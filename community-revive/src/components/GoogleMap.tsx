import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MarkerClusterer, GridAlgorithm } from '@googlemaps/markerclusterer';
import { Property } from '../types';
import { MapProperty } from '../services/firebaseService';
import { getScoreColor } from '../utils/scoreUtils';
import { PropertyPopover } from './PropertyPopover';
import { apiService } from '../services/apiService';

// Union type for properties that can be displayed on the map
type MapDisplayProperty = Property | MapProperty;

interface GoogleMapProps {
  properties: MapDisplayProperty[];
  selectedProperty?: Property;
  highlightedProperty?: Property;
  onPropertySelect: (property: Property) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  className?: string;
  loading?: boolean;
}

interface MapComponentProps {
  properties: MapDisplayProperty[];
  selectedProperty?: Property;
  highlightedProperty?: Property;
  onPropertySelect: (property: Property) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  className?: string;
  loading?: boolean;
}

// Helper function to check if a property is a full Property or MapProperty
const isFullProperty = (property: MapDisplayProperty): property is Property => {
  return 'communityImpact' in property;
};

// Helper function to get coordinates from either property type
const getPropertyCoordinates = (property: MapDisplayProperty) => {
  if (isFullProperty(property)) {
    return property.coordinates;
  } else {
    return property.coordinates;
  }
};

// Helper function to get community value score from either property type
const getPropertyScore = (property: MapDisplayProperty) => {
  if (isFullProperty(property)) {
    return property.communityValueScore;
  } else {
    return property.communityValueScore;
  }
};

// Helper function to get property title from either property type
const getPropertyTitle = (property: MapDisplayProperty) => {
  if (isFullProperty(property)) {
    return property.title;
  } else {
    return property.title;
  }
};

// Helper function to get property price from either property type
const getPropertyPrice = (property: MapDisplayProperty) => {
  if (isFullProperty(property)) {
    return property.price;
  } else {
    return property.price;
  }
};

// Helper function to get property beforeImage from either property type
const getPropertyBeforeImage = (property: MapDisplayProperty) => {
  if (isFullProperty(property)) {
    return property.beforeImage;
  } else {
    return property.beforeImage;
  }
};

const MapComponent: React.FC<MapComponentProps> = ({
  properties,
  selectedProperty,
  highlightedProperty,
  onPropertySelect,
  onBoundsChange,
  className = '',
  loading = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<Map<number, google.maps.Marker>>(new Map());
  const markerClusterer = useRef<MarkerClusterer | null>(null);
  const [popoverProperty, setPopoverProperty] = useState<Property | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoverProperty, setHoverProperty] = useState<MapDisplayProperty | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  const currentHoveredProperty = useRef<MapDisplayProperty | null>(null);
  const boundsChangedListener = useRef<google.maps.MapsEventListener | null>(null);

  // Helper function to calculate screen position from lat/lng
  const calculateScreenPosition = useCallback((lat: number, lng: number) => {
    const mapDiv = mapRef.current;
    const map = mapInstance.current;
    if (!mapDiv || !map) return null;

    const projection = map.getProjection();
    if (!projection) return null;

    const bounds = map.getBounds();
    if (!bounds) return null;

    const markerLatLng = new google.maps.LatLng(lat, lng);
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    const worldCoordinate = projection.fromLatLngToPoint(markerLatLng);
    const scale = Math.pow(2, map.getZoom() || 8);
    
    if (!worldCoordinate) return null;
    
    const swWorldCoordinate = projection.fromLatLngToPoint(sw);
    const neWorldCoordinate = projection.fromLatLngToPoint(ne);
    
    if (!swWorldCoordinate || !neWorldCoordinate) return null;
    
    const mapWidth = mapDiv.offsetWidth;
    const mapHeight = mapDiv.offsetHeight;
    
    const x = ((worldCoordinate.x - swWorldCoordinate.x) * scale * mapWidth) / 
              ((neWorldCoordinate.x - swWorldCoordinate.x) * scale);
    const y = ((worldCoordinate.y - neWorldCoordinate.y) * scale * mapHeight) / 
              ((swWorldCoordinate.y - neWorldCoordinate.y) * scale);
    
    return { x, y: y - 10 }; // Offset above the marker
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: 53.28925, lng: -7.812739}, // Ireland coordinates
      zoom: 7,
      mapId: process.env.REACT_APP_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID', // Add mapId to silence Advanced Markers warning
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ color: '#f5f5f5' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#c9c9c9' }],
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#757575' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#ffffff' }],
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#eeeeee' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#757575' }],
        },
        {
          featureType: 'road',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#ffffff' }],
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#f2f2f2' }],
        },
        {
          featureType: 'administrative',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#bdbdbd' }],
        },
      ],
    });

    // Initialize marker clusterer with custom options for more aggressive clustering
    markerClusterer.current = new MarkerClusterer({
      map: mapInstance.current,
      markers: [],
      algorithm: new GridAlgorithm({
        maxZoom: 17, // Clusters persist until zoom level 17 (default is 14) - higher = more clustering
        gridSize: 100, // Larger grid = more aggressive clustering (default is 60)
      }),
    });

    // Add click listener to close popover and hide hover
    mapInstance.current.addListener('click', () => {
      setPopoverProperty(null);
      setPopoverPosition(null);
      setHoverProperty(null);
      setHoverPosition(null);
      currentHoveredProperty.current = null;
    });

    // Add listener to update hover position when map moves
    boundsChangedListener.current = mapInstance.current.addListener('bounds_changed', () => {
      if (currentHoveredProperty.current) {
        const coords = getPropertyCoordinates(currentHoveredProperty.current);
        if (coords) {
          const newPosition = calculateScreenPosition(coords.lat, coords.lng);
          if (newPosition) {
            setHoverPosition(newPosition);
          }
        }
      }
      
      // Report bounds change to parent
      if (onBoundsChange) {
        const bounds = mapInstance.current?.getBounds();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          onBoundsChange({
            north: ne.lat(),
            south: sw.lat(),
            east: ne.lng(),
            west: sw.lng(),
          });
        }
      }
    });

    // Cleanup on unmount
    return () => {
      if (markerClusterer.current) {
        markerClusterer.current.clearMarkers();
      }
      if (boundsChangedListener.current) {
        google.maps.event.removeListener(boundsChangedListener.current);
      }
    };
  }, [calculateScreenPosition, onBoundsChange]);

  // Handle highlighted property - center and zoom to it
  useEffect(() => {
    if (!mapInstance.current || !highlightedProperty) return;
    
    const coords = highlightedProperty.coordinates;
    mapInstance.current.setCenter({ lat: coords.lat, lng: coords.lng });
    mapInstance.current.setZoom(15);
    
  }, [highlightedProperty]);

  useEffect(() => {
    if (!mapInstance.current || !markerClusterer.current) return;

    console.log('🗺️ Updating markers for', properties.length, 'properties');

    // Clear existing markers and timeouts
    markerClusterer.current.clearMarkers();
    markers.current.forEach(marker => marker.setMap(null));
    markers.current.clear();
    
    // Clear any pending timeouts
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    currentHoveredProperty.current = null;

    const newMarkers: google.maps.Marker[] = [];

    // Add markers for each property using default Google markers
    for (const property of properties) {
      const coordinates = getPropertyCoordinates(property);
      const title = getPropertyTitle(property);
      const score = getPropertyScore(property);
      const isHighlighted = highlightedProperty?.id === property.id;
      
      // Skip if coordinates are invalid
      if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
        console.warn('⚠️ Skipping property with invalid coordinates:', property.id, coordinates);
        continue;
      }
      
      // Use default Google marker without label value on the pin
      const marker = new google.maps.Marker({
        position: { lat: coordinates.lat, lng: coordinates.lng },
        title: title,
        optimized: true, // Use optimized rendering for better performance
      });

      // Add click listener
      marker.addListener('click', async (event: google.maps.MapMouseEvent) => {
        // If it's a full property, select it directly
        if (isFullProperty(property)) {
          onPropertySelect(property);
        } else {
          // If it's a MapProperty, fetch the full property data
          console.log('Fetching full property data for ID:', property.id);
          try {
            const fullProperty = await apiService.fetchPropertyById(property.id);
            if (fullProperty) {
              onPropertySelect(fullProperty);
            } else {
              console.error('Could not fetch full property data for ID:', property.id);
            }
          } catch (error) {
            console.error('Error fetching property:', error);
          }
        }
      });

      // Add hover effects
      marker.addListener('mouseover', (event: google.maps.MapMouseEvent) => {
        // Clear any pending hide timeout
        if (hideTimeout.current) {
          clearTimeout(hideTimeout.current);
          hideTimeout.current = null;
        }
        
        // Check if we're already hovering over this property
        if (currentHoveredProperty.current?.id === property.id) {
          return; // Already showing this property, do nothing
        }
        
        // Clear any existing show timeout
        if (hoverTimeout.current) {
          clearTimeout(hoverTimeout.current);
        }
        
        // Show hover tooltip with small delay
        hoverTimeout.current = setTimeout(() => {
          const position = calculateScreenPosition(coordinates.lat, coordinates.lng);
          if (position) {
            console.log('Setting hover property:', property.id);
            // Set hover for both full properties and map properties
            currentHoveredProperty.current = property;
            setHoverProperty(property);
            setHoverPosition(position);
          }
        }, 300); // Delay to prevent flickering
      });

      marker.addListener('mouseout', () => {
        // Clear show timeout
        if (hoverTimeout.current) {
          clearTimeout(hoverTimeout.current);
          hoverTimeout.current = null;
        }
        
        // Add a delay before hiding to prevent flicker and tooltip interference
        hideTimeout.current = setTimeout(() => {
          currentHoveredProperty.current = null;
          setHoverProperty(null);
          setHoverPosition(null);
        }, 200); // Increased delay to prevent blinking
      });

      markers.current.set(property.id, marker);
      newMarkers.push(marker);
    }
    
    // Add all markers to the clusterer
    markerClusterer.current.addMarkers(newMarkers);
    
    console.log('✅ Rendered', markers.current.size, 'markers with clustering');
    
    // Cleanup function
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current);
      }
      if (hideTimeout.current) {
        clearTimeout(hideTimeout.current);
      }
    };
  }, [properties, highlightedProperty, onPropertySelect, calculateScreenPosition]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      
      {/* Click Popover */}
      {popoverProperty && popoverPosition && (
        <PropertyPopover
          property={popoverProperty}
          position={popoverPosition}
          onClose={() => {
            setPopoverProperty(null);
            setPopoverPosition(null);
          }}
        />
      )}
      
      {/* Hover Tooltip */}
      {hoverProperty && hoverPosition && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: hoverPosition.x,
            top: hoverPosition.y,
            transform: 'translateX(-50%) translateY(-100%)',
            paddingBottom: '20px', // Extra space to prevent tooltip from covering marker
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border-2 border-accent-500 p-4 w-72">
            <div className="flex gap-3">
              {/* Property Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={getPropertyBeforeImage(hoverProperty)}
                  alt={getPropertyTitle(hoverProperty)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
                  }}
                />
              </div>
              
              {/* Property Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                  {getPropertyTitle(hoverProperty)}
                </h3>
                {isFullProperty(hoverProperty) && (
                  <p className="text-xs text-gray-600 mb-2">
                    {hoverProperty.city}, {hoverProperty.state} {hoverProperty.zipCode}
                  </p>
                )}
                
                {/* Score */}
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: getScoreColor(getPropertyScore(hoverProperty)) }}
                  >
                    {getPropertyScore(hoverProperty)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Community Value</p>
                    <p className="text-xs text-gray-600">Score</p>
                  </div>
                </div>
                
                {/* Additional Info */}
                {isFullProperty(hoverProperty) ? (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      {hoverProperty.propertyType.charAt(0).toUpperCase() + hoverProperty.propertyType.slice(1)}
                      {hoverProperty.size?.squareFeet && (
                        <> • {Math.round(hoverProperty.size.squareFeet / 1000)}k sq ft</>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      {hoverProperty.propertyType}
                      {getPropertyPrice(hoverProperty) && (
                        <> • {getPropertyPrice(hoverProperty)!.formatted}</>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const render = (status: Status): React.ReactElement => {
  switch (status) {
    case Status.LOADING:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      );
    case Status.FAILURE:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load map</p>
            <p className="text-gray-600 text-sm">Please check your Google Maps API key</p>
          </div>
        </div>
      );
    default:
      return <div />;
  }
};

export const GoogleMap: React.FC<GoogleMapProps> = ({ loading, ...props }) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-2">Google Maps API key not found</p>
          <p className="text-gray-600 text-sm">Please add REACT_APP_GOOGLE_MAPS_API_KEY to your environment variables</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map properties...</p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper 
      apiKey={apiKey} 
      libraries={['marker']}
      render={render}
    >
      <MapComponent {...props} />
    </Wrapper>
  );
};