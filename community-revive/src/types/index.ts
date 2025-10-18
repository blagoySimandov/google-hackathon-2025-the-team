// Import the API schema types
import { Schema as ApiProperty } from '../backend/scheme_of_api';

// Extended Property interface that combines API data with community-specific data
export interface Property extends Omit<ApiProperty, 'propertyType'> {
  // Override propertyType with our community-specific types
  propertyType: 'residential' | 'commercial' | 'industrial' | 'vacant';
  
  // Community-specific fields that we'll calculate or add
  communityValueScore: number;
  estimatedRenovationCost: number;
  potentialUses: string[];
  communityImpact: {
    blightRemoval: boolean;
    nearSchool: boolean;
    nearPark: boolean;
    nearTransit: boolean;
    historicDistrict: boolean;
    highYouthImpact: boolean;
    potentialGreenSpace: boolean;
  };
  neighborhoodMetrics: {
    renewalScore: number;
    walkabilityScore: number;
    safetyScore: number;
  };
  communityVoice?: {
    organization: string;
    quote: string;
    author: string;
    role: string;
  };
  impactStory: {
    title: string;
    description: string;
    keyPoints: string[];
  };
  // Helper properties for easier access
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  city: string;
  state: string;
  zipCode: string;
  beforeImage: string;
  size: {
    squareFeet: number;
    acres?: number;
  };
  yearBuilt?: number;
  lastOccupied?: number;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count: number;
}

export interface MapMarker {
  id: string;
  coordinates: [number, number];
  property: Property;
  color: string;
}
