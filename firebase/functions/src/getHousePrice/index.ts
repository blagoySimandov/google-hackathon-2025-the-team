import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { isPointInBounds, getBoundsCenter, getDistance, Bounds } from "./utils";
import * as housePriceData from "./houseprice_data.json";

interface Town {
  town: string;
  price: string;
  bounds?: Bounds;
}

interface CityData {
  towns?: Town[];
}

interface HousePriceData {
  [county: string]: CityData;
}

const DEFAULT_PRICE = "€300,000";

export const getHousePrice = onRequest((request, response) => {
  const lat = parseFloat(request.query.lat as string);
  const lon = parseFloat(request.query.lon as string);

  if (isNaN(lat) || isNaN(lon)) {
    response.status(400).json({ error: "Invalid lat or lon parameters" });
    return;
  }

  logger.info(`Looking up price for lat=${lat}, lon=${lon}`);

  const data = housePriceData as HousePriceData;

  for (const [county, cityData] of Object.entries(data)) {
    if (!cityData.towns) continue;

    for (const town of cityData.towns) {
      if (town.bounds && isPointInBounds(lat, lon, town.bounds)) {
        logger.info(`Exact match found: ${town.town} in ${county}`);
        response.json({
          town: town.town,
          price: town.price || DEFAULT_PRICE,
          matchType: "exact",
          county: county,
        });
        return;
      }
    }
  }

  let nearestTown: Town | null = null;
  let nearestCounty: string | null = null;
  let minDistance = Infinity;

  for (const [county, cityData] of Object.entries(data)) {
    if (!cityData.towns) continue;

    for (const town of cityData.towns) {
      if (!town.bounds) continue;

      const center = getBoundsCenter(town.bounds);
      const distance = getDistance(lat, lon, center.lat, center.lng);

      if (distance < minDistance) {
        minDistance = distance;
        nearestTown = town;
        nearestCounty = county;
      }
    }
  }

  if (nearestTown && nearestCounty) {
    logger.info(
      `Nearest match found: ${nearestTown.town} in ${nearestCounty} (${minDistance.toFixed(2)}km away)`,
    );
    response.json({
      town: nearestTown.town,
      price: nearestTown.price || DEFAULT_PRICE,
      matchType: "nearest",
      county: nearestCounty,
      distanceKm: Math.round(minDistance * 10) / 10,
    });
    return;
  }

  logger.info("No match found, using default price");
  response.json({
    town: "Ireland (National Average)",
    price: DEFAULT_PRICE,
    matchType: "default",
  });
});
