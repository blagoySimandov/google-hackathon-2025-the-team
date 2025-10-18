import React from 'react';
import { Property, FilterOption } from '../types';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters } from './PropertyFilters';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface MobileDrawerProps {
  properties: Property[];
  filters: FilterOption[];
  selectedFilter: string;
  selectedProperty?: Property;
  onPropertySelect: (property: Property) => void;
  onFilterChange: (filterId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  properties,
  filters,
  selectedFilter,
  selectedProperty,
  onPropertySelect,
  onFilterChange,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="lg:hidden">
      {/* Drawer Handle */}
      <button
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 w-full"
        onClick={onToggle}
        type="button"
        aria-label={isOpen ? 'Hide Properties' : 'Show Properties'}
      >
        <div className="flex items-center justify-center py-2">
          {isOpen ? (
            <ChevronDown className="w-6 h-6 text-gray-500" />
          ) : (
            <ChevronUp className="w-6 h-6 text-gray-500" />
          )}
          <span className="ml-2 text-sm font-medium text-gray-700">
            {isOpen ? 'Hide Properties' : 'Show Properties'}
          </span>
        </div>
      </button>

      {/* Drawer Content */}
      <div
        className={`fixed bottom-12 left-0 right-0 bg-white border-t border-gray-200 z-30 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '60vh' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Community Revive
            </h2>
            <p className="text-sm text-gray-600">
              Discover properties with high community impact potential
            </p>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <PropertyFilters
              filters={filters}
              selectedFilter={selectedFilter}
              onFilterChange={onFilterChange}
            />
          </div>

          {/* Properties List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {properties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No properties match the selected filter.</p>
              </div>
            ) : (
              properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isSelected={selectedProperty?.id === property.id}
                  onClick={() => onPropertySelect(property)}
                />
              ))
            )}
          </div>

          {/* Footer Stats */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{properties.length} properties</span>
              <span>
                Avg. Score: {Math.round(
                  properties.reduce((sum, p) => sum + p.communityValueScore, 0) / 
                  properties.length || 0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
