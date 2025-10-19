from firebase_admin import firestore
from constants import COLLECTION_NAME, FIELD_NAMES


def update_properties_in_transaction(db, item: dict):
    batch = db.batch()
    id = item[FIELD_NAMES.ID.value]
    vs = item[FIELD_NAMES.VALIDITY_SCORE.value]
    cs = item[FIELD_NAMES.COMMUNITY_SCORE.value]
    _update_firestore_properties(batch, db, id, vs, cs)
    batch.commit()


def _update_firestore_properties(batch, db, id: str, vs: int, cs: int):
    doc_ref = db.collection(COLLECTION_NAME).document(id)
    batch.update(
        doc_ref,
        {FIELD_NAMES.VALIDITY_SCORE.value: vs, FIELD_NAMES.COMMUNITY_SCORE.value: cs},
    )


def merge_into_firestore(data: dict | list, mode: str = "single"):
    """
    Args:
        data: A single dict or list of dicts depending on mode
        mode: Either "single" for a single item or "multiple" for a list of items
    """
    try:
        db = firestore.client()

        if mode == "multiple":
            if not isinstance(data, list):
                raise ValueError("Expected list when mode is 'multiple'")
            for item in data:
                update_properties_in_transaction(db, item)
        elif mode == "single":
            if not isinstance(data, dict):
                raise ValueError("Expected dict when mode is 'single'")
            update_properties_in_transaction(db, data)
        else:
            raise ValueError(f"Invalid mode: {mode}. Expected 'single' or 'multiple'")
    except Exception as e:
        print(f"Error: {e}")
