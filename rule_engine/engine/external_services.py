# engine/external_services.py
import requests
import json
import re
from typing import List

# New imports for the Gemini service
import google.generativeai as genai
from geopy.distance import great_circle

# Our existing models and config
from .models import RenovationItem, RenovationCost, Amenity, AmenityResult
from config import GEMINI_API_KEY, DAFT_COOKIE # <-- Import the new key

# --- Configure the Gemini Client ---
# This is more efficient than creating a client on every call
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-2.5-pro')


def _clean_and_parse_json(raw_text: str) -> list:
    """
    Cleans the raw text response from the LLM and parses it into a list.
    Handles responses wrapped in markdown code blocks.
    """
    # Regex to find JSON content within ```json ... ```
    match = re.search(r"```json\n(.*?)\n```", raw_text, re.DOTALL)
    if match:
        clean_str = match.group(1)
    else:
        # Assume the whole string is the JSON if no markdown block is found
        clean_str = raw_text
    
    return json.loads(clean_str)


def get_renovation_cost(image_urls: List[str]) -> RenovationCost:
    """Calls the Gemini vision model to get renovation cost details from images."""
    print("   -> [LIVE] Calling Gemini Vision API for renovation analysis...")
    image_parts = []

    # --- FIX: Use a requests.Session for persistent headers and cookies ---
    with requests.Session() as session:
        # Configure the session with a standard browser User-Agent
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        # Set the necessary cookies for the session
        # This assumes the cookie name is 'cf_clearance' as is common.
        if DAFT_COOKIE and '=' in DAFT_COOKIE:
            cookie_name, cookie_value = DAFT_COOKIE.split('=', 1)
            session.cookies.update({cookie_name: cookie_value})

        # Download image data using the configured session
        for url in image_urls:
            try:
                # Use session.get() which automatically includes the headers and cookies
                response = session.get(url, stream=True, timeout=10) # Added timeout
                response.raise_for_status()
                # Use Part.from_uri for URLs when possible or from data
                image_parts.append({'mime_type': 'image/jpeg', 'data': response.content})
            except requests.exceptions.RequestException as e:
                print(f"   WARNING: Could not download image {url}. Skipping. Error: {e}")
                continue
    # -----------------------------------------------------------------

    if not image_parts:
        print("   -> ERROR: No valid images could be loaded. Returning zero cost.")
        return RenovationCost(items=[], total_cost=0.0)

    prompt = "Play a role as an expert property evaluator. Analyze the uploaded photos and provide a list of broken or degraded items that require renovation. Return a JSON list where each object has 'item', 'reason', 'material', 'amount', and 'price' (estimated in GBP, e.g., '£1500'). Focus only on damaged items. For outdoor photos, evaluate only the building's exterior (walls, roof, windows, doors). Do not include landscaping. The final output must be only the raw JSON list, without any extra text or markdown."
    
    # Construct the contents list for the API call
    contents = [prompt] + [genai.types.Part(inline_data=part['data'], mime_type=part['mime_type']) for part in image_parts]


    try:
        response = gemini_model.generate_content(contents)
        parsed_data = _clean_and_parse_json(response.text)
        validated_items = [RenovationItem.model_validate(item) for item in parsed_data]
        total_cost = sum(item.cost for item in validated_items)
        
        print(f"   -> SUCCESS: Gemini analysis complete. Estimated Renovation Cost: £{total_cost:.2f}")
        return RenovationCost(items=validated_items, total_cost=total_cost)

    except (json.JSONDecodeError, ValueError) as e:
        print(f"   -> ERROR: Failed to parse or validate JSON response from Gemini. Error: {e}")
    except Exception as e:
        print(f"   -> ERROR: An unexpected error occurred during Gemini API call. Error: {e}")
    
    return RenovationCost(items=[], total_cost=0.0)

# --- The rest of the functions in this file remain the same ---

def get_market_average(latitude: float, longitude: float) -> float:
    # ... (no change)

    return 300000 + (latitude * 100) + (longitude * 100)

def get_amenity_details(latitude: float, longitude: float, api_key: str) -> AmenityResult:
    """
    Finds nearby amenities, calculates their distance, and returns a score and detailed list.
    """
    print("   -> Checking for amenities using Places API...")
    
    # Define the types of amenities we are interested in
    amenity_types = ['supermarket', 'school', 'bus_station', 'train_station', 'park']
    
    # Store the results
    found_amenities_list = []
    
    # Update the FieldMask to request the data we need: name, type, and location
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': 'places.displayName,places.types,places.location'
    }
    
    property_coords = (latitude, longitude)

    for place_type in amenity_types:
        payload = {
            "includedTypes": [place_type],
            "maxResultCount": 1, # Get the closest one
            "locationRestriction": {
                "circle": {
                    "center": {"latitude": latitude, "longitude": longitude},
                    "radius": 5000.0 # Search within a 2km radius
                }
            }
        }
        try:
            response = requests.post("https://places.googleapis.com/v1/places:searchNearby", json=payload, headers=headers, timeout=5)
            if response.ok and response.json().get('places'):
                place = response.json()['places'][0]
                
                # Calculate distance
                place_coords = (place['location']['latitude'], place['location']['longitude'])
                distance_km = round(great_circle(property_coords, place_coords).kilometers, 2)
                
                # Create the Amenity object
                amenity = Amenity(
                    name=place['displayName']['text'],
                    type=place_type.replace('_', ' '),
                    distance_km=distance_km
                )
                found_amenities_list.append(amenity)

        except requests.exceptions.RequestException:
            # Silently fail on API error to not stop the whole process
            continue
            
    # Calculate the final score based on how many types were found
    score = round((len(found_amenities_list) / len(amenity_types)) * 100, 2)
    
    # Return the comprehensive result object
    return AmenityResult(score=score, found_amenities=found_amenities_list)


def get_air_quality_score(latitude: float, longitude: float, api_key: str) -> float:
    # ... (no change)
    url = "https://airquality.googleapis.com/v1/currentConditions:lookup"
    payload = {"location": {"latitude": latitude, "longitude": longitude}}
    
    try:
        response = requests.post(f"{url}?key={api_key}", json=payload)
        response.raise_for_status()
        data = response.json()
        uaqi = next((idx['aqi'] for idx in data['indexes'] if idx['code'] == 'uaqi'), 75)
        max_aqi = 500
        if uaqi < 0:
            uaqi = 0
        elif uaqi > max_aqi:
            uaqi = max_aqi
        score = (1 - uaqi / max_aqi) * 100
        # score = 100 - (min(uaqi, 150) / 150 * 100)
        return round(score, 2)
    except requests.exceptions.RequestException:
        return 50.0