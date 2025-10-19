import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  QueryConstraint,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Listing as ApiProperty, Currency } from '../backend/scheme_of_api';
import { Property } from '../types';

// Collection name for properties in Firestore
const PROPERTIES_COLLECTION = 'properties';

// Pagination interfaces
export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export interface PaginatedResult<T> {
  data: T[];
  lastDoc?: DocumentSnapshot;
  hasMore: boolean;
  totalCount?: number;
}

// Lightweight property interface for map markers
export interface MapProperty {
  id: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  title: string;
  price?: {
    amount: number;
    formatted: string;
  };
  propertyType: string;
  communityValueScore: number;
  beforeImage: string;
}

// Transform Firestore document to Property type
function transformFirestoreToProperty(doc: QueryDocumentSnapshot<DocumentData>): Property {
  const data = doc.data() as any; // Use any since the structure is different
  
  console.log('🔄 Transforming document:', doc.id, 'Data keys:', Object.keys(data));
  console.log('💰 Price data:', data.price);
  console.log('💰 NonFormatted data:', data.nonFormatted);
  console.log('💰 PriceHistory data:', data.priceHistory);
  console.log('💰 All price-related fields:', {
    price: data.price,
    nonFormatted: data.nonFormatted,
    priceHistory: data.priceHistory,
    stampDutyValue: data.stampDutyValue
  });
  
  // Transform coordinates from the new API schema structure
  let transformedCoordinates = { lat: 53.3498, lng: -6.2603 }; // Default to Dublin
  
  // Check for coordinates in the new schema format (location.coordinates array)
  if (data.location?.coordinates && Array.isArray(data.location.coordinates) && data.location.coordinates.length >= 2) {
    transformedCoordinates = {
      lat: data.location.coordinates[1], // API stores as [lng, lat]
      lng: data.location.coordinates[0]
    };
  }
  // Fallback to old point format for backward compatibility
  else if (data.point && Array.isArray(data.point) && data.point.length >= 2) {
    transformedCoordinates = {
      lat: data.point[1], // Your data stores as [lng, lat]
      lng: data.point[0]
    };
  }

  // Create address from the new API schema structure
  const address = data.location?.areaName || data.areaName || 'Unknown Address';
  const city = data.location?.areaName || data.areaName || 'Unknown City';
  const state = data.location?.isInRepublicOfIreland ? 'Ireland' : 'Unknown';
  const zipCode = data.location?.eircodes?.[0] || ''; // Use first eircode if available

  // Map your data structure to expected fields
  const mappedData = {
    id: data.id || doc.id,
    title: data.title || 'Untitled Property',
    seoTitle: data.seoTitle || data.title || 'Untitled Property',
    daftShortcode: data.daftShortcode || '',
    seoFriendlyPath: data.seoFriendlyPath || '',
    propertyType: data.propertyType || 'Property',
    sections: data.sections || ['Residential'],
    amenities: data.amenities || {
      primarySchools: [],
      secondarySchools: [],
      publicTransports: []
    },
    floorPlanImages: data.floorPlanImages || [],
    priceHistory: data.priceHistory || [],
    price: (() => {
      // Helper function to parse price from string
      const parsePriceFromString = (priceStr: string): number | null => {
        if (!priceStr || typeof priceStr !== 'string') return null;
        
        // Remove currency symbols and commas, then parse
        const cleaned = priceStr.replace(/[€$£,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      };
      
      // Helper function to extract price from object
      const extractPriceFromObject = (obj: any): number | null => {
        if (!obj || typeof obj !== 'object') return null;
        
        // Try different possible number fields
        const possibleFields = ['amount', 'value', 'price', 'total', 'cost'];
        for (const field of possibleFields) {
          if (obj[field] !== undefined) {
            if (typeof obj[field] === 'number' && obj[field] > 0) {
              return obj[field];
            }
            if (typeof obj[field] === 'string') {
              const parsed = parsePriceFromString(obj[field]);
              if (parsed && parsed > 0) return parsed;
            }
          }
        }
        return null;
      };
      
      // Try different possible price fields from your Firebase structure
      
      // Check if price is a direct number
      if (typeof data.price === 'number' && data.price > 0) {
        return {
          amount: data.price,
          currency: Currency.Eur,
          formatted: `€${data.price.toLocaleString()}`
        };
      }
      
      // Check if price is a string (like "€150,000")
      if (typeof data.price === 'string') {
        const parsedPrice = parsePriceFromString(data.price);
        if (parsedPrice && parsedPrice > 0) {
        return {
          amount: parsedPrice,
          currency: Currency.Eur,
          formatted: data.price // Use original formatted string
        };
        }
      }
      
      // Check if price is an object with amount/value/price
      if (data.price && typeof data.price === 'object') {
        const extractedPrice = extractPriceFromObject(data.price);
        if (extractedPrice && extractedPrice > 0) {
          return {
            amount: extractedPrice,
            currency: Currency.Eur,
            formatted: data.price.formatted || `€${extractedPrice.toLocaleString()}`
          };
        }
      }
      
      // Check nonFormatted field (could be object or string)
      if (data.nonFormatted) {
        if (typeof data.nonFormatted === 'number' && data.nonFormatted > 0) {
          return {
            amount: data.nonFormatted,
            currency: Currency.Eur,
            formatted: `€${data.nonFormatted.toLocaleString()}`
          };
        }
        if (typeof data.nonFormatted === 'string') {
          const parsedPrice = parsePriceFromString(data.nonFormatted);
          if (parsedPrice && parsedPrice > 0) {
            return {
              amount: parsedPrice,
              currency: Currency.Eur,
              formatted: data.nonFormatted
            };
          }
        }
        if (typeof data.nonFormatted === 'object') {
          const extractedPrice = extractPriceFromObject(data.nonFormatted);
          if (extractedPrice && extractedPrice > 0) {
            return {
              amount: extractedPrice,
              currency: Currency.Eur,
              formatted: `€${extractedPrice.toLocaleString()}`
            };
          }
        }
      }
      
      // Check priceHistory for current price
      if (data.priceHistory && Array.isArray(data.priceHistory) && data.priceHistory.length > 0) {
        const latestPrice = data.priceHistory[data.priceHistory.length - 1];
        if (latestPrice) {
          const extractedPrice = extractPriceFromObject(latestPrice);
          if (extractedPrice && extractedPrice > 0) {
            return {
              amount: extractedPrice,
              currency: Currency.Eur,
              formatted: latestPrice.formatted || `€${extractedPrice.toLocaleString()}`
            };
          }
        }
      }
      
      // Check stampDutyValue as fallback
      if (data.stampDutyValue) {
        if (typeof data.stampDutyValue === 'number' && data.stampDutyValue > 0) {
          return {
            amount: data.stampDutyValue,
            currency: Currency.Eur,
            formatted: `€${data.stampDutyValue.toLocaleString()}`
          };
        }
        if (typeof data.stampDutyValue === 'string') {
          const parsedPrice = parsePriceFromString(data.stampDutyValue);
          if (parsedPrice && parsedPrice > 0) {
            return {
              amount: parsedPrice,
              currency: Currency.Eur,
              formatted: data.stampDutyValue
            };
          }
        }
      }
      
      // Return undefined if no valid price found
      console.log('❌ No valid price found for property:', doc.id);
      return undefined;
    })(),
    bedrooms: data.numBedrooms || 0,
    bathrooms: data.numBathrooms || 0,
    location: {
      areaName: data.location?.areaName || data.areaName || null,
      primaryAreaId: data.location?.primaryAreaId || data.primaryAreaId || null,
      isInRepublicOfIreland: data.location?.isInRepublicOfIreland ?? data.isInRepublicOfIreland ?? true,
      coordinates: data.location?.coordinates || [data.point?.[0] || -6.2603, data.point?.[1] || 53.3498],
      eircodes: data.location?.eircodes || []
    },
    dates: {
      publishDate: data.publishDate ? new Date(data.publishDate) : new Date(),
      lastUpdateDate: data.lastUpdateDate ? new Date(data.lastUpdateDate) : new Date(),
      dateOfConstruction: data.dateOfConstruction || null
    },
    media: {
      images: data.media?.images || [],
      totalImages: data.media?.totalImages || 0,
      hasVideo: data.media?.hasVideo || false,
      hasVirtualTour: data.media?.hasVirtualTour || false,
      hasBrochure: data.media?.hasBrochure || false
    },
    seller: data.seller || {
      id: 0,
      name: 'Unknown',
      type: 'UNBRANDED_AGENT',
      branch: null,
      address: null,
      phone: null,
      alternativePhone: null,
      licenceNumber: null,
      available: true,
      premierPartner: false,
      images: {
        profileImage: null,
        profileRoundedImage: null,
        standardLogo: null,
        squareLogo: null
      },
      backgroundColour: null
    },
    ber: data.ber || { rating: null },
    description: data.description || '',
    features: [],
    extracted: {
      folios: [],
      utilities: [],
      nearbyLocations: {
        closeBy: [],
        shortDrive: [],
        withinHour: []
      }
    },
    metadata: {
      featuredLevel: data.featuredLevel || 'STANDARD',
      featuredLevelFull: data.featuredLevelFull || 'STANDARD',
      sticker: null,
      sellingType: data.sellingType || 'By Private Treaty',
      category: data.category || 'Buy',
      state: data.state || 'PUBLISHED',
      platform: data.platform || 'WEB',
      premierPartner: data.premierPartner || false,
      imageRestricted: data.imageRestricted || false
    },
    stamps: {
      stampDutyValue: data.stampDutyValue || undefined
    },
    branding: {
      standardLogo: undefined,
      squareLogo: undefined,
      backgroundColour: undefined,
      squareLogos: undefined,
      rectangleLogo: undefined
    },
    analytics: {
      listingViews: 0
    }
  };

  // Calculate community-specific values
  const communityValueScore = calculateCommunityValueScore(mappedData);
  const estimatedRenovationCost = calculateRenovationCost(mappedData);
  const potentialUses = calculatePotentialUses(mappedData);
  const communityImpact = calculateCommunityImpact(mappedData);
  const neighborhoodMetrics = calculateNeighborhoodMetrics(mappedData);
  const impactStory = generateImpactStory(mappedData);

  return {
    ...mappedData,
    propertyType: mapPropertyType(mappedData.propertyType),
    communityValueScore,
    estimatedRenovationCost,
    potentialUses,
    communityImpact,
    neighborhoodMetrics,
    impactStory,
    coordinates: transformedCoordinates,
    address,
    city,
    state,
    zipCode,
    beforeImage: mappedData.media.images[0]?.size1440x960 || '',
    size: {
      squareFeet: 1200, // Default estimate
    },
    yearBuilt: mappedData.dates.dateOfConstruction ? Number.parseInt(mappedData.dates.dateOfConstruction) : undefined,
    lastOccupied: mappedData.dates.lastUpdateDate ? new Date(mappedData.dates.lastUpdateDate).getFullYear() : undefined,
  };
}

// Map API property types to our community types
function mapPropertyType(apiType: string): 'residential' | 'commercial' | 'industrial' | 'vacant' {
  switch (apiType) {
    case 'Apartment':
    case 'House':
    case 'Detached':
    case 'Semi-D':
    case 'Terrace':
    case 'End of Terrace':
    case 'Bungalow':
    case 'Townhouse':
      return 'residential';
    case 'Site':
      return 'vacant';
    default:
      return 'residential';
  }
}

// Calculate community value score based on property characteristics
function calculateCommunityValueScore(data: ApiProperty): number {
  let score = 50; // Base score
  
  // Adjust based on property type
  if (data.propertyType === 'Site') score += 20; // Vacant lots have high potential
  if (data.propertyType === 'House' || data.propertyType === 'Detached') score += 15;
  
  // Adjust based on size (bedrooms as proxy)
  if (data.bedrooms && data.bedrooms >= 3) score += 10;
  
  // Adjust based on BER rating
  if (data.ber.rating && data.ber.rating !== 'F' && data.ber.rating !== 'G') score += 5;
  
  // Adjust based on location
  if (data.location.areaName) score += 10;
  
  return Math.min(100, Math.max(0, score));
}

// Calculate estimated renovation cost
function calculateRenovationCost(data: ApiProperty): number {
  let baseCost = 50000; // Base renovation cost
  
  // Adjust based on property type and size
  if (data.propertyType === 'Site') baseCost = 200000; // New construction
  else if (data.bedrooms && data.bedrooms >= 4) baseCost += 30000;
  
  // Adjust based on BER rating (worse rating = more renovation needed)
  if (data.ber.rating === 'F' || data.ber.rating === 'G') baseCost += 40000;
  else if (data.ber.rating === 'E1' || data.ber.rating === 'E2') baseCost += 20000;
  
  return baseCost;
}

// Calculate potential uses for the property
function calculatePotentialUses(data: ApiProperty): string[] {
  const uses = ['Community Center', 'Youth Center', 'Affordable Housing'];
  
  if (data.propertyType === 'Site') {
    uses.push('Community Garden', 'Playground', 'Sports Facility');
  } else if (data.bedrooms && data.bedrooms >= 3) {
    uses.push('Family Services', 'Childcare Center');
  }
  
  if (data.location.areaName?.toLowerCase().includes('school')) {
    uses.push('Educational Facility', 'After-School Program');
  }
  
  return uses;
}

// Calculate community impact metrics
function calculateCommunityImpact(data: ApiProperty) {
  return {
    blightRemoval: data.propertyType === 'Site' || (data.ber.rating === 'F' || data.ber.rating === 'G'),
    nearSchool: data.extracted.nearbyLocations.closeBy?.some(loc => 
      loc.toLowerCase().includes('school') || loc.toLowerCase().includes('education')
    ) || false,
    nearPark: data.extracted.nearbyLocations.closeBy?.some(loc => 
      loc.toLowerCase().includes('park') || loc.toLowerCase().includes('green')
    ) || false,
    nearTransit: data.extracted.nearbyLocations.closeBy?.some(loc => 
      loc.toLowerCase().includes('station') || loc.toLowerCase().includes('bus')
    ) || false,
    historicDistrict: data.extracted.nearbyLocations.closeBy?.some(loc => 
      loc.toLowerCase().includes('historic') || loc.toLowerCase().includes('heritage')
    ) || false,
    highYouthImpact: Boolean(data.bedrooms && data.bedrooms >= 3),
    potentialGreenSpace: data.propertyType === 'Site' || data.extracted.nearbyLocations.closeBy?.some(loc => 
      loc.toLowerCase().includes('park')
    ) || false,
  };
}

// Calculate neighborhood metrics
function calculateNeighborhoodMetrics(data: ApiProperty) {
  return {
    renewalScore: calculateCommunityValueScore(data),
    walkabilityScore: data.extracted.nearbyLocations.closeBy?.length ? 70 : 50,
    safetyScore: data.location.areaName ? 75 : 60,
  };
}

// Generate impact story
function generateImpactStory(data: ApiProperty) {
  const stories = [
    {
      title: "Transforming Vacant Space into Community Hub",
      description: "This property has the potential to become a vibrant community center that brings neighbors together and provides essential services for local families.",
      keyPoints: [
        "Create safe space for youth activities",
        "Provide community meeting rooms",
        "Support local business development",
        "Improve neighborhood aesthetics"
      ]
    },
    {
      title: "Affordable Housing for Local Families",
      description: "Renovating this property could provide much-needed affordable housing for working families in the area, helping to stabilize the community.",
      keyPoints: [
        "Increase housing affordability",
        "Support working families",
        "Reduce neighborhood blight",
        "Create long-term community stability"
      ]
    },
    {
      title: "Educational Resource Center",
      description: "Located near schools, this property could serve as an educational resource center offering after-school programs and community learning opportunities.",
      keyPoints: [
        "Support student success",
        "Provide adult education",
        "Create learning partnerships",
        "Enhance community knowledge"
      ]
    }
  ];
  
  // Select story based on property characteristics
  if (data.propertyType === 'Site') return stories[0];
  if (data.bedrooms && data.bedrooms >= 3) return stories[1];
  if (data.extracted.nearbyLocations.closeBy?.some(loc => loc.toLowerCase().includes('school'))) return stories[2];
  
  return stories[0]; // Default story
}

// Transform Firestore document to lightweight MapProperty type
function transformFirestoreToMapProperty(doc: QueryDocumentSnapshot<DocumentData>): MapProperty {
  const data = doc.data() as any; // Use any since the structure is different
  
  console.log('🗺️ Transforming map document:', doc.id, 'Data keys:', Object.keys(data));
  
  // Transform coordinates from the new API schema structure
  let transformedCoordinates = { lat: 53.3498, lng: -6.2603 }; // Default to Dublin
  
  // Check for coordinates in the new schema format (location.coordinates array)
  if (data.location?.coordinates && Array.isArray(data.location.coordinates) && data.location.coordinates.length >= 2) {
    transformedCoordinates = {
      lat: data.location.coordinates[1], // API stores as [lng, lat]
      lng: data.location.coordinates[0]
    };
  }
  // Fallback to old point format for backward compatibility
  else if (data.point && Array.isArray(data.point) && data.point.length >= 2) {
    transformedCoordinates = {
      lat: data.point[1], // Your data stores as [lng, lat]
      lng: data.point[0]
    };
  }

  // Calculate community value score using your data structure
  let communityValueScore = 50; // Base score
  
  // Adjust based on property type
  if (data.propertyType === 'Site') communityValueScore += 20; // Vacant lots have high potential
  if (data.propertyType === 'House' || data.propertyType === 'Detached') communityValueScore += 15;
  
  // Adjust based on size (bedrooms as proxy)
  if (data.numBedrooms && data.numBedrooms >= 3) communityValueScore += 10;
  
  // Adjust based on BER rating
  if (data.ber?.rating && data.ber.rating !== 'F' && data.ber.rating !== 'G') communityValueScore += 5;
  
  // Adjust based on location
  if (data.areaName) communityValueScore += 10;
  
  communityValueScore = Math.min(100, Math.max(0, communityValueScore));

  return {
    id: data.id || doc.id,
    coordinates: transformedCoordinates,
    title: data.title || 'Untitled Property',
    price: (() => {
      // Helper function to parse price from string
      const parsePriceFromString = (priceStr: string): number | null => {
        if (!priceStr || typeof priceStr !== 'string') return null;
        
        // Remove currency symbols and commas, then parse
        const cleaned = priceStr.replace(/[€$£,]/g, '').trim();
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      };
      
      // Helper function to extract price from object
      const extractPriceFromObject = (obj: any): number | null => {
        if (!obj || typeof obj !== 'object') return null;
        
        // Try different possible number fields
        const possibleFields = ['amount', 'value', 'price', 'total', 'cost'];
        for (const field of possibleFields) {
          if (obj[field] !== undefined) {
            if (typeof obj[field] === 'number' && obj[field] > 0) {
              return obj[field];
            }
            if (typeof obj[field] === 'string') {
              const parsed = parsePriceFromString(obj[field]);
              if (parsed && parsed > 0) return parsed;
            }
          }
        }
        return null;
      };
      
      // Try different possible price fields from your Firebase structure
      
      // Check if price is a direct number
      if (typeof data.price === 'number' && data.price > 0) {
        return {
          amount: data.price,
          formatted: `€${data.price.toLocaleString()}`
        };
      }
      
      // Check if price is a string (like "€150,000")
      if (typeof data.price === 'string') {
        const parsedPrice = parsePriceFromString(data.price);
        if (parsedPrice && parsedPrice > 0) {
          return {
            amount: parsedPrice,
            formatted: data.price // Use original formatted string
          };
        }
      }
      
      // Check if price is an object with amount/value/price
      if (data.price && typeof data.price === 'object') {
        const extractedPrice = extractPriceFromObject(data.price);
        if (extractedPrice && extractedPrice > 0) {
          return {
            amount: extractedPrice,
            formatted: data.price.formatted || `€${extractedPrice.toLocaleString()}`
          };
        }
      }
      
      // Check nonFormatted field (could be object or string)
      if (data.nonFormatted) {
        if (typeof data.nonFormatted === 'number' && data.nonFormatted > 0) {
          return {
            amount: data.nonFormatted,
            formatted: `€${data.nonFormatted.toLocaleString()}`
          };
        }
        if (typeof data.nonFormatted === 'string') {
          const parsedPrice = parsePriceFromString(data.nonFormatted);
          if (parsedPrice && parsedPrice > 0) {
            return {
              amount: parsedPrice,
              formatted: data.nonFormatted
            };
          }
        }
        if (typeof data.nonFormatted === 'object') {
          const extractedPrice = extractPriceFromObject(data.nonFormatted);
          if (extractedPrice && extractedPrice > 0) {
            return {
              amount: extractedPrice,
              formatted: `€${extractedPrice.toLocaleString()}`
            };
          }
        }
      }
      
      // Check priceHistory for current price
      if (data.priceHistory && Array.isArray(data.priceHistory) && data.priceHistory.length > 0) {
        const latestPrice = data.priceHistory[data.priceHistory.length - 1];
        if (latestPrice) {
          const extractedPrice = extractPriceFromObject(latestPrice);
          if (extractedPrice && extractedPrice > 0) {
            return {
              amount: extractedPrice,
              formatted: latestPrice.formatted || `€${extractedPrice.toLocaleString()}`
            };
          }
        }
      }
      
      // Check stampDutyValue as fallback
      if (data.stampDutyValue) {
        if (typeof data.stampDutyValue === 'number' && data.stampDutyValue > 0) {
          return {
            amount: data.stampDutyValue,
            formatted: `€${data.stampDutyValue.toLocaleString()}`
          };
        }
        if (typeof data.stampDutyValue === 'string') {
          const parsedPrice = parsePriceFromString(data.stampDutyValue);
          if (parsedPrice && parsedPrice > 0) {
            return {
              amount: parsedPrice,
              formatted: data.stampDutyValue
            };
          }
        }
      }
      
      // Return undefined if no valid price found
      return undefined;
    })(),
    propertyType: data.propertyType || 'Property',
    communityValueScore,
    beforeImage: data.media?.images?.[0]?.size1440x960 || '',
  };
}

export class FirebaseService {
  // Fetch properties with pagination
  async fetchProperties(options: PaginationOptions = {}): Promise<PaginatedResult<Property>> {
    try {
      console.log('🔥 FirebaseService.fetchProperties called with options:', options);
      
      const { pageSize = 20, lastDoc } = options;
      console.log('🔥 Creating collection reference for:', PROPERTIES_COLLECTION);
      
      const propertiesRef = collection(db, PROPERTIES_COLLECTION);
      console.log('🔥 Collection reference created:', propertiesRef);
      
      const constraints: QueryConstraint[] = [
        orderBy('id', 'desc'), // Use id field since analytics.listingViews might not exist
        limit(pageSize)
      ];
      
      if (lastDoc) {
        console.log('🔥 Adding startAfter constraint with lastDoc:', lastDoc);
        constraints.push(startAfter(lastDoc));
      }
      
      console.log('🔥 Query constraints:', constraints);
      const q = query(propertiesRef, ...constraints);
      console.log('🔥 Query created:', q);
      
      console.log('🔥 Executing Firestore query...');
      const snapshot = await getDocs(q);
      console.log('🔥 Query executed successfully. Snapshot:', {
        size: snapshot.size,
        empty: snapshot.empty,
        docs: snapshot.docs.length
      });
      
      if (snapshot.empty) {
        console.log('⚠️ No documents found in collection');
        return {
          data: [],
          hasMore: false,
        };
      }
      
      console.log('🔥 Transforming documents...');
      const properties = snapshot.docs.map(doc => {
        console.log('🔥 Transforming doc:', doc.id, doc.data());
        return transformFirestoreToProperty(doc);
      });
      
      const hasMore = snapshot.docs.length === pageSize;
      const newLastDoc = snapshot.docs.at(-1);
      
      console.log('🔥 Fetch completed:', {
        propertiesCount: properties.length,
        hasMore,
        newLastDoc: newLastDoc?.id
      });
      
      return {
        data: properties,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw new Error(`Failed to fetch properties from Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fetch lightweight properties for map markers only
  async fetchMapProperties(options: PaginationOptions = {}): Promise<PaginatedResult<MapProperty>> {
    try {
      console.log('🗺️ FirebaseService.fetchMapProperties called with options:', options);
      
      const { pageSize = 50, lastDoc } = options;
      console.log('🗺️ Creating collection reference for map properties:', PROPERTIES_COLLECTION);
      
      const propertiesRef = collection(db, PROPERTIES_COLLECTION);
      console.log('🗺️ Collection reference created:', propertiesRef);
      
      const constraints: QueryConstraint[] = [
        orderBy('id', 'desc'), // Use id field since analytics.listingViews might not exist
        limit(pageSize)
      ];
      
      if (lastDoc) {
        console.log('🗺️ Adding startAfter constraint with lastDoc:', lastDoc);
        constraints.push(startAfter(lastDoc));
      }
      
      console.log('🗺️ Query constraints:', constraints);
      const q = query(propertiesRef, ...constraints);
      console.log('🗺️ Query created:', q);
      
      console.log('🗺️ Executing Firestore query for map properties...');
      const snapshot = await getDocs(q);
      console.log('🗺️ Map query executed successfully. Snapshot:', {
        size: snapshot.size,
        empty: snapshot.empty,
        docs: snapshot.docs.length
      });
      
      if (snapshot.empty) {
        console.log('⚠️ No documents found in collection for map');
        return {
          data: [],
          hasMore: false,
        };
      }
      
      console.log('🗺️ Transforming documents for map...');
      const properties = snapshot.docs.map(doc => {
        console.log('🗺️ Transforming map doc:', doc.id);
        return transformFirestoreToMapProperty(doc);
      });
      
      const hasMore = snapshot.docs.length === pageSize;
      const newLastDoc = snapshot.docs.at(-1);
      
      console.log('🗺️ Map fetch completed:', {
        propertiesCount: properties.length,
        hasMore,
        newLastDoc: newLastDoc?.id
      });
      
      return {
        data: properties,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      console.error('❌ Error fetching map properties:', error);
      console.error('❌ Map error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw new Error(`Failed to fetch map properties from Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fetch a single property by ID
  async fetchPropertyById(id: number): Promise<Property | null> {
    try {
      const propertyRef = doc(db, PROPERTIES_COLLECTION, id.toString());
      const snapshot = await getDoc(propertyRef);
      
      if (snapshot.exists()) {
        return transformFirestoreToProperty(snapshot as QueryDocumentSnapshot<DocumentData>);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error('Failed to fetch property from Firebase');
    }
  }

  // Search properties with filters and pagination
  async searchProperties(searchParams: {
    query?: string;
    area?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    berRating?: string;
    minCommunityScore?: number;
  }, options: PaginationOptions = {}): Promise<PaginatedResult<Property>> {
    try {
      const { pageSize = 20, lastDoc } = options;
      const propertiesRef = collection(db, PROPERTIES_COLLECTION);
      const constraints: QueryConstraint[] = [];

      // Add filters based on search parameters - be more careful with compound queries
      // Firestore has limitations on compound queries, so we'll use simpler queries
      if (searchParams.area) {
        constraints.push(where('areaName', '==', searchParams.area));
      }
      
      if (searchParams.propertyType) {
        constraints.push(where('propertyType', '==', searchParams.propertyType));
      }
      
      // For price range, we'll filter in memory to avoid compound query issues
      
      if (searchParams.bedrooms) {
        constraints.push(where('numBedrooms', '==', searchParams.bedrooms));
      }
      
      if (searchParams.bathrooms) {
        constraints.push(where('numBathrooms', '==', searchParams.bathrooms));
      }
      
      if (searchParams.berRating) {
        constraints.push(where('ber.rating', '==', searchParams.berRating));
      }

      // Always order by a field that exists and is indexed
      constraints.push(orderBy('id', 'desc'), limit(pageSize));
      
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(propertiesRef, ...constraints);
      const snapshot = await getDocs(q);
      
      let properties = snapshot.docs.map(doc => transformFirestoreToProperty(doc));

      // Apply additional filters that can't be done in Firestore
      if (searchParams.minPrice) {
        properties = properties.filter(p => p.price && p.price.amount >= searchParams.minPrice!);
      }
      
      if (searchParams.maxPrice) {
        properties = properties.filter(p => p.price && p.price.amount <= searchParams.maxPrice!);
      }
      
      if (searchParams.minCommunityScore) {
        properties = properties.filter(p => p.communityValueScore >= searchParams.minCommunityScore!);
      }

      // Apply text search if query is provided
      if (searchParams.query) {
        const queryLower = searchParams.query.toLowerCase();
        properties = properties.filter(p => 
          p.title.toLowerCase().includes(queryLower) ||
          p.description.toLowerCase().includes(queryLower) ||
          p.address.toLowerCase().includes(queryLower) ||
          p.city.toLowerCase().includes(queryLower)
        );
      }

      const hasMore = snapshot.docs.length === pageSize;
      const newLastDoc = snapshot.docs.at(-1);

      return {
        data: properties,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      console.error('Error searching properties:', error);
      throw new Error(`Failed to search properties in Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get properties by community value score range with pagination
  async getHighValueProperties(minScore: number = 70, options: PaginationOptions = {}): Promise<PaginatedResult<Property>> {
    try {
      const result = await this.fetchProperties(options);
      const filteredData = result.data
        .filter(p => p.communityValueScore >= minScore)
        .sort((a, b) => b.communityValueScore - a.communityValueScore);
      
      return {
        ...result,
        data: filteredData,
      };
    } catch (error) {
      console.error('Error fetching high value properties:', error);
      throw new Error(`Failed to fetch high value properties: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get properties by area with pagination
  async getPropertiesByArea(area: string, options: PaginationOptions = {}): Promise<PaginatedResult<Property>> {
    try {
      return await this.searchProperties({ area }, options);
    } catch (error) {
      console.error('Error fetching properties by area:', error);
      throw new Error(`Failed to fetch properties by area: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get map properties by area (lightweight)
  async getMapPropertiesByArea(area: string, options: PaginationOptions = {}): Promise<PaginatedResult<MapProperty>> {
    try {
      const { pageSize = 50, lastDoc } = options;
      const propertiesRef = collection(db, PROPERTIES_COLLECTION);
      
      const constraints: QueryConstraint[] = [
        where('areaName', '==', area),
        orderBy('id', 'desc'),
        limit(pageSize)
      ];
      
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
      
      const q = query(propertiesRef, ...constraints);
      const snapshot = await getDocs(q);
      
      const properties = snapshot.docs.map(doc => transformFirestoreToMapProperty(doc));
      const hasMore = snapshot.docs.length === pageSize;
      const newLastDoc = snapshot.docs.at(-1);
      
      return {
        data: properties,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching map properties by area:', error);
      throw new Error(`Failed to fetch map properties by area: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export a default instance
export const firebaseService = new FirebaseService();
