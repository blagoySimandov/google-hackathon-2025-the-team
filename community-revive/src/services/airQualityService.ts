// Removed unused Property import

export interface AirQualityData {
  score: number;
  aqi: number;
  category: string;
  lastUpdated: string;
  pollutants: {
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
    co?: number;
  };
}

export interface AirQualityError {
  error: string;
  message: string;
}

/**
 * Fetches air quality data from Google Air Quality API
 * @param latitude - Property latitude
 * @param longitude - Property longitude
 * @returns Promise<AirQualityData | AirQualityError>
 */
export const fetchAirQuality = async (
  latitude: number,
  longitude: number
): Promise<AirQualityData | AirQualityError> => {
  const apiKey = process.env.REACT_APP_GOOGLE_AIR_QUALITY_API_KEY;
  
  if (!apiKey) {
    return {
      error: 'API_KEY_MISSING',
      message: 'Google Air Quality API key is not configured'
    };
  }

  try {
    const url = 'https://airquality.googleapis.com/v1/currentConditions:lookup';
    const payload = {
      location: {
        latitude: latitude,
        longitude: longitude
      }
    };

    const response = await fetch(`${url}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract AQI data
    const uaqi = data.indexes?.find((idx: any) => idx.code === 'uaqi');
    const aqi = uaqi?.aqi || 0;
    const category = uaqi?.category || 'Unknown';
    
    // Calculate score (0-100, higher is better)
    const maxAqi = 500;
    const score = Math.max(0, Math.min(100, (1 - aqi / maxAqi) * 100));
    
    // Extract pollutant data
    const pollutants: any = {};
    if (data.pollutants) {
      data.pollutants.forEach((pollutant: any) => {
        const code = pollutant.code?.toLowerCase();
        const concentration = pollutant.concentration?.value;
        if (code && concentration !== undefined) {
          pollutants[code] = concentration;
        }
      });
    }

    return {
      score: Math.round(score),
      aqi: aqi,
      category: category,
      lastUpdated: new Date().toISOString(),
      pollutants: pollutants
    };

  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return {
      error: 'API_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Gets air quality category color based on AQI
 * @param aqi - Air Quality Index value
 * @returns CSS color class
 */
export const getAirQualityColor = (aqi: number): string => {
  if (aqi <= 50) return 'text-green-600 bg-green-50';
  if (aqi <= 100) return 'text-yellow-600 bg-yellow-50';
  if (aqi <= 150) return 'text-orange-600 bg-orange-50';
  if (aqi <= 200) return 'text-red-600 bg-red-50';
  if (aqi <= 300) return 'text-purple-600 bg-purple-50';
  return 'text-red-800 bg-red-100';
};

/**
 * Gets air quality category description
 * @param aqi - Air Quality Index value
 * @returns Human-readable description
 */
export const getAirQualityDescription = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

/**
 * Gets air quality health recommendations
 * @param aqi - Air Quality Index value
 * @returns Array of health recommendations
 */
export const getAirQualityRecommendations = (aqi: number): string[] => {
  if (aqi <= 50) {
    return ['Air quality is satisfactory', 'No health concerns for most people'];
  }
  if (aqi <= 100) {
    return ['Sensitive individuals may experience minor breathing discomfort', 'Consider limiting outdoor activities if you have respiratory issues'];
  }
  if (aqi <= 150) {
    return ['Sensitive groups should avoid prolonged outdoor exertion', 'Children and elderly should limit outdoor activities'];
  }
  if (aqi <= 200) {
    return ['Everyone should avoid prolonged outdoor exertion', 'Sensitive groups should avoid all outdoor activities'];
  }
  if (aqi <= 300) {
    return ['Everyone should avoid outdoor activities', 'Stay indoors with windows closed', 'Use air purifiers if available'];
  }
  return [
    'Avoid all outdoor activities',
    'Stay indoors with windows and doors closed',
    'Use air purifiers and consider wearing N95 masks indoors',
    'Consider evacuating if possible'
  ];
};
