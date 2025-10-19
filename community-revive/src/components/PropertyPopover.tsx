import React from 'react';
import { Property } from '../types';
import { Card, CardContent } from './ui/Card';
import { getScoreColor } from '../utils/scoreUtils';

interface PropertyPopoverProps {
  property: Property;
  position: { x: number; y: number };
  onClose: () => void;
}

export const PropertyPopover: React.FC<PropertyPopoverProps> = ({
  property,
  position,
  onClose,
}) => {
  const scoreColor = getScoreColor(property.communityValueScore);

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateX(-50%) translateY(-100%)',
      }}
    >
      <Card className="pointer-events-auto w-80 shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {property.address}
              </h3>
              <p className="text-xs text-gray-600">
                {property.city && property.city !== property.address && `${property.city}, `}
                {property.state}
                {property.zipCode && property.zipCode !== property.address && property.zipCode !== property.city && ` ${property.zipCode}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
          
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
              <p className="text-xs text-gray-600">Potential Uses</p>
              <p className="text-xs font-medium text-gray-900">
                {property.potentialUses.slice(0, 2).join(', ')}
                {property.potentialUses.length > 2 && '...'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
