import { Listing as ApiProperty } from '../backend/scheme_of_api';
import { InvestmentAnalysis, RenovationDetails, Amenity } from '../api/firestore/types';

export interface Property extends Omit<ApiProperty, 'propertyType'> {
  propertyType: 'residential' | 'commercial' | 'industrial' | 'vacant';

  validityScore: number;
  communityScore: number;
  communityValueScore: number;
  estimatedRenovationCost: number;
  potentialUses: string[];
  investmentAnalysis?: InvestmentAnalysis;
  renovationDetails?: RenovationDetails;
  foundAmenities?: Amenity[];
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
  airQuality?: {
    score: number;
    aqi: number;
    category: string;
    lastUpdated: string;
    pollutants: {
      pm25?: number;
      pm10?: number;
      o3?: number;
      no2?: number;
      co?: number;
    };
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
