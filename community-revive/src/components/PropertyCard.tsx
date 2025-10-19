import React from 'react';
import { Property } from '../types';
import { Card, CardContent } from './ui/Card';
import { getScoreColor } from '../utils/scoreUtils';
import { 
  School, 
  Trees, 
  Bus, 
  Landmark, 
  Users, 
  Leaf,
  Square
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onClick: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSelected = false,
  onClick,
}) => {
  const scoreColor = getScoreColor(property.communityValueScore);

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatSquareFeet = (sqft: number) => {
    return new Intl.NumberFormat('en-US').format(sqft);
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-accent-500 shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header with image and score */}
        <div className="flex gap-3 mb-3">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            <img
              src={property.beforeImage}
              alt={property.address}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
              {property.address}
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              {property.city}, {property.state} {property.zipCode}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: scoreColor }}
                >
                  {property.communityValueScore}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900">Community Value</p>
                  <p className="text-xs text-gray-600">Score</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-600">Est. Cost</p>
                <p className="text-xs font-medium text-gray-900">
                  {formatCurrency(property.estimatedRenovationCost, property.price?.currency || 'EUR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Impact Icons */}
        <div className="flex flex-wrap gap-2 mb-3">
          {property.communityImpact.blightRemoval && (
            <div className="flex items-center space-x-1 bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              <span>Blight Removal</span>
            </div>
          )}
          {property.communityImpact.nearSchool && (
            <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
              <School className="w-3 h-3" />
              <span>Near School</span>
            </div>
          )}
          {property.communityImpact.nearPark && (
            <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
              <Trees className="w-3 h-3" />
              <span>Near Park</span>
            </div>
          )}
          {property.communityImpact.nearTransit && (
            <div className="flex items-center space-x-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs">
              <Bus className="w-3 h-3" />
              <span>Near Transit</span>
            </div>
          )}
          {property.communityImpact.historicDistrict && (
            <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs">
              <Landmark className="w-3 h-3" />
              <span>Historic</span>
            </div>
          )}
          {property.communityImpact.highYouthImpact && (
            <div className="flex items-center space-x-1 bg-pink-50 text-pink-700 px-2 py-1 rounded-full text-xs">
              <Users className="w-3 h-3" />
              <span>Youth Impact</span>
            </div>
          )}
          {property.communityImpact.potentialGreenSpace && (
            <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs">
              <Leaf className="w-3 h-3" />
              <span>Green Space</span>
            </div>
          )}
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <div className="flex items-center space-x-1">
            <Square className="w-3 h-3" />
            <span>{formatSquareFeet(property.size.squareFeet)} sq ft</span>
          </div>
          {property.yearBuilt && (
            <span>Built {property.yearBuilt}</span>
          )}
        </div>

        {/* Potential Uses */}
        <div>
          <p className="text-xs text-gray-600 mb-1">Potential Uses:</p>
          <p className="text-xs font-medium text-gray-900">
            {property.potentialUses.join(' • ')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
