import axios from "axios";
import * as fs from "fs";

interface Town {
  town: string;
  price: string;
  bounds?: Bounds;
}

interface LatLng {
  lat: number;
  lng: number;
}

interface Bounds {
  northeast: LatLng;
  southwest: LatLng;
}

interface CityData {
  towns?: Town[];
}

interface GeocodeResponse {
  results: Array<{
    geometry: {
      bounds?: Bounds;
    };
  }>;
  status: string;
}

async function getTownBounds(town: string, apiKey: string): Promise<Bounds> {
  const query = `${town}, Ireland`;
  const baseURL = "https://maps.googleapis.com/maps/api/geocode/json";

  const params = new URLSearchParams({
    address: query,
    key: apiKey,
  });

  const response = await axios.get<GeocodeResponse>(
    `${baseURL}?${params.toString()}`
  );

  if (response.data.status !== "OK") {
    throw new Error(`Geocoding failed with status: ${response.data.status}`);
  }

  if (response.data.results.length === 0) {
    throw new Error("No results found");
  }

  const bounds = response.data.results[0].geometry.bounds;
  if (!bounds) {
    throw new Error("No bounds in response");
  }

  return bounds;
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Usage: ts-node add_city_bounds.ts <GOOGLE_MAPS_API_KEY>");
    process.exit(1);
  }

  const apiKey = process.argv[2];
  const inputFile = "houseprice_data.json";
  const outputFile = "houseprice_data.json";

  let data: string;
  try {
    data = fs.readFileSync(inputFile, "utf-8");
  } catch (err) {
    console.error(`Error reading file: ${err}`);
    process.exit(1);
  }

  let oldFormat: Record<string, Town[]>;
  try {
    oldFormat = JSON.parse(data);
  } catch (err) {
    console.error(`Error parsing JSON: ${err}`);
    process.exit(1);
  }

  const newFormat: Record<string, CityData> = {};

  for (const [city, towns] of Object.entries(oldFormat)) {
    console.log(`Processing city: ${city}`);

    if (towns.length === 0) {
      console.log(`  Skipping ${city} (no towns)`);
      newFormat[city] = { towns };
      continue;
    }

    const updatedTowns: Town[] = [];

    for (const town of towns) {
      console.log(`  Processing town: ${town.town}`);

      try {
        const bounds = await getTownBounds(town.town, apiKey);

        updatedTowns.push({
          ...town,
          bounds,
        });

        console.log(
          `    Added bounds: NE(${bounds.northeast.lat.toFixed(6)}, ${bounds.northeast.lng.toFixed(
            6
          )}) SW(${bounds.southwest.lat.toFixed(6)}, ${bounds.southwest.lng.toFixed(6)})`
        );

        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.error(`    Error getting bounds for ${town.town}: ${err}`);
        updatedTowns.push(town);
      }
    }

    newFormat[city] = {
      towns: updatedTowns,
    };
  }

  try {
    const output = JSON.stringify(newFormat, null, 2);
    fs.writeFileSync(outputFile, output);
  } catch (err) {
    console.error(`Error writing file: ${err}`);
    process.exit(1);
  }

  console.log(`\nSuccessfully updated ${outputFile} with town bounds!`);
}

main();
