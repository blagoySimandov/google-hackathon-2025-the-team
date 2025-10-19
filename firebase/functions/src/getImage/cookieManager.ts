import { getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { generateCloudflareCookie } from "./getCloudflareCookie";

interface CookieDocument {
  cookie: string;
  expiresAt: number;
  createdAt: number;
}

const COOKIE_TTL_MS = 30 * 60 * 1000;

export async function getCloudflareCookieFromCache(
  url: string,
): Promise<string> {
  const app = getApp();
  const db = getFirestore(app);
  const urlHost = new URL(url).hostname;
  const docRef = db.collection("cloudflare_cookies").doc(urlHost);

  const doc = await docRef.get();

  if (doc.exists) {
    const data = doc.data() as CookieDocument;
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
  const cookieDoc: CookieDocument = {
    cookie: newCookie,
    expiresAt: now + COOKIE_TTL_MS,
    createdAt: now,
  };

  await docRef.set(cookieDoc);

  console.log(`Cookie stored for ${urlHost}`);

  return newCookie;
}
