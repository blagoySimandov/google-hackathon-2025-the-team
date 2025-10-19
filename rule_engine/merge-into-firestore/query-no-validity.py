from constants import COLLECTION_NAME, FIELD_NAMES


def query_no_validity(db):
    docs_without_validity = get_documents_without_a_field(
        db, COLLECTION_NAME, FIELD_NAMES.VALIDITY_SCORE.value
    )
    return docs_without_validity


def get_documents_without_a_field(db, collection_name: str, field_name: str):
    docs = db.collection(collection_name).stream()

    docs_without_field = []
    for doc in docs:
        doc_data = doc.to_dict()
        if field_name not in doc_data:
            docs_without_field.append(doc)

    return docs_without_field
