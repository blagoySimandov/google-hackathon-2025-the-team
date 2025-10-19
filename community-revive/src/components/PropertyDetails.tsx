import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PropertyListing } from '../api/firestore/types';
import { getPropertyById } from '../api/firestore/index';
import { PhotoCarousel } from './PhotoCarousel';
import { ArrowLeft } from 'lucide-react';

export const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setError('No property ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const propertyData = await getPropertyById(Number.parseInt(id, 10));
        
        if (propertyData) {
          setProperty(propertyData);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Property not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Transform property images to PhotoCarousel format
  const carouselImages = property.media.images.map((image) => ({
    src: image.size1440x960,
    alt: property.title,
    width: 1440,
    height: 960
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {property.title}
          </h1>
          
          {/* Address Information */}
          <div className="flex flex-wrap items-center gap-2 text-gray-600">
            {property.location.areaName && (
              <span className="text-lg">{property.location.areaName}</span>
            )}
            {property.location.eircodes && property.location.eircodes.length > 0 && (
              <>
                {property.location.areaName && <span>•</span>}
                <span className="text-lg">{property.location.eircodes[0]}</span>
              </>
            )}
          </div>
        </div>

        {/* Photo Carousel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <PhotoCarousel images={carouselImages} />
        </div>
      </div>
    </div>
  );
};
