import { getPropertyListings, getPropertyById } from './firestore';
import type { PropertyListing } from './firestore/types';

export async function getAllProperties(limit?: number): Promise<PropertyListing[]> {
  try {
    const properties = await getPropertyListings(limit);
    return properties;
  } catch (error) {
    console.error('Error in getAllProperties:', error);
    throw error;
  }
}

export async function getPropertyByIdApi(id: number): Promise<PropertyListing | null> {
  try {
    const property = await getPropertyById(id);
    return property;
  } catch (error) {
    console.error('Error in getPropertyByIdApi:', error);
    throw error;
  }
}

export type { PropertyListing } from './firestore/types';

export {
  getPropertyListings,
  getPropertyById
} from './firestore';

export { useGetAllProperties, usePropertyById, PROPERTIES_QUERY_KEY } from './hooks';
export { QueryProvider, queryClient } from './QueryProvider';
