import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  QueryConstraint,
} from "firebase/firestore";
import { getFirestoreInstance } from "./util";
import { PROPERTIES_COLLECTION } from "./constants";
import { PropertyListing } from "./types";

const parsePropertyData = (data: any): PropertyListing => {
  return {
    id: data.id,
    title: data.title,
    seoTitle: data.seoTitle,
    amenities: data.amenities || {
      primarySchools: [],
      secondarySchools: [],
      publicTransports: [],
    },
    floorArea: data.floorArea,
    floorAreaFormatted: data.floorAreaFormatted,
    floorPlanImages: data.floorPlanImages || [],
    daftShortcode: data.daftShortcode,
    seoFriendlyPath: data.seoFriendlyPath,
    priceHistory: data.priceHistory || [],
    propertyType: data.propertyType,
    sections: data.sections || [],
    price: data.price,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    location: data.location,
    dates: {
      publishDate: data.dates?.publishDate
        ? new Date(data.dates.publishDate)
        : new Date(),
      lastUpdateDate: data.dates?.lastUpdateDate
        ? new Date(data.dates.lastUpdateDate)
        : new Date(),
      dateOfConstruction: data.dates?.dateOfConstruction || null,
    },
    media: data.media || {
      images: [],
      totalImages: 0,
      hasVideo: false,
      hasVirtualTour: false,
      hasBrochure: false,
    },
    seller: data.seller,
    ber: data.ber || { rating: null },
    description: data.description || "",
    features: data.features || [],
    extracted: data.extracted || {
      folios: [],
      utilities: [],
      nearbyLocations: {},
    },
    metadata: data.metadata,
    stamps: data.stamps || { stampDutyValue: null },
    branding: data.branding || {},
    analytics: data.analytics || { listingViews: 0 },
  } as PropertyListing;
};

export const getPropertyListings = async (
  limitCount: number = 20,
): Promise<PropertyListing[]> => {
  try {
    const db = getFirestoreInstance();
    const propertiesRef = collection(db, PROPERTIES_COLLECTION);

    const constraints: QueryConstraint[] = [
      orderBy("id", "desc"),
      limit(limitCount),
    ];

    const q = query(propertiesRef, ...constraints);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    const properties: PropertyListing[] = snapshot.docs.map((doc) => 
      parsePropertyData(doc.data())
    );

    return properties;
  } catch (error) {
    console.error("Error fetching property listings:", error);
    throw new Error(
      `Failed to fetch property listings: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

export const getPropertyById = async (
  propertyId: number,
): Promise<PropertyListing | null> => {
  try {
    const db = getFirestoreInstance();
    const propertiesRef = collection(db, PROPERTIES_COLLECTION);

    // Query by the 'id' field (not the document ID)
    const q = query(propertiesRef, where("id", "==", propertyId), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    return parsePropertyData(data);
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    throw new Error(
      `Failed to fetch property: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
