// To parse this data:
//
//   import { Convert } from "./file";
//
//   const schema = Convert.toSchema(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Listing {
    id:              number;
    title:           string;
    seoTitle:        string;
    amenities:       Amenities;
    floorPlanImages: Image[];
    daftShortcode:   string;
    seoFriendlyPath: string;
    priceHistory:    PriceHistory[];
    propertyType:    PropertyType;
    sections:        Section[];
    price?:          Price;
    bedrooms?:       number;
    bathrooms?:      number;
    location:        SchemaLocation;
    dates:           Dates;
    media:           Media;
    seller:          Seller;
    ber:             BER;
    description:     string;
    features:        string[];
    extracted:       Extracted;
    metadata:        Metadata;
    stamps:          Stamps;
    branding:        Branding;
    analytics:       Analytics;
}

export interface Amenities {
    primarySchools:   ArySchool[];
    secondarySchools: ArySchool[];
    publicTransports: PublicTransport[];
}

export interface ArySchool {
    schoolName: string;
    numPupils:  number;
    distance:   Distance;
    location:   PrimarySchoolLocation;
}

export interface Distance {
    value: number;
    unit:  Unit;
}

export enum Unit {
    KM = "km",
}

export interface PrimarySchoolLocation {
    lat: string;
    lon: string;
}

export interface PublicTransport {
    type:        PublicTransportType;
    stop:        string;
    route:       string;
    destination: string;
    provider:    string;
    distance:    Distance;
    location:    PrimarySchoolLocation;
}

export enum PublicTransportType {
    Bus = "Bus",
    Rail = "Rail",
    Tram = "Tram",
}

export interface Analytics {
    listingViews: number;
}

export interface BER {
    rating: Rating | null;
}

export enum Rating {
    BERPending = "BER_PENDING",
    C1 = "C1",
    C2 = "C2",
    C3 = "C3",
    D1 = "D1",
    D2 = "D2",
    E1 = "E1",
    E2 = "E2",
    F = "F",
    G = "G",
    Si666 = "SI_666",
}

export interface Branding {
    standardLogo?:     string;
    squareLogo?:       string;
    backgroundColour?: string;
    squareLogos?:      string[];
    rectangleLogo?:    string;
}

export interface Dates {
    publishDate:        Date;
    lastUpdateDate:     Date;
    dateOfConstruction: null | string;
}

export interface Extracted {
    folios:          string[];
    utilities:       Utility[];
    nearbyLocations: NearbyLocations;
}

export interface NearbyLocations {
    closeBy?:    string[];
    shortDrive?: string[];
    withinHour?: string[];
}

export enum Utility {
    Broadband = "broadband",
    Electricity = "electricity",
    MainsSewage = "mains sewage",
    MainsWater = "mains water",
    PhoneLine = "phone line",
    SepticTank = "septic tank",
}

export interface Image {
    size1440x960:  string;
    size1200x1200: string;
    size360x240:   string;
    size72x52:     string;
    imageLabels?:  ImageLabel[];
    caption?:      string;
}

export interface ImageLabel {
    label: Label;
    type:  ImageLabelType;
}

export enum Label {
    Balcony = "Balcony",
    Bathroom = "Bathroom",
    Bedroom = "Bedroom",
    DiningRoom = "Dining Room",
    Driveway = "Driveway",
    FloorPlan = "Floor Plan",
    Garage = "Garage",
    Garden = "Garden",
    Hallway = "Hallway",
    Kitchen = "Kitchen",
    LivingRoom = "Living Room",
    Pool = "Pool",
}

export enum ImageLabelType {
    Backyard = "BACKYARD",
    Balcony = "BALCONY",
    Bathroom = "BATHROOM",
    Bedroom = "BEDROOM",
    DiningRoom = "DINING_ROOM",
    Driveway = "DRIVEWAY",
    FloorPlan = "FLOOR_PLAN",
    Garage = "GARAGE",
    Hallway = "HALLWAY",
    Kitchen = "KITCHEN",
    LivingRoom = "LIVING_ROOM",
    Pool = "POOL",
}

export interface SchemaLocation {
    areaName:              null | string;
    primaryAreaId:         number | null;
    isInRepublicOfIreland: boolean;
    coordinates:           number[];
    eircodes:              string[];
}

export interface Media {
    images:         Image[];
    totalImages:    number;
    hasVideo:       boolean;
    hasVirtualTour: boolean;
    hasBrochure:    boolean;
}

export interface Metadata {
    featuredLevel:     FeaturedLevel;
    featuredLevelFull: FeaturedLevelFull;
    sticker:           Sticker | null;
    sellingType:       SellingType;
    category:          Category;
    state:             State;
    platform:          Platform;
    premierPartner:    boolean;
    imageRestricted:   boolean;
}

export enum Category {
    Buy = "Buy",
}

export enum FeaturedLevel {
    Lite = "LITE",
    Standard = "STANDARD",
}

export enum FeaturedLevelFull {
    PremierPartnerLite = "PREMIER_PARTNER_LITE",
    Standard = "STANDARD",
}

export enum Platform {
    Feeds = "FEEDS",
    Web = "WEB",
}

export enum SellingType {
    ByPrivateTreaty = "By Private Treaty",
    ByPublicAuction = "By Public Auction",
}

export enum State {
    Published = "PUBLISHED",
}

export enum Sticker {
    RuralLocation = "Rural Location",
    SchoolNearby = "School Nearby",
    ViewingAdvised = "Viewing Advised",
}

export interface Price {
    amount:    number;
    currency:  Currency;
    formatted: string;
}

export enum Currency {
    Eur = "EUR",
}

export interface PriceHistory {
    date:            string;
    price:           string;
    direction:       Direction;
    priceDifference: string;
}

export enum Direction {
    Decrease = "DECREASE",
    Increase = "INCREASE",
}

export enum PropertyType {
    Apartment = "Apartment",
    Bungalow = "Bungalow",
    Detached = "Detached",
    EndOfTerrace = "End of Terrace",
    House = "House",
    Property = "Property",
    SemiD = "Semi-D",
    Site = "Site",
    Terrace = "Terrace",
    Townhouse = "Townhouse",
}

export enum Section {
    Apartment = "Apartment",
    Bungalow = "Bungalow",
    DetachedHouse = "Detached House",
    EndOfTerraceHouse = "End of Terrace House",
    House = "House",
    Property = "Property",
    Residential = "Residential",
    SemiDetachedHouse = "Semi-Detached House",
    Site = "Site",
    TerracedHouse = "Terraced House",
    Townhouse = "Townhouse",
}

export interface Seller {
    id:               number;
    name:             string;
    type:             SellerType;
    branch:           null | string;
    address:          null | string;
    phone:            null | string;
    alternativePhone: null | string;
    licenceNumber:    null | string;
    available:        boolean;
    premierPartner:   boolean;
    images:           Images;
    backgroundColour: null | string;
}

export interface Images {
    profileImage:        null | string;
    profileRoundedImage: null | string;
    standardLogo:        null | string;
    squareLogo:          null | string;
}

export enum SellerType {
    BrandedAgent = "BRANDED_AGENT",
    PrivateUser = "PRIVATE_USER",
    UnbrandedAgent = "UNBRANDED_AGENT",
}

export interface Stamps {
    stampDutyValue: Price | null;
}