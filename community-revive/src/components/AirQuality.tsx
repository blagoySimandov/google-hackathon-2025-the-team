import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/Card';
import { 
  Wind, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Activity
} from 'lucide-react';
import { Property } from '../types';
import { 
  fetchAirQuality, 
  getAirQualityColor, 
  getAirQualityDescription, 
  getAirQualityRecommendations,
  AirQualityData
} from '../services/airQualityService';

interface AirQualityProps {
  property: Property;
  className?: string;
}

export const AirQuality: React.FC<AirQualityProps> = ({ property, className = '' }) => {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadAirQuality = useCallback(async () => {
    if (!property.coordinates?.lat || !property.coordinates?.lng) {
      setError('Property coordinates not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchAirQuality(property.coordinates.lat, property.coordinates.lng);
      
      if ('error' in result) {
        setError(result.message);
      } else {
        setAirQualityData(result);
      }
    } catch (err) {
      setError('Failed to fetch air quality data');
    } finally {
      setLoading(false);
    }
  }, [property.coordinates?.lat, property.coordinates?.lng]);

  useEffect(() => {
    // Load air quality data if not already present
    if (!property.airQuality && !loading && !error) {
      loadAirQuality();
    } else if (property.airQuality) {
      setAirQualityData(property.airQuality);
    }
  }, [property.coordinates, property.airQuality, loadAirQuality, loading, error]);

  const handleRefresh = () => {
    loadAirQuality();
  };

  const getAirQualityIcon = (aqi: number) => {
    if (aqi <= 50) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (aqi <= 100) return <Activity className="w-5 h-5 text-yellow-600" />;
    if (aqi <= 150) return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getAirQualityStatus = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const data = airQualityData || property.airQuality;

  // Show loading state with skeleton content to prevent blinking
  if (loading && !data) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-sm text-gray-900">Air Quality</h3>
            </div>
            {/* <RefreshCw className="w-4 h-4 animate-spin text-gray-400" /> */}
          </div>

          {/* Loading skeleton */}
          <div className="space-y-3">
            {/* AQI Score skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                    <span className="text-xs text-gray-500">AQI</span>
                  </div>
                  <div className="w-20 h-3 bg-gray-200 rounded animate-pulse mt-1"></div>
                </div>
              </div>
              <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>

            {/* Health Score skeleton */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Health Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Last Updated skeleton */}
            <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-sm text-gray-900">Air Quality</h3>
            </div>
            <button
              onClick={handleRefresh}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Retry"
            >
              {/* <RefreshCw className="w-4 h-4 text-gray-500" /> */}
            </button>
          </div>

          {/* Error content */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Air Quality Unavailable</span>
            </div>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const colorClasses = getAirQualityColor(data.aqi);
  const description = getAirQualityDescription(data.aqi);
  const recommendations = getAirQualityRecommendations(data.aqi);

  return (
    <Card className={`${className} transition-all duration-200 hover:shadow-md`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Wind className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-sm text-gray-900">Air Quality</h3>
            {/* {loading && data && (
              <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
            )} */}
          </div>
          {/* <div className="flex items-center space-x-1">
            <button
              onClick={handleRefresh}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title={showDetails ? "Hide details" : "Show details"}
            >
              <Eye className="w-4 h-4 text-gray-500" />
            </button>
          </div> */}
        </div>

        {/* Main Air Quality Display */}
        <div className="space-y-3">
          {/* AQI Score and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getAirQualityIcon(data.aqi)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">{data.aqi}</span>
                  <span className="text-xs text-gray-500">AQI</span>
                </div>
                <p className="text-xs text-gray-600">{description}</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
              {getAirQualityStatus(data.aqi)}
            </div>
          </div>

          {/* Air Quality Score */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Health Score</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                  style={{ width: `${data.score}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900">{data.score}/100</span>
            </div>
          </div>

          {/* Last Updated */}
          <p className="text-xs text-gray-400">
            Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </p>

          {/* Detailed Information */}
          {showDetails && (
            <div className="pt-3 border-t border-gray-100 space-y-3">
              {/* Pollutant Levels */}
              {data.pollutants && Object.keys(data.pollutants).length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Pollutant Levels</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(data.pollutants).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-600 uppercase">{key}</span>
                        <span className="font-medium text-gray-900">{value?.toFixed(1)} μg/m³</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Health Recommendations */}
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-2">Health Recommendations</h4>
                <ul className="space-y-1">
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                      <Info className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
