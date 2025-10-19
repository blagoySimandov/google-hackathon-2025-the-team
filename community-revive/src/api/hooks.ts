import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getAllProperties } from "./index";
import type { PropertyListing } from "./firestore/types";

export const PROPERTIES_QUERY_KEY = "properties";

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
