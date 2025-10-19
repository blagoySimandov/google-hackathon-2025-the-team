export interface HeadersConfig {
  responseType: string;
  headers: {
    accept: string;
    "accept-language": string;
    "cache-control": string;
    cookie: string;
    pragma: string;
    priority: string;
    "sec-ch-ua": string;
    "sec-ch-ua-mobile": string;
    "sec-ch-ua-platform": string;
    "sec-fetch-dest": string;
    "sec-fetch-mode": string;
    "sec-fetch-site": string;
    "sec-fetch-user": string;
    "upgrade-insecure-requests": string;
    "user-agent": string;
  };
}

export const getHeaders = (cookie: string): HeadersConfig => {
  return {
    responseType: "arraybuffer",
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      cookie: cookie,
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
  };
};
