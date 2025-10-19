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
  { id: 'residential', value: 'residential', label: 'Residential', count: 0 },
  { id: 'commercial', value: 'commercial', label: 'Commercial', count: 0 },
  { id: 'industrial', value: 'industrial', label: 'Industrial', count: 0 },
  { id: 'vacant', value: 'vacant', label: 'Vacant Land', count: 0 },
];
