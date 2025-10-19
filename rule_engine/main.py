# main.py
import json
from engine import ViabilityEngine
from data_loader import initialize_firebase, load_from_firestore
from config import SCORING_WEIGHTS

def run_single_property_analysis(doc_id: str):
    """
    Initializes services, loads data for a single property, runs the engine,
    and prints the results.
    """
    print("--- Starting Single Property Viability Analysis ---")
    
    # 1. Initialize services
    db = initialize_firebase()
    
    # 2. Load and transform data
    try:
        property_data = load_from_firestore(db, doc_id)
        property_listings = [property_data] # Engine expects a list
    except (FileNotFoundError, ValueError) as e:
        print(f"FATAL: Could not load property data. {e}")
        return

    # 3. Initialize and run the engine
    print(SCORING_WEIGHTS)
    engine = ViabilityEngine(weights=SCORING_WEIGHTS)
    result = engine.run(property_listings)

    # 4. Print the output
    print("\n--- Engine Analysis Complete ---")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    DOCUMENT_ID_TO_TEST = "3467640"
    run_single_property_analysis(DOCUMENT_ID_TO_TEST)