import React from 'react';
import { FilterOption } from '../types';
import { cn } from '../utils/cn';

interface PropertyFiltersProps {
  filters: FilterOption[];
  selectedFilter: string;
  onFilterChange: (filterId: string) => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={cn(
            'px-3 py-2 rounded-full text-sm font-medium transition-colors',
            'border border-gray-200 hover:border-gray-300',
            selectedFilter === filter.id
              ? 'bg-accent-500 text-white border-accent-500 hover:bg-accent-600'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          )}
        >
          {filter.label}
          <span className="ml-2 text-xs opacity-75">({filter.count})</span>
        </button>
      ))}
    </div>
  );
};
