# config.py
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Google Cloud & Firebase Configuration ---
MAPS_API_KEY = os.getenv("MAPS_API_KEY")
if not MAPS_API_KEY:
    raise RuntimeError("ERROR: MAPS_API_KEY not found. Please set it in your .env file.")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("ERROR: GEMINI_API_KEY not found.")

# Your Google Cloud Project ID
PROJECT_ID = "bgn-ie-hack25dub-703"

# --- Scoring Configuration ---
SCORING_WEIGHTS = {
    "price_attractiveness": 0.40,
    "renovation_cost": 0.30,
    "amenity_score": 0.20,
    "air_quality": 0.10,
}

DAFT_COOKIE = os.getenv("DAFT_COOKIE")
if not DAFT_COOKIE:
    raise RuntimeError("ERROR: DAFT_COOKIE not found. Please set it in your .env file.")

# --- NEW: Investment Calculator Configuration ---

# Labour cost as a percentage of the material renovation cost. 
# (e.g., 0.80 means labour is 80% of the material cost)
LABOUR_COST_PERCENTAGE = 0.80 

# Potential grants available (in EUR). We assume derelict properties might qualify.
# Source: https://www.citizensinformation.ie/en/housing/housing-grants-and-schemes/vacant-property-refurbishment-grant/
VACANT_PROPERTY_GRANT_AMOUNT = 50000.0
DERELICT_PROPERTY_TOP_UP_GRANT = 20000.0 # Additional grant if proven derelict

# Simplified SEAI grants. If Gemini's output contains these keywords,
# we can suggest a potential grant. This is a simplified model.
SEAI_GRANT_KEYWORDS = {
    "insulation": 1500.0,
    "windows": 3000.0,
    "heating": 1200.0,
    "boiler": 700.0
}