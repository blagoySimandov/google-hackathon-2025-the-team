import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";

const COUNTY_URLS = [
  "https://houseprice.ie/dublin",
  "https://houseprice.ie/cork",
  "https://houseprice.ie/galway",
  "https://houseprice.ie/limerick",
  "https://houseprice.ie/waterford",
  "https://houseprice.ie/tipperary",
  "https://houseprice.ie/clare",
  "https://houseprice.ie/offaly",
  "https://houseprice.ie/laois",
  "https://houseprice.ie/carlow",
  "https://houseprice.ie/kilkenny",
  "https://houseprice.ie/wexford",
  "https://houseprice.ie/wicklow",
  "https://houseprice.ie/kildare",
  "https://houseprice.ie/meath",
  "https://houseprice.ie/louth",
  "https://houseprice.ie/monaghan",
  "https://houseprice.ie/cavan",
  "https://houseprice.ie/longford",
  "https://houseprice.ie/westmeath",
  "https://houseprice.ie/roscommon",
  "https://houseprice.ie/sligo",
  "https://houseprice.ie/leitrim",
  "https://houseprice.ie/mayo",
  "https://houseprice.ie/donegal",
  "https://houseprice.ie/derry",
  "https://houseprice.ie/tyrone",
  "https://houseprice.ie/fermanagh",
  "https://houseprice.ie/armagh",
  "https://houseprice.ie/down",
  "https://houseprice.ie/antrim",
];

async function scrapeTownPrices(url: string, county: string) {
  try {
    console.log(`Fetching ${url}...`);
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    const townPrices: {
      town: string;
      price: string;
    }[] = [];

    const rows = $("#town-table-body tr");

    rows.each((index, element) => {
      const townElement = $(element).find("td:first-child a");

      const priceElement = $(element).find("td:nth-child(2) span:first-child");

      if (townElement.length && priceElement.length) {
        const townName = townElement.text().trim();
        const medianPrice = priceElement.text().trim();

        townPrices.push({
          town: townName,
          price: medianPrice,
        });
      }
    });

    console.log(`✓ Scraped ${townPrices.length} towns from ${county}`);

    return townPrices;
  } catch (error) {
    console.error(`Error scraping ${county}:`, error.message);
    return [];
  }
}

async function scrapeAllCounties() {
  const results: Record<string, any[]> = {};

  for (const url of COUNTY_URLS) {
    const county = url.split("/").pop() || "unknown";
    const townPrices = await scrapeTownPrices(url, county);
    results[county] = townPrices;

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const outputFile = "houseprice_data.json";
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\n✓ Data saved to ${outputFile}`);

  return results;
}

scrapeAllCounties();
