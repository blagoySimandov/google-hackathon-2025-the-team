import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap } from './GoogleMap';
import { PropertyCard } from './PropertyCard';
import { MobileDrawer } from './MobileDrawer';
import { FilterPanel, FilterState } from './FilterPanel';
import { Property } from '../types';
import { apiService } from '../services/apiService';
import { MapProperty } from '../services/firebaseService';
import { Search, X, MapPin } from 'lucide-react';

const defaultFilters: FilterState = {
  priceRange: { min: '', max: '' },
  propertyTypes: [],
  scoreRange: { min: '', max: '' },
  sortBy: 'score',
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [highlightedProperty, setHighlightedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
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

  // Fetch properties from Firebase
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        console.log('📋 Dashboard: Starting to fetch properties...');
        setLoading(true);
        setError(null);

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

  // Fetch lightweight map properties separately
  useEffect(() => {
    const fetchMapProperties = async () => {
      try {
        console.log('🗺️ Dashboard: Starting to fetch ALL map properties...');
        setMapLoading(true);

        let allProperties: MapProperty[] = [];
        let hasMore = true;
        let lastDoc: any = undefined;
        let pageCount = 0;

        while (hasMore) {
          pageCount++;
          console.log(`🗺️ Dashboard: Fetching page ${pageCount}...`);

          const result = await apiService.fetchMapProperties({}, {
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
      } catch (err) {
        console.error('❌ Dashboard: Error fetching map properties:', err);
      } finally {
        setMapLoading(false);
      }
    };

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

  // Helper function to apply filters (used for both full properties and map properties)
  const applyFilters = useCallback((propertyList: any[]) => {
    let filtered = [...propertyList];

    // Apply search query filter
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(queryLower) ||
        (p.address && p.address.toLowerCase().includes(queryLower)) ||
        (p.city && p.city.toLowerCase().includes(queryLower)) ||
        (p.state && p.state.toLowerCase().includes(queryLower))
      );
    }

    // Apply price range filter
    if (filters.priceRange.min !== '') {
      filtered = filtered.filter(p => p.price && p.price.amount >= (filters.priceRange.min as number));
    }
    if (filters.priceRange.max !== '') {
      filtered = filtered.filter(p => p.price && p.price.amount <= (filters.priceRange.max as number));
    }

    // Apply property type filter
    if (filters.propertyTypes.length > 0) {
      filtered = filtered.filter(p => filters.propertyTypes.includes(p.propertyType));
    }

    // Apply score range filter (communityScore for full properties, communityValueScore for map properties)
    if (filters.scoreRange.min !== '') {
      filtered = filtered.filter(p => {
        const score = p.communityScore !== undefined ? p.communityScore : p.communityValueScore;
        return score >= (filters.scoreRange.min as number);
      });
    }
    if (filters.scoreRange.max !== '') {
      filtered = filtered.filter(p => {
        const score = p.communityScore !== undefined ? p.communityScore : p.communityValueScore;
        return score <= (filters.scoreRange.max as number);
      });
    }

    return filtered;
  }, [searchQuery, filters]);

  // Filtered map properties
  const filteredMapProperties = useMemo(() => {
    return applyFilters(mapProperties);
  }, [mapProperties, applyFilters]);

  // Filtered and sorted list properties
  const filteredAndSortedProperties = useMemo(() => {
    const filtered = applyFilters(properties);

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          return b.communityScore - a.communityScore;
        case 'price-low':
          return (a.price?.amount || 0) - (b.price?.amount || 0);
        case 'price-high':
          return (b.price?.amount || 0) - (a.price?.amount || 0);
        case 'newest':
          return b.id - a.id;
        case 'oldest':
          return a.id - b.id;
        default:
          return 0;
      }
    });

    return sorted;
  }, [properties, applyFilters, filters.sortBy]);

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

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const hasActiveSearch = searchQuery !== '';

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
      {/* Map Section */}
      <div className="flex-1 lg:w-3/5 h-1/2 lg:h-full">
        <div className="h-full p-4">
          <div className="bg-white rounded-lg shadow-sm h-full">
            <GoogleMap
              properties={filteredMapProperties}
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
              <div className="mb-4 relative">
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
            </div>
          </div>

          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleResetFilters}
            propertyCount={filteredAndSortedProperties.length}
          />

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
            ) : filteredAndSortedProperties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 text-center max-w-sm mb-4">
                  Try adjusting your search terms to see more results
                </p>
                {hasActiveSearch && (
                  <button 
                    onClick={clearSearch}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg 
                      font-semibold transition-all duration-200 button-press shadow-sm hover:shadow-md"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredAndSortedProperties.map((property, index) => (
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
          {pagination.hasMore && !loading && filteredAndSortedProperties.length > 0 && (
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
        properties={filteredAndSortedProperties}
        filters={[]}
        selectedFilter=""
        selectedProperty={selectedProperty || undefined}
        onPropertySelect={handlePropertySelect}
        onFilterChange={() => {}}
        isOpen={isMobileDrawerOpen}
        onToggle={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
      />
    </div>
  );
};
