import { Property } from '../types';
import { firebaseService, PaginationOptions, PaginatedResult, MapProperty } from './firebaseService';

// Cache for property data to prevent repeated database requests
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// API service for fetching property data from Firebase
export class ApiService {
  private readonly propertyCache: Map<number, CacheEntry<Property>> = new Map();
  private mapPropertiesCache: CacheEntry<MapProperty[]> | null = null;
  private readonly propertiesCache: Map<string, CacheEntry<PaginatedResult<Property>>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  private isCacheValid<T>(entry: CacheEntry<T> | null | undefined): entry is CacheEntry<T> {
    if (!entry) return false;
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }
  // Fetch properties from Firebase with pagination
  async fetchProperties(params?: {
    area?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
  }, options?: PaginationOptions): Promise<PaginatedResult<Property>> {
    try {
      console.log('🔌 ApiService.fetchProperties called with:', { params, options });
      
      // Use Firebase service to fetch properties
      if (params && Object.keys(params).length > 0) {
        console.log('🔌 ApiService: Using searchProperties with params');
        return await firebaseService.searchProperties({
          area: params.area,
          propertyType: params.propertyType,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          bedrooms: params.bedrooms,
        }, options);
      }
      
      console.log('🔌 ApiService: Using fetchProperties without params');
      return await firebaseService.fetchProperties(options);
    } catch (error) {
      console.error('❌ ApiService: Error fetching properties:', error);
      throw new Error('Failed to fetch properties');
    }
  }

  // Fetch lightweight properties for map markers
  // Note: Caching is handled at the Dashboard component level for map properties
  // because we need to fetch all pages and cache the complete collection
  async fetchMapProperties(options?: PaginationOptions): Promise<PaginatedResult<MapProperty>> {
    try {
      console.log('🔌 ApiService.fetchMapProperties called with:', { options });
      
      // Don't cache paginated map properties - let the component handle it
      const result = await firebaseService.fetchMapProperties(options);
      
      return result;
    } catch (error) {
      console.error('❌ ApiService: Error fetching map properties:', error);
      throw new Error('Failed to fetch map properties');
    }
  }

  // Fetch a single property by ID
  async fetchPropertyById(id: number): Promise<Property | null> {
    try {
      // Check cache first
      const cached = this.propertyCache.get(id);
      if (this.isCacheValid(cached)) {
        console.log(`✅ Using cached property for ID ${id}`);
        return cached.data;
      }
      
      const property = await firebaseService.fetchPropertyById(id);
      
      // Cache the result
      if (property) {
        this.propertyCache.set(id, {
          data: property,
          timestamp: Date.now(),
        });
      }
      
      return property;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error('Failed to fetch property');
    }
  }

  // Clear cache (useful for manual refresh)
  clearCache() {
    this.propertyCache.clear();
    this.mapPropertiesCache = null;
    this.propertiesCache.clear();
    console.log('🧹 Cache cleared');
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
  }, options?: PaginationOptions): Promise<PaginatedResult<Property>> {
    try {
      return await firebaseService.searchProperties(searchParams, options);
    } catch (error) {
      console.error('Error searching properties:', error);
      throw new Error('Failed to search properties');
    }
  }

  // Get high-value properties for community impact with pagination
  async getHighValueProperties(minScore: number = 70, options?: PaginationOptions): Promise<PaginatedResult<Property>> {
    try {
      return await firebaseService.getHighValueProperties(minScore, options);
    } catch (error) {
      console.error('Error fetching high value properties:', error);
      throw new Error('Failed to fetch high value properties');
    }
  }

  // Get properties by area with pagination
  async getPropertiesByArea(area: string, options?: PaginationOptions): Promise<PaginatedResult<Property>> {
    try {
      return await firebaseService.getPropertiesByArea(area, options);
    } catch (error) {
      console.error('Error fetching properties by area:', error);
      throw new Error('Failed to fetch properties by area');
    }
  }

  // Get map properties by area (lightweight)
  async getMapPropertiesByArea(area: string, options?: PaginationOptions): Promise<PaginatedResult<MapProperty>> {
    try {
      return await firebaseService.getMapPropertiesByArea(area, options);
    } catch (error) {
      console.error('Error fetching map properties by area:', error);
      throw new Error('Failed to fetch map properties by area');
    }
  }
}

// Export a default instance
export const apiService = new ApiService();
