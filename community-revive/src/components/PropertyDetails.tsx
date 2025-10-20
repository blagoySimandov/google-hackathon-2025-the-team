import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePropertyById, useGetValidityData } from '../api';
import { PhotoCarousel } from './PhotoCarousel';
import { ArrowLeft, List, Map as MapIcon, TrendingUp, DollarSign, Home, Star, Info } from 'lucide-react';
import { AmenitiesMap } from './AmenitiesMap';
import { AirQuality } from './AirQuality';
import { SchoolsSection } from './SchoolsSection';
import { TransportSection } from './TransportSection';
import type { ValidityData } from '../api/firestore/types';

// ValidityDataSection Component
interface ValidityDataSectionProps {
  validityData: ValidityData | null;
  loading: boolean;
  error: Error | null;
}

const ValidityDataSection: React.FC<ValidityDataSectionProps> = ({ validityData, loading, error }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Close tooltip when clicking anywhere
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeTooltip) {
        setActiveTooltip(null);
      }
    };

    if (activeTooltip) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeTooltip]);
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading validity analysis...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Validity Analysis Unavailable</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!validityData) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Validity Data</h3>
          <p className="text-gray-600">Validity analysis is not available for this property.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const scoreExplanations = {
    price_attractiveness: "Measures how attractive the property price is compared to market average. Higher scores indicate better value for money.",
    amenity_score: "Evaluates proximity and quality of nearby amenities like schools, transport, shops, and services. Higher scores mean better accessibility.",
    sustainability_score: "Assesses environmental factors including air quality, energy efficiency, and green spaces. Higher scores indicate better sustainability.",
    community_score: "Measures community engagement potential, walkability, and neighborhood characteristics. Higher scores suggest better community integration.",
    viability_score: "Overall investment viability based on market conditions, property condition, and investment potential. Higher scores indicate better investment opportunities.",
    validity_score: "Combined score calculated from Price Attractiveness (40%), Amenity Score (20%), Renovation cost (30%), and Air Quality (20%). This weighted average provides a comprehensive validity assessment."
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Investment Validity Analysis</h2>
      </div>

      {/* Overall Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600 mb-2">{validityData.rank}</div>
          <div className="text-sm text-gray-600">Overall Rank</div>
        </div> */}
        <div className="text-center p-4 bg-gray-50 rounded-lg relative">
          <div className="text-3xl font-bold text-green-600 mb-2">{validityData.scores.viability_score}</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">Viability Score</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'viability_score' ? null : 'viability_score');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
              <Info className="w-4 h-4" />
            </button>
          </div>
          {activeTooltip === 'viability_score' && (
            <div className="absolute top-16 left-0 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
              {scoreExplanations.viability_score}
            </div>
          )}
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg relative">
          <div className="text-3xl font-bold text-purple-600 mb-2">{validityData.scores.validity_score}</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">Validity Score</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTooltip(activeTooltip === 'validity_score' ? null : 'validity_score');
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          {activeTooltip === 'validity_score' && (
            <div className="absolute top-16 left-0 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
              {scoreExplanations.validity_score}
            </div>
          )}
        </div>
      </div>

      {/* Price Analysis */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Price Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Listed Price</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(validityData.listed_price)}</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Market Average</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(validityData.market_average_price)}</div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Price Difference:</strong> {formatCurrency(validityData.listed_price - validityData.market_average_price)} 
            ({((validityData.listed_price - validityData.market_average_price) / validityData.market_average_price * 100).toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2" />
          Detailed Scores
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg relative">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Price Attractiveness</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'price_attractiveness' ? null : 'price_attractiveness');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(validityData.scores.price_attractiveness_score)}`}>
                {validityData.scores.price_attractiveness_score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${validityData.scores.price_attractiveness_score}%` }}
              ></div>
            </div>
            {activeTooltip === 'price_attractiveness' && (
              <div className="absolute top-12 left-0 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
                {scoreExplanations.price_attractiveness}
              </div>
            )}
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg relative">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Amenity Score</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'amenity_score' ? null : 'amenity_score');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(validityData.scores.amenity_score)}`}>
                {validityData.scores.amenity_score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${validityData.scores.amenity_score}%` }}
              ></div>
            </div>
            {activeTooltip === 'amenity_score' && (
              <div className="absolute top-12 left-0 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
                {scoreExplanations.amenity_score}
              </div>
            )}
          </div>

          <div className="p-4 border border-gray-200 rounded-lg relative">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sustainability Score</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'sustainability_score' ? null : 'sustainability_score');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(validityData.scores.sustainability_score)}`}>
                {validityData.scores.sustainability_score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${validityData.scores.sustainability_score}%` }}
              ></div>
            </div>
            {activeTooltip === 'sustainability_score' && (
              <div className="absolute top-12 left-0 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
                {scoreExplanations.sustainability_score}
              </div>
            )}
          </div>

          <div className="p-4 border border-gray-200 rounded-lg relative">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Community Score</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === 'community_score' ? null : 'community_score');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(validityData.scores.community_score)}`}>
                {validityData.scores.community_score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full" 
                style={{ width: `${validityData.scores.community_score}%` }}
              ></div>
            </div>
            {activeTooltip === 'community_score' && (
              <div className="absolute top-12 left-0 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
                {scoreExplanations.community_score}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Renovation Analysis */}
      {validityData.renovation_details && validityData.total_renovation_cost > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home className="w-5 h-5 mr-2" />
            Renovation Analysis
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Estimated Renovation Cost</div>
            <div className="text-2xl font-bold text-gray-900 mb-4">{formatCurrency(validityData.total_renovation_cost)}</div>
            <div className="text-sm text-gray-600">
              <strong>Total Investment:</strong> {formatCurrency(validityData.listed_price + validityData.total_renovation_cost)}
            </div>
          </div>
        </div>
      )}

      {/* Air Quality */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Air Quality</h3>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Air Quality Index</div>
              <div className="text-lg font-semibold text-gray-900">{validityData.air_quality_index}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Category</div>
              <div className="text-lg font-semibold text-gray-900">{validityData.air_quality_category}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validityData.area_m2 && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600">Area</div>
              <div className="text-lg font-semibold text-gray-900">{validityData.area_m2} m²</div>
            </div>
          )}
          {validityData.ber && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600">BER Rating</div>
              <div className="text-lg font-semibold text-gray-900">{validityData.ber}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'map'>('list');

  const { property, loading, error } = usePropertyById(id || '');
  const { validityData, loading: validityLoading, error: validityError } = useGetValidityData(id || '');

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

            {/* Validity Data Section */}
            <ValidityDataSection 
              validityData={validityData}
              loading={validityLoading}
              error={validityError}
            />

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
