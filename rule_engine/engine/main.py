# engine/main.py
from typing import List, Dict, Any
from pydantic import ValidationError
from .models import PropertyListing
from .enrichment import DataEnricher
from .scoring import ScoringEngine

class ViabilityEngine:
    """Orchestrates validation, enrichment, and ranking."""
    def __init__(self, weights: Dict[str, float]):
        self.enricher = DataEnricher()
        self.scorer = ScoringEngine(weights)
        print("Viability Engine Initialized.")

    def run(self, raw_properties_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Executes the full validation and ranking pipeline."""
        validated_properties, validation_errors = self._validate_data(raw_properties_data)
        
        # Pass the plain dictionaries to the enricher
        enriched_data = [self.enricher.enrich_property(prop) for prop in validated_properties]
        
        ranked_data = self.scorer.rank_properties(enriched_data)
        
        return {
            "ranked_properties": ranked_data,
            "validation_errors": validation_errors,
            "total_processed": len(validated_properties),
            "total_failed_validation": len(validation_errors)
        }

    def _validate_data(self, raw_data: List[Dict]) -> (List[Dict], List[Dict]):
            """Validates a list of raw property data and returns plain dictionaries."""
            validated, errors = [], []
            for i, item in enumerate(raw_data):
                try:
                    # Validate the raw dictionary
                    validated_prop = PropertyListing.model_validate(item)
                    # Convert the validated Pydantic object back to a dictionary for further processing
                    validated.append(validated_prop.model_dump(mode='json')) 
                except ValidationError as e:
                    errors.append({"property_index": i, "errors": e.errors()})
            return validated, errors