import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleMap } from './GoogleMap';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters } from './PropertyFilters';
import { MobileDrawer } from './MobileDrawer';
import { filterOptions } from '../utils/scoreUtils';
import { Property } from '../types';
import { apiService } from '../services/apiService';
import { MapProperty } from '../services/firebaseService';

interface DashboardProps {
  onPropertySelect: (property: Property) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onPropertySelect }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [mapProperties, setMapProperties] = useState<MapProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    lastDoc?: any;
    hasMore: boolean;
  }>({ hasMore: true });

  // Fetch properties from Firebase on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('📋 Dashboard: Starting to fetch properties...');
        setLoading(true);
        setError(null);
        
        console.log('📋 Dashboard: Calling apiService.fetchProperties...');
        const result = await apiService.fetchProperties({}, { pageSize: 20 });
        console.log('📋 Dashboard: Received result from API:', result);
        
        setProperties(result.data);
        setPagination({
          lastDoc: result.lastDoc,
          hasMore: result.hasMore,
        });
        
        console.log('📋 Dashboard: Properties set successfully:', result.data.length);
      } catch (err) {
        console.error('❌ Dashboard: Error fetching properties:', err);
        setError('Failed to load properties. Please check your Firebase configuration.');
      } finally {
        setLoading(false);
      }
    };

    console.log('📋 Dashboard: useEffect triggered, calling fetchProperties...');
    fetchProperties();
  }, []);

  // Fetch lightweight map properties separately - fetch ALL properties
  useEffect(() => {
    const fetchMapProperties = async () => {
      try {
        console.log('🗺️ Dashboard: Starting to fetch ALL map properties...');
        setMapLoading(true);
        
        let allProperties: MapProperty[] = [];
        let hasMore = true;
        let lastDoc: any = undefined;
        let pageCount = 0;
        
        // Fetch all properties in batches
        while (hasMore) {
          pageCount++;
          console.log(`🗺️ Dashboard: Fetching page ${pageCount}...`);
          
          const result = await apiService.fetchMapProperties({ 
            pageSize: 100, // Larger batch size
            lastDoc 
          });
          
          console.log(`🗺️ Dashboard: Page ${pageCount} received ${result.data.length} properties`);
          allProperties = [...allProperties, ...result.data];
          
          hasMore = result.hasMore;
          lastDoc = result.lastDoc;
        }
        
        console.log('🗺️ Dashboard: All map properties fetched:', allProperties.length);
        setMapProperties(allProperties);
      } catch (err) {
        console.error('❌ Dashboard: Error fetching map properties:', err);
        // Don't set error state for map properties, just log it
      } finally {
        setMapLoading(false);
      }
    };

    console.log('🗺️ Dashboard: Map useEffect triggered, calling fetchMapProperties...');
    fetchMapProperties();
  }, []);

  // Load more properties
  const loadMoreProperties = useCallback(async () => {
    if (!pagination.hasMore || loading) return;

    try {
      setLoading(true);
      const result = await apiService.fetchProperties({}, {
        pageSize: 20,
        lastDoc: pagination.lastDoc,
      });
      
      setProperties(prev => [...prev, ...result.data]);
      setPagination({
        lastDoc: result.lastDoc,
        hasMore: result.hasMore,
      });
    } catch (err) {
      console.error('Error loading more properties:', err);
      setError('Failed to load more properties.');
    } finally {
      setLoading(false);
    }
  }, [pagination, loading]);

  const filteredProperties = useMemo(() => {
    if (selectedFilter === 'all') return properties;
    
    return properties.filter(property => {
      switch (selectedFilter) {
        case 'historic':
          return property.communityImpact.historicDistrict;
        case 'green-space':
          return property.communityImpact.potentialGreenSpace;
        case 'youth-impact':
          return property.communityImpact.highYouthImpact;
        case 'near-school':
          return property.communityImpact.nearSchool;
        case 'near-park':
          return property.communityImpact.nearPark;
        default:
          return true;
      }
    });
  }, [selectedFilter, properties]);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect(property);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Map Section */}
      <div className="flex-1 lg:w-3/5 h-1/2 lg:h-full">
        <div className="h-full p-4">
          <div className="bg-white rounded-lg shadow-sm h-full">
            <GoogleMap
              properties={mapProperties}
              selectedProperty={selectedProperty || undefined}
              onPropertySelect={handlePropertySelect}
              className="h-full"
              loading={mapLoading}
            />
          </div>
        </div>
      </div>

      {/* Desktop Properties List Section */}
      <div className="hidden lg:flex lg:w-2/5 h-full flex-col">
        <div className="p-4 bg-white border-l border-gray-200 flex flex-col h-full">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Community Revive
            </h1>
            <p className="text-gray-600 text-sm">
              Discover properties with high community impact potential
            </p>
          </div>

          {/* Filters */}
          <PropertyFilters
            filters={filterOptions}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />

          {/* Properties List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading properties...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p className="mb-2">{error}</p>
                <button 
                  onClick={() => globalThis.location.reload()} 
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Retry
                </button>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No properties match the selected filter.</p>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isSelected={selectedProperty?.id === property.id}
                  onClick={() => handlePropertySelect(property)}
                />
              ))
            )}
          </div>

          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={loadMoreProperties}
                disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load More Properties'}
              </button>
            </div>
          )}

          {/* Footer Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filteredProperties.length} properties</span>
              <span>
                Avg. Score: {Math.round(
                  filteredProperties.reduce((sum, p) => sum + p.communityValueScore, 0) / 
                  filteredProperties.length || 0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        properties={filteredProperties}
        filters={filterOptions}
        selectedFilter={selectedFilter}
        selectedProperty={selectedProperty || undefined}
        onPropertySelect={handlePropertySelect}
        onFilterChange={setSelectedFilter}
        isOpen={isMobileDrawerOpen}
        onToggle={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
      />
    </div>
  );
};
