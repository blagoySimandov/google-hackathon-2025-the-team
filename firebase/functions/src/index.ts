/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import FirecrawlApp from "@mendable/firecrawl-js";

// Define the secret for Firecrawl API key
const firecrawlApiKey = defineSecret("FIRECRAWL_API_KEY");

/**
 * HTTP endpoint to scrape a URL using Firecrawl
 *
 * Request body/query parameters:
 * - url (required): The URL to scrape
 * - formats (optional): Array of formats to return (e.g., ["markdown", "html", "links"])
 *
 * Returns: JSON with scraped content and metadata
 */
export const firecrawlScrape = onRequest(
  { secrets: [firecrawlApiKey], cors: true },
  async (request, response) => {
    try {
      // Get URL from query params or request body
      const url = (request.query.url as string) || request.body?.url;

      if (!url) {
        response.status(400).json({
          error: "Missing required parameter: url",
        });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        response.status(400).json({
          error: "Invalid URL format",
        });
        return;
      }

      // Get formats from request (default to markdown)
      const formats = request.query.formats ||
        request.body?.formats || ["markdown"];
      const formatsArray = Array.isArray(formats) ? formats : [formats];

      logger.info("Scraping URL with Firecrawl", {
        url,
        formats: formatsArray,
      });

      // Initialize Firecrawl with API key from secret
      const firecrawl = new FirecrawlApp({
        apiKey: firecrawlApiKey.value(),
      });

      // Scrape the URL
      const scrapeResult = await firecrawl.scrape(url, {
        formats: formatsArray,
      });

      logger.info("Firecrawl scrape completed", {
        url,
      });

      // Return the scraped content
      response.status(200).json({
        success: true,
        url,
        result: scrapeResult,
      });
    } catch (error) {
      logger.error("Error in firecrawlScrape function", error);
      response.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);
