import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePropertyById } from '../api';
import { PhotoCarousel } from './PhotoCarousel';
import { ArrowLeft, List, Map as MapIcon } from 'lucide-react';
import { AmenitiesMap } from './AmenitiesMap';
import { AirQuality } from './AirQuality';
import { SchoolsSection } from './SchoolsSection';
import { TransportSection } from './TransportSection';

export const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'map'>('list');

  const { property, loading, error } = usePropertyById(id || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || (!loading && !property)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error?.message || 'Property not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  const carouselImages = property.media.images.map((image) => ({
    src: image.size1440x960,
    alt: property.title,
    width: 1440,
    height: 960
  }));

  // Extract property location from coordinates
  const propertyLocation = property.location.coordinates.length === 2
    ? { lat: property.location.coordinates[1], lng: property.location.coordinates[0] }
    : undefined;

  // Get amenities data
  const { primarySchools, secondarySchools, publicTransports } = property.amenities;
  const hasAmenities = primarySchools.length > 0 || secondarySchools.length > 0 || publicTransports.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title Section */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {property.title}
          </h1>
          
          {/* Address Information */}
          <div className="flex flex-wrap items-center gap-2 text-gray-600">
            {property.location.areaName && (
              <span className="text-lg">{property.location.areaName}</span>
            )}
            {property.location.eircodes && property.location.eircodes.length > 0 && (
              <>
                {property.location.areaName && <span>•</span>}
                <span className="text-lg">{property.location.eircodes[0]}</span>
              </>
            )}
          </div>
        </div>

        {/* Photo Carousel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <PhotoCarousel images={carouselImages} />
        </div>

        {/* Amenities Section */}
        {hasAmenities && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nearby Amenities
              </h2>
              
              {/* View Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-5 h-5" />
                  List View
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    view === 'map'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <MapIcon className="w-5 h-5" />
                  Map View
                </button>
              </div>
            </div>

            {view === 'list' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(primarySchools.length > 0 || secondarySchools.length > 0) && (
                  <div>
                    <SchoolsSection
                      primarySchools={primarySchools}
                      secondarySchools={secondarySchools}
                    />
                  </div>
                )}

                {publicTransports.length > 0 && (
                  <div>
                    <TransportSection publicTransports={publicTransports} />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities Map View</h3>
                <div className="h-[600px]">
                  <AmenitiesMap
                    primarySchools={primarySchools}
                    secondarySchools={secondarySchools}
                    publicTransports={publicTransports}
                    propertyLocation={propertyLocation}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                    <span>Property</span>
                  </div>
                  {primarySchools.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span>Primary Schools</span>
                    </div>
                  )}
                  {secondarySchools.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                      <span>Secondary Schools</span>
                    </div>
                  )}
                  {publicTransports.some(t => t.type === 'Bus') && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-600"></div>
                      <span>Bus</span>
                    </div>
                  )}
                  {publicTransports.some(t => t.type === 'Rail') && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-600"></div>
                      <span>Rail</span>
                    </div>
                  )}
                  {publicTransports.some(t => t.type === 'Tram') && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
                      <span>Tram</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Summary Section */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Amenities Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                {(primarySchools.length > 0 || secondarySchools.length > 0) && (
                  <div>
                    <p className="font-medium">Schools Nearby</p>
                    {primarySchools.length > 0 && (
                      <p className="text-blue-600">
                        {primarySchools.length} Primary School{primarySchools.length === 1 ? '' : 's'}
                      </p>
                    )}
                    {secondarySchools.length > 0 && (
                      <p className="text-blue-600">
                        {secondarySchools.length} Secondary School{secondarySchools.length === 1 ? '' : 's'}
                      </p>
                    )}
                  </div>
                )}
                {publicTransports.length > 0 && (
                  <div>
                    <p className="font-medium">Public Transport: {publicTransports.length}</p>
                    <p className="text-blue-600">
                      {publicTransports.filter(t => t.type === 'Bus').length} Bus •{' '}
                      {publicTransports.filter(t => t.type === 'Rail').length} Rail •{' '}
                      {publicTransports.filter(t => t.type === 'Tram').length} Tram
                    </p>
                  </div>
                )}
                {propertyLocation && (
                  <div>
                    <p className="font-medium">Property Location</p>
                    <p className="text-blue-600 text-xs">
                      {propertyLocation.lat.toFixed(4)}, {propertyLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
