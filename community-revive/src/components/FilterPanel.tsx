import React, { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

export interface FilterState {
  priceRange: {
    min: number | '';
    max: number | '';
  };
  propertyTypes: string[];
  scoreRange: {
    min: number | '';
    max: number | '';
  };
  sortBy: 'score' | 'price-low' | 'price-high' | 'newest' | 'oldest';
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  propertyCount: number;
}

const propertyTypeOptions = [
  { value: 'House', label: 'House' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Detached', label: 'Detached' },
  { value: 'Semi-D', label: 'Semi-Detached' },
  { value: 'Terrace', label: 'Terrace' },
  { value: 'Bungalow', label: 'Bungalow' },
  { value: 'Townhouse', label: 'Townhouse' },
  { value: 'Site', label: 'Site/Land' },
];


const sortOptions = [
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onReset,
  propertyCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    type: false,
    score: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = 
    filters.priceRange.min !== '' ||
    filters.priceRange.max !== '' ||
    filters.propertyTypes.length > 0 ||
    filters.scoreRange.min !== '' ||
    filters.scoreRange.max !== '' ||
    filters.sortBy !== 'score';

  const handlePropertyTypeToggle = (type: string) => {
    const newTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    onFiltersChange({ ...filters, propertyTypes: newTypes });
  };


  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-primary-600" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Filters & Sorting</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {propertyCount} properties {hasActiveFilters && '• Filters active'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Reset All
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
          {/* Sort By */}
          <div className="pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFiltersChange({ ...filters, sortBy: option.value as any })}
                  className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                    filters.sortBy === option.value
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="text-sm font-semibold text-gray-700">Price Range (€)</span>
              {expandedSections.price ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.price && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    placeholder="Min price"
                    value={filters.priceRange.min}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        priceRange: { ...filters.priceRange, min: e.target.value ? Number(e.target.value) : '' },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Max price"
                    value={filters.priceRange.max}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        priceRange: { ...filters.priceRange, max: e.target.value ? Number(e.target.value) : '' },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Property Type */}
          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={() => toggleSection('type')}
              className="w-full flex items-center justify-between mb-3"
            >
              <span className="text-sm font-semibold text-gray-700">
                Property Type {filters.propertyTypes.length > 0 && `(${filters.propertyTypes.length})`}
              </span>
              {expandedSections.type ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.type && (
              <div className="flex flex-wrap gap-2">
                {propertyTypeOptions.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handlePropertyTypeToggle(type.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all ${
                      filters.propertyTypes.includes(type.value)
                        ? 'bg-primary-100 text-primary-700 border-primary-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

