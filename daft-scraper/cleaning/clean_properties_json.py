import json
import re
from typing import Any, Dict, List, Optional
from datetime import datetime


def extract_price(price_str: Optional[str]) -> Optional[Dict[str, Any]]:
    if not price_str:
        return None

    match = re.search(r"€?([\d,]+)", str(price_str))
    if match:
        amount = float(match.group(1).replace(",", ""))
        return {"amount": amount, "currency": "EUR", "formatted": price_str}
    return None


def extract_number(text: Optional[str]) -> Optional[int]:
    if not text:
        return None
    match = re.search(r"\d+", str(text))
    return int(match.group()) if match else None


def extract_eircodes(text: Optional[str]) -> List[str]:
    if not text:
        return []

    pattern = r"\b[A-Z]\d{2}\s?[A-Z0-9]{4}\b"
    matches = re.findall(pattern, text)
    return [m.replace(" ", "") for m in matches]


def extract_folios(text: Optional[str]) -> List[str]:
    if not text:
        return []

    pattern = r"\bFolio\s+([A-Z]{2}\d+[A-Z]?)\b"
    matches = re.findall(pattern, text, re.IGNORECASE)
    return matches


def extract_utilities(text: Optional[str]) -> List[str]:
    if not text:
        return []

    utilities = []
    text_lower = text.lower()

    utility_patterns = [
        ("mains water", r"mains\s+water"),
        ("mains sewage", r"mains\s+sewage"),
        ("septic tank", r"septic\s+tank"),
        ("broadband", r"broadband"),
        ("phone line", r"phone\s+line"),
        ("electricity", r"electricity"),
        ("gas", r"gas\s+(supply|available)"),
    ]

    for utility_name, pattern in utility_patterns:
        if re.search(pattern, text_lower):
            utilities.append(utility_name)

    return utilities


def extract_nearby_locations(text: Optional[str]) -> Dict[str, List[str]]:
    if not text:
        return {}

    locations = {"shortDrive": [], "withinHour": [], "closeBy": []}

    short_drive_pattern = r"(?:short drive|a few minutes) from ([^.,]+)"
    matches = re.findall(short_drive_pattern, text, re.IGNORECASE)
    for match in matches:
        location_list = [loc.strip() for loc in match.split(" or ")]
        locations["shortDrive"].extend(location_list)

    within_hour_pattern = r"within (?:an? )?hours? drive of ([^.,]+)"
    matches = re.findall(within_hour_pattern, text, re.IGNORECASE)
    for match in matches:
        location_list = [loc.strip() for loc in match.split(" or ")]
        locations["withinHour"].extend(location_list)

    close_pattern = r"close to ([^.,]+)"
    matches = re.findall(close_pattern, text, re.IGNORECASE)
    for match in matches:
        locations["closeBy"].append(match.strip())

    return {k: v for k, v in locations.items() if v}


def parse_date(date_str: Optional[str]) -> Optional[str]:
    if not date_str:
        return None
    try:
        dt = datetime.fromisoformat(str(date_str))
        return dt.isoformat()
    except:
        return date_str


def clean_property(item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    try:
        listing = item.get("props", {}).get("pageProps", {}).get("listing", {})
        pageProps = item.get("props", {}).get("pageProps", {})

        if not listing:
            return None

        description = listing.get("description", "")

        images = listing.get("media", {}).get("images", [])
        floor_plan_images = []
        for image in images:
            image_labels = image.get("imageLabels", [])
            if any(label.get("type") == "FLOOR_PLAN" for label in image_labels):
                floor_plan_images.append(image)
        cleaned = {
            "id": listing.get("id"),
            "title": listing.get("title"),
            "seoTitle": listing.get("seoTitle"),
            "amenities": pageProps.get("amenities"),
            "floorArea": listing.get("floorArea"),
            "floorAreaFormatted": listing.get("propertySize"),
            "floorPlanImages": floor_plan_images,
            "daftShortcode": listing.get("daftShortcode"),
            "seoFriendlyPath": listing.get("seoFriendlyPath"),
            "priceHistory": listing.get("priceHistory", []),
            "propertyType": listing.get("propertyType"),
            "sections": listing.get("sections", []),
            "price": extract_price(listing.get("price")),
            "bedrooms": extract_number(listing.get("numBedrooms"))
            or listing.get("nonFormatted", {}).get("beds"),
            "bathrooms": extract_number(listing.get("numBathrooms")),
            "location": {
                "areaName": listing.get("areaName"),
                "primaryAreaId": listing.get("primaryAreaId"),
                "isInRepublicOfIreland": listing.get("isInRepublicOfIreland", False),
                "coordinates": listing.get("point", {}).get("coordinates", []),
                "eircodes": extract_eircodes(description),
            },
            "dates": {
                "publishDate": parse_date(listing.get("publishDate")),
                "lastUpdateDate": parse_date(listing.get("lastUpdateDate")),
                "dateOfConstruction": listing.get("dateOfConstruction"),
            },
            "media": {
                "images": listing.get("media", {}).get("images", []),
                "totalImages": listing.get("media", {}).get("totalImages", 0),
                "hasVideo": listing.get("media", {}).get("hasVideo", False),
                "hasVirtualTour": listing.get("media", {}).get("hasVirtualTour", False),
                "hasBrochure": listing.get("media", {}).get("hasBrochure", False),
            },
            "seller": {
                "id": listing.get("seller", {}).get("sellerId"),
                "name": listing.get("seller", {}).get("name"),
                "type": listing.get("seller", {}).get("sellerType"),
                "branch": listing.get("seller", {}).get("branch"),
                "address": listing.get("seller", {}).get("address"),
                "phone": listing.get("seller", {}).get("phone"),
                "alternativePhone": listing.get("seller", {}).get("alternativePhone"),
                "licenceNumber": listing.get("seller", {}).get("licenceNumber"),
                "available": listing.get("seller", {}).get("sellerAvailable", False),
                "premierPartner": listing.get("seller", {}).get(
                    "premierPartnerSeller", False
                ),
                "images": {
                    "profileImage": listing.get("seller", {}).get("profileImage"),
                    "profileRoundedImage": listing.get("seller", {}).get(
                        "profileRoundedImage"
                    ),
                    "standardLogo": listing.get("seller", {}).get("standardLogo"),
                    "squareLogo": listing.get("seller", {}).get("squareLogo"),
                },
                "backgroundColour": listing.get("seller", {}).get("backgroundColour"),
            },
            "ber": {
                "rating": listing.get("ber", {}).get("rating")
                if listing.get("ber")
                else None,
            },
            "description": description,
            "features": listing.get("features", []),
            "extracted": {
                "folios": extract_folios(description),
                "utilities": extract_utilities(description),
                "nearbyLocations": extract_nearby_locations(description),
            },
            "metadata": {
                "featuredLevel": listing.get("featuredLevel"),
                "featuredLevelFull": listing.get("featuredLevelFull"),
                "sticker": listing.get("sticker"),
                "sellingType": listing.get("sellingType"),
                "category": listing.get("category"),
                "state": listing.get("state"),
                "platform": listing.get("platform"),
                "premierPartner": listing.get("premierPartner", False),
                "imageRestricted": listing.get("imageRestricted", False),
            },
            "stamps": {
                "stampDutyValue": extract_price(listing.get("stampDutyValue")),
            },
            "branding": listing.get("pageBranding", {}),
            "analytics": {
                "listingViews": item.get("props", {})
                .get("pageProps", {})
                .get("listingViews"),
            },
        }

        cleaned = {k: v for k, v in cleaned.items() if v is not None}

        return cleaned

    except Exception as e:
        print(f"Error cleaning property: {e}")
        return None


def clean_properties_data(input_file: str, output_file: str):
    print(f"Loading data from {input_file}...")

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Total properties loaded: {len(data)}")

    cleaned_properties = []
    errors = 0

    for item in data:
        cleaned = clean_property(item)
        if cleaned:
            cleaned_properties.append(cleaned)
        else:
            errors += 1

    print(f"\nSuccessfully cleaned: {len(cleaned_properties)} properties")
    print(f"Errors: {errors}")

    unique_ids = set()
    deduplicated = []
    for prop in cleaned_properties:
        if prop["id"] not in unique_ids:
            unique_ids.add(prop["id"])
            deduplicated.append(prop)

    duplicates_removed = len(cleaned_properties) - len(deduplicated)
    if duplicates_removed > 0:
        print(f"Removed {duplicates_removed} duplicates")

    deduplicated.sort(
        key=lambda x: x.get("dates", {}).get("publishDate", ""), reverse=True
    )

    print(f"\nWriting cleaned data to {output_file}...")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(deduplicated, f, indent=2, ensure_ascii=False)

    print(f"✓ Saved {len(deduplicated)} properties to {output_file}")

    generate_summary(deduplicated)


def generate_summary(properties: List[Dict[str, Any]]):
    print("\n" + "=" * 60)
    print("DATASET SUMMARY")
    print("=" * 60)

    print(f"\nTotal Properties: {len(properties)}")

    prices = [p["price"]["amount"] for p in properties if p.get("price")]
    if prices:
        print(f"\nPrice Statistics:")
        print(f"  Mean: €{sum(prices) / len(prices):,.2f}")
        print(f"  Median: €{sorted(prices)[len(prices) // 2]:,.2f}")
        print(f"  Min: €{min(prices):,.2f}")
        print(f"  Max: €{max(prices):,.2f}")

    bedrooms = {}
    for p in properties:
        beds = p.get("bedrooms")
        if beds:
            bedrooms[beds] = bedrooms.get(beds, 0) + 1

    if bedrooms:
        print(f"\nBedrooms Distribution:")
        for beds in sorted(bedrooms.keys()):
            print(f"  {beds} bed: {bedrooms[beds]}")

    property_types = {}
    for p in properties:
        ptype = p.get("propertyType")
        if ptype:
            property_types[ptype] = property_types.get(ptype, 0) + 1

    if property_types:
        print(f"\nTop Property Types:")
        for ptype, count in sorted(
            property_types.items(), key=lambda x: x[1], reverse=True
        )[:10]:
            print(f"  {ptype}: {count}")

    ber_ratings = {}
    for p in properties:
        rating = p.get("ber", {}).get("rating")
        if rating:
            ber_ratings[rating] = ber_ratings.get(rating, 0) + 1

    if ber_ratings:
        print(f"\nBER Rating Distribution:")
        for rating in sorted(ber_ratings.keys()):
            print(f"  {rating}: {ber_ratings[rating]}")

    with_images = sum(
        1 for p in properties if p.get("media", {}).get("totalImages", 0) > 0
    )
    print(f"\nMedia Statistics:")
    print(
        f"  Properties with images: {with_images} ({with_images / len(properties) * 100:.1f}%)"
    )
    print(
        f"  Properties with video: {sum(1 for p in properties if p.get('media', {}).get('hasVideo'))}"
    )
    print(
        f"  Properties with virtual tour: {sum(1 for p in properties if p.get('media', {}).get('hasVirtualTour'))}"
    )

    with_utilities = sum(
        1 for p in properties if p.get("extracted", {}).get("utilities")
    )
    print(f"\nExtracted Information:")
    print(f"  Properties with utility info: {with_utilities}")
    print(
        f"  Properties with Eircode: {sum(1 for p in properties if p.get('location', {}).get('eircodes'))}"
    )
    print(
        f"  Properties with Folio: {sum(1 for p in properties if p.get('extracted', {}).get('folios'))}"
    )
    print(
        f"  Properties with nearby locations: {sum(1 for p in properties if p.get('extracted', {}).get('nearbyLocations'))}"
    )

    print("\n" + "=" * 60)


if __name__ == "__main__":
    input_file = "../all-properties.json"
    output_file = "./cleaned_properties.json"

    clean_properties_data(input_file, output_file)

    print("\n✓ Cleaning script completed successfully!")
