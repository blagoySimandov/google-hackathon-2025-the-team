import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePropertyById, useGetValidityData } from "../api";
import { PhotoCarousel } from "./PhotoCarousel";
import {
  ArrowLeft,
  List,
  Map as MapIcon,
  TrendingUp,
  DollarSign,
  Home,
  Star,
  Info,
  ChevronDown,

} from "lucide-react";
import { AmenitiesMap } from "./AmenitiesMap";
import { AirQuality } from "./AirQuality";
import { SchoolsSection } from "./SchoolsSection";
import { TransportSection } from "./TransportSection";
import type { ValidityData } from "../api/firestore/types";
import { RenovationDetailsSection } from "./RenovationDetailsSection";


// ValidityDataSection Component
interface ValidityDataSectionProps {
  validityData: ValidityData | null;
  loading: boolean;
  error: Error | null;
}

const ValidityDataSection: React.FC<ValidityDataSectionProps> = ({
  validityData,
  loading,
  error,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => {
      if (activeTooltip) {
        setActiveTooltip(null);
      }
    };
    if (activeTooltip) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeTooltip]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">
            Loading validity analysis...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Validity Analysis Unavailable
          </h3>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Validity Data
          </h3>
          <p className="text-gray-600">
            Validity analysis is not available for this property.
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    if (score >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const scoreExplanations = {
    validity_score:
      "A weighted score based on Price, Amenities, Renovation Cost, and Air Quality, indicating the overall soundness of the property itself.",
    community_score:
      "Measures community engagement potential, walkability, and neighborhood characteristics. Higher scores suggest better community integration.",
    investment_return:
      "The potential Return on Investment (ROI) as a percentage, calculated from the total project cost versus the estimated after-repair value.",
    price_attractiveness:
      "Measures how attractive the property price is compared to market average. Higher scores indicate better value for money.",
    amenity_score:
      "Evaluates proximity and quality of nearby amenities like schools, transport, shops, and services. Higher scores mean better accessibility.",
    sustainability_score:
      "Assesses environmental factors including air quality, energy efficiency, and green spaces. Higher scores indicate better sustainability.",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">
          Investment Validity Analysis
        </h2>
      </div>

      {/* Overall Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-4 bg-gray-50 rounded-lg relative">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {validityData.scores.validity_score}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">Validity Score</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTooltip(
                  activeTooltip === "validity_score" ? null : "validity_score"
                );
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          {activeTooltip === "validity_score" && (
            <div className="absolute top-16 left-0 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
              {scoreExplanations.validity_score}
            </div>
          )}
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg relative">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {validityData.scores.community_score}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">Community Score</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTooltip(
                  activeTooltip === "community_score" ? null : "community_score"
                );
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          {activeTooltip === "community_score" && (
            <div className="absolute top-16 left-0 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
              {scoreExplanations.community_score}
            </div>
          )}
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg relative">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {validityData.investment_analysis
              ? `${validityData.investment_analysis.return_on_investment_percent.toFixed(
                  1
                )}%`
              : "N/A"}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">Investment Return</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTooltip(
                  activeTooltip === "investment_return"
                    ? null
                    : "investment_return"
                );
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          {activeTooltip === "investment_return" && (
            <div className="absolute top-16 left-0 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
              {scoreExplanations.investment_return}
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
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(validityData.listed_price)}
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Market Average</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(validityData.market_average_price)}
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Price Difference:</strong>{" "}
            {formatCurrency(
              validityData.listed_price - validityData.market_average_price
            )}
            (
            {(
              ((validityData.listed_price - validityData.market_average_price) /
                validityData.market_average_price) *
              100
            ).toFixed(1)}
            %)
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
                <span className="text-sm text-gray-600">
                  Price Attractiveness
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(
                      activeTooltip === "price_attractiveness"
                        ? null
                        : "price_attractiveness"
                    );
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(
                  validityData.scores.price_attractiveness_score
                )}`}
              >
                {validityData.scores.price_attractiveness_score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${validityData.scores.price_attractiveness_score}%`,
                }}
              ></div>
            </div>
            {activeTooltip === "price_attractiveness" && (
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
                    setActiveTooltip(
                      activeTooltip === "amenity_score" ? null : "amenity_score"
                    );
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(
                  validityData.scores.amenity_score
                )}`}
              >
                {validityData.scores.amenity_score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${validityData.scores.amenity_score}%` }}
              ></div>
            </div>
            {activeTooltip === "amenity_score" && (
              <div className="absolute top-12 left-0 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
                {scoreExplanations.amenity_score}
              </div>
            )}
          </div>

          <div className="p-4 border border-gray-200 rounded-lg relative">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Sustainability Score
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(
                      activeTooltip === "sustainability_score"
                        ? null
                        : "sustainability_score"
                    );
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(
                  validityData.scores.sustainability_score
                )}`}
              >
                {validityData.scores.sustainability_score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{
                  width: `${validityData.scores.sustainability_score}%`,
                }}
              ></div>
            </div>
            {activeTooltip === "sustainability_score" && (
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
                    setActiveTooltip(
                      activeTooltip === "community_score"
                        ? null
                        : "community_score"
                    );
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(
                  validityData.scores.community_score
                )}`}
              >
                {validityData.scores.community_score}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${validityData.scores.community_score}%` }}
              ></div>
            </div>
            {activeTooltip === "community_score" && (
              <div className="absolute top-12 left-0 right-0 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-lg z-10">
                {scoreExplanations.community_score}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Renovation Analysis */}
      {validityData.renovation_details &&
        validityData.total_renovation_cost > 0 && (
          <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Renovation Analysis
              </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTooltip(activeTooltip === 'renovation_details' ? null : 'renovation_details');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <span>{activeTooltip === 'renovation_details' ? 'Hide Details' : 'Show Details'}</span>
              <div className={`transform transition-transform ${activeTooltip === 'renovation_details' ? 'rotate-180' : ''}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
          </div>
          
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">
                Estimated Renovation Cost
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-4">
                {formatCurrency(validityData.total_renovation_cost)}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Total Investment:</strong>{" "}
                {formatCurrency(
                  validityData.listed_price + validityData.total_renovation_cost
                )}
              </div>
            </div>

          {/* Expandable Details */}
          {activeTooltip === 'renovation_details' && (
            <div className="mt-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Home className="w-5 h-5 mr-2 text-blue-600" />
                Renovation Items Breakdown
              </h4>
              <div className="space-y-4">
                {validityData.renovation_details.items.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-semibold text-gray-900 text-base">{item.item}</h5>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(item.price)}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div>
                        <span className="font-medium text-gray-700">Reason:</span>
                        <p className="mt-1">{item.reason}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Material:</span>
                        <p className="mt-1">{item.material}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Amount:</span>
                        <p className="mt-1">{item.amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-900">Total Renovation Cost:</span>
                  <span className="text-2xl font-bold text-blue-900">{formatCurrency(validityData.renovation_details.total_cost)}</span>
                </div>
              </div>
            </div>
          )}
          </div>
        )}

      {/* Air Quality */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Air Quality
        </h3>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Air Quality Index</div>
              <div className="text-lg font-semibold text-gray-900">
                {validityData.air_quality_index}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Category</div>
              <div className="text-lg font-semibold text-gray-900">
                {validityData.air_quality_category}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Property Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validityData.area_m2 && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600">Area</div>
              <div className="text-lg font-semibold text-gray-900">
                {validityData.area_m2} m²
              </div>
            </div>
          )}
          {validityData.ber && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600">BER Rating</div>
              <div className="text-lg font-semibold text-gray-900">
                {validityData.ber}
              </div>
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
  const [view, setView] = useState<"list" | "map">("list");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { property, loading, error } = usePropertyById(id || "");
  const {
    validityData,
    loading: validityLoading,
    error: validityError,
  } = useGetValidityData(id || "");

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAnalysis(true);
    }, 2000);
  };

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
          <p className="text-gray-600 mb-6">
            {error?.message || "Property not found"}
          </p>
          <button
            onClick={() => navigate("/")}
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
    height: 960,
  }));

  // Extract property location from coordinates
  const propertyLocation =
    property.location.coordinates.length === 2
      ? {
          lat: property.location.coordinates[1],
          lng: property.location.coordinates[0],
        }
      : undefined;

  const { primarySchools, secondarySchools, publicTransports } =
    property.amenities;
  const hasAmenities =
    primarySchools.length > 0 ||
    secondarySchools.length > 0 ||
    publicTransports.length > 0;

  // Create new sorted and sliced arrays for display. We sort by the closest distance.
  const topPrimarySchools = [...primarySchools]
    .sort((a, b) => a.distance.value - b.distance.value)
    .slice(0, 5);

  const topSecondarySchools = [...secondarySchools]
    .sort((a, b) => a.distance.value - b.distance.value)
    .slice(0, 5);

  const topPublicTransports = [...publicTransports]
    .sort((a, b) => a.distance.value - b.distance.value)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/")}
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {property.title}
          </h1>

          {/* Property Price */}
          {property.price && (
            <p className="text-3xl font-bold text-blue-600">
              {property.price.formatted}
            </p>
          )}

          {/* Address Information */}
          <div className="flex flex-wrap items-center gap-2 text-gray-600">
            {property.location.areaName && (
              <span className="text-lg">{property.location.areaName}</span>
            )}
            {property.location.eircodes &&
              property.location.eircodes.length > 0 && (
                <>
                  {property.location.areaName && <span>•</span>}
                  <span className="text-lg">
                    {property.location.eircodes[0]}
                  </span>
                </>
              )}
          </div>
        </div>
              
        {/* Photo Carousel */}
        <div className="bg-white rounded-lg shadow-sm pb-6">
          <PhotoCarousel images={carouselImages} />
        </div>

        {!showAnalysis && !isAnalyzing && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <TrendingUp className="w-16 h-16 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Property Analysis
              </h2>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Get comprehensive insights about this property's investment potential, including price analysis, amenity scores, renovation estimates, and nearby amenities.
              </p>
              <button
                onClick={handleStartAnalysis}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md hover:shadow-lg"
              >
                Start Analysis
              </button>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Analyzing Property Data
              </h3>
              <p className="text-gray-600 text-center">
                Calculating investment metrics, validity scores, and nearby amenities...
              </p>
            </div>
          </div>
        )}

        {showAnalysis && (
          <>
            <div>
              <ValidityDataSection
                validityData={validityData}
                loading={validityLoading}
                error={validityError}
              />
            </div>


           {validityData?.renovation_details && (
              <div>
                <RenovationDetailsSection renovationDetails={validityData.renovation_details} />
              </div>
            )}

            {/* Amenities Section */}
            {hasAmenities && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nearby Amenities (Showing up to 5 closest)
              </h2>

              {/* View Toggle */}
              <div className="flex gap-2">{/* ... toggle buttons ... */}</div>
            </div>

            {view === "list" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(topPrimarySchools.length > 0 ||
                  topSecondarySchools.length > 0) && (
                  <div>
                    {/* MODIFICATION: Pass limited data */}
                    <SchoolsSection
                      primarySchools={topPrimarySchools}
                      secondarySchools={topSecondarySchools}
                    />
                  </div>
                )}

                {topPublicTransports.length > 0 && (
                  <div>
                    {/* MODIFICATION: Pass limited data */}
                    <TransportSection publicTransports={topPublicTransports} />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Amenities Map View
                </h3>
                <div className="h-[600px]">
                  {/* MODIFICATION: Pass limited data */}
                  <AmenitiesMap
                    primarySchools={topPrimarySchools}
                    secondarySchools={topSecondarySchools}
                    publicTransports={topPublicTransports}
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
                  {publicTransports.some((t) => t.type === "Bus") && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-600"></div>
                      <span>Bus</span>
                    </div>
                  )}
                  {publicTransports.some((t) => t.type === "Rail") && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-600"></div>
                      <span>Rail</span>
                    </div>
                  )}
                  {publicTransports.some((t) => t.type === "Tram") && (
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
              <h3 className="font-semibold text-blue-900 mb-2">
                Amenities Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                {(primarySchools.length > 0 || secondarySchools.length > 0) && (
                  <div>
                    <p className="font-medium">Schools Nearby</p>
                    {primarySchools.length > 0 && (
                      <p className="text-blue-600">
                        {primarySchools.length} Primary School
                        {primarySchools.length === 1 ? "" : "s"}
                      </p>
                    )}
                    {secondarySchools.length > 0 && (
                      <p className="text-blue-600">
                        {secondarySchools.length} Secondary School
                        {secondarySchools.length === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>
                )}
                {publicTransports.length > 0 && (
                  <div>
                    <p className="font-medium">
                      Public Transport: {publicTransports.length}
                    </p>
                    <p className="text-blue-600">
                      {publicTransports.filter((t) => t.type === "Bus").length}{" "}
                      Bus •{" "}
                      {publicTransports.filter((t) => t.type === "Rail").length}{" "}
                      Rail •{" "}
                      {publicTransports.filter((t) => t.type === "Tram").length}{" "}
                      Tram
                    </p>
                  </div>
                )}
                {propertyLocation && (
                  <div>
                    <p className="font-medium">Property Location</p>
                    <p className="text-blue-600 text-xs">
                      {propertyLocation.lat.toFixed(4)},{" "}
                      {propertyLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>

    </div>
  );
};
