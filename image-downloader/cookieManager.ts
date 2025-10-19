import { generateCloudflareCookie } from "./getCloudflareCookie.js";
import { Firestore } from "firebase-admin/firestore";

const COOKIE_TTL_MS = 30 * 60 * 1000;

interface CookieData {
  cookie: string;
  expiresAt: number;
  createdAt: number;
}

export async function getCloudflareCookieFromCache(
  db: Firestore,
  url: string,
): Promise<string> {
  const urlHost = new URL(url).hostname;
  const docRef = db.collection("cloudflare_cookies").doc(urlHost);

  const doc = await docRef.get();

  if (doc.exists) {
    const data = doc.data() as CookieData;
    const now = Date.now();

    if (data.expiresAt > now) {
      console.log(`Using cached cookie for ${urlHost}`);
      return data.cookie;
    } else {
      console.log(`Cached cookie expired, generating new one`);
    }
  }

  console.log(`Generating new cookie for ${urlHost}`);
  const newCookie = await generateCloudflareCookie();

  const now = Date.now();
  const cookieDoc: CookieData = {
    cookie: newCookie,
    expiresAt: now + COOKIE_TTL_MS,
    createdAt: now,
  };

  await docRef.set(cookieDoc);

  console.log(`Cookie stored for ${urlHost}`);

  return newCookie;
}
