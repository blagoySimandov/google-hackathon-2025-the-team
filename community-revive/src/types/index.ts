export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  communityValueScore: number;
  beforeImage: string;
  propertyType: 'residential' | 'commercial' | 'industrial' | 'vacant';
  size: {
    squareFeet: number;
    acres?: number;
  };
  yearBuilt?: number;
  lastOccupied?: number;
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
