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
    
    try:
        price = float(data['price']['amount'])
        if price <= 0:
            raise ValueError("Firestore document contains a non-positive price.")

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
            "image_urls": image_urls # <-- Use the direct storage URLs
        }
    except (KeyError, TypeError) as e:
        raise ValueError(f"Could not transform Firestore document '{doc_id}'. Invalid or missing key: {e}")
    except ValueError as e:
        raise ValueError(f"Could not transform Firestore document '{doc_id}'. Invalid value: {e}")