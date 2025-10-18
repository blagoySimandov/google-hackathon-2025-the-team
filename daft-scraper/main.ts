import puppeteer from "puppeteer";
import { writeFileSync } from "fs";

async function scrape(url: string) {
  const browser = await puppeteer.launch({
    headless: false,
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

    console.log("Waiting for JS challenge to resolve...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await page.waitForNetworkIdle({ timeout: 30000 });

    console.log("Getting HTML content...");
    const html = await page.content();

    const filename = "html.html";
    writeFileSync(filename, html, "utf-8");
    console.log(`HTML saved to ${filename}`);
  } finally {
    await browser.close();
  }
}

const url = process.argv[2];

if (!url) {
  console.error("Usage: bun main.ts <url>");
  process.exit(1);
}

scrape(url).catch(console.error);
