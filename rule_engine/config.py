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