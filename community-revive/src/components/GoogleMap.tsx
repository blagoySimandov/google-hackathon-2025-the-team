import React, { useRef, useEffect, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { Property } from '../types';
import { getScoreColor } from '../data/mockData';
import { PropertyPopover } from './PropertyPopover';

interface GoogleMapProps {
  properties: Property[];
  selectedProperty?: Property;
  onPropertySelect: (property: Property) => void;
  className?: string;
}

interface MapComponentProps {
  properties: Property[];
  selectedProperty?: Property;
  onPropertySelect: (property: Property) => void;
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  properties,
  selectedProperty,
  onPropertySelect,
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const [popoverProperty, setPopoverProperty] = useState<Property | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoverProperty, setHoverProperty] = useState<Property | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: 42.3314, lng: -83.0458 }, // Detroit coordinates
      zoom: 11,
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

    // Add click listener to close popover
    mapInstance.current.addListener('click', () => {
      setPopoverProperty(null);
      setPopoverPosition(null);
    });
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    for (const marker of markers.current) {
      marker.setMap(null);
    }
    markers.current = [];

    // Add markers for each property
    for (const property of properties) {
      const color = getScoreColor(property.communityValueScore);
      
      const marker = new google.maps.Marker({
        position: { lat: property.coordinates.lat, lng: property.coordinates.lng },
        map: mapInstance.current,
        title: property.address,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      // Add click listener
      marker.addListener('click', (event: google.maps.MapMouseEvent) => {
        onPropertySelect(property);
        
        // Show popover
        if (event.latLng) {
          const projection = mapInstance.current!.getProjection();
          const pixel = projection?.fromLatLngToPoint(event.latLng);
          if (pixel && projection) {
            const mapDiv = mapRef.current!;
            const scale = Math.pow(2, mapInstance.current!.getZoom()!);
            const worldCoordinate = projection.fromPointToLatLng(
              new google.maps.Point(
                pixel.x * scale,
                pixel.y * scale
              )
            );
            if (worldCoordinate) {
              const markerPoint = projection.fromLatLngToPoint(worldCoordinate);
              if (markerPoint) {
                const pixelPoint = new google.maps.Point(
                  markerPoint.x / scale,
                  markerPoint.y / scale
                );
                
                const bounds = mapInstance.current!.getBounds();
                if (bounds) {
                  const ne = bounds.getNorthEast();
                  const sw = bounds.getSouthWest();
                  const scaleX = mapDiv.offsetWidth / (ne.lng() - sw.lng());
                  const scaleY = mapDiv.offsetHeight / (ne.lat() - sw.lat());
                  
                  const x = (pixelPoint.x - sw.lng()) * scaleX;
                  const y = (ne.lat() - pixelPoint.y) * scaleY;
                  
                  setPopoverProperty(property);
                  setPopoverPosition({ x, y });
                }
              }
            }
          }
        }
      });

      // Add hover effects
      marker.addListener('mouseover', (event: google.maps.MapMouseEvent) => {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        });
        
        // Clear any existing timeout
        if (hoverTimeout.current) {
          clearTimeout(hoverTimeout.current);
        }
        
        // Show hover tooltip with small delay
        hoverTimeout.current = setTimeout(() => {
          // Simple positioning - use mouse position relative to map container
          const mapDiv = mapRef.current;
          if (mapDiv) {
            const rect = mapDiv.getBoundingClientRect();
            const x = rect.width / 2; // Center horizontally
            const y = rect.height / 2 - 20; // Center vertically, slightly above
            
            console.log('Setting hover property:', property);
            setHoverProperty(property);
            setHoverPosition({ x, y });
          }
        }, 250); // No delay for testing
      });

      marker.addListener('mouseout', () => {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        });
        
        // Clear timeout and hide hover tooltip
        if (hoverTimeout.current) {
          clearTimeout(hoverTimeout.current);
          hoverTimeout.current = null;
        }
        setHoverProperty(null);
        setHoverPosition(null);
      });

      markers.current.push(marker);
    }
  }, [properties, onPropertySelect]);

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
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border-2 border-accent-500 p-4 w-72 pointer-events-auto">
            <div className="flex gap-3">
              {/* Property Image */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src={hoverProperty.beforeImage}
                  alt={hoverProperty.address}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
                  }}
                />
              </div>
              
              {/* Property Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                  {hoverProperty.address}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  {hoverProperty.city}, {hoverProperty.state} {hoverProperty.zipCode}
                </p>
                
                {/* Score */}
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: getScoreColor(hoverProperty.communityValueScore) }}
                  >
                    {hoverProperty.communityValueScore}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900">Community Value</p>
                    <p className="text-xs text-gray-600">Score</p>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    {hoverProperty.propertyType.charAt(0).toUpperCase() + hoverProperty.propertyType.slice(1)} • 
                    {Math.round(hoverProperty.size.squareFeet / 1000)}k sq ft
                  </p>
                </div>
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

export const GoogleMap: React.FC<GoogleMapProps> = (props) => {
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
