import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebaseConfig.js";
import { generateCloudflareCookie } from "./getCloudflareCookie.js";
import { processProperty } from "./processProperty.js";
import { AxiosError } from "axios";

const MAX_CONCURRENT_PROPERTIES = 3;

export async function migrateImages(): Promise<void> {
  console.log("Starting image migration...");

  const propertiesRef = db.collection("properties");
  const snapshot = await propertiesRef.get();

  if (snapshot.empty) {
    console.log("No properties to process. All done!");
    return;
  }

  console.log(`Found ${snapshot.size} properties to process`);
  console.log(`Processing ${MAX_CONCURRENT_PROPERTIES} properties at a time`);

  let cookie = await generateCloudflareCookie();
  console.log("Initial cookie generated");

  let processedCount = 0;
  let failedCount = 0;

  const processPropertyWithRetry = async (
    doc: FirebaseFirestore.QueryDocumentSnapshot,
    index: number,
  ) => {
    const propertyId = doc.id;
    const propertyData = doc.data();

    console.log(
      `\n[${index + 1}/${snapshot.size}] Processing property: ${propertyId}`,
    );

    let retryCount = 0;
    const maxRetries = 3;
    let success = false;

    while (!success && retryCount < maxRetries) {
      try {
        await processProperty(propertyId, propertyData, cookie);
        processedCount++;
        success = true;
        console.log(`✓ Property ${propertyId} completed successfully`);
      } catch (error) {
        const axiosError = error as AxiosError;

        if (axiosError.response?.status === 403) {
          console.log(`✗ Got 403 Forbidden. Regenerating cookie...`);
          cookie = await generateCloudflareCookie();
          console.log(`New cookie generated. Retrying...`);
          retryCount++;
        } else {
          console.error(`✗ Error processing property ${propertyId}:`, error);
          failedCount++;
          break;
        }
      }
    }

    if (!success) {
      console.error(
        `✗ Failed to process property ${propertyId} after ${maxRetries} retries`,
      );
      failedCount++;
    }
  };

  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += MAX_CONCURRENT_PROPERTIES) {
    const batch = docs.slice(i, i + MAX_CONCURRENT_PROPERTIES);
    await Promise.all(
      batch.map((doc, batchIndex) =>
        processPropertyWithRetry(doc, i + batchIndex),
      ),
    );
  }

  console.log("\n=== Migration Complete ===");
  console.log(`Total properties: ${snapshot.size}`);
  console.log(`Successfully processed: ${processedCount}`);
  console.log(`Failed: ${failedCount}`);
}
