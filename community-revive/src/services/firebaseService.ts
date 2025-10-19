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
import { Schema as ApiProperty } from '../backend/scheme_of_api';
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
  const data = doc.data() as ApiProperty;
  
  // Transform coordinates from [lng, lat] to {lat, lng}
  const coordinates = data.location.coordinates;
  const transformedCoordinates = {
    lat: coordinates[1], // Firebase stores as [lng, lat]
    lng: coordinates[0]
  };

  // Create address from location data
  const address = data.location.areaName || 'Unknown Address';
  const city = data.location.areaName || 'Unknown City';
  const state = data.location.isInRepublicOfIreland ? 'Ireland' : 'Unknown';
  const zipCode = data.location.eircodes?.[0] || '';

  // Calculate community-specific values
  const communityValueScore = calculateCommunityValueScore(data);
  const estimatedRenovationCost = calculateRenovationCost(data);
  const potentialUses = calculatePotentialUses(data);
  const communityImpact = calculateCommunityImpact(data);
  const neighborhoodMetrics = calculateNeighborhoodMetrics(data);
  const impactStory = generateImpactStory(data);

  return {
    ...data,
    propertyType: mapPropertyType(data.propertyType),
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
    beforeImage: data.media.images[0]?.size1440x960 || '',
    size: {
      squareFeet: data.extracted?.utilities?.length ? 1500 : 1200, // Estimate based on utilities
    },
    yearBuilt: data.dates.dateOfConstruction ? Number.parseInt(data.dates.dateOfConstruction) : undefined,
    lastOccupied: data.dates.lastUpdateDate ? new Date(data.dates.lastUpdateDate).getFullYear() : undefined,
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
  const data = doc.data() as ApiProperty;
  
  // Transform coordinates from [lng, lat] to {lat, lng}
  const coordinates = data.location.coordinates;
  const transformedCoordinates = {
    lat: coordinates[1], // Firebase stores as [lng, lat]
    lng: coordinates[0]
  };

  // Calculate community value score
  const communityValueScore = calculateCommunityValueScore(data);

  return {
    id: data.id,
    coordinates: transformedCoordinates,
    title: data.title,
    price: data.price ? {
      amount: data.price.amount,
      formatted: data.price.formatted
    } : undefined,
    propertyType: data.propertyType,
    communityValueScore,
    beforeImage: data.media.images[0]?.size1440x960 || '',
  };
}

export class FirebaseService {
  // Fetch properties with pagination
  async fetchProperties(options: PaginationOptions = {}): Promise<PaginatedResult<Property>> {
    try {
      const { pageSize = 20, lastDoc } = options;
      const propertiesRef = collection(db, PROPERTIES_COLLECTION);
      
      const constraints: QueryConstraint[] = [
        orderBy('analytics.listingViews', 'desc'),
        limit(pageSize)
      ];
      
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }
      
      const q = query(propertiesRef, ...constraints);
      const snapshot = await getDocs(q);
      
      const properties = snapshot.docs.map(doc => transformFirestoreToProperty(doc));
      const hasMore = snapshot.docs.length === pageSize;
      const newLastDoc = snapshot.docs.at(-1);
      
      return {
        data: properties,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error(`Failed to fetch properties from Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fetch lightweight properties for map markers only
  async fetchMapProperties(options: PaginationOptions = {}): Promise<PaginatedResult<MapProperty>> {
    try {
      const { pageSize = 50, lastDoc } = options;
      const propertiesRef = collection(db, PROPERTIES_COLLECTION);
      
      const constraints: QueryConstraint[] = [
        orderBy('analytics.listingViews', 'desc'),
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
      console.error('Error fetching map properties:', error);
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
        constraints.push(where('location.areaName', '==', searchParams.area));
      }
      
      if (searchParams.propertyType) {
        constraints.push(where('propertyType', '==', searchParams.propertyType));
      }
      
      // For price range, we'll filter in memory to avoid compound query issues
      
      if (searchParams.bedrooms) {
        constraints.push(where('bedrooms', '==', searchParams.bedrooms));
      }
      
      if (searchParams.bathrooms) {
        constraints.push(where('bathrooms', '==', searchParams.bathrooms));
      }
      
      if (searchParams.berRating) {
        constraints.push(where('ber.rating', '==', searchParams.berRating));
      }

      // Always order by a field that exists and is indexed
      constraints.push(orderBy('analytics.listingViews', 'desc'), limit(pageSize));
      
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
        where('location.areaName', '==', area),
        orderBy('analytics.listingViews', 'desc'),
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
