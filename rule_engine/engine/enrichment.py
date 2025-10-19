# engine/enrichment.py
from .models import PropertyListing
from . import external_services
from config import MAPS_API_KEY

class DataEnricher:
    """Enriches raw property data with calculated metrics."""

    def enrich_property(self, property_data: dict) -> dict:
        """Processes a single property to add all calculated scores and details."""
        prop = PropertyListing.model_validate(property_data)
        enriched_data = prop.model_dump(mode='json')
        lat, lon = prop.latitude, prop.longitude

        print(f"Enriching property ID: {prop.property_id} ({prop.address})...")
        
        # --- AMENITY LOGIC UPDATE ---
        # 1. Call the updated function to get the detailed result object
        amenity_result = external_services.get_amenity_details(lat, lon, MAPS_API_KEY)
        
        # 2. Store the detailed list and the numerical score separately
        enriched_data['amenity_details'] = amenity_result.model_dump(mode='json')
        enriched_data['amenity_score'] = amenity_result.score # For the ranking algorithm

        # --- Other enrichment steps remain the same ---
        enriched_data['price_attractiveness_score'] = self._calculate_price_attractiveness(prop.listed_price, lat, lon)
        enriched_data['air_quality_score'] = external_services.get_air_quality_score(lat, lon, MAPS_API_KEY)
        
        renovation_details = external_services.get_renovation_cost(
            enriched_data['image_urls'] # Already strings from model_dump
        )
        enriched_data['renovation_details'] = renovation_details.model_dump(mode='json')

        return enriched_data

    def _calculate_price_attractiveness(self, listed_price: float, lat: float, lon: float) -> float:
        """Calculates price attractiveness against a simulated market average."""
        market_average = external_services.get_market_average(lat, lon)
        if market_average <= 0: return 0.0
        attractiveness = ((market_average - listed_price) / market_average) * 100
        return round(max(0, attractiveness), 2)