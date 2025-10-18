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
      marker.addListener('mouseover', () => {
        marker.setIcon({
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        });
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
      });

      markers.current.push(marker);
    }
  }, [properties, onPropertySelect]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
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
