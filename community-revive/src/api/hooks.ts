import { useQuery } from "@tanstack/react-query";
import { getAllProperties, getPropertyByIdApi } from "./index";
import type { PropertyListing } from "./firestore/types";

export const PROPERTIES_QUERY_KEY = "properties";
export const PROPERTY_BY_ID_QUERY_KEY = "property";

interface UseGetAllPropertiesReturn {
  properties: PropertyListing[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useGetAllProperties = (
  limit: number = 500,
): UseGetAllPropertiesReturn => {
  const query = useQuery<PropertyListing[], Error>({
    queryKey: [PROPERTIES_QUERY_KEY, limit],
    queryFn: () => getAllProperties(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  return {
    properties: query.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};

interface UsePropertyByIdReturn {
  data: PropertyListing | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const usePropertyById = (id: number): UsePropertyByIdReturn => {
  const query = useQuery<PropertyListing | null, Error>({
    queryKey: [PROPERTY_BY_ID_QUERY_KEY, id],
    queryFn: () => getPropertyByIdApi(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: id > 0, // Only run query if we have a valid ID
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? null,
    refetch: query.refetch,
  };
};
