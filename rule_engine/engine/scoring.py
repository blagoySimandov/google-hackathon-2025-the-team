# engine/scoring.py
import pandas as pd
from typing import List, Dict

class ScoringEngine:
    """Applies a weighted algorithm to rank properties."""
    def __init__(self, weights: Dict[str, float]):
        if sum(weights.values()) != 1.0:
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

        df['viability_score'] = (
            df['price_attractiveness_score'] * self.weights['price_attractiveness'] +
            df['renovation_cost_score'] * self.weights['renovation_cost'] +
            df['amenity_score'] * self.weights['amenity_score'] +
            df['air_quality_score'] * self.weights['air_quality']
        )
        
        df['viability_score'] = df['viability_score'].round(2)
        df_ranked = df.sort_values('viability_score', ascending=False).reset_index(drop=True)
        df_ranked['rank'] = df_ranked.index + 1
        
        return df_ranked.to_dict('records')

    def _calculate_renovation_cost_score(self, reno_cost: float, price: float) -> float:
        """Scores renovation cost relative to purchase price (0-100, higher is better)."""
        if price <= 0: return 0.0
        ratio = reno_cost / price
        # Score is 100 if ratio is 0.5 or less, and 0 if ratio is 2.0 or more
        score = 100 * (1 - (min(max(ratio, 0.5), 2.0) - 0.5) / 1.5)
        return round(score, 2)