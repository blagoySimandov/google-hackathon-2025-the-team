// Utility function to get color based on community value score
export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10B981'; // Green
  if (score >= 60) return '#F59E0B'; // Yellow
  if (score >= 40) return '#F97316'; // Orange
  return '#EF4444'; // Red
};

// Filter options for property filtering
export const filterOptions = [
  { id: 'all', value: 'all', label: 'All Properties', count: 0 },
  { id: 'high-score', value: 'high-score', label: 'High Community Score (80+)', count: 0 },
  { id: 'medium-score', value: 'medium-score', label: 'Medium Community Score (60-79)', count: 0 },
  { id: 'house', value: 'house', label: 'House', count: 0 },
  { id: 'apartment', value: 'apartment', label: 'Apartment', count: 0 },
  { id: 'bungalow', value: 'bungalow', label: 'Bungalow', count: 0 },
  { id: 'detached', value: 'detached', label: 'Detached', count: 0 },
  { id: 'semi-d', value: 'semi-d', label: 'Semi-Detached', count: 0 },
  { id: 'terrace', value: 'terrace', label: 'Terrace', count: 0 },
  { id: 'townhouse', value: 'townhouse', label: 'Townhouse', count: 0 },
  { id: 'site', value: 'site', label: 'Site', count: 0 },
  { id: 'near-school', value: 'near-school', label: 'Near School', count: 0 },
  { id: 'near-park', value: 'near-park', label: 'Near Park', count: 0 },
  { id: 'near-transit', value: 'near-transit', label: 'Near Transit', count: 0 },
  { id: 'historic', value: 'historic', label: 'Historic District', count: 0 },
  { id: 'blight-removal', value: 'blight-removal', label: 'Blight Removal', count: 0 },
  { id: 'youth-impact', value: 'youth-impact', label: 'High Youth Impact', count: 0 },
  { id: 'green-space', value: 'green-space', label: 'Potential Green Space', count: 0 },
];
