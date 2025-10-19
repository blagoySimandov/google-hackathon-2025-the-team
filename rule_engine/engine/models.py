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
    price: str

    @property
    def model_validate(self):
        match = re.search(r"[\d,.]+", self.price)

        if match:
            # Replace commas if used as thousand separators, then convert to float
            self.price = float(match.group().replace(",", ""))
            print("Price in numbers: ", self.price)  # Output: 750.00
        else:
            raise ValueError("No numeric value found in price string")
        


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