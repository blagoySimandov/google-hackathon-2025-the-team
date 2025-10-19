export interface PropertyListing {
  id: number;
  validityScore: number;
  communityScore: number;
  title: string;
  seoTitle: string;
  amenities: Amenities;
  floorArea?: FloorArea;
  floorAreaFormatted?: string;
  floorPlanImages: PropertyImage[];
  daftShortcode: string;
  seoFriendlyPath: string;
  priceHistory: PriceHistory[];
  propertyType: PropertyType;
  sections: PropertySection[];
  price?: Price;
  bedrooms?: number;
  bathrooms?: number;
  location: PropertyLocation;
  dates: PropertyDates;
  media: PropertyMedia;
  seller: PropertySeller;
  ber: BuildingEnergyRating;
  description: string;
  features: string[];
  extracted: ExtractedData;
  metadata: PropertyMetadata;
  stamps: PropertyStamps;
  branding: PropertyBranding;
  analytics: PropertyAnalytics;
}

export interface GeoCoordinates {
  lat: string;
  lon: string;
}

export interface Distance {
  value: number;
  unit: "km";
}

export interface Amenities {
  primarySchools: School[];
  secondarySchools: School[];
  publicTransports: PublicTransport[];
}

export interface School {
  schoolName: string;
  numPupils: number;
  distance: Distance;
  location: GeoCoordinates;
}

export interface PublicTransport {
  type: "Bus" | "Rail" | "Tram";
  stop: string;
  route: string;
  destination: string;
  provider: string;
  distance: Distance;
  location: GeoCoordinates;
}

export interface PropertyAnalytics {
  listingViews: number;
}

export type BERRating =
  | "BER_PENDING"
  | "C1"
  | "C2"
  | "C3"
  | "D1"
  | "D2"
  | "E1"
  | "E2"
  | "F"
  | "G"
  | "SI_666";

export interface BuildingEnergyRating {
  rating: BERRating | null;
}

export interface PropertyBranding {
  standardLogo?: string;
  squareLogo?: string;
  backgroundColour?: string;
  squareLogos?: string[];
  rectangleLogo?: string;
}

export interface PropertyDates {
  publishDate: Date;
  lastUpdateDate: Date;
  dateOfConstruction: string | null;
}

export interface ExtractedData {
  folios: string[];
  utilities: Utility[];
  nearbyLocations: NearbyLocations;
}

export interface NearbyLocations {
  closeBy?: string[];
  shortDrive?: string[];
  withinHour?: string[];
}

export type Utility =
  | "broadband"
  | "electricity"
  | "mains sewage"
  | "mains water"
  | "phone line"
  | "septic tank";

export interface FloorArea {
  unit: "ACRES" | "METRES_SQUARED";
  value: string;
}

export interface PropertyImage {
  size1440x960: string;
  size1200x1200: string;
  size360x240: string;
  size72x52: string;
  imageLabels?: ImageLabel[];
  caption?: string;
}

export type ImageLabelType =
  | "BACKYARD"
  | "BALCONY"
  | "BATHROOM"
  | "BEDROOM"
  | "DINING_ROOM"
  | "DRIVEWAY"
  | "FLOOR_PLAN"
  | "GARAGE"
  | "HALLWAY"
  | "KITCHEN"
  | "LIVING_ROOM"
  | "POOL";

export type ImageLabelText =
  | "Balcony"
  | "Bathroom"
  | "Bedroom"
  | "Dining Room"
  | "Driveway"
  | "Floor Plan"
  | "Garage"
  | "Garden"
  | "Hallway"
  | "Kitchen"
  | "Living Room"
  | "Pool";

export interface ImageLabel {
  label: ImageLabelText;
  type: ImageLabelType;
}

export interface PropertyLocation {
  areaName: string | null;
  primaryAreaId: number | null;
  isInRepublicOfIreland: boolean;
  coordinates: number[];
  eircodes: string[];
}

export interface PropertyMedia {
  images: PropertyImage[];
  totalImages: number;
  hasVideo: boolean;
  hasVirtualTour: boolean;
  hasBrochure: boolean;
}

export type FeaturedLevel = "LITE" | "STANDARD";

export type FeaturedLevelFull = "PREMIER_PARTNER_LITE" | "STANDARD";

export type PropertySticker =
  | "Rural Location"
  | "School Nearby"
  | "Viewing Advised";

export type SellingType = "By Private Treaty" | "By Public Auction";

export type ListingCategory = "Buy";

export type ListingState = "PUBLISHED";

export type Platform = "FEEDS" | "WEB";

export interface PropertyMetadata {
  featuredLevel: FeaturedLevel;
  featuredLevelFull: FeaturedLevelFull;
  sticker: PropertySticker | null;
  sellingType: SellingType;
  category: ListingCategory;
  state: ListingState;
  platform: Platform;
  premierPartner: boolean;
  imageRestricted: boolean;
}

export interface Price {
  amount: number;
  currency: "EUR";
  formatted: string;
}

export interface PriceHistory {
  date: string;
  price: string;
  direction: "DECREASE" | "INCREASE";
  priceDifference: string;
}

export type PropertyType =
  | "Apartment"
  | "Bungalow"
  | "Detached"
  | "End of Terrace"
  | "House"
  | "Property"
  | "Semi-D"
  | "Site"
  | "Terrace"
  | "Townhouse";

export type PropertySection =
  | "Apartment"
  | "Bungalow"
  | "Detached House"
  | "End of Terrace House"
  | "House"
  | "Property"
  | "Residential"
  | "Semi-Detached House"
  | "Site"
  | "Terraced House"
  | "Townhouse";

export type SellerType = "BRANDED_AGENT" | "PRIVATE_USER" | "UNBRANDED_AGENT";

export interface SellerImages {
  profileImage: string | null;
  profileRoundedImage: string | null;
  standardLogo: string | null;
  squareLogo: string | null;
}

export interface PropertySeller {
  id: number;
  name: string;
  type: SellerType;
  branch: string | null;
  address: string | null;
  phone: string | null;
  alternativePhone: string | null;
  licenceNumber: string | null;
  available: boolean;
  premierPartner: boolean;
  images: SellerImages;
  backgroundColour: string | null;
}

export interface PropertyStamps {
  stampDutyValue: Price | null;
}

export interface Amenity {
  name: string;
  type: string;
  distance_km: number;
}

export interface PotentialGrant {
  name: string;
  amount: number;
  reason: string;
}

export interface InvestmentAnalysis {
  total_project_cost: number;
  net_project_cost: number;
  estimated_after_repair_value: number;
  potential_profit: number;
  return_on_investment_percent: number;
  total_grant_amount: number;
  estimated_labour_cost: number;
  potential_grants: PotentialGrant[];
}

export interface RenovationItem {
  item: string;
  reason: string;
  price: number;
  amount: string;
  material: string;
}

export interface RenovationDetails {
  total_cost: number;
  items: RenovationItem[];
}

export interface PropertyScores {
  score: number;
  viability_score: number;
  validity_score: number;
  price_attractiveness_score: number;
  renovation_cost_score: number;
  sustainability_score: number;
  amenity_score: number;
  community_score: number;
  community_value_score: number;
  community_access_score: number;
  community_cluster_score: number;
}

export interface ValidityData {
  id: string;
  property_id: string;
  rank: number;
  url: string;
  address: string;
  latitude: number;
  longitude: number;
  listed_price: number;
  market_average_price: number;
  image_urls: string[];
  area_m2: number | null;
  ber: string | null;
  air_quality_index: number;
  air_quality_score: number;
  air_quality_category: string;
  found_amenities: Amenity[];
  investment_analysis: InvestmentAnalysis;
  renovation_details: RenovationDetails;
  total_renovation_cost: number;
  scores: PropertyScores;
}
