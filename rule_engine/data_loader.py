# data_loader.py
import firebase_admin
from firebase_admin import credentials, firestore
from config import PROJECT_ID
import json

def initialize_firebase():
    """Initializes the Firebase Admin SDK using Application Default Credentials."""
    try:
        print(f"Authenticating with Google Cloud Project: {PROJECT_ID} using ADC...")
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {'projectId': PROJECT_ID})
        return firestore.client()
    except Exception as e:
        print(f"FATAL ERROR: Could not initialize Firebase Admin SDK. {e}")
        print("Ensure you have authenticated via gcloud: 'gcloud auth application-default login'")
        exit()

def load_from_firestore(db, doc_id: str) -> dict:
    """Fetches and transforms a single property document from Firestore."""
    doc_ref = db.collection('properties').document(doc_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise FileNotFoundError(f"Document with ID '{doc_id}' not found.")

    data = doc.to_dict()
    
    try:
        price = float(data['price']['amount'])
        if price <= 0:
            raise ValueError("Firestore document contains a non-positive price.")
        
        area_m2 = None
        # Prefer structured floorArea in METRES_SQUARED (ignore ACRES – that’s site size)
        fa = data.get("floorArea")
        if isinstance(fa, dict):
            unit = (fa.get("unit") or "").upper()
            val = fa.get("value")
            if unit == "METRES_SQUARED" and val is not None:
                try:
                    area_val = float(val)
                    # light sanity: ignore extreme outliers
                    if area_val > 0:
                        area_m2 = round(area_val, 2)
                except Exception:
                    pass

        # Fallback: parse floorAreaFormatted like "120 m²"
        if area_m2 is None:
            faf = data.get("floorAreaFormatted")
            if isinstance(faf, str):
                import re
                m = re.search(r"(\d+(?:\.\d+)?)\s*(m²|m2|sqm|sq\.?\s*m)", faf, flags=re.I)
                if m:
                    try:
                        area_val = float(m.group(1))
                        if area_val > 0:
                            area_m2 = round(area_val, 2)
                    except Exception:
                        pass

        # BER normalize – ignore placeholders
        ber_rating = None
        ber_obj = data.get("ber") or {}
        raw_ber = (ber_obj.get("rating") or "").strip().upper().replace(" ", "")
        if raw_ber and raw_ber not in {"BER_PENDING", "SI_666"}:
            ber_rating = raw_ber  # e.g., "C1","F","G"

        # --- THE FIX: Point to the 'storageImages' field ---
        # This new field contains direct, public URLs to Firebase Storage,
        # so we no longer need the proxy function.
        image_urls = data.get("storageImages", []) # Safely get the list, default to empty
        if not image_urls:
            print(f"   WARNING: No images found in 'storageImages' for document {doc_id}.")
        # ----------------------------------------------------

        return {
            "property_id": str(data["id"]),
            "url": f"https://www.daft.ie{data['seoFriendlyPath']}",
            "listed_price": price,
            "address": data["title"],
            "latitude": data["location"]["coordinates"][1],
            "longitude": data["location"]["coordinates"][0],
            "image_urls": [img["size1200x1200"] for img in data["media"]["images"] if img.get("size1200x1200")],
            "area_m2": area_m2,  
            "ber": ber_rating

        }
    except (KeyError, TypeError) as e:
        raise ValueError(f"Could not transform Firestore document '{doc_id}'. Invalid or missing key: {e}")
    except ValueError as e:
        raise ValueError(f"Could not transform Firestore document '{doc_id}'. Invalid value: {e}")