# engine/models.py
from typing import List
from pydantic import BaseModel, Field, field_validator, HttpUrl
import re

class PropertyListing(BaseModel):
    """Defines the strict data schema for a raw input property."""
    property_id: str = Field(..., min_length=1)
    url: HttpUrl
    listed_price: float = Field(..., gt=0)
    address: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    image_urls: List[HttpUrl] = Field(..., min_length=1)

class RenovationItem(BaseModel):
    """Defines the schema for an item in the renovation list."""
    item: str
    reason: str
    material: str
    amount: str
    price: float  # The field will now correctly store the final float value

    @field_validator('price', mode='before')
    @classmethod
    def clean_and_convert_price(cls, v: str) -> float:
        """
        Catches the incoming price string (e.g., "€1,500.50"), extracts
        the numeric part, and converts it to a float.
        """
        if not isinstance(v, str):
            # Allow floats to pass through if data is already clean
            if isinstance(v, (int, float)):
                return float(v)
            raise ValueError("Price must be a string or number.")
            
        match = re.search(r'[\d,.]+', v)
        if match:
            return float(match.group(0).replace(',', ''))
        
        raise ValueError(f"Could not extract a valid number from price string: '{v}'")


    @property
    def cost(self) -> float:
        """Extracts the numerical cost from the price string."""
        # Use regex to find numbers in the string (handles £, €, etc.)
        match = re.search(r'[\d,.]+', self.price)
        if match:
            # Remove commas for correct float conversion
            return float(match.group(0).replace(',', ''))
        return 0.0

class RenovationCost(BaseModel):
    """Represents the full output from the image scanning service."""
    items: List[RenovationItem]
    total_cost: float

class Amenity(BaseModel):
    """Represents a single nearby amenity."""
    name: str
    type: str
    distance_km: float

class AmenityResult(BaseModel):
    """Holds the full results of the amenity search."""
    score: float
    found_amenities: List[Amenity]

class AppliedGrant(BaseModel):
    """Represents a potential grant applied to the project."""
    name: str
    amount: float
    reason: str

class InvestmentAnalysis(BaseModel):
    """Holds all the calculated financial metrics for the investment."""
    estimated_labour_cost: float
    total_project_cost: float
    potential_grants: List[AppliedGrant]
    total_grant_amount: float
    net_project_cost: float
    estimated_after_repair_value: float
    potential_profit: float
    return_on_investment_percent: float