# Firebase Setup Guide

## 1. Create a .env file

Create a `.env` file in the root directory with your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Click "Add app" and select Web (</>) 
6. Register your app and copy the config values to your `.env` file

## 3. Firestore Database Setup

1. In Firebase Console, go to Firestore Database
2. Create a new database
3. Start in test mode (you can secure it later)
4. Create a collection called `properties`
5. Import your property data with the same schema as defined in `scheme_of_api.ts`

## 4. Data Structure

Your Firestore collection should have documents with the following structure (matching the `Schema` interface):

```json
{
  "id": 12345,
  "title": "Property Title",
  "seoTitle": "SEO Title",
  "daftShortcode": "shortcode",
  "seoFriendlyPath": "/path",
  "propertyType": "House",
  "sections": ["Residential"],
  "price": {
    "amount": 250000,
    "currency": "EUR",
    "formatted": "€250,000"
  },
  "bedrooms": 3,
  "bathrooms": 2,
  "location": {
    "areaName": "Dublin 2",
    "primaryAreaId": 123,
    "isInRepublicOfIreland": true,
    "coordinates": [-6.2603, 53.3498],
    "eircodes": ["D02 XY00"]
  },
  "dates": {
    "publishDate": "2024-01-01T00:00:00Z",
    "lastUpdateDate": "2024-01-01T00:00:00Z",
    "dateOfConstruction": "1990"
  },
  "media": {
    "images": [
      {
        "size1440x960": "https://example.com/image1.jpg",
        "size1200x1200": "https://example.com/image1-square.jpg",
        "size360x240": "https://example.com/image1-small.jpg",
        "size72x52": "https://example.com/image1-thumb.jpg"
      }
    ],
    "totalImages": 1,
    "hasVideo": false,
    "hasVirtualTour": false,
    "hasBrochure": false
  },
  "seller": {
    "id": 1,
    "name": "Estate Agent",
    "type": "BRANDED_AGENT",
    "branch": "Main Branch",
    "address": "123 Main St",
    "phone": "+353123456789",
    "alternativePhone": null,
    "licenceNumber": "12345",
    "available": true,
    "premierPartner": true,
    "images": {
      "profileImage": "https://example.com/profile.jpg",
      "profileRoundedImage": "https://example.com/profile-round.jpg",
      "standardLogo": "https://example.com/logo.jpg",
      "squareLogo": "https://example.com/logo-square.jpg"
    },
    "backgroundColour": "#ffffff"
  },
  "ber": {
    "rating": "C1"
  },
  "description": "Property description...",
  "features": ["Feature 1", "Feature 2"],
  "extracted": {
    "folios": ["12345"],
    "utilities": ["mains water", "electricity", "broadband"],
    "nearbyLocations": {
      "closeBy": ["School", "Park"],
      "shortDrive": ["Shopping Center"],
      "withinHour": ["Airport"]
    }
  },
  "metadata": {
    "featuredLevel": "STANDARD",
    "featuredLevelFull": "STANDARD",
    "sticker": "School Nearby",
    "sellingType": "By Private Treaty",
    "category": "Buy",
    "state": "PUBLISHED",
    "platform": "WEB",
    "premierPartner": true,
    "imageRestricted": false
  },
  "stamps": {
    "stampDutyValue": {
      "amount": 2500,
      "currency": "EUR",
      "formatted": "€2,500"
    }
  },
  "branding": {
    "standardLogo": "https://example.com/logo.jpg",
    "squareLogo": "https://example.com/logo-square.jpg",
    "backgroundColour": "#ffffff"
  },
  "analytics": {
    "listingViews": 150
  }
}
```

## 5. Security Rules (Optional)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /properties/{document} {
      allow read: if true; // Allow public read access
      allow write: if false; // Restrict write access
    }
  }
}
```

## 6. Testing the Integration

Once you've set up Firebase and imported your data:

1. Start the development server: `npm start`
2. The app should now load properties from Firebase instead of mock data
3. Check the browser console for any Firebase connection errors

## Troubleshooting

- Make sure your `.env` file is in the root directory
- Verify all Firebase config values are correct
- Check that your Firestore database has the `properties` collection
- Ensure your data structure matches the `Schema` interface
- Check browser console for any error messages
