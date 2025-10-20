# main.py

import json
from math import ceil
from concurrent.futures import ThreadPoolExecutor, as_completed

from engine import ViabilityEngine
from engine.enrichment import DataEnricher # We need direct access to the enricher
from data_loader import initialize_firebase, load_from_firestore
from config import SCORING_WEIGHTS
from constants import COLLECTION_NAME, COLLECTION_NAME_VALIDITY_DATA, FIELD_NAMES_RE, FIELD_NAMES_FE
from firebase_admin import firestore

# --- Configuration for Batch Processing ---
CHUNK_SIZE = 10 # Increase chunk size for more parallelism. 10 is a good starting point.
MAX_WORKERS = 10 # The number of properties to process in parallel. Match this to CHUNK_SIZE.

# --- Firestore Functions (unchanged) ---

def _update_firestore_properties(batch, db, doc_id: str, vs: float, cs: float):
    doc_ref = db.collection(COLLECTION_NAME).document(doc_id)
    batch.update(doc_ref, {
        FIELD_NAMES_FE.VALIDITY_SCORE.value: vs,
        FIELD_NAMES_FE.COMMUNITY_SCORE.value: cs,
    })

def _save_full_data(batch, db, doc_id: str, item: dict):
    doc_ref = db.collection(COLLECTION_NAME_VALIDITY_DATA).document(doc_id)
    batch.set(doc_ref, item)

def update_properties_in_transaction(db, item: dict):
    batch = db.batch()
    item_id = item[FIELD_NAMES_RE.ID.value]
    validity_score = item[FIELD_NAMES_RE.VALIDITY_SCORE.value]
    community_score = item[FIELD_NAMES_RE.COMMUNITY_SCORE.value]
    _update_firestore_properties(batch, db, item_id, validity_score, community_score)
    _save_full_data(batch, db, item_id, item)
    batch.commit()

def merge_into_firestore(item: dict):
    try:
        db = firestore.client()
        update_properties_in_transaction(db, item)
    except Exception as e:
        item_id = item.get(FIELD_NAMES_RE.ID.value, "N/A")
        print(f"    -> ERROR: Failed to merge item ID {item_id} into Firestore: {e}")

def get_documents_without_a_field(db, collection_name: str, field_name: str):
    docs = db.collection(collection_name).stream()
    return [doc for doc in docs if field_name not in doc.to_dict()]

def query_no_validity(db):
    return get_documents_without_a_field(
        db, COLLECTION_NAME, FIELD_NAMES_FE.VALIDITY_SCORE.value
    )

# --- NEW: Worker function for parallel processing ---

def process_single_property(enricher: DataEnricher, property_data: dict) -> dict | None:
    """
    Worker function that enriches a single property.
    Designed to be run in a separate thread.
    Includes error handling to prevent one failure from stopping the entire batch.
    """
    prop_id = property_data.get("property_id", "Unknown")
    try:
        # This is the slow, network-intensive part.
        return enricher.enrich_property(property_data)
    except Exception as e:
        print(f"  -> ERROR processing property {prop_id}. It will be skipped. Reason: {e}")
        return None

# --- Main Batch Processing Logic (Updated for Parallelism) ---

def run_batch_analysis():
    """
    Fetches all unprocessed properties and analyzes them in parallel, resilient chunks,
    saving progress after each chunk.
    """
    print("--- Starting Parallel Batch Property Viability Analysis ---")
    
    db = initialize_firebase()
    
    print("Querying Firestore for all properties that need analysis...")
    all_unprocessed_docs = query_no_validity(db)
    
    if not all_unprocessed_docs:
        print("No new properties to process. System is up-to-date.")
        return

    total_docs = len(all_unprocessed_docs)
    total_chunks = ceil(total_docs / CHUNK_SIZE)
    print(f"Found {total_docs} properties. Processing in {total_chunks} chunks of size {CHUNK_SIZE} with {MAX_WORKERS} parallel workers.")
    
    engine = ViabilityEngine(weights=SCORING_WEIGHTS)

    for i in range(total_chunks):
        start_index = i * CHUNK_SIZE
        end_index = start_index + CHUNK_SIZE
        current_chunk_docs = all_unprocessed_docs[start_index:end_index]
        
        print(f"\n--- Processing Chunk {i+1}/{total_chunks} ({len(current_chunk_docs)} properties) ---")

        property_listings_chunk = []
        for doc in current_chunk_docs:
            try:
                # The data loading part is still sequential and fast.
                property_data = load_from_firestore(db, doc.id)
                property_listings_chunk.append(property_data)
            except (FileNotFoundError, ValueError) as e:
                print(f"  -> WARNING: Could not load property '{doc.id}'. Skipping. Reason: {e}")
        
        if not property_listings_chunk:
            print("No valid properties in this chunk. Moving to the next.")
            continue
            
        # --- PARALLEL ENRICHMENT ---
        enriched_results = []
        print(f"  -> Starting parallel enrichment for {len(property_listings_chunk)} properties...")
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            # Submit all enrichment tasks to the thread pool
            future_to_prop = {
                executor.submit(process_single_property, engine.enricher, prop): prop 
                for prop in property_listings_chunk
            }
            
            # Process results as they are completed
            for future in as_completed(future_to_prop):
                result = future.result()
                if result: # Only add successful results
                    enriched_results.append(result)
        
        if not enriched_results:
            print("  -> No properties were successfully enriched in this chunk.")
            continue

        # --- SCORING AND SAVING (Sequential) ---
        print(f"  -> Enrichment complete. Scoring {len(enriched_results)} properties...")
        # The scorer now gets the list of successfully enriched properties
        ranked_properties = engine.scorer.rank_properties(enriched_results)
        
        if ranked_properties:
            print(f"  -> Storing results for {len(ranked_properties)} properties in Firestore...")
            for prop_result in ranked_properties:
                item_to_save = prop_result.copy()
                item_to_save[FIELD_NAMES_RE.ID.value] = item_to_save['property_id']
                item_to_save[FIELD_NAMES_RE.VALIDITY_SCORE.value] = item_to_save['viability_score']
                item_to_save[FIELD_NAMES_RE.COMMUNITY_SCORE.value] = item_to_save['community_value_score']
                
                # The merge function is called sequentially, which is safer for DB writes
                merge_into_firestore(item_to_save)
        else:
            print("  -> Engine did not return any ranked properties for this chunk.")

    print("\n--- All chunks processed. Batch analysis complete. ---")


if __name__ == "__main__":
    run_batch_analysis()