import React from 'react';
import { Property } from '../types';
import { Card, CardContent } from './ui/Card';

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
          
          <div className="flex items-center justify-end">
            <div className="text-right">
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
