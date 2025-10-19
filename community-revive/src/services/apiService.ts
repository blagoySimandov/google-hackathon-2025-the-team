import { Property } from '../types';
import { firebaseService, PaginationOptions, PaginatedResult, MapProperty } from './firebaseService';

// API service for fetching property data from Firebase
export class ApiService {
  // Fetch properties from Firebase with pagination
  async fetchProperties(params?: {
    area?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
  }, options?: PaginationOptions): Promise<PaginatedResult<Property>> {
    try {
      // Use Firebase service to fetch properties
      if (params && Object.keys(params).length > 0) {
        return await firebaseService.searchProperties({
          area: params.area,
          propertyType: params.propertyType,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          bedrooms: params.bedrooms,
        }, options);
      }
      
      return await firebaseService.fetchProperties(options);
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error('Failed to fetch properties');
    }
  }

  // Fetch lightweight properties for map markers
  async fetchMapProperties(options?: PaginationOptions): Promise<PaginatedResult<MapProperty>> {
    try {
      return await firebaseService.fetchMapProperties(options);
    } catch (error) {
      console.error('Error fetching map properties:', error);
      throw new Error('Failed to fetch map properties');
    }
  }

  // Fetch a single property by ID
  async fetchPropertyById(id: number): Promise<Property | null> {
    try {
      return await firebaseService.fetchPropertyById(id);
    } catch (error) {
      console.error('Error fetching property:', error);
      throw new Error('Failed to fetch property');
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
