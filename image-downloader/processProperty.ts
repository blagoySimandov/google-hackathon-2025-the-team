import { db } from "./firebaseConfig.js";
import { downloadImage } from "./imageDownloader.js";
import { uploadImageToStorage } from "./storageUploader.js";

const MAX_CONCURRENT_IMAGES = 5;

interface ImageObject {
  size1440x960?: string;
}

interface PropertyMedia {
  images?: ImageObject[];
}

interface PropertyData {
  media?: PropertyMedia;
  [key: string]: unknown;
}

export async function processProperty(
  propertyId: string,
  propertyData: PropertyData,
  cookie: string,
): Promise<string[]> {
  const images = propertyData.media?.images || [];

  if (images.length === 0) {
    console.log(`  No images found for property ${propertyId}`);
    return [];
  }

  console.log(`  Processing ${images.length} images for property ${propertyId}`);
  console.log(`  Processing ${MAX_CONCURRENT_IMAGES} images at a time`);

  const processImage = async (imageObj: ImageObject, i: number) => {
    const imageUrl = imageObj.size1440x960;

    if (!imageUrl) {
      console.log(`  Skipping image ${i} - no size1440x960 URL`);
      return null;
    }

    try {
      console.log(`  Downloading image ${i + 1}/${images.length}...`);
      const imageBuffer = await downloadImage(imageUrl, cookie);

      const storagePath = `properties/${propertyId}/image-${i}.jpg`;
      console.log(`  Uploading to ${storagePath}...`);
      const storageUrl = await uploadImageToStorage(imageBuffer, storagePath);

      console.log(`  ✓ Uploaded image ${i + 1}/${images.length}`);
      return storageUrl;
    } catch (error) {
      console.error(`  ✗ Error processing image ${i}:`, error);
      throw error;
    }
  };

  const storageUrls: string[] = [];
  for (let i = 0; i < images.length; i += MAX_CONCURRENT_IMAGES) {
    const batch = images.slice(i, i + MAX_CONCURRENT_IMAGES);
    const batchResults = await Promise.all(
      batch.map((imageObj, batchIndex) =>
        processImage(imageObj, i + batchIndex),
      ),
    );
    storageUrls.push(
      ...batchResults.filter((url): url is string => url !== null),
    );
  }

  await db.collection("properties").doc(propertyId).update({
    storageImages: storageUrls,
  });

  console.log(`  ✓ Updated Firestore with ${storageUrls.length} storage URLs`);

  return storageUrls;
}
