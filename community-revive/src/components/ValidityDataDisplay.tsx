import React, { useState } from 'react';
import { useGetValidityData } from '../api';
import { ValidityData } from '../api/firestore/types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { getScoreColor } from '../utils/scoreUtils';
import {
  MapPin,
  Euro,
  TrendingUp,
  TrendingDown,
  Home,
  Ruler,
  Zap,
  Wind,
  Construction,
  Award,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building,
  Trees,
  Store,
  School,
  Hospital,
  ShoppingCart,
  Dumbbell,
  Image as ImageIcon,
} from 'lucide-react';

interface ValidityDataDisplayProps {
  propertyId: string;
}

export const ValidityDataDisplay: React.FC<ValidityDataDisplayProps> = ({ propertyId }) => {
  const { validityData, loading, error } = useGetValidityData(propertyId);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading validity data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!validityData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No validity data found for this property</p>
        </div>
      </div>
    );
  }

  return <ValidityDataContent data={validityData} />;
};

interface ValidityDataContentProps {
  data: ValidityData;
}

const ValidityDataContent: React.FC<ValidityDataContentProps> = ({ data }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IE').format(num);
  };

  const priceComparison = data.market_average_price - data.listed_price;
  const priceComparisonPercent = ((priceComparison / data.market_average_price) * 100).toFixed(1);
  const isPriceGood = priceComparison > 0;

  const getAmenityIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('park') || lowerType.includes('garden')) return <Trees className="w-5 h-5" />;
    if (lowerType.includes('shop') || lowerType.includes('store') || lowerType.includes('supermarket')) return <ShoppingCart className="w-5 h-5" />;
    if (lowerType.includes('school')) return <School className="w-5 h-5" />;
    if (lowerType.includes('hospital') || lowerType.includes('clinic')) return <Hospital className="w-5 h-5" />;
    if (lowerType.includes('gym') || lowerType.includes('fitness')) return <Dumbbell className="w-5 h-5" />;
    return <Store className="w-5 h-5" />;
  };

  const getAirQualityColor = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('good')) return 'text-green-600 bg-green-50';
    if (lowerCategory.includes('moderate')) return 'text-yellow-600 bg-yellow-50';
    if (lowerCategory.includes('poor')) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  Rank #{data.rank}
                </div>
                <a
                  href={data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Original Listing
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.address}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Listed Price */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Listed Price</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.listed_price)}</p>
            </div>

            {/* Market Average */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Market Average</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.market_average_price)}</p>
            </div>

            {/* Price Comparison */}
            <div className={`${isPriceGood ? 'bg-green-50' : 'bg-red-50'} rounded-lg p-4`}>
              <div className="flex items-center gap-2 mb-2">
                {isPriceGood ? (
                  <TrendingDown className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${isPriceGood ? 'text-green-900' : 'text-red-900'}`}>
                  Price Difference
                </span>
              </div>
              <p className={`text-2xl font-bold ${isPriceGood ? 'text-green-900' : 'text-red-900'}`}>
                {isPriceGood ? '-' : '+'}{formatCurrency(Math.abs(priceComparison))}
              </p>
              <p className={`text-sm ${isPriceGood ? 'text-green-700' : 'text-red-700'}`}>
                {isPriceGood ? 'Below' : 'Above'} market by {Math.abs(Number(priceComparisonPercent))}%
              </p>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Home className="w-6 h-6" />
              Property Details
            </h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.area_m2 && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Floor Area</p>
                  <p className="text-lg font-semibold text-gray-900">{formatNumber(data.area_m2)} m²</p>
                </div>
              </div>
            )}
            {data.ber && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">BER Rating</p>
                  <p className="text-lg font-semibold text-gray-900">{data.ber}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getAirQualityColor(data.air_quality_category)}`}>
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Air Quality</p>
                <p className="text-lg font-semibold text-gray-900">{data.air_quality_category}</p>
                <p className="text-xs text-gray-500">Index: {data.air_quality_index.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Gallery */}
        {data.image_urls.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-6 h-6" />
                Property Images ({data.image_urls.length})
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={data.image_urls[selectedImageIndex]}
                    alt={`Property ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {data.image_urls.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-sm">
                      {selectedImageIndex + 1} / {data.image_urls.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Grid */}
                {data.image_urls.length > 1 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {data.image_urls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? 'border-blue-600 scale-105'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3C/svg%3E';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scores Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6" />
              Property Scores
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.scores).map(([key, value]) => {
                const scoreColor = getScoreColor(value);
                const formattedKey = key
                  .replace(/_/g, ' ')
                  .replace(/score/gi, '')
                  .trim()
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');

                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: scoreColor }}
                      ></div>
                      <p className="text-xs font-medium text-gray-600">{formattedKey}</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{value.toFixed(1)}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        {data.found_amenities.length > 0 && (
          <Card>
            <CardHeader>
              <button
                onClick={() => toggleSection('amenities')}
                className="w-full flex items-center justify-between"
              >
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Store className="w-6 h-6" />
                  Nearby Amenities ({data.found_amenities.length})
                </h2>
                {expandedSection === 'amenities' ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </CardHeader>
            {expandedSection === 'amenities' && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.found_amenities.map((amenity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        {getAmenityIcon(amenity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{amenity.name}</p>
                        <p className="text-sm text-gray-600">{amenity.type}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {amenity.distance_km.toFixed(2)} km away
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Investment Analysis */}
        <Card>
          <CardHeader>
            <button
              onClick={() => toggleSection('investment')}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Investment Analysis
              </h2>
              {expandedSection === 'investment' ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </CardHeader>
          {expandedSection === 'investment' && (
            <CardContent>
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700 mb-1">Total Project Cost</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(data.investment_analysis.total_project_cost)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700 mb-1">Net Project Cost</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(data.investment_analysis.net_project_cost)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      After {formatCurrency(data.investment_analysis.total_grant_amount)} in grants
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-700 mb-1">Estimated ARV</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatCurrency(data.investment_analysis.estimated_after_repair_value)}
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-sm text-amber-700 mb-1">Potential Profit</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {formatCurrency(data.investment_analysis.potential_profit)}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-indigo-700 mb-1">ROI</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {data.investment_analysis.return_on_investment_percent.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-1">Labour Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(data.investment_analysis.estimated_labour_cost)}
                    </p>
                  </div>
                </div>

                {/* Potential Grants */}
                {data.investment_analysis.potential_grants.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Potential Grants</h3>
                    <div className="space-y-2">
                      {data.investment_analysis.potential_grants.map((grant, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-green-900">{grant.name}</p>
                              <p className="text-lg font-bold text-green-900">{formatCurrency(grant.amount)}</p>
                            </div>
                            <p className="text-sm text-green-700">{grant.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Renovation Details */}
        <Card>
          <CardHeader>
            <button
              onClick={() => toggleSection('renovation')}
              className="w-full flex items-center justify-between"
            >
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Construction className="w-6 h-6" />
                Renovation Details ({data.renovation_details.items.length} items)
              </h2>
              {expandedSection === 'renovation' ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </CardHeader>
          {expandedSection === 'renovation' && (
            <CardContent>
              <div className="space-y-4">
                {/* Total Cost Banner */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-orange-900">Total Renovation Cost</span>
                    <span className="text-2xl font-bold text-orange-900">
                      {formatCurrency(data.renovation_details.total_cost)}
                    </span>
                  </div>
                </div>

                {/* Renovation Items */}
                <div className="space-y-3">
                  {data.renovation_details.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.item}</p>
                          <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(item.price)}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600 mt-2">
                        <div>
                          <span className="font-medium">Amount:</span> {item.amount}
                        </div>
                        <div>
                          <span className="font-medium">Material:</span> {item.material}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

