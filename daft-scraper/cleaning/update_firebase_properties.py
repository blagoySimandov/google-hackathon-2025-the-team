import json
import sys
from typing import Any, Dict, List
import firebase_admin
from firebase_admin import credentials, firestore


def init_firebase():
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    return firestore.client()


def update_property(
    db, property_id: int, updates: Dict[str, Any], fields_to_update: List[str] = None
):
    collection_name = "properties"
    doc_ref = db.collection(collection_name).document(str(property_id))

    doc = doc_ref.get()
    if not doc.exists:
        print(f"  Property {property_id} not found in Firestore, skipping")
        return False

    if fields_to_update:
        filtered_updates = {k: v for k, v in updates.items() if k in fields_to_update}
    else:
        filtered_updates = updates

    if not filtered_updates:
        print(f"  No valid fields to update for property {property_id}")
        return False

    doc_ref.update(filtered_updates)
    return True


def update_properties_from_json(
    json_file_path: str,
    fields_to_update: List[str] | None = None,
    batch_size: int = 500,
):
    print("Initializing Firebase Admin SDK...")
    db = init_firebase()

    print(f"Loading properties from {json_file_path}...")
    with open(json_file_path, "r", encoding="utf-8") as f:
        properties = json.load(f)

    print(f"Loaded {len(properties)} properties from JSON")

    if fields_to_update:
        print(f"Will only update these fields: {', '.join(fields_to_update)}")
    else:
        print("Will update ALL fields from JSON")

    successful = 0
    failed = 0

    for i, prop in enumerate(properties, 1):
        property_id = prop.get("id")
        if not property_id:
            print(f"  Skipping property at index {i - 1} - no ID found")
            failed += 1
            continue

        try:
            updates = {k: v for k, v in prop.items() if k != "id"}

            if update_property(db, property_id, updates, fields_to_update):
                successful += 1
                if successful % 50 == 0:
                    print(
                        f"  Progress: {successful}/{len(properties)} properties updated"
                    )
            else:
                failed += 1
        except Exception as e:
            print(f"  Error updating property {property_id}: {str(e)}")
            failed += 1

        if i % batch_size == 0:
            print(f"Processed {i}/{len(properties)} properties...")

    print(f"\n{'=' * 60}")
    print(f"UPDATE SUMMARY")
    print(f"{'=' * 60}")
    print(f"Total properties in JSON: {len(properties)}")
    print(f"Successfully updated: {successful}")
    print(f"Failed/Skipped: {failed}")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    SERVICE_ACCOUNT_PATH = "./serviceAccountKey.json"
    JSON_FILE_PATH = "./cleaned_properties.json"

    if len(sys.argv) < 2:
        print("\nError: No fields specified for update")
        print("\nUsage: python update_firebase_properties.py <field1> <field2> ...")
        print(
            "\nExample: python update_firebase_properties.py amenities floorArea price"
        )
        print("\nThis is a safety feature to prevent accidentally updating all fields.")
        sys.exit(1)

    FIELDS_TO_UPDATE = sys.argv[1:]
    print(f"Received fields to update from command line: {FIELDS_TO_UPDATE}")

    try:
        update_properties_from_json(
            json_file_path=JSON_FILE_PATH,
            fields_to_update=FIELDS_TO_UPDATE,
        )
        print("✓ Update script completed successfully!")
    except FileNotFoundError as e:
        print(f"\nError: File not found - {str(e)}")
        print("\nMake sure you have:")
        print("1. serviceAccountKey.json in this directory")
        print("2. cleaned_properties.json in this directory")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {str(e)}")
        sys.exit(1)
