from .models import PropertyListing
from . import external_services
from config import MAPS_API_KEY
from .investment_calculator import InvestmentCalculator # <-- Import the new calculator

class DataEnricher:
    """Enriches raw property data with calculated metrics."""
    
    def __init__(self):
        # Instantiate the calculator so we can use it
        self.investment_calculator = InvestmentCalculator()
        print("Data Enricher Initialized (with Investment Calculator).")

    def enrich_property(self, property_data: dict) -> dict:
        """Processes a single property to add all calculated scores and details."""
        prop = PropertyListing.model_validate(property_data)
        enriched_data = prop.model_dump(mode='json')
        lat, lon = prop.latitude, prop.longitude

        print(f"Enriching property ID: {prop.property_id} ({prop.address})...")
        
        # --- Standard Enrichment ---
        amenity_result = external_services.get_amenity_details(lat, lon, MAPS_API_KEY)
        enriched_data['amenity_details'] = amenity_result.model_dump(mode='json')
        enriched_data['amenity_score'] = amenity_result.score
        
        market_average = external_services.get_market_average(lat, lon)
        enriched_data['market_average_price'] = market_average # Store this for later use

        enriched_data['price_attractiveness_score'] = self._calculate_price_attractiveness(
            prop.listed_price, market_average
        )
        
        enriched_data['air_quality_score'] = external_services.get_air_quality_score(lat, lon, MAPS_API_KEY)
        
        renovation_details = external_services.get_renovation_cost(
            enriched_data['image_urls']
        )
        enriched_data['renovation_details'] = renovation_details.model_dump(mode='json')

        # --- NEW: Investment Analysis Step ---
        print("   -> Running Investment Viability Analysis...")
        investment_analysis = self.investment_calculator.calculate(
            listed_price=prop.listed_price,
            renovation_details=enriched_data['renovation_details'],
            market_average_price=market_average
        )
        enriched_data['investment_analysis'] = investment_analysis.model_dump(mode='json')
        print("   -> Investment Analysis Complete.")

        return enriched_data

    def _calculate_price_attractiveness(self, listed_price: float, market_average: float) -> float:
        """Calculates price attractiveness against the market average."""
        if market_average <= 0: return 0.0
        attractiveness = ((market_average - listed_price) / market_average) * 100
        return round(max(0, attractiveness), 2)