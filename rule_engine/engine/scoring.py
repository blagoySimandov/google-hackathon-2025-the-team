# engine/scoring.py
import pandas as pd
from typing import List, Dict
from math import radians, sin, cos, asin, sqrt, exp

from constants import FIELD_NAMES_RE


class ScoringEngine:
    """Applies a weighted algorithm to rank properties."""
    def __init__(self, weights: Dict[str, float]):
        print("Weights in scoring engine: ", weights)
        if abs(sum(weights.values()) - 1.0) > 1e-9:
            print("Sum of weights: ", sum(weights.values()))
            raise ValueError("The sum of weights must be 1.0")
        self.weights = weights

    def rank_properties(self, enriched_properties: List[Dict]) -> List[Dict]:
        """Calculates the final viability score and ranks properties."""
        if not enriched_properties:
            return []

        df = pd.DataFrame(enriched_properties)
        
        # Extract total renovation cost from the nested dictionary
        df['total_renovation_cost'] = df['renovation_details'].apply(lambda x: x['total_cost'])

        df['renovation_cost_score'] = df.apply(
            lambda row: self._calculate_renovation_cost_score(
                row['total_renovation_cost'], row['listed_price']
            ), axis=1
        )

        # --- Compute Community Scores (added section) ---
        try:
            lats = df['latitude'].to_numpy(dtype=float)
            lons = df['longitude'].to_numpy(dtype=float)

            df['community_access_score'] = df['amenity_details'].apply(_amenity_access_score)
            df['community_cluster_score'] = [
                _cluster_score(lats, lons, i, radius_m=300.0) for i in range(len(df))
            ]
            df['community_value_score'] = (
                0.65 * df['community_access_score'] + 0.35 * df['community_cluster_score']
            ).round(2)
        except Exception as e:
            print("⚠️  Community score calculation skipped:", e)
            df['community_access_score'] = 0.0
            df['community_cluster_score'] = 0.0
            df['community_value_score'] = 0.0
        # ----------------------------------------------

            # ------------------ Sustainability Value------------------
        # Ensure columns exist (defaults if missing)
        if 'community_access_score' not in df.columns:
            df['community_access_score'] = 0.0
        if 'ber' not in df.columns:
            df['ber'] = None
        if 'area_m2' not in df.columns:
            df['area_m2'] = None

        # Compute sustainability_score per row (0–100)
        df['sustainability_score'] = df.apply(
            lambda row: _sustainability_score({
                "ber": row.get('ber', None),
                "community_access_score": float(row.get('community_access_score', 0.0) or 0.0),
                "area_m2": row.get('area_m2', None)
            }),
            axis=1
        )
        # ----------------------------------------------------

        df['viability_score'] = (
            df['price_attractiveness_score'] * self.weights['price_attractiveness'] +
            df['renovation_cost_score'] * self.weights['renovation_cost'] +
            df['amenity_score'] * self.weights['amenity_score'] +
            df['air_quality_score'] * self.weights['air_quality']
        )
        
        df['viability_score'] = df['viability_score'].round(2)
        df_ranked = df.sort_values('viability_score', ascending=False).reset_index(drop=True)
        df_ranked['rank'] = df_ranked.index + 1

        

        # --- Print summary of new scores for debugging ---
        print("\n--- Property Scoring Summary ---")
        for _, row in df_ranked.iterrows():
            print(f"{row['address'] if 'address' in row else '(No address)'}")
            print(f"  Community Access Score: {row['community_access_score']:.2f}")
            print(f"  Community Cluster Score: {row['community_cluster_score']:.2f}")
            print(f"  Community Value Score:   {row['community_value_score']:.2f}")
            print(f"  Viability Score:         {row['viability_score']:.2f}")
            record = {
            "ber": row.get("ber"),
            "community_access_score": row.get("community_access_score"),
            "area_m2": row.get("area_m2")
        }   
            sustainability = _sustainability_score(record)
            print(f"  Sustainability Score:    {sustainability:.2f}")
            print("--------------------------------------------------")
        # -------------------------------------------------

        return df_ranked.to_dict('records')


    def _calculate_renovation_cost_score(self, reno_cost: float, price: float) -> float:
        """Scores renovation cost relative to purchase price (0-100, higher is better)."""
        if price <= 0: return 0.0
        ratio = reno_cost / price
        # Score is 100 if ratio is 0.5 or less, and 0 if ratio is 2.0 or more
        score = 100 * (1 - (min(max(ratio, 0.5), 2.0) - 0.5) / 1.5)
        return round(score, 2)


# ---------------------------------------------------------------------------
# Community Value Helpers (added without changing existing engine behaviour)
# ---------------------------------------------------------------------------

def _haversine_m(lat1, lon1, lat2, lon2):
    """Return distance in metres between two lat/lon coordinates."""
    R = 6371000.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * R * asin(sqrt(a))


def _cluster_score(latitudes, longitudes, idx, radius_m: float = 300.0) -> float:
    """
    Compute how many other derelict properties fall within radius_m of the
    property at index idx. Produces a 0–100 score with a smooth exponential curve.
    """
    lat0, lon0 = latitudes[idx], longitudes[idx]
    n = 0
    for j in range(len(latitudes)):
        if j == idx:
            continue
        d = _haversine_m(float(lat0), float(lon0), float(latitudes[j]), float(longitudes[j]))
        if d <= radius_m:
            n += 1
    score = 100.0 * (1.0 - exp(-n / 2.0))
    return round(score, 2)


def _pick_caps(found_amenities):
    """
    Decide whether to use URBAN or RURAL distance caps based on how close
    the nearest amenity is. If nothing is within 1.5 km, treat as RURAL.
    Returns: (caps_dict, anchor_radius_km)
    """
    distances = [
        a.get("distance_km")
        for a in (found_amenities or [])
        if a is not None and a.get("distance_km") is not None
    ]
    nearest_any = min(distances) if distances else None
    is_rural = (nearest_any is None) or (nearest_any > 1.5)

    if is_rural:
        # RURAL caps (more forgiving)
        caps = {"transport": 3.0, "shop": 5.0, "park": 5.0, "school": 6.0}
        anchor_radius_km = 1.2
    else:
        # URBAN caps (15-min neighbourhood)
        caps = {"transport": 1.2, "shop": 0.8, "park": 1.0, "school": 1.5}
        anchor_radius_km = 0.6

    return caps, anchor_radius_km


def _amenity_access_score(amenity_details: dict) -> float:
    """
    Compute a 0–100 score based on proximity to key amenities (transport, shop, park, school),
    automatically adjusting for rural vs urban context.
    """
    found = []
    if isinstance(amenity_details, dict):
        found = amenity_details.get("found_amenities", []) or []

    caps, anchor_r_km = _pick_caps(found)

    nearest = {"transport": None, "shop": None, "park": None, "school": None}
    for a in found:
        t = (a.get("type") or "").strip().lower()
        d = a.get("distance_km", None)
        if d is None:
            continue

        if t in ("bus station", "bus stop", "train station", "railway station"):
            key = "transport"
        elif t in ("supermarket", "convenience", "grocery"):
            key = "shop"
        elif t in ("park", "green", "greenspace", "green space"):
            key = "park"
        elif t in ("school", "primary school", "secondary school"):
            key = "school"
        else:
            continue

        nearest[key] = d if nearest[key] is None else min(nearest[key], d)

    def _score_from_distance_km(d_km: float, cap_km: float) -> float:
        if d_km is None or d_km < 0:
            return 0.0
        return max(0.0, 100.0 * (1.0 - (d_km / cap_km)))

    transport_s = _score_from_distance_km(nearest["transport"], caps["transport"])
    shop_s      = _score_from_distance_km(nearest["shop"],      caps["shop"])
    park_s      = _score_from_distance_km(nearest["park"],      caps["park"])
    school_s    = _score_from_distance_km(nearest["school"],    caps["school"])

    access = (
        0.35 * transport_s +
        0.25 * shop_s +
        0.20 * park_s +
        0.20 * school_s
    )

    close_types = sum(
        1 for k in ("transport", "shop", "park", "school")
        if nearest[k] is not None and nearest[k] <= anchor_r_km
    )
    anchor_bonus = 5.0 if close_types >= 3 else 0.0

    return min(100.0, access + anchor_bonus)


# ---------------------------------------------------------------------------
# Sustainability Score Helpers
# ---------------------------------------------------------------------------

BER_ORDER_WORST_TO_BEST = [
    "G","F","E2","E1","D2","D1","C3","C2","C1","B3","B2","B1","A3","A2","A1"
]
BER_INDEX = {b:i for i,b in enumerate(BER_ORDER_WORST_TO_BEST)}
TARGET_BER = "C1"
TARGET_IDX = BER_INDEX[TARGET_BER]

def _energy_potential_from_current_ber(current_ber: str | None) -> float:
    """Return Energy Efficiency Potential (0–100) using only current BER."""
    if not current_ber:
        return 60.0
    cur = current_ber.strip().upper()
    if cur not in BER_INDEX:
        return 60.0
    current_idx = BER_INDEX[cur]
    improvement = max(0, TARGET_IDX - current_idx) / TARGET_IDX
    return round(improvement * 100.0, 2)

def _carbon_savings_score(area_m2: float | None) -> float:
    """0–100 scaled by CO₂ saved vs rebuild. Defaults area to 100 m²."""
    a = area_m2 if (area_m2 and area_m2 > 0) else 100.0
    co2_saved_kg = 350.0 * a  # (500 – 150) × area
    return round(min(100.0, (co2_saved_kg / 35000.0) * 100.0), 2)

def _sustainability_score(record: dict) -> float:
    """
    Compute Sustainability Score (0–100) with only current BER + community_access_score.
    Expects keys: 'ber', 'community_access_score', 'area_m2' (optional)
    """
    C = _carbon_savings_score(record.get("area_m2"))
    E = _energy_potential_from_current_ber(record.get("ber"))
    L = float(record.get("community_access_score") or 0.0)
    score = 0.40*C + 0.35*E + 0.25*L
    return round(min(100.0, max(0.0, score)), 2)

