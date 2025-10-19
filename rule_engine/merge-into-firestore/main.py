from firebase_admin import firestore
from constants import COLLECTION_NAME, COLLECTION_NAME_VALIDITY_DATA, FIELD_NAMES_RE, FIELD_NAMES_FE


def update_properties_in_transaction(db, item: dict):
    batch = db.batch()
    id = item[FIELD_NAMES_RE.ID.value]
    vs = item[FIELD_NAMES_RE.VALIDITY_SCORE.value]
    cs = item[FIELD_NAMES_RE.COMMUNITY_SCORE.value]
    _update_firestore_properties(batch, db, id, vs, cs)
    _save_full_data(batch, db, id, item)
    batch.commit()


def _update_firestore_properties(batch, db, id: str, vs: int, cs: int):
    doc_ref = db.collection(COLLECTION_NAME).document(id)
    batch.update(
        doc_ref,
        {
            FIELD_NAMES_FE.VALIDITY_SCORE.value: vs,
            FIELD_NAMES_FE.COMMUNITY_SCORE.value: cs,
        },
    )


def _save_full_data(batch, db, id: str, item: dict):
    doc_ref = db.collection(COLLECTION_NAME_VALIDITY_DATA).document(id)
    batch.set(doc_ref, item)


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
