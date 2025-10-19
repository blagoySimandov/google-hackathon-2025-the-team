import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GoogleMap } from './GoogleMap';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters } from './PropertyFilters';
import { MobileDrawer } from './MobileDrawer';
import { filterOptions } from '../utils/scoreUtils';
import { Property } from '../types';
import { apiService } from '../services/apiService';
import { MapProperty } from '../services/firebaseService';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';

interface DashboardProps {
  onPropertySelect: (property: Property) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onPropertySelect }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [highlightedProperty, setHighlightedProperty] = useState<Property | null>(null); // For "See on map" feature
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'newest'>('score');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [mapProperties, setMapProperties] = useState<MapProperty[]>([]);
  const [mapPropertiesFetched, setMapPropertiesFetched] = useState(false); // Track if map properties have been fetched
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
      // If we already have map properties, don't fetch again
      if (mapPropertiesFetched && mapProperties.length > 0) {
        console.log('🗺️ Dashboard: Using existing map properties:', mapProperties.length);
        setMapLoading(false);
        return;
      }
      
      try {
        console.log('🗺️ Dashboard: Starting to fetch ALL map properties...');
        setMapLoading(true);
        
        let allProperties: MapProperty[] = [];
        let hasMore = true;
        let lastDoc: any = undefined;
        let pageCount = 0;
        
        // Fetch all properties in batches, bypassing cache for pagination
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
        setMapPropertiesFetched(true); // Mark as fetched
      } catch (err) {
        console.error('❌ Dashboard: Error fetching map properties:', err);
        // Don't set error state for map properties, just log it
      } finally {
        setMapLoading(false);
      }
    };

    console.log('🗺️ Dashboard: Map useEffect triggered, calling fetchMapProperties...');
    fetchMapProperties();
  }, [mapPropertiesFetched, mapProperties.length]);

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

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = [...properties];
    
    // Apply category filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(property => {
        switch (selectedFilter) {
          case 'high-score':
            return property.communityValueScore >= 80;
          case 'medium-score':
            return property.communityValueScore >= 60 && property.communityValueScore < 80;
          case 'historic':
            return property.communityImpact?.historicDistrict || false;
          case 'near-school':
            return property.communityImpact?.nearSchool || false;
          case 'near-transit':
            return property.communityImpact?.nearTransit || false;
          case 'residential':
            return property.propertyType === 'residential';
          case 'commercial':
            return property.propertyType === 'commercial';
          case 'vacant':
            return property.propertyType === 'vacant';
          default:
            return true;
        }
      });
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const beforeCount = filtered.length;
      filtered = filtered.filter(property => {
        const addressMatch = property.address?.toLowerCase().includes(query) || false;
        const cityMatch = property.city?.toLowerCase().includes(query) || false;
        const stateMatch = property.state?.toLowerCase().includes(query) || false;
        const titleMatch = property.title?.toLowerCase().includes(query) || false;
        const descMatch = property.description?.toLowerCase().includes(query) || false;
        return addressMatch || cityMatch || stateMatch || titleMatch || descMatch;
      });
      console.log(`🔍 Search "${searchQuery}": ${beforeCount} → ${filtered.length} properties`);
    }

    // Apply price range filters
    if (minPrice !== '' && minPrice > 0) {
      filtered = filtered.filter(p => p.price && p.price.amount >= minPrice);
    }
    if (maxPrice !== '' && maxPrice > 0) {
      filtered = filtered.filter(p => p.price && p.price.amount <= maxPrice);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.communityValueScore - a.communityValueScore;
        case 'price':
          return (a.price?.amount || 0) - (b.price?.amount || 0);
        case 'newest':
          return b.id - a.id; // Assuming higher ID = newer
        default:
          return 0;
      }
    });

    console.log(`📊 Final filtered results: ${sorted.length} properties`);
    return sorted;
  }, [selectedFilter, searchQuery, minPrice, maxPrice, sortBy, properties]);

  // Calculate filter counts dynamically
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: properties.length };
    
    for (const property of properties) {
      if (property.communityValueScore >= 80) counts['high-score'] = (counts['high-score'] || 0) + 1;
      if (property.communityValueScore >= 60 && property.communityValueScore < 80) counts['medium-score'] = (counts['medium-score'] || 0) + 1;
      if (property.communityImpact?.historicDistrict) counts['historic'] = (counts['historic'] || 0) + 1;
      if (property.communityImpact?.nearSchool) counts['near-school'] = (counts['near-school'] || 0) + 1;
      if (property.communityImpact?.nearTransit) counts['near-transit'] = (counts['near-transit'] || 0) + 1;
      if (property.propertyType === 'residential') counts['residential'] = (counts['residential'] || 0) + 1;
      if (property.propertyType === 'commercial') counts['commercial'] = (counts['commercial'] || 0) + 1;
      if (property.propertyType === 'vacant') counts['vacant'] = (counts['vacant'] || 0) + 1;
    }
    
    return counts;
  }, [properties]);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect(property);
  };

  const handleViewOnMap = (property: Property) => {
    setHighlightedProperty(property);
    // Clear highlight after 5 seconds
    setTimeout(() => {
      setHighlightedProperty(null);
    }, 5000);
  };

  const clearAllFilters = () => {
    setSelectedFilter('all');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('score');
  };

  const hasActiveFilters = selectedFilter !== 'all' || searchQuery || minPrice !== '' || maxPrice !== '';

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
      {/* Map Section */}
      <div className="flex-1 lg:w-3/5 h-1/2 lg:h-full">
        <div className="h-full p-4">
          <div className="bg-white rounded-lg shadow-sm h-full">
            <GoogleMap
              properties={mapProperties}
              selectedProperty={selectedProperty || undefined}
              highlightedProperty={highlightedProperty || undefined}
              onPropertySelect={handlePropertySelect}
              className="h-full"
              loading={mapLoading}
            />
          </div>
        </div>
      </div>

      {/* Desktop Properties List Section - Full Height Column */}
      <div className="hidden lg:flex lg:w-2/5 h-full flex-col overflow-hidden">
        <div className="h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Community Revive
            </h1>
            <p className="text-gray-600 text-sm mb-4">
              Discover properties with high community impact potential
            </p>

            {/* Search Bar */}
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by address, city, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="mb-3">
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'score' | 'price' | 'newest')}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm appearance-none bg-white"
                >
                  <option value="score">Sort by Impact Score</option>
                  <option value="price">Sort by Price (Low to High)</option>
                  <option value="newest">Sort by Newest</option>
                </select>
              </div>
            </div>

            {/* Collapsible Filters */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-700">Filters & Options</span>
                  {hasActiveFilters && (
                    <span className="bg-accent-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                {filtersExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              {filtersExpanded && (
                <div className="p-4 bg-white border-t border-gray-200 space-y-4">
                  {/* Price Range Filters */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Price Range (€)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Category Filters */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Categories</label>
                    <PropertyFilters
                      filters={filterOptions.map(f => ({ ...f, count: filterCounts[f.id] || 0 }))}
                      selectedFilter={selectedFilter}
                      onFilterChange={setSelectedFilter}
                    />
                  </div>

                  {/* Clear Button */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="mt-3 text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredAndSortedProperties.length}</span> of {properties.length} properties
            </div>
          </div>

          {/* Scrollable Properties List - Takes all remaining space */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3"  style={{ height: 0 }}>
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
            ) : filteredAndSortedProperties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">No properties match your filters.</p>
                {hasActiveFilters && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-accent-600 hover:text-accent-800 underline text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              filteredAndSortedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isSelected={selectedProperty?.id === property.id}
                  onClick={() => handlePropertySelect(property)}
                  onViewOnMap={() => handleViewOnMap(property)}
                />
              ))
            )}
          </div>

          {/* Load More Button - Fixed at bottom */}
          {pagination.hasMore && !loading && (
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <button
                onClick={loadMoreProperties}
                disabled={loading}
                className="w-full py-2 px-4 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Load More Properties
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        properties={filteredAndSortedProperties}
        filters={filterOptions.map(f => ({ ...f, count: filterCounts[f.id] || 0 }))}
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
