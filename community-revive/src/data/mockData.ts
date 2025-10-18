import { Property, FilterOption } from '../types';
import { Schema as ApiProperty, PropertyType, Section, Currency, SellerType, Rating, Utility, FeaturedLevel, FeaturedLevelFull, Sticker, SellingType, Category, State, Platform } from '../backend/scheme_of_api';

// Calculate price factor for community value score
const calculatePriceFactor = (property: ApiProperty): number => {
  if (!property.price) return 0;
  
  if (property.price.amount < 100000) return 20;
  if (property.price.amount < 200000) return 15;
  if (property.price.amount < 300000) return 10;
  if (property.price.amount < 500000) return 5;
  return 0;
};

// Calculate property type factor for community value score
const calculatePropertyTypeFactor = (property: ApiProperty): number => {
  if (property.propertyType === PropertyType.House || property.propertyType === PropertyType.Detached) return 10;
  if (property.propertyType === PropertyType.Apartment) return 5;
  return 0;
};

// Calculate bedrooms factor for community value score
const calculateBedroomsFactor = (property: ApiProperty): number => {
  if (!property.bedrooms) return 0;
  
  if (property.bedrooms >= 4) return 15;
  if (property.bedrooms >= 3) return 10;
  if (property.bedrooms >= 2) return 5;
  return 0;
};

// Calculate BER rating factor for community value score
const calculateBerFactor = (property: ApiProperty): number => {
  if (!property.ber.rating) return 0;
  
  const berScores: Record<Rating, number> = {
    [Rating.C1]: 8, [Rating.C2]: 6, [Rating.C3]: 4, [Rating.D1]: 2, [Rating.D2]: 0, 
    [Rating.E1]: -5, [Rating.E2]: -10, [Rating.F]: -15, [Rating.G]: -20,
    [Rating.BERPending]: 0, [Rating.Si666]: 0
  };
  return berScores[property.ber.rating] || 0;
};

// Calculate media factor for community value score
const calculateMediaFactor = (property: ApiProperty): number => {
  if (property.media.totalImages > 10) return 10;
  if (property.media.totalImages > 5) return 5;
  return 0;
};

// Calculate community value score based on various factors
const calculateCommunityValueScore = (property: ApiProperty): number => {
  const baseScore = 50;
  const priceFactor = calculatePriceFactor(property);
  const propertyTypeFactor = calculatePropertyTypeFactor(property);
  const bedroomsFactor = calculateBedroomsFactor(property);
  const berFactor = calculateBerFactor(property);
  const mediaFactor = calculateMediaFactor(property);
  
  const totalScore = baseScore + priceFactor + propertyTypeFactor + bedroomsFactor + berFactor + mediaFactor;
  return Math.max(0, Math.min(100, totalScore));
};

// Utility function to transform API data to our Property format
export const transformApiPropertyToProperty = (apiProperty: ApiProperty): Property => {

  // Calculate estimated renovation cost based on property details
  const calculateRenovationCost = (property: ApiProperty): number => {
    let baseCost = 50000; // Base renovation cost
    
    if (property.price) {
      baseCost = property.price.amount * 0.3; // 30% of property value
    }
    
    // Adjust based on property type
    if (property.propertyType === PropertyType.House || property.propertyType === PropertyType.Detached) {
      baseCost *= 1.2;
    } else if (property.propertyType === PropertyType.Apartment) {
      baseCost *= 0.8;
    }
    
    // Adjust based on size
    if (property.bedrooms && property.bedrooms > 3) {
      baseCost *= 1.3;
    }
    
    return Math.round(baseCost);
  };

  // Determine potential uses based on property characteristics
  const getPotentialUses = (property: ApiProperty): string[] => {
    const uses: string[] = [];
    
    if (property.propertyType === PropertyType.House || property.propertyType === PropertyType.Detached) {
      uses.push('Affordable Housing', 'Community Center', 'Family Services');
    } else if (property.propertyType === PropertyType.Apartment) {
      uses.push('Affordable Housing', 'Senior Housing', 'Youth Center');
    } else if (property.propertyType === PropertyType.Site) {
      uses.push('Community Garden', 'Park', 'Playground');
    }
    
    // Add uses based on size
    if (property.bedrooms && property.bedrooms >= 4) {
      uses.push('Multi-Family Housing', 'Community Center');
    }
    
    return uses;
  };

  // Calculate community impact based on property features
  const calculateCommunityImpact = (property: ApiProperty) => {
    const isHistoric = property.metadata.sticker === Sticker.RuralLocation || 
      (property.dates.dateOfConstruction ? 
        new Date(property.dates.dateOfConstruction).getFullYear() < 1950 : false);
    
    return {
      blightRemoval: true, // Assume all properties help with blight removal
      nearSchool: property.extracted.nearbyLocations.closeBy?.some(location => 
        location.toLowerCase().includes('school') || 
        location.toLowerCase().includes('education')
      ) || false,
      nearPark: property.extracted.nearbyLocations.closeBy?.some(location => 
        location.toLowerCase().includes('park') || 
        location.toLowerCase().includes('garden')
      ) || false,
      nearTransit: property.extracted.nearbyLocations.closeBy?.some(location => 
        location.toLowerCase().includes('station') || 
        location.toLowerCase().includes('bus') ||
        location.toLowerCase().includes('train')
      ) || false,
      historicDistrict: isHistoric,
      highYouthImpact: Boolean(property.bedrooms && property.bedrooms >= 3),
      potentialGreenSpace: property.propertyType === PropertyType.Site || 
        Boolean(property.bedrooms && property.bedrooms >= 4)
    };
  };

  // Calculate neighborhood metrics (simplified)
  const calculateNeighborhoodMetrics = (property: ApiProperty) => {
    const baseScore = 60;
    return {
      renewalScore: Math.min(95, baseScore + (property.analytics.listingViews / 100)),
      walkabilityScore: property.extracted.nearbyLocations.closeBy?.length ? 75 : 45,
      safetyScore: property.ber.rating && ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'].includes(property.ber.rating) ? 80 : 60
    };
  };

  // Generate impact story
  const generateImpactStory = (property: ApiProperty) => {
    const yearBuilt = property.dates.dateOfConstruction ? 
      new Date(property.dates.dateOfConstruction).getFullYear() : null;
    
    const yearBuiltText = yearBuilt ? `Built in ${yearBuilt}, ` : '';
    const description = `This ${property.propertyType.toLowerCase()} property presents a unique opportunity for community revitalization. ${yearBuiltText}it has the potential to serve as a cornerstone for neighborhood development.`;
    
    const familyCount = property.bedrooms ? property.bedrooms * 50 : 100;
    const energyText = property.ber.rating ? `Energy efficiency rating: ${property.ber.rating}` : 'Potential for energy upgrades';
    const amenitiesText = property.extracted.nearbyLocations.closeBy?.length ? 
      `Close to ${property.extracted.nearbyLocations.closeBy.length} amenities` : 
      'Opportunity for new community amenities';
    
    return {
      title: `Transforming ${property.title}`,
      description,
      keyPoints: [
        `Serves ${familyCount}+ families in the area`,
        energyText,
        amenitiesText,
        'Strong potential for community partnerships'
      ]
    };
  };

  const communityValueScore = calculateCommunityValueScore(apiProperty);
  const communityImpact = calculateCommunityImpact(apiProperty);
  const neighborhoodMetrics = calculateNeighborhoodMetrics(apiProperty);
  const impactStory = generateImpactStory(apiProperty);

  return {
    ...apiProperty,
    communityValueScore,
    estimatedRenovationCost: calculateRenovationCost(apiProperty),
    potentialUses: getPotentialUses(apiProperty),
    communityImpact,
    neighborhoodMetrics,
    impactStory,
    // Helper properties for easier access
    coordinates: {
      lat: apiProperty.location.coordinates[0],
      lng: apiProperty.location.coordinates[1]
    },
    address: apiProperty.title,
    city: apiProperty.location.areaName || 'Unknown',
    state: apiProperty.location.isInRepublicOfIreland ? 'Ireland' : 'Unknown',
    zipCode: apiProperty.location.eircodes[0] || '',
    beforeImage: apiProperty.media.images[0]?.size1440x960 || apiProperty.media.images[0]?.size1200x1200 || '',
    propertyType: (() => {
      const residentialTypes = [PropertyType.House, PropertyType.Detached, PropertyType.SemiD, PropertyType.Terrace, PropertyType.EndOfTerrace, PropertyType.Bungalow, PropertyType.Apartment, PropertyType.Townhouse];
      if (residentialTypes.includes(apiProperty.propertyType)) return 'residential';
      if (apiProperty.propertyType === PropertyType.Site) return 'vacant';
      return 'commercial';
    })(),
    size: {
      squareFeet: apiProperty.bedrooms ? apiProperty.bedrooms * 800 : 1200, // Estimate based on bedrooms
      acres: apiProperty.propertyType === PropertyType.Site ? 0.25 : undefined
    },
    yearBuilt: apiProperty.dates.dateOfConstruction ? 
      new Date(apiProperty.dates.dateOfConstruction).getFullYear() : undefined,
    lastOccupied: apiProperty.dates.lastUpdateDate ? 
      new Date(apiProperty.dates.lastUpdateDate).getFullYear() : undefined
  };
};

// Sample API properties (you would replace this with actual API calls)
const sampleApiProperties: ApiProperty[] = [
  {
    id: 1,
    title: 'Beautiful 3 Bedroom House in Dublin',
    seoTitle: '3 Bedroom House Dublin',
    daftShortcode: 'DAFT-001',
    seoFriendlyPath: '/property/3-bedroom-house-dublin-1',
    propertyType: PropertyType.House,
    sections: [Section.House, Section.Residential],
    price: {
      amount: 450000,
      currency: Currency.Eur,
      formatted: '€450,000'
    },
    bedrooms: 3,
    bathrooms: 2,
    location: {
      areaName: 'Dublin 4',
      primaryAreaId: 1,
      isInRepublicOfIreland: true,
      coordinates: [53.3498, -6.2603],
      eircodes: ['D04 W2F2']
    },
    dates: {
      publishDate: new Date('2024-01-15'),
      lastUpdateDate: new Date('2024-01-20'),
      dateOfConstruction: '1995'
    },
    media: {
      images: [
        {
          size1440x960: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1440&h=960&fit=crop',
          size1200x1200: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=1200&fit=crop',
          size360x240: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=360&h=240&fit=crop',
          size72x52: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=72&h=52&fit=crop'
        }
      ],
      totalImages: 12,
      hasVideo: false,
      hasVirtualTour: true,
      hasBrochure: false
    },
    seller: {
      id: 1,
      name: 'Dublin Properties Ltd',
      type: SellerType.BrandedAgent,
      branch: 'Dublin City Center',
      address: '123 Grafton Street, Dublin 2',
      phone: '+353 1 234 5678',
      alternativePhone: null,
      licenceNumber: 'L12345',
      available: true,
      premierPartner: true,
      images: {
        profileImage: null,
        profileRoundedImage: null,
        standardLogo: null,
        squareLogo: null
      },
      backgroundColour: '#0066CC'
    },
    ber: {
      rating: Rating.C2
    },
    description: 'A beautiful 3 bedroom house in the heart of Dublin 4. This property offers excellent potential for community development and affordable housing initiatives.',
    features: ['Garden', 'Parking', 'Near Schools', 'Public Transport'],
    extracted: {
      folios: ['12345F'],
      utilities: [Utility.MainsWater, Utility.MainsSewage, Utility.Electricity, Utility.Broadband],
      nearbyLocations: {
        closeBy: ['Dublin City University', 'Phoenix Park', 'Dublin Bus Station'],
        shortDrive: ['Dublin Airport', 'Dublin Port'],
        withinHour: ['Bray', 'Howth', 'Dun Laoghaire']
      }
    },
    metadata: {
      featuredLevel: FeaturedLevel.Standard,
      featuredLevelFull: FeaturedLevelFull.Standard,
      sticker: Sticker.SchoolNearby,
      sellingType: SellingType.ByPrivateTreaty,
      category: Category.Buy,
      state: State.Published,
      platform: Platform.Web,
      premierPartner: true,
      imageRestricted: false
    },
    stamps: {
      stampDutyValue: {
        amount: 22500,
        currency: Currency.Eur,
        formatted: '€22,500'
      }
    },
    branding: {
      standardLogo: undefined,
      squareLogo: undefined,
      backgroundColour: undefined,
      squareLogos: undefined,
      rectangleLogo: undefined
    },
    analytics: {
      listingViews: 1250
    }
  },
  {
    id: 2,
    title: 'Spacious Apartment in Cork City Center',
    seoTitle: 'Apartment Cork City Center',
    daftShortcode: 'DAFT-002',
    seoFriendlyPath: '/property/apartment-cork-city-center-2',
    propertyType: PropertyType.Apartment,
    sections: [Section.Apartment, Section.Residential],
    price: {
      amount: 280000,
      currency: Currency.Eur,
      formatted: '€280,000'
    },
    bedrooms: 2,
    bathrooms: 1,
    location: {
      areaName: 'Cork City Center',
      primaryAreaId: 2,
      isInRepublicOfIreland: true,
      coordinates: [51.8985, -8.4756],
      eircodes: ['T12 XY34']
    },
    dates: {
      publishDate: new Date('2024-01-10'),
      lastUpdateDate: new Date('2024-01-18'),
      dateOfConstruction: '2010'
    },
    media: {
      images: [
        {
          size1440x960: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1440&h=960&fit=crop',
          size1200x1200: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=1200&fit=crop',
          size360x240: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=360&h=240&fit=crop',
          size72x52: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=72&h=52&fit=crop'
        }
      ],
      totalImages: 8,
      hasVideo: false,
      hasVirtualTour: false,
      hasBrochure: true
    },
    seller: {
      id: 2,
      name: 'Cork Real Estate',
      type: SellerType.BrandedAgent,
      branch: 'Cork City',
      address: '456 Patrick Street, Cork',
      phone: '+353 21 987 6543',
      alternativePhone: null,
      licenceNumber: 'L67890',
      available: true,
      premierPartner: false,
      images: {
        profileImage: null,
        profileRoundedImage: null,
        standardLogo: null,
        squareLogo: null
      },
      backgroundColour: '#CC6600'
    },
    ber: {
      rating: Rating.C3
    },
    description: 'Modern 2 bedroom apartment in the heart of Cork city center. Perfect for young professionals or as an investment property for community housing.',
    features: ['Balcony', 'Lift', 'Near University', 'Shopping Center'],
    extracted: {
      folios: ['67890F'],
      utilities: [Utility.MainsWater, Utility.MainsSewage, Utility.Electricity, Utility.Broadband],
      nearbyLocations: {
        closeBy: ['University College Cork', 'Cork City Hall', 'Cork Bus Station'],
        shortDrive: ['Cork Airport', 'Cork Port'],
        withinHour: ['Kinsale', 'Cobh', 'Blarney']
      }
    },
    metadata: {
      featuredLevel: FeaturedLevel.Lite,
      featuredLevelFull: FeaturedLevelFull.PremierPartnerLite,
      sticker: null,
      sellingType: SellingType.ByPrivateTreaty,
      category: Category.Buy,
      state: State.Published,
      platform: Platform.Web,
      premierPartner: false,
      imageRestricted: false
    },
    stamps: {
      stampDutyValue: {
        amount: 14000,
        currency: Currency.Eur,
        formatted: '€14,000'
      }
    },
    branding: {
      standardLogo: undefined,
      squareLogo: undefined,
      backgroundColour: undefined,
      squareLogos: undefined,
      rectangleLogo: undefined
    },
    analytics: {
      listingViews: 890
    }
  },
  {
    id: 3,
    title: 'Historic Building in Galway - Development Opportunity',
    seoTitle: 'Historic Building Galway Development',
    daftShortcode: 'DAFT-003',
    seoFriendlyPath: '/property/historic-building-galway-development-3',
    propertyType: PropertyType.Property,
    sections: [Section.Property, Section.Residential],
    price: {
      amount: 650000,
      currency: Currency.Eur,
      formatted: '€650,000'
    },
    bedrooms: 0,
    bathrooms: 0,
    location: {
      areaName: 'Galway City Center',
      primaryAreaId: 3,
      isInRepublicOfIreland: true,
      coordinates: [53.2707, -9.0568],
      eircodes: ['H91 XY12']
    },
    dates: {
      publishDate: new Date('2024-01-05'),
      lastUpdateDate: new Date('2024-01-15'),
      dateOfConstruction: '1890'
    },
    media: {
      images: [
        {
          size1440x960: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1440&h=960&fit=crop',
          size1200x1200: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=1200&fit=crop',
          size360x240: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=360&h=240&fit=crop',
          size72x52: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=72&h=52&fit=crop'
        }
      ],
      totalImages: 15,
      hasVideo: true,
      hasVirtualTour: true,
      hasBrochure: true
    },
    seller: {
      id: 3,
      name: 'Galway Heritage Properties',
      type: SellerType.BrandedAgent,
      branch: 'Galway City',
      address: '789 Shop Street, Galway',
      phone: '+353 91 123 4567',
      alternativePhone: null,
      licenceNumber: 'L11111',
      available: true,
      premierPartner: true,
      images: {
        profileImage: null,
        profileRoundedImage: null,
        standardLogo: null,
        squareLogo: null
      },
      backgroundColour: '#006600'
    },
    ber: {
      rating: null
    },
    description: 'Magnificent historic building in the heart of Galway city center. This property offers incredible potential for community development, cultural center, or affordable housing conversion.',
    features: ['Historic Character', 'Large Windows', 'High Ceilings', 'City Center Location'],
    extracted: {
      folios: ['11111F'],
      utilities: [Utility.MainsWater, Utility.MainsSewage, Utility.Electricity],
      nearbyLocations: {
        closeBy: ['Galway University', 'Eyre Square', 'Galway Cathedral'],
        shortDrive: ['Galway Airport', 'Galway Port'],
        withinHour: ['Connemara', 'Aran Islands', 'Clifden']
      }
    },
    metadata: {
      featuredLevel: FeaturedLevel.Standard,
      featuredLevelFull: FeaturedLevelFull.Standard,
      sticker: Sticker.RuralLocation,
      sellingType: SellingType.ByPublicAuction,
      category: Category.Buy,
      state: State.Published,
      platform: Platform.Web,
      premierPartner: true,
      imageRestricted: false
    },
    stamps: {
      stampDutyValue: {
        amount: 32500,
        currency: Currency.Eur,
        formatted: '€32,500'
      }
    },
    branding: {
      standardLogo: undefined,
      squareLogo: undefined,
      backgroundColour: undefined,
      squareLogos: undefined,
      rectangleLogo: undefined
    },
    analytics: {
      listingViews: 2100
    }
  }
];

// Transform API properties to our Property format
export const mockProperties: Property[] = sampleApiProperties.map(transformApiPropertyToProperty);

export const filterOptions: FilterOption[] = [
  { id: 'all', label: 'All Properties', value: 'all', count: mockProperties.length },
  { id: 'historic', label: 'Historic District', value: 'historic', count: mockProperties.filter(p => p.communityImpact.historicDistrict).length },
  { id: 'green-space', label: 'Potential Green Space', value: 'green-space', count: mockProperties.filter(p => p.communityImpact.potentialGreenSpace).length },
  { id: 'youth-impact', label: 'High Youth Impact', value: 'youth-impact', count: mockProperties.filter(p => p.communityImpact.highYouthImpact).length },
  { id: 'near-school', label: 'Near School', value: 'near-school', count: mockProperties.filter(p => p.communityImpact.nearSchool).length },
  { id: 'near-park', label: 'Near Park', value: 'near-park', count: mockProperties.filter(p => p.communityImpact.nearPark).length },
];

export const getScoreColor = (score: number): string => {
  if (score >= 90) return '#16a34a'; // green-600
  if (score >= 80) return '#22c55e'; // green-500
  if (score >= 70) return '#84cc16'; // lime-500
  if (score >= 60) return '#eab308'; // yellow-500
  if (score >= 50) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
};
