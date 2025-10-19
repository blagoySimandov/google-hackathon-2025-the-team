import React from 'react';
import { ValidityDataDisplay } from './ValidityDataDisplay';

/**
 * Example component showing how to use ValidityDataDisplay
 * 
 * Simply pass a propertyId (string) to display the full validity data UI
 */

export const ValidityDataExample: React.FC = () => {
  // Replace this with actual property ID from your data
  const propertyId = "12345";

  return (
    <div>
      <ValidityDataDisplay propertyId={propertyId} />
    </div>
  );
};

/**
 * Example with dynamic property ID from route params
 */

import { useParams } from 'react-router-dom';

export const ValidityDataPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();

  if (!propertyId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Property ID is required</p>
      </div>
    );
  }

  return <ValidityDataDisplay propertyId={propertyId} />;
};

/**
 * Example with conditional rendering
 */

interface ConditionalExampleProps {
  propertyId?: string;
  showValidityData: boolean;
}

export const ConditionalValidityDataExample: React.FC<ConditionalExampleProps> = ({
  propertyId,
  showValidityData,
}) => {
  if (!showValidityData || !propertyId) {
    return <div>Validity data not available</div>;
  }

  return <ValidityDataDisplay propertyId={propertyId} />;
};

