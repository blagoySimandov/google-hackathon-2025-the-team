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
  { id: 'high-score', value: 'high-score', label: 'High Impact (80+)', count: 0 },
  { id: 'medium-score', value: 'medium-score', label: 'Medium Impact (60-79)', count: 0 },
  { id: 'historic', value: 'historic', label: 'Historic District', count: 0 },
  { id: 'near-school', value: 'near-school', label: 'Near School', count: 0 },
  { id: 'near-transit', value: 'near-transit', label: 'Near Transit', count: 0 },
  { id: 'residential', value: 'residential', label: 'Residential', count: 0 },
  { id: 'commercial', value: 'commercial', label: 'Commercial', count: 0 },
  { id: 'vacant', value: 'vacant', label: 'Vacant Land', count: 0 },
];
