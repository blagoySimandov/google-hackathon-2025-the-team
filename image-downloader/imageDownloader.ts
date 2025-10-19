import axios from "axios";
import { getHeaders } from "./getHeaders.js";

function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function downloadImage(
  url: string,
  cookie: string,
): Promise<Buffer> {
  await randomDelay(500, 2000);

  const headers = getHeaders(cookie);

  const response = await axios.get(url, {
    ...headers,
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data);
}
