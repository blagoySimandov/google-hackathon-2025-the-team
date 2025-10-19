import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";

import axios from "axios";
import { getCloudflareCookieFromCache } from "./cookieManager";
import { getHeaders } from "./getHeaders";

export const getImage = onRequest(async (req, res) => {
  const { url } = req.query as { url: string };

  if (!url) {
    res.status(400).send("Missing url parameter");
    return;
  }

  try {
    const cookie = await getCloudflareCookieFromCache(url);

    const { data, headers } = await axios.get(url, getHeaders(cookie));

    const contentType = headers["content-type"] || "image/jpeg";
    res.set("Content-Type", contentType);
    res.send(Buffer.from(data));
  } catch (error) {
    logger.error("Error in getImage:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).send({ error: errorMessage });
  }
});

export default getImage;
