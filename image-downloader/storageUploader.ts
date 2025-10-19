import { bucket } from "./firebaseConfig.js";

export async function uploadImageToStorage(
  imageBuffer: Buffer,
  storagePath: string,
): Promise<string> {
  const file = bucket.file(storagePath);

  await file.save(imageBuffer, {
    metadata: {
      contentType: "image/jpeg",
    },
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
}
