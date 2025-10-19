import requests
import json
import re
from typing import List
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
# New imports for the Gemini service
import google.generativeai as genai
from geopy.distance import great_circle

# Our existing models and config
from .models import RenovationItem, RenovationCost, Amenity, AmenityResult
from config import GEMINI_API_KEY, DAFT_COOKIE # <-- Import the new key

# This is more efficient than creating a client on every call
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-1.5-pro')

# --- NEW: Cloud Function Configuration ---
GET_HOUSE_PRICE_URL = "https://gethouseprice-gp7bcz6nya-uc.a.run.app/"
DEFAULT_MARKET_PRICE = 300000.0


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


def _parse_price_string(price_str: str) -> float:
    """
    A helper function to remove currency symbols and commas from a price string
    and convert it to a float. Returns 0.0 on failure.
    """
    if not isinstance(price_str, str):
        return 0.0
    # Remove any character that is not a digit or a decimal point
    cleaned_str = re.sub(r'[^\d.]', '', price_str)
    try:
        return float(cleaned_str)
    except (ValueError, TypeError):
        return 0.0

def get_market_average(latitude: float, longitude: float) -> float:
    """
    Fetches the average market price from the external GetHousePrice Cloud Function.
    Falls back to a default value if the API call fails.
    """
    print(f"   -> [LIVE] Calling GetHousePrice API for market average...")
    params = {"lat": latitude, "lon": longitude}
    try:
        response = requests.get(GET_HOUSE_PRICE_URL, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        
        # --- THE FIX ---
        # Try to get the price from a key named 'price' first. If that fails,
        # fall back to trying 'median'.
        price_str = data.get("price") or data.get("median")

        if price_str:
            price = _parse_price_string(price_str)
            if price > 0:
                print(f"   -> SUCCESS: Market average found: €{price:,.2f}")
                return price
        
        print(f"   -> WARNING: API returned an invalid price string ('{price_str}'). Falling back to default.")
        return DEFAULT_MARKET_PRICE

    except requests.exceptions.RequestException as e:
        print(f"   -> ERROR: Could not connect to GetHousePrice API: {e}. Falling back to default price.")
        return DEFAULT_MARKET_PRICE
    except json.JSONDecodeError:
        print(f"   -> ERROR: Failed to parse JSON from GetHousePrice API. Falling back to default price.")
        return DEFAULT_MARKET_PRICE


def get_amenity_details(latitude: float, longitude: float, api_key: str) -> AmenityResult:
    """
    Finds nearby amenities, calculates their distance, and returns a score and detailed list.
    The score is now distance-weighted: closer amenities result in a higher score.
    """
    print("   -> Checking for amenities using Places API...")
    
    amenity_types = ['supermarket', 'school', 'bus_station', 'train_station', 'park', 'hospital', 'pharmacy']
    found_amenities_list = []
    
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': api_key,
        'X-Goog-FieldMask': 'places.displayName,places.types,places.location'
    }
    
    property_coords = (latitude, longitude)
    
    # Define a max search radius, which will also be our scoring boundary
    MAX_RADIUS_KM = 5.0

    for place_type in amenity_types:
        payload = {
            "includedTypes": [place_type],
            "maxResultCount": 1, # Get the closest one
            "locationRestriction": {
                "circle": {
                    "center": {"latitude": latitude, "longitude": longitude},
                    "radius": MAX_RADIUS_KM * 1000 # API expects radius in meters
                }
            }
        }
        try:
            response = requests.post("https://places.googleapis.com/v1/places:searchNearby", json=payload, headers=headers, timeout=5)
            if response.ok and response.json().get('places'):
                place = response.json()['places'][0]
                
                place_coords = (place['location']['latitude'], place['location']['longitude'])
                distance_km = round(great_circle(property_coords, place_coords).kilometers, 2)
                
                amenity = Amenity(
                    name=place['displayName']['text'],
                    type=place_type.replace('_', ' '),
                    distance_km=distance_km
                )
                found_amenities_list.append(amenity)

        except requests.exceptions.RequestException:
            # Silently fail on API error to not stop the whole process
            continue
            
    # --- NEW DISTANCE-WEIGHTED SCORING LOGIC ---
    if not found_amenities_list:
        return AmenityResult(score=0.0, found_amenities=[])

    total_score_points = 0
    num_searched_types = len(amenity_types)

    for amenity in found_amenities_list:
        # Calculate a score for this amenity (100 for 0km, 0 for MAX_RADIUS_KM)
        # using a linear decay.
        amenity_score = 100 * (1 - (min(amenity.distance_km, MAX_RADIUS_KM) / MAX_RADIUS_KM))
        total_score_points += amenity_score
    print("Found amenities: ", found_amenities_list)  
    print("Total score: ", total_score_points)  
    # Average the score across all *searched* amenity types. This correctly
    # penalizes the score if some amenity types were not found.
    print("Number of searched types: ", num_searched_types)  
    final_score = round(total_score_points / num_searched_types, 2)
    
    return AmenityResult(score=final_score, found_amenities=found_amenities_list)


def get_air_quality_score(latitude: float, longitude: float, api_key: str) -> float:
    # ... (no change)
    url = "https://airquality.googleapis.com/v1/currentConditions:lookup"
    payload = {"location": {"latitude": latitude, "longitude": longitude}}

    historical_url = "https://airquality.googleapis.com/v1/history:lookup"

    # Current date and time in Ireland timezone
    ireland_tz = ZoneInfo("Europe/Dublin")
    now_utc = datetime.now(ireland_tz).replace(microsecond=0)

    # Datetime 7 days before current in UTC
    one_days_ago = now_utc - timedelta(days=1)
    one_days_ago_iso = one_days_ago.isoformat().replace("+01:00", "Z")
    seven_days_ago = now_utc - timedelta(days=7)
    seven_days_ago_iso = seven_days_ago.isoformat().replace("+01:00", "Z")
    historical_payload = {"location": {"latitude": latitude, "longitude": longitude}, "period": {
        "startTime":seven_days_ago_iso,
        "endTime":one_days_ago_iso
    }}
    # print(payload)
    
    
    try:
        response = requests.post(f"{url}?key={api_key}", json=payload)
        response.raise_for_status()
        data = response.json()
        print("Air quality data: ", data)
        uaqi = next((idx['aqi'] for idx in data['indexes'] if idx['code'] == 'uaqi'), 75)

        historical_response = requests.post(f"{historical_url}?key={api_key}", json=historical_payload)
        historical_data = historical_response.json()
        print("Air quality data: ", historical_data)

        historical_hour_data = historical_data['hoursInfo']
        list_aqi = [hour['indexes'][0]['aqi'] for hour in historical_hour_data]
        list_categories = [hour['indexes'][0]['category'] for hour in historical_hour_data]
        most_frequent_category = max(list_categories, key=list_categories.count)

        list_aqi.append(uaqi)
        avg_aqi = sum(list_aqi) / len(list_aqi)

        max_aqi = 500
        if avg_aqi < 0:
            avg_aqi = 0
        elif avg_aqi > max_aqi:
            avg_aqi = max_aqi
        score = (1 - avg_aqi / max_aqi) * 100
        # score = 100 - (min(uaqi, 150) / 150 * 100)
        # historical_data = requests.post(f"https://airquality.googleapis.com/v1/historicalConditions:lookup?key={api_key}&location={latitude},{longitude}&startDate=2024-01-01&endDate=2024-12-31")
        return round(score, 2), round(avg_aqi, 2), most_frequent_category
    except requests.exceptions.RequestException:
        return 50.0, 100, "Good air quality"