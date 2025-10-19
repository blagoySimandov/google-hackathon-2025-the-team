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
        print("Firebase Admin SDK initialized successfully.")
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
    
    # The debug print can be removed now that we've found the issue, but it's useful to keep
    # print("\n--- Raw Firestore Data Received ---")
    # print(json.dumps(data, indent=2))
    # print("---------------------------------\n")

    try:
        # --- CORRECTED TRANSFORMATION LOGIC ---
        
        # CORRECTED PATH: Directly access price.amount
        price = float(data['price']['amount'])
        if price <= 0:
            raise ValueError("Firestore document contains a non-positive price.")

        return {
            "property_id": str(data["id"]),
            "url": f"https://www.daft.ie{data['seoFriendlyPath']}",
            "listed_price": price,
            "address": data["title"],
            # CORRECTED PATH: Use location.coordinates
            "latitude": data["location"]["coordinates"][1],
            "longitude": data["location"]["coordinates"][0],
            "image_urls": [img["size1200x1200"] for img in data["media"]["images"] if img.get("size1200x1200")]
        }
    except (KeyError, TypeError) as e:
        # This will catch errors if fields are missing in the new structure.
        raise ValueError(f"Could not transform Firestore document '{doc_id}'. Invalid or missing key: {e}")
    except ValueError as e:
        # This catches the non-positive price error from above.
        raise ValueError(f"Could not transform Firestore document '{doc_id}'. Invalid value: {e}")