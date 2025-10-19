import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getAllProperties } from "./index";
import { getValidityDataById } from "./firestore";
import type { PropertyListing, ValidityData } from "./firestore/types";

export const PROPERTIES_QUERY_KEY = "properties";
export const VALIDITY_DATA_QUERY_KEY = "validity_data";

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

interface UseGetValidityDataReturn {
  validityData: ValidityData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

export const useGetValidityData = (
  propertyId: string,
): UseGetValidityDataReturn => {
  const query = useQuery<ValidityData | null, Error>({
    queryKey: [VALIDITY_DATA_QUERY_KEY, propertyId],
    queryFn: () => getValidityDataById(propertyId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!propertyId,
  });

  return {
    validityData: query.data || null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
};
