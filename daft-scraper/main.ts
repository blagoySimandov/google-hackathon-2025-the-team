import puppeteer from "puppeteer";
import { writeFileSync } from "fs";

//https://www.daft.ie/property-for-sale/ireland?adState=published&terms=derelict
//
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

const url = process.argv[2];

if (!url) {
  console.error("Usage: npm start <url> or tsx main.ts <url>");
  process.exit(1);
}

scrapeDetails(url).catch(console.error);
