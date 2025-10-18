# API Integration Guide

This document explains how to integrate the Community Revive application with real property data from the Daft.ie API.

## Overview

The application has been updated to work with the real API schema defined in `src/backend/scheme_of_api.ts`. The data transformation layer converts API data into the community-focused format used by the application.

## Key Components

### 1. API Schema (`src/backend/scheme_of_api.ts`)
- Contains TypeScript interfaces matching the Daft.ie API response structure
- Includes all property fields, enums, and utility functions for data conversion
- Generated from the actual API response structure

### 2. Data Transformation (`src/data/mockData.ts`)
- `transformApiPropertyToProperty()` function converts API data to our Property format
- Calculates community value scores based on property characteristics
- Generates community impact assessments and potential uses
- Maps API property types to our simplified categories

### 3. API Service (`src/services/apiService.ts`)
- Provides methods for fetching properties from the API
- Includes search functionality with filters
- Handles error cases and data transformation
- Ready for integration with actual API endpoints

### 4. Updated Components
- `PropertyCard.tsx` - Displays properties with real API data
- `PropertyDetails.tsx` - Shows detailed property information including BER ratings, features, etc.
- All components now work with the extended Property interface

## Integration Steps

### 1. Replace Mock Data
Update `src/data/mockData.ts` to use real API calls:

```typescript
// Replace the sampleApiProperties array with actual API calls
export const fetchProperties = async (): Promise<Property[]> => {
  const apiProperties = await apiService.fetchProperties();
  return apiProperties.map(transformApiPropertyToProperty);
};
```

### 2. Update API Service
Modify `src/services/apiService.ts` to use real API endpoints:

```typescript
async fetchProperties(params?: SearchParams): Promise<Property[]> {
  const response = await fetch(`${this.baseUrl}/properties`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });
  const data = await response.json();
  return data.map(transformApiPropertyToProperty);
}
```

### 3. Add Environment Variables
Create a `.env` file with API configuration:

```env
REACT_APP_API_BASE_URL=https://api.daft.ie/v1
REACT_APP_API_KEY=your_api_key_here
```

### 4. Update Components to Use Real Data
Replace mock data imports with API service calls:

```typescript
import { apiService } from '../services/apiService';

// In your component
const [properties, setProperties] = useState<Property[]>([]);

useEffect(() => {
  const loadProperties = async () => {
    const data = await apiService.fetchProperties();
    setProperties(data);
  };
  loadProperties();
}, []);
```

## Data Mapping

### Property Type Mapping
- API: `House`, `Detached`, `Semi-D`, `Terrace`, `End of Terrace`, `Bungalow` → Community: `residential`
- API: `Apartment`, `Townhouse` → Community: `residential`
- API: `Site` → Community: `vacant`
- API: `Property` → Community: `commercial`

### Community Value Score Calculation
The score is calculated based on:
- **Price Factor**: Lower prices get higher scores (affordable = better for community)
- **Property Type**: Houses and detached properties score higher
- **Bedrooms**: More bedrooms = higher community impact potential
- **BER Rating**: Better energy efficiency = higher score
- **Media**: More images = better maintained property

### Community Impact Assessment
- **Near School**: Detected from nearby locations containing "school" or "education"
- **Near Park**: Detected from nearby locations containing "park" or "garden"
- **Near Transit**: Detected from nearby locations containing "station", "bus", or "train"
- **Historic District**: Based on construction date or rural location sticker
- **High Youth Impact**: Properties with 3+ bedrooms
- **Potential Green Space**: Sites or large properties

## Features Added

### New Property Information Display
- Original property price and currency
- BER energy rating
- Number of bedrooms and bathrooms
- Property features from API
- Nearby locations and amenities
- Seller information

### Enhanced Community Analysis
- Calculated community value scores
- Estimated renovation costs
- Potential community uses
- Neighborhood metrics (renewal, walkability, safety scores)

## Error Handling

The application includes error handling for:
- API connection failures
- Invalid data responses
- Missing property information
- Network timeouts

## Testing

To test the integration:
1. Start the development server: `npm start`
2. The application will load with sample data
3. Replace sample data with real API calls
4. Test all property cards and detail views
5. Verify community impact calculations

## Future Enhancements

- Add real-time property updates
- Implement property favoriting
- Add advanced filtering options
- Include property comparison features
- Add community feedback integration
