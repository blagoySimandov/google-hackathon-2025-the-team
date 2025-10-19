// Utility script to help migrate data to Firebase
// This is a helper script that can be used to transform and upload data to Firestore

import { Listing as ApiProperty } from '../backend/scheme_of_api';

// Example function to transform your existing data to Firebase format
export function transformDataForFirebase(data: any[]): ApiProperty[] {
  return data.map((item, index) => ({
    id: item.id || index + 1,
    title: item.title || `Property ${index + 1}`,
    seoTitle: item.seoTitle || item.title || `Property ${index + 1}`,
    daftShortcode: item.daftShortcode || `shortcode_${index + 1}`,
    seoFriendlyPath: item.seoFriendlyPath || `/property-${index + 1}`,
    propertyType: item.propertyType || 'House',
    sections: item.sections || ['Residential'],
    amenities: item.amenities || {
      primarySchools: [],
      secondarySchools: [],
      publicTransports: []
    },
    floorPlanImages: item.floorPlanImages || [],
    priceHistory: item.priceHistory || [],
    price: item.price || {
      amount: 250000,
      currency: 'EUR',
      formatted: '€250,000'
    },
    bedrooms: item.bedrooms || 3,
    bathrooms: item.bathrooms || 2,
    location: {
      areaName: item.location?.areaName || 'Dublin',
      primaryAreaId: item.location?.primaryAreaId || 1,
      isInRepublicOfIreland: item.location?.isInRepublicOfIreland ?? true,
      coordinates: item.location?.coordinates || [-6.2603, 53.3498],
      eircodes: item.location?.eircodes || ['D02 XY00']
    },
    dates: {
      publishDate: item.dates?.publishDate || new Date(),
      lastUpdateDate: item.dates?.lastUpdateDate || new Date(),
      dateOfConstruction: item.dates?.dateOfConstruction || '1990'
    },
    media: {
      images: item.media?.images || [{
        size1440x960: 'https://via.placeholder.com/1440x960',
        size1200x1200: 'https://via.placeholder.com/1200x1200',
        size360x240: 'https://via.placeholder.com/360x240',
        size72x52: 'https://via.placeholder.com/72x52'
      }],
      totalImages: item.media?.totalImages || 1,
      hasVideo: item.media?.hasVideo || false,
      hasVirtualTour: item.media?.hasVirtualTour || false,
      hasBrochure: item.media?.hasBrochure || false
    },
    seller: {
      id: item.seller?.id || 1,
      name: item.seller?.name || 'Estate Agent',
      type: item.seller?.type || 'BRANDED_AGENT',
      branch: item.seller?.branch || 'Main Branch',
      address: item.seller?.address || '123 Main St',
      phone: item.seller?.phone || '+353123456789',
      alternativePhone: item.seller?.alternativePhone || null,
      licenceNumber: item.seller?.licenceNumber || '12345',
      available: item.seller?.available ?? true,
      premierPartner: item.seller?.premierPartner ?? true,
      images: {
        profileImage: item.seller?.images?.profileImage || null,
        profileRoundedImage: item.seller?.images?.profileRoundedImage || null,
        standardLogo: item.seller?.images?.standardLogo || null,
        squareLogo: item.seller?.images?.squareLogo || null
      },
      backgroundColour: item.seller?.backgroundColour || null
    },
    ber: {
      rating: item.ber?.rating || 'C1'
    },
    description: item.description || 'Property description...',
    features: item.features || ['Feature 1', 'Feature 2'],
    extracted: {
      folios: item.extracted?.folios || ['12345'],
      utilities: item.extracted?.utilities || ['mains water', 'electricity', 'broadband'],
      nearbyLocations: {
        closeBy: item.extracted?.nearbyLocations?.closeBy || ['School', 'Park'],
        shortDrive: item.extracted?.nearbyLocations?.shortDrive || ['Shopping Center'],
        withinHour: item.extracted?.nearbyLocations?.withinHour || ['Airport']
      }
    },
    metadata: {
      featuredLevel: item.metadata?.featuredLevel || 'STANDARD',
      featuredLevelFull: item.metadata?.featuredLevelFull || 'STANDARD',
      sticker: item.metadata?.sticker || null,
      sellingType: item.metadata?.sellingType || 'By Private Treaty',
      category: item.metadata?.category || 'Buy',
      state: item.metadata?.state || 'PUBLISHED',
      platform: item.metadata?.platform || 'WEB',
      premierPartner: item.metadata?.premierPartner ?? true,
      imageRestricted: item.metadata?.imageRestricted ?? false
    },
    stamps: {
      stampDutyValue: item.stamps?.stampDutyValue || {
        amount: 2500,
        currency: 'EUR',
        formatted: '€2,500'
      }
    },
    branding: {
      standardLogo: item.branding?.standardLogo || null,
      squareLogo: item.branding?.squareLogo || null,
      backgroundColour: item.branding?.backgroundColour || null,
      squareLogos: item.branding?.squareLogos || null,
      rectangleLogo: item.branding?.rectangleLogo || null
    },
    analytics: {
      listingViews: item.analytics?.listingViews || 150
    }
  }));
}

// Example usage:
// 1. Import your data (JSON file, API response, etc.)
// 2. Transform it using this function
// 3. Upload to Firebase using the Firebase console or admin SDK

export const migrationInstructions = `
# Firebase Data Migration Instructions

## Option 1: Using Firebase Console (Recommended for small datasets)

1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Create a collection called 'properties'
4. For each property, create a document with ID as the property ID
5. Copy the transformed JSON data into each document

## Option 2: Using Firebase Admin SDK (For large datasets)

1. Install Firebase Admin SDK: npm install firebase-admin
2. Create a migration script that uses the Admin SDK
3. Run the script to bulk upload your data

## Option 3: Using Firebase CLI

1. Install Firebase CLI: npm install -g firebase-tools
2. Use firebase firestore:import command with your JSON data

## Data Format

Make sure your data follows the Schema interface defined in scheme_of_api.ts
Each document should have the property ID as the document ID for easy querying.
`;
