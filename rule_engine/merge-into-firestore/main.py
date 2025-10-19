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


def merge_into_firestore(item: dict):
    """
    Args:
        item: A single dict to merge into Firestore
    """
    try:
        db = firestore.client()
        update_properties_in_transaction(db, item)
    except Exception as e:
        print(f"Error: {e}")
