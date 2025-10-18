import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
import axios from "axios";

const DOMAIN = "https://www.daft.ie";
const START_URL =
  "https://www.daft.ie/property-for-sale/ireland?adState=published&terms=derelict";
const START_PAGE = 2;
const END_PAGE = 24;
const DELAY_BETWEEN_REQUESTS = 500;

function parseHydrationData(html: string) {
  const regex = /<script id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s;
  const match = html.match(regex);

  if (!match || !match[1]) {
    throw new Error("Could not find __NEXT_DATA__ script tag");
  }

  try {
    return JSON.parse(match[1]);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error}`);
  }
}

async function simulateMouseMovement(page: any) {
  const moves = 20;
  for (let i = 0; i < moves; i++) {
    const x = Math.floor(Math.random() * 800) + 100;
    const y = Math.floor(Math.random() * 600) + 100;
    await page.mouse.move(x, y);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function extractChallengeCookie(page: any): Promise<string> {
  const cookies = await page.cookies();
  const cfClearance = cookies.find(
    (cookie: any) => cookie.name === "cf_clearance",
  );

  if (!cfClearance) {
    throw new Error("cf_clearance cookie not found");
  }

  const allCookies = cookies
    .map((cookie: any) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return allCookies;
}

async function scrapeDetailsWithCookie(url: string, challengeCookie: string) {
  console.log(`Fetching details for ${url}...`);

  const response = await axios.get(url, {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      cookie: challengeCookie,
      pragma: "no-cache",
      priority: "u=0, i",
      "sec-ch-ua":
        '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    },
  });

  const html = response.data;
  const data = parseHydrationData(html);

  return data;
}

async function scrapeListingsPage(pageNumber: number) {
  const url = `${START_URL}&page=${pageNumber}`;
  console.log(`Scraping listings page ${pageNumber}: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    console.log(`Navigating to ${url}...`);
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Simulating mouse movement...");
    await simulateMouseMovement(page);

    console.log("Waiting for JS challenge to resolve...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await page.waitForNetworkIdle({ timeout: 30000 });

    console.log("Extracting challenge cookie...");
    const challengeCookie = await extractChallengeCookie(page);

    console.log("Getting HTML content...");
    const html = await page.content();

    console.log("Parsing listings data...");
    const data = parseHydrationData(html);
    const listings = data.props?.pageProps?.listings || [];

    console.log(`Found ${listings.length} listings on page ${pageNumber}`);

    return { listings, challengeCookie };
  } finally {
    await browser.close();
  }
}

async function scrapeAllProperties() {
  const allProperties: any[] = [];

  console.log(`Starting scrape from page ${START_PAGE} to ${END_PAGE}`);

  for (let pageNumber = START_PAGE; pageNumber <= END_PAGE; pageNumber++) {
    try {
      const { listings, challengeCookie } =
        await scrapeListingsPage(pageNumber);

      for (const listing of listings) {
        const seoFriendlyPath = listing.listing?.seoFriendlyPath;

        if (!seoFriendlyPath) {
          console.log("Skipping listing without seoFriendlyPath");
          continue;
        }

        const propertyUrl = `${DOMAIN}${seoFriendlyPath}`;

        try {
          await new Promise((resolve) =>
            setTimeout(resolve, DELAY_BETWEEN_REQUESTS),
          );

          const propertyDetails = await scrapeDetailsWithCookie(
            propertyUrl,
            challengeCookie,
          );
          allProperties.push(propertyDetails);

          console.log(
            `Successfully scraped ${allProperties.length} properties so far`,
          );
        } catch (error) {
          console.error(`Failed to scrape ${propertyUrl}:`, error);
        }
      }
    } catch (error) {
      console.error(`Failed to scrape page ${pageNumber}:`, error);
    }
  }

  const filename = "all-properties.json";
  writeFileSync(filename, JSON.stringify(allProperties, null, 2), "utf-8");
  console.log(
    `\nScraping complete! Saved ${allProperties.length} properties to ${filename}`,
  );
}

async function scrapeDetails(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    console.log(`Navigating to ${url}...`);
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("Simulating mouse movement...");
    await simulateMouseMovement(page);

    console.log("Waiting for JS challenge to resolve...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await page.waitForNetworkIdle({ timeout: 30000 });

    console.log("Getting HTML content...");
    const html = await page.content();

    writeFileSync("html.html", html, "utf-8");
    console.log("Parsing Next.js hydration data...");
    const data = parseHydrationData(html);

    const filename = "data.js";
    const jsContent = `export const data = ${JSON.stringify(data, null, 2)};`;

    writeFileSync(filename, jsContent, "utf-8");
    console.log(`Parsed data saved to ${filename}`);
  } finally {
    await browser.close();
  }
}

scrapeAllProperties().catch(console.error);
