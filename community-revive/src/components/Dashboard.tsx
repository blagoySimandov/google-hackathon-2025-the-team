import React, { useState, useMemo } from 'react';
import { GoogleMap } from './GoogleMap';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters } from './PropertyFilters';
import { MobileDrawer } from './MobileDrawer';
import { mockProperties, filterOptions } from '../data/mockData';
import { Property } from '../types';

interface DashboardProps {
  onPropertySelect: (property: Property) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onPropertySelect }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const filteredProperties = useMemo(() => {
    if (selectedFilter === 'all') return mockProperties;
    
    return mockProperties.filter(property => {
      switch (selectedFilter) {
        case 'historic':
          return property.communityImpact.historicDistrict;
        case 'green-space':
          return property.communityImpact.potentialGreenSpace;
        case 'youth-impact':
          return property.communityImpact.highYouthImpact;
        case 'near-school':
          return property.communityImpact.nearSchool;
        case 'near-park':
          return property.communityImpact.nearPark;
        default:
          return true;
      }
    });
  }, [selectedFilter]);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect(property);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Map Section */}
      <div className="flex-1 lg:w-3/5 h-1/2 lg:h-full">
        <div className="h-full p-4">
          <div className="bg-white rounded-lg shadow-sm h-full">
            <GoogleMap
              properties={filteredProperties}
              selectedProperty={selectedProperty || undefined}
              onPropertySelect={handlePropertySelect}
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* Desktop Properties List Section */}
      <div className="hidden lg:flex lg:w-2/5 h-full flex-col">
        <div className="p-4 bg-white border-l border-gray-200 flex flex-col h-full">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Community Revive
            </h1>
            <p className="text-gray-600 text-sm">
              Discover properties with high community impact potential
            </p>
          </div>

          {/* Filters */}
          <PropertyFilters
            filters={filterOptions}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />

          {/* Properties List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No properties match the selected filter.</p>
              </div>
            ) : (
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isSelected={selectedProperty?.id === property.id}
                  onClick={() => handlePropertySelect(property)}
                />
              ))
            )}
          </div>

          {/* Footer Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{filteredProperties.length} properties</span>
              <span>
                Avg. Score: {Math.round(
                  filteredProperties.reduce((sum, p) => sum + p.communityValueScore, 0) / 
                  filteredProperties.length || 0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        properties={filteredProperties}
        filters={filterOptions}
        selectedFilter={selectedFilter}
        selectedProperty={selectedProperty || undefined}
        onPropertySelect={handlePropertySelect}
        onFilterChange={setSelectedFilter}
        isOpen={isMobileDrawerOpen}
        onToggle={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
      />
    </div>
  );
};
