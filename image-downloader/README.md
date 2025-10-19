# Image Downloader Script

This script fetches all property listings from Firebase Firestore and downloads their images to Firebase Storage.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Ensure you have a service account key file at `../firebase/serviceAccountKey.json`

## Usage

Run the script:
```bash
npm start
```

## Features

- Fetches all properties from the `properties` collection in Firestore
- Downloads images from the `media.images[].size1440x960` URLs
- Reuses Cloudflare cookies (cached for 30 minutes) to minimize browser automation overhead
- Uploads images to Firebase Storage in the format: `properties/{propertyId}/image_{index}.jpg`
- Updates each property document with `downloadedImages` array and `downloadedAt` timestamp
- Progress tracking and error handling for each property

## How it works

1. Initializes Firebase Admin SDK with service account credentials
2. Fetches all documents from the `properties` collection
3. Generates/retrieves a Cloudflare cookie (reused for all requests)
4. For each property:
   - Downloads each image from Daft.ie using the Cloudflare cookie
   - Uploads to Firebase Storage
   - Updates the property document with the list of uploaded files
5. Displays a summary of successful and failed operations
