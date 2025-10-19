import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const PriceDebug: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSampleProperties = async () => {
    setLoading(true);
    try {
      const result = await apiService.fetchProperties({}, { pageSize: 5 });
      setProperties(result.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Price Debug Information</h2>
      
      <button
        onClick={fetchSampleProperties}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Fetch Sample Properties'}
      </button>
      
      <div className="space-y-4">
        {properties.map((property, index) => (
          <div key={property.id} className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Property {index + 1}: {property.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Property ID:</strong> {property.id}</p>
                <p><strong>Price Object:</strong> {JSON.stringify(property.price, null, 2)}</p>
                <p><strong>Price Amount:</strong> {property.price?.amount}</p>
                <p><strong>Price Formatted:</strong> {property.price?.formatted}</p>
                <p><strong>Price Currency:</strong> {property.price?.currency}</p>
              </div>
              <div>
                <p><strong>Property Type:</strong> {property.propertyType}</p>
                <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
                <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
                <p><strong>Community Score:</strong> {property.communityValueScore}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
