import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  QueryConstraint,
  doc,
  getDoc,
} from "firebase/firestore";
import { getFirestoreInstance } from "./util";
import { PROPERTIES_COLLECTION, VALIDITY_DATA_COLLECTION } from "./constants";
import { PropertyListing, ValidityData } from "./types";

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

export const getValidityDataById = async (
  propertyId: string,
): Promise<ValidityData | null> => {
  try {
    const db = getFirestoreInstance();
    const docRef = doc(db, VALIDITY_DATA_COLLECTION, propertyId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: data.id,
      property_id: data.property_id,
      rank: data.rank,
      url: data.url,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      listed_price: data.listed_price,
      market_average_price: data.market_average_price,
      image_urls: data.image_urls || [],
      area_m2: data.area_m2,
      ber: data.ber,
      air_quality_index: data.air_quality_index,
      air_quality_score: data.air_quality_score,
      air_quality_category: data.air_quality_category,
      found_amenities: data.found_amenities || [],
      investment_analysis: data.investment_analysis || {},
      renovation_details: data.renovation_details || { total_cost: 0, items: [] },
      total_renovation_cost: data.total_renovation_cost,
      scores: data.scores || {},
    } as ValidityData;
  } catch (error) {
    console.error("Error fetching validity data:", error);
    throw new Error(
      `Failed to fetch validity data: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
