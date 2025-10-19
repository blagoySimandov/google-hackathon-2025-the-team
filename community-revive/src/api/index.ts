import { getPropertyListings } from './firestore';
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

export type { PropertyListing } from './firestore/types';

export {
  getPropertyListings
} from './firestore';

export { useGetAllProperties, PROPERTIES_QUERY_KEY } from './hooks';
export { QueryProvider, queryClient } from './QueryProvider';
