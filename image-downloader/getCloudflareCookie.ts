import puppeteer, { Page, Browser } from "puppeteer";

async function simulateMouseMovement(page: Page): Promise<void> {
  const moves = 20;
  for (let i = 0; i < moves; i++) {
    const x = Math.floor(Math.random() * 800) + 100;
    const y = Math.floor(Math.random() * 600) + 100;
    await page.mouse.move(x, y);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function extractChallengeCookie(page: Page): Promise<string> {
  const cookies = await page.cookies();
  const cfClearance = cookies.find(
    (cookie) => cookie.name === "cf_clearance",
  );

  if (!cfClearance) {
    throw new Error("cf_clearance cookie not found");
  }

  const allCookies = cookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  return allCookies;
}

export async function generateCloudflareCookie(): Promise<string> {
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    const baseUrl = "https://www.daft.ie/";
    console.log(`Navigating to ${baseUrl}...`);
    await page.goto(baseUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await simulateMouseMovement(page);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await page.waitForNetworkIdle({ timeout: 30000 });

    const challengeCookie = await extractChallengeCookie(page);

    return challengeCookie;
  } finally {
    await browser.close();
  }
}
