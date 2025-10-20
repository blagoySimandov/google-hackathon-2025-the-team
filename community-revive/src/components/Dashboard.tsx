import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap } from './GoogleMap';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters } from './PropertyFilters';
import { MobileDrawer } from './MobileDrawer';
import { filterOptions } from '../utils/scoreUtils';
import { Property } from '../types';
import { apiService } from '../services/apiService';
import { MapProperty, PropertyFilters as ApiPropertyFilters } from '../services/firebaseService';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [highlightedProperty, setHighlightedProperty] = useState<Property | null>(null); // For "See on map" feature
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'score' | 'validity' | 'price' | 'newest'>('score');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [mapProperties, setMapProperties] = useState<MapProperty[]>([]);
  const [mapPropertiesFetched, setMapPropertiesFetched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    lastDoc?: any;
    hasMore: boolean;
  }>({ hasMore: true });
  const [visiblePropertyIds, setVisiblePropertyIds] = useState<number[]>([]);

  const buildFilters = useCallback((): ApiPropertyFilters => {
    const filters: ApiPropertyFilters = {};

    if (visiblePropertyIds.length > 0) {
      filters.propertyIds = visiblePropertyIds;
    }

    if (minPrice !== '' && minPrice > 0) {
      filters.minPrice = minPrice;
    }

    if (maxPrice !== '' && maxPrice > 0) {
      filters.maxPrice = maxPrice;
    }

    if (selectedFilter !== 'all') {
      const filterIdToPropertyType: Record<string, string> = {
        'house': 'House',
        'apartment': 'Apartment',
        'bungalow': 'Bungalow',
        'detached': 'Detached',
        'semi-d': 'Semi-D',
        'terrace': 'Terrace',
        'townhouse': 'Townhouse',
        'site': 'Site',
      };

      if (filterIdToPropertyType[selectedFilter]) {
        filters.propertyType = filterIdToPropertyType[selectedFilter];
      }

      if (selectedFilter === 'high-score') {
        filters.minCommunityScore = 80;
      } else if (selectedFilter === 'medium-score') {
        filters.minCommunityScore = 60;
        filters.maxCommunityScore = 79;
      }

      if (selectedFilter === 'near-school') filters.nearSchool = true;
      if (selectedFilter === 'near-park') filters.nearPark = true;
      if (selectedFilter === 'near-transit') filters.nearTransit = true;
      if (selectedFilter === 'historic') filters.historicDistrict = true;
      if (selectedFilter === 'blight-removal') filters.blightRemoval = true;
      if (selectedFilter === 'youth-impact') filters.highYouthImpact = true;
      if (selectedFilter === 'green-space') filters.potentialGreenSpace = true;
    }

    return filters;
  }, [selectedFilter, minPrice, maxPrice, visiblePropertyIds]);

  const buildMapFilters = useCallback((): ApiPropertyFilters => {
    const filters: ApiPropertyFilters = {};

    if (minPrice !== '' && minPrice > 0) {
      filters.minPrice = minPrice;
    }

    if (maxPrice !== '' && maxPrice > 0) {
      filters.maxPrice = maxPrice;
    }

    if (selectedFilter !== 'all') {
      const filterIdToPropertyType: Record<string, string> = {
        'house': 'House',
        'apartment': 'Apartment',
        'bungalow': 'Bungalow',
        'detached': 'Detached',
        'semi-d': 'Semi-D',
        'terrace': 'Terrace',
        'townhouse': 'Townhouse',
        'site': 'Site',
      };

      if (filterIdToPropertyType[selectedFilter]) {
        filters.propertyType = filterIdToPropertyType[selectedFilter];
      }

      if (selectedFilter === 'high-score') {
        filters.minCommunityScore = 80;
      } else if (selectedFilter === 'medium-score') {
        filters.minCommunityScore = 60;
        filters.maxCommunityScore = 79;
      }

      if (selectedFilter === 'near-school') filters.nearSchool = true;
      if (selectedFilter === 'near-park') filters.nearPark = true;
      if (selectedFilter === 'near-transit') filters.nearTransit = true;
      if (selectedFilter === 'historic') filters.historicDistrict = true;
      if (selectedFilter === 'blight-removal') filters.blightRemoval = true;
      if (selectedFilter === 'youth-impact') filters.highYouthImpact = true;
      if (selectedFilter === 'green-space') filters.potentialGreenSpace = true;
    }

    return filters;
  }, [selectedFilter, minPrice, maxPrice]);

  // Fetch properties from Firebase with server-side filters
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('📋 Dashboard: Starting to fetch properties with filters...');
        setLoading(true);
        setError(null);

        const filters = buildFilters();
        console.log('📋 Dashboard: Calling apiService.fetchProperties with filters:', filters);
        const result = await apiService.fetchProperties(filters, { pageSize: 20 });
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
  }, [buildFilters]);

  // Fetch lightweight map properties separately with filters
  useEffect(() => {
    const fetchMapProperties = async () => {
      try {
        console.log('🗺️ Dashboard: Starting to fetch ALL map properties with filters...');
        setMapLoading(true);

        let allProperties: MapProperty[] = [];
        let hasMore = true;
        let lastDoc: any = undefined;
        let pageCount = 0;

        const mapFilters = buildMapFilters();
        console.log('🗺️ Dashboard: Using map filters:', mapFilters);

        while (hasMore) {
          pageCount++;
          console.log(`🗺️ Dashboard: Fetching page ${pageCount}...`);

          const result = await apiService.fetchMapProperties(mapFilters, {
            pageSize: 100,
            lastDoc
          });

          console.log(`🗺️ Dashboard: Page ${pageCount} received ${result.data.length} properties`);
          allProperties = [...allProperties, ...result.data];

          hasMore = result.hasMore;
          lastDoc = result.lastDoc;
        }

        console.log('🗺️ Dashboard: All map properties fetched:', allProperties.length);
        setMapProperties(allProperties);
        setMapPropertiesFetched(true);
      } catch (err) {
        console.error('❌ Dashboard: Error fetching map properties:', err);
      } finally {
        setMapLoading(false);
      }
    };

    setMapPropertiesFetched(false);
    fetchMapProperties();
  }, [buildMapFilters]);

  // Load more properties with filters
  const loadMoreProperties = useCallback(async () => {
    if (!pagination.hasMore || loading) return;

    try {
      setLoading(true);
      const filters = buildFilters();
      const result = await apiService.fetchProperties(filters, {
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
  }, [pagination, loading, buildFilters]);

  const sortedProperties = useMemo(() => {
    const sorted = [...properties].sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.communityScore - a.communityScore;
        case 'validity':
          return b.validityScore - a.validityScore;
        case 'price':
          return (a.price?.amount || 0) - (b.price?.amount || 0);
        case 'newest':
          return b.id - a.id;
        default:
          return 0;
      }
    });

    return sorted;
  }, [sortBy, properties]);

  const handleBoundsChange = useCallback((ids: number[]) => {
    console.log('🗺️ Dashboard: Map bounds changed, visible IDs:', ids.length);
    setVisiblePropertyIds(ids);
  }, []);

  // Calculate filter counts dynamically
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: properties.length };

    for (const property of properties) {
      if (property.communityScore >= 80) counts['high-score'] = (counts['high-score'] || 0) + 1;
      if (property.communityScore >= 60 && property.communityScore < 80) counts['medium-score'] = (counts['medium-score'] || 0) + 1;

      const propType = property.propertyType?.toLowerCase();
      if (propType === 'house') counts['house'] = (counts['house'] || 0) + 1;
      if (propType === 'apartment') counts['apartment'] = (counts['apartment'] || 0) + 1;
      if (propType === 'bungalow') counts['bungalow'] = (counts['bungalow'] || 0) + 1;
      if (propType === 'detached') counts['detached'] = (counts['detached'] || 0) + 1;
      if (propType === 'semi-d') counts['semi-d'] = (counts['semi-d'] || 0) + 1;
      if (propType === 'terrace') counts['terrace'] = (counts['terrace'] || 0) + 1;
      if (propType === 'townhouse') counts['townhouse'] = (counts['townhouse'] || 0) + 1;
      if (propType === 'site') counts['site'] = (counts['site'] || 0) + 1;

      if (property.communityImpact?.nearSchool) counts['near-school'] = (counts['near-school'] || 0) + 1;
      if (property.communityImpact?.nearPark) counts['near-park'] = (counts['near-park'] || 0) + 1;
      if (property.communityImpact?.nearTransit) counts['near-transit'] = (counts['near-transit'] || 0) + 1;
      if (property.communityImpact?.historicDistrict) counts['historic'] = (counts['historic'] || 0) + 1;
      if (property.communityImpact?.blightRemoval) counts['blight-removal'] = (counts['blight-removal'] || 0) + 1;
      if (property.communityImpact?.highYouthImpact) counts['youth-impact'] = (counts['youth-impact'] || 0) + 1;
      if (property.communityImpact?.potentialGreenSpace) counts['green-space'] = (counts['green-space'] || 0) + 1;
    }

    return counts;
  }, [properties]);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    navigate(`/property/${property.id}`);
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
    setVisiblePropertyIds([]);
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
              onBoundsChange={handleBoundsChange}
              className="h-full"
              loading={mapLoading}
            />
          </div>
        </div>
      </div>

      {/* Desktop Properties List Section - Full Height Column */}
      <div className="hidden lg:flex lg:w-2/5 h-full flex-col overflow-hidden">
        <div className="h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          {/* Fixed Header - Enhanced */}
          <div className="flex-shrink-0 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-3xl font-bold mb-1 tracking-tight">
                    Community Revive
                  </h1>
                  <p className="text-primary-100 text-sm">
                    Transforming vacant properties into community assets
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-3 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Search by location or property type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-white/95 backdrop-blur-sm border-0 rounded-xl 
                    shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900 
                    placeholder:text-gray-500 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                      hover:text-gray-600 transition-colors z-10 button-press"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="mb-0">
                <div className="relative">
                  <SlidersHorizontal className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'score' | 'validity' | 'price' | 'newest')}
                    className="w-full pl-11 pr-4 py-3 bg-white/95 backdrop-blur-sm border-0 rounded-xl
                      shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-sm
                      appearance-none text-gray-900 font-medium cursor-pointer transition-all"
                  >
                    <option value="score">Sort by Community Score</option>
                    <option value="validity">Sort by Validity Score</option>
                    <option value="price">Sort by Price (Low to High)</option>
                    <option value="newest">Sort by Newest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Collapsible Filters */}
            <div className="mx-6 mb-4 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-white" />
                  <span className="font-semibold text-white">Filters & Options</span>
                  {hasActiveFilters && (
                    <span className="bg-white text-primary-700 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse-slow">
                      Active
                    </span>
                  )}
                </div>
                {filtersExpanded ? (
                  <ChevronUp className="w-5 h-5 text-white" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white" />
                )}
              </button>
              
              {filtersExpanded && (
                <div className="p-4 bg-white space-y-4 slide-up">
                  {/* Price Range Filters */}
                  <div>
                    <div className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      Price Range (€)
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="min-price" className="sr-only">Minimum Price</label>
                        <input
                          id="min-price"
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium
                            transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="max-price" className="sr-only">Maximum Price</label>
                        <input
                          id="max-price"
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none 
                            focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium
                            transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category Filters */}
                  <div>
                    <div className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                      Categories
                    </div>
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
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                        bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold 
                        transition-all duration-200 button-press shadow-sm hover:shadow-md"
                    >
                      <X className="w-4 h-4" />
                      Clear All Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="flex-shrink-0 px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-bold text-primary-600">{sortedProperties.length}</span> properties
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Properties List - Takes all remaining space */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3"  style={{ height: 0 }}>
            {loading && properties.length === 0 ? (
              <div className="space-y-3">
                {/* Loading Skeletons */}
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                    <div className="h-48 bg-gray-200 shimmer"></div>
                    <div className="p-4 space-y-3">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                        <div className="h-12 bg-gray-200 rounded-lg"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <X className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-gray-600 text-center max-w-sm mb-4">{error}</p>
                <button 
                  onClick={() => globalThis.location.reload()} 
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg 
                    font-semibold transition-all duration-200 button-press shadow-sm hover:shadow-md"
                >
                  Retry
                </button>
              </div>
            ) : sortedProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 text-center max-w-sm mb-4">
                  Try adjusting your filters or search terms to see more results
                </p>
                {hasActiveFilters && (
                  <button 
                    onClick={clearAllFilters}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg 
                      font-semibold transition-all duration-200 button-press shadow-sm hover:shadow-md"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              sortedProperties.map((property, index) => (
                <div key={property.id} className="fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <PropertyCard
                    property={property}
                    isSelected={selectedProperty?.id === property.id}
                    onClick={() => handlePropertySelect(property)}
                    onViewOnMap={() => handleViewOnMap(property)}
                  />
                </div>
              ))
            )}
          </div>

          {/* Load More Button - Fixed at bottom */}
          {pagination.hasMore && !loading && sortedProperties.length > 0 && (
            <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={loadMoreProperties}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 
                  text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 
                  shadow-sm hover:shadow-md button-press"
              >
                Load More Properties
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        properties={sortedProperties}
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
