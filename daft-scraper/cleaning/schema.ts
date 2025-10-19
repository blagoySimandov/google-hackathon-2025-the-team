// To parse this data:
//
//   import { Convert } from "./file";
//
//   const schema = Convert.toSchema(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Schema {
    id:                  number;
    title:               string;
    seoTitle:            string;
    amenities:           Amenities;
    floorArea?:          FloorArea;
    floorAreaFormatted?: string;
    floorPlanImages:     Image[];
    daftShortcode:       string;
    seoFriendlyPath:     string;
    priceHistory:        PriceHistory[];
    propertyType:        PropertyType;
    sections:            Section[];
    price?:              Price;
    bedrooms?:           number;
    bathrooms?:          number;
    location:            SchemaLocation;
    dates:               Dates;
    media:               Media;
    seller:              Seller;
    ber:                 BER;
    description:         string;
    features:            string[];
    extracted:           Extracted;
    metadata:            Metadata;
    stamps:              Stamps;
    branding:            Branding;
    analytics:           Analytics;
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
    unit:  DistanceUnit;
}

export enum DistanceUnit {
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

export interface FloorArea {
    unit:  FloorAreaUnit;
    value: string;
}

export enum FloorAreaUnit {
    Acres = "ACRES",
    MetresSquared = "METRES_SQUARED",
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

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toSchema(json: string): Schema[] {
        return cast(JSON.parse(json), a(r("Schema")));
    }

    public static schemaToJson(value: Schema[]): string {
        return JSON.stringify(uncast(value, a(r("Schema"))), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "Schema": o([
        { json: "id", js: "id", typ: 0 },
        { json: "title", js: "title", typ: "" },
        { json: "seoTitle", js: "seoTitle", typ: "" },
        { json: "amenities", js: "amenities", typ: r("Amenities") },
        { json: "floorArea", js: "floorArea", typ: u(undefined, r("FloorArea")) },
        { json: "floorAreaFormatted", js: "floorAreaFormatted", typ: u(undefined, "") },
        { json: "floorPlanImages", js: "floorPlanImages", typ: a(r("Image")) },
        { json: "daftShortcode", js: "daftShortcode", typ: "" },
        { json: "seoFriendlyPath", js: "seoFriendlyPath", typ: "" },
        { json: "priceHistory", js: "priceHistory", typ: a(r("PriceHistory")) },
        { json: "propertyType", js: "propertyType", typ: r("PropertyType") },
        { json: "sections", js: "sections", typ: a(r("Section")) },
        { json: "price", js: "price", typ: u(undefined, r("Price")) },
        { json: "bedrooms", js: "bedrooms", typ: u(undefined, 0) },
        { json: "bathrooms", js: "bathrooms", typ: u(undefined, 0) },
        { json: "location", js: "location", typ: r("SchemaLocation") },
        { json: "dates", js: "dates", typ: r("Dates") },
        { json: "media", js: "media", typ: r("Media") },
        { json: "seller", js: "seller", typ: r("Seller") },
        { json: "ber", js: "ber", typ: r("BER") },
        { json: "description", js: "description", typ: "" },
        { json: "features", js: "features", typ: a("") },
        { json: "extracted", js: "extracted", typ: r("Extracted") },
        { json: "metadata", js: "metadata", typ: r("Metadata") },
        { json: "stamps", js: "stamps", typ: r("Stamps") },
        { json: "branding", js: "branding", typ: r("Branding") },
        { json: "analytics", js: "analytics", typ: r("Analytics") },
    ], false),
    "Amenities": o([
        { json: "primarySchools", js: "primarySchools", typ: a(r("ArySchool")) },
        { json: "secondarySchools", js: "secondarySchools", typ: a(r("ArySchool")) },
        { json: "publicTransports", js: "publicTransports", typ: a(r("PublicTransport")) },
    ], false),
    "ArySchool": o([
        { json: "schoolName", js: "schoolName", typ: "" },
        { json: "numPupils", js: "numPupils", typ: 0 },
        { json: "distance", js: "distance", typ: r("Distance") },
        { json: "location", js: "location", typ: r("PrimarySchoolLocation") },
    ], false),
    "Distance": o([
        { json: "value", js: "value", typ: 3.14 },
        { json: "unit", js: "unit", typ: r("DistanceUnit") },
    ], false),
    "PrimarySchoolLocation": o([
        { json: "lat", js: "lat", typ: "" },
        { json: "lon", js: "lon", typ: "" },
    ], false),
    "PublicTransport": o([
        { json: "type", js: "type", typ: r("PublicTransportType") },
        { json: "stop", js: "stop", typ: "" },
        { json: "route", js: "route", typ: "" },
        { json: "destination", js: "destination", typ: "" },
        { json: "provider", js: "provider", typ: "" },
        { json: "distance", js: "distance", typ: r("Distance") },
        { json: "location", js: "location", typ: r("PrimarySchoolLocation") },
    ], false),
    "Analytics": o([
        { json: "listingViews", js: "listingViews", typ: 0 },
    ], false),
    "BER": o([
        { json: "rating", js: "rating", typ: u(r("Rating"), null) },
    ], false),
    "Branding": o([
        { json: "standardLogo", js: "standardLogo", typ: u(undefined, "") },
        { json: "squareLogo", js: "squareLogo", typ: u(undefined, "") },
        { json: "backgroundColour", js: "backgroundColour", typ: u(undefined, "") },
        { json: "squareLogos", js: "squareLogos", typ: u(undefined, a("")) },
        { json: "rectangleLogo", js: "rectangleLogo", typ: u(undefined, "") },
    ], false),
    "Dates": o([
        { json: "publishDate", js: "publishDate", typ: Date },
        { json: "lastUpdateDate", js: "lastUpdateDate", typ: Date },
        { json: "dateOfConstruction", js: "dateOfConstruction", typ: u(null, "") },
    ], false),
    "Extracted": o([
        { json: "folios", js: "folios", typ: a("") },
        { json: "utilities", js: "utilities", typ: a(r("Utility")) },
        { json: "nearbyLocations", js: "nearbyLocations", typ: r("NearbyLocations") },
    ], false),
    "NearbyLocations": o([
        { json: "closeBy", js: "closeBy", typ: u(undefined, a("")) },
        { json: "shortDrive", js: "shortDrive", typ: u(undefined, a("")) },
        { json: "withinHour", js: "withinHour", typ: u(undefined, a("")) },
    ], false),
    "FloorArea": o([
        { json: "unit", js: "unit", typ: r("FloorAreaUnit") },
        { json: "value", js: "value", typ: "" },
    ], false),
    "Image": o([
        { json: "size1440x960", js: "size1440x960", typ: "" },
        { json: "size1200x1200", js: "size1200x1200", typ: "" },
        { json: "size360x240", js: "size360x240", typ: "" },
        { json: "size72x52", js: "size72x52", typ: "" },
        { json: "imageLabels", js: "imageLabels", typ: u(undefined, a(r("ImageLabel"))) },
        { json: "caption", js: "caption", typ: u(undefined, "") },
    ], false),
    "ImageLabel": o([
        { json: "label", js: "label", typ: r("Label") },
        { json: "type", js: "type", typ: r("ImageLabelType") },
    ], false),
    "SchemaLocation": o([
        { json: "areaName", js: "areaName", typ: u(null, "") },
        { json: "primaryAreaId", js: "primaryAreaId", typ: u(0, null) },
        { json: "isInRepublicOfIreland", js: "isInRepublicOfIreland", typ: true },
        { json: "coordinates", js: "coordinates", typ: a(3.14) },
        { json: "eircodes", js: "eircodes", typ: a("") },
    ], false),
    "Media": o([
        { json: "images", js: "images", typ: a(r("Image")) },
        { json: "totalImages", js: "totalImages", typ: 0 },
        { json: "hasVideo", js: "hasVideo", typ: true },
        { json: "hasVirtualTour", js: "hasVirtualTour", typ: true },
        { json: "hasBrochure", js: "hasBrochure", typ: true },
    ], false),
    "Metadata": o([
        { json: "featuredLevel", js: "featuredLevel", typ: r("FeaturedLevel") },
        { json: "featuredLevelFull", js: "featuredLevelFull", typ: r("FeaturedLevelFull") },
        { json: "sticker", js: "sticker", typ: u(r("Sticker"), null) },
        { json: "sellingType", js: "sellingType", typ: r("SellingType") },
        { json: "category", js: "category", typ: r("Category") },
        { json: "state", js: "state", typ: r("State") },
        { json: "platform", js: "platform", typ: r("Platform") },
        { json: "premierPartner", js: "premierPartner", typ: true },
        { json: "imageRestricted", js: "imageRestricted", typ: true },
    ], false),
    "Price": o([
        { json: "amount", js: "amount", typ: 3.14 },
        { json: "currency", js: "currency", typ: r("Currency") },
        { json: "formatted", js: "formatted", typ: "" },
    ], false),
    "PriceHistory": o([
        { json: "date", js: "date", typ: "" },
        { json: "price", js: "price", typ: "" },
        { json: "direction", js: "direction", typ: r("Direction") },
        { json: "priceDifference", js: "priceDifference", typ: "" },
    ], false),
    "Seller": o([
        { json: "id", js: "id", typ: 0 },
        { json: "name", js: "name", typ: "" },
        { json: "type", js: "type", typ: r("SellerType") },
        { json: "branch", js: "branch", typ: u(null, "") },
        { json: "address", js: "address", typ: u(null, "") },
        { json: "phone", js: "phone", typ: u(null, "") },
        { json: "alternativePhone", js: "alternativePhone", typ: u(null, "") },
        { json: "licenceNumber", js: "licenceNumber", typ: u(null, "") },
        { json: "available", js: "available", typ: true },
        { json: "premierPartner", js: "premierPartner", typ: true },
        { json: "images", js: "images", typ: r("Images") },
        { json: "backgroundColour", js: "backgroundColour", typ: u(null, "") },
    ], false),
    "Images": o([
        { json: "profileImage", js: "profileImage", typ: u(null, "") },
        { json: "profileRoundedImage", js: "profileRoundedImage", typ: u(null, "") },
        { json: "standardLogo", js: "standardLogo", typ: u(null, "") },
        { json: "squareLogo", js: "squareLogo", typ: u(null, "") },
    ], false),
    "Stamps": o([
        { json: "stampDutyValue", js: "stampDutyValue", typ: u(r("Price"), null) },
    ], false),
    "DistanceUnit": [
        "km",
    ],
    "PublicTransportType": [
        "Bus",
        "Rail",
        "Tram",
    ],
    "Rating": [
        "BER_PENDING",
        "C1",
        "C2",
        "C3",
        "D1",
        "D2",
        "E1",
        "E2",
        "F",
        "G",
        "SI_666",
    ],
    "Utility": [
        "broadband",
        "electricity",
        "mains sewage",
        "mains water",
        "phone line",
        "septic tank",
    ],
    "FloorAreaUnit": [
        "ACRES",
        "METRES_SQUARED",
    ],
    "Label": [
        "Balcony",
        "Bathroom",
        "Bedroom",
        "Dining Room",
        "Driveway",
        "Floor Plan",
        "Garage",
        "Garden",
        "Hallway",
        "Kitchen",
        "Living Room",
        "Pool",
    ],
    "ImageLabelType": [
        "BACKYARD",
        "BALCONY",
        "BATHROOM",
        "BEDROOM",
        "DINING_ROOM",
        "DRIVEWAY",
        "FLOOR_PLAN",
        "GARAGE",
        "HALLWAY",
        "KITCHEN",
        "LIVING_ROOM",
        "POOL",
    ],
    "Category": [
        "Buy",
    ],
    "FeaturedLevel": [
        "LITE",
        "STANDARD",
    ],
    "FeaturedLevelFull": [
        "PREMIER_PARTNER_LITE",
        "STANDARD",
    ],
    "Platform": [
        "FEEDS",
        "WEB",
    ],
    "SellingType": [
        "By Private Treaty",
        "By Public Auction",
    ],
    "State": [
        "PUBLISHED",
    ],
    "Sticker": [
        "Rural Location",
        "School Nearby",
        "Viewing Advised",
    ],
    "Currency": [
        "EUR",
    ],
    "Direction": [
        "DECREASE",
        "INCREASE",
    ],
    "PropertyType": [
        "Apartment",
        "Bungalow",
        "Detached",
        "End of Terrace",
        "House",
        "Property",
        "Semi-D",
        "Site",
        "Terrace",
        "Townhouse",
    ],
    "Section": [
        "Apartment",
        "Bungalow",
        "Detached House",
        "End of Terrace House",
        "House",
        "Property",
        "Residential",
        "Semi-Detached House",
        "Site",
        "Terraced House",
        "Townhouse",
    ],
    "SellerType": [
        "BRANDED_AGENT",
        "PRIVATE_USER",
        "UNBRANDED_AGENT",
    ],
};
