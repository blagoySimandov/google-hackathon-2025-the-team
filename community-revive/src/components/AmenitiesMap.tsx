import React, { useRef, useEffect, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { School, PublicTransport } from '../api/firestore/types';

interface AmenitiesMapProps {
  primarySchools: School[];
  secondarySchools: School[];
  publicTransports: PublicTransport[];
  propertyLocation?: { lat: number; lng: number };
  className?: string;
}

interface MapComponentProps extends AmenitiesMapProps {}

const MapComponent: React.FC<MapComponentProps> = ({
  primarySchools,
  secondarySchools,
  publicTransports,
  propertyLocation,
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const [infoWindow] = useState(() => new google.maps.InfoWindow());

  useEffect(() => {
    if (!mapRef.current) return;

    const allAmenities = [
      ...primarySchools.map(s => ({ lat: parseFloat(s.location.lat), lng: parseFloat(s.location.lon) })),
      ...secondarySchools.map(s => ({ lat: parseFloat(s.location.lat), lng: parseFloat(s.location.lon) })),
      ...publicTransports.map(t => ({ lat: parseFloat(t.location.lat), lng: parseFloat(t.location.lon) })),
    ];

    const centerLocation = propertyLocation || (allAmenities.length > 0
      ? {
          lat: allAmenities.reduce((sum, a) => sum + a.lat, 0) / allAmenities.length,
          lng: allAmenities.reduce((sum, a) => sum + a.lng, 0) / allAmenities.length,
        }
      : { lat: 53.3498, lng: -6.2603 });

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: centerLocation,
      zoom: propertyLocation ? 13 : 12,
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
      ],
    });

    if (propertyLocation) {
      new google.maps.Marker({
        position: propertyLocation,
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: 'Property Location',
      });
    }

    return () => {
      markers.current.forEach(marker => marker.setMap(null));
      markers.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    primarySchools.forEach((school) => {
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(school.location.lat), lng: parseFloat(school.location.lon) },
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: school.schoolName,
      });

      marker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px; color: #1f2937;">${school.schoolName}</h3>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Primary School</p>
            <p style="font-size: 12px; color: #6b7280;">Pupils: ${school.numPupils.toLocaleString()}</p>
            <p style="font-size: 12px; color: #6b7280;">${school.distance.value.toFixed(2)} ${school.distance.unit} away</p>
          </div>
        `);
        infoWindow.open(mapInstance.current, marker);
      });

      markers.current.push(marker);
    });

    secondarySchools.forEach((school) => {
      const marker = new google.maps.Marker({
        position: { lat: parseFloat(school.location.lat), lng: parseFloat(school.location.lon) },
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#9333ea',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: school.schoolName,
      });

      marker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px; color: #1f2937;">${school.schoolName}</h3>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Secondary School</p>
            <p style="font-size: 12px; color: #6b7280;">Pupils: ${school.numPupils.toLocaleString()}</p>
            <p style="font-size: 12px; color: #6b7280;">${school.distance.value.toFixed(2)} ${school.distance.unit} away</p>
          </div>
        `);
        infoWindow.open(mapInstance.current, marker);
      });

      markers.current.push(marker);
    });

    publicTransports.forEach((transport) => {
      let fillColor = '#22c55e';
      if (transport.type === 'Rail') fillColor = '#f97316';
      if (transport.type === 'Tram') fillColor = '#6366f1';

      const marker = new google.maps.Marker({
        position: { lat: parseFloat(transport.location.lat), lng: parseFloat(transport.location.lon) },
        map: mapInstance.current,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 5,
          fillColor: fillColor,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 0,
        },
        title: transport.stop,
      });

      marker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px; color: #1f2937;">${transport.stop}</h3>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${transport.type} - Route ${transport.route}</p>
            <p style="font-size: 12px; color: #6b7280;">To: ${transport.destination}</p>
            <p style="font-size: 12px; color: #6b7280;">Provider: ${transport.provider}</p>
            <p style="font-size: 12px; color: #6b7280;">${transport.distance.value.toFixed(2)} ${transport.distance.unit} away</p>
          </div>
        `);
        infoWindow.open(mapInstance.current, marker);
      });

      markers.current.push(marker);
    });
  }, [primarySchools, secondarySchools, publicTransports, infoWindow]);

  return <div ref={mapRef} className={`w-full h-full rounded-lg ${className}`} />;
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

export const AmenitiesMap: React.FC<AmenitiesMapProps> = (props) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <p className="text-red-600 mb-2">Google Maps API key not found</p>
          <p className="text-gray-600 text-sm">Please add REACT_APP_GOOGLE_MAPS_API_KEY to your environment variables</p>
        </div>
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} libraries={['marker']} render={render}>
      <MapComponent {...props} />
    </Wrapper>
  );
};
