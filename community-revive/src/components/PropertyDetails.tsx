import React from 'react';
import { Property } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { PhotoCarousel } from './PhotoCarousel';
import { getScoreColor } from '../utils/scoreUtils';
import { 
  School, 
  Trees, 
  Bus, 
  Landmark, 
  Users, 
  Leaf,
  DollarSign,
  Square,
  Calendar,
  ArrowLeft,
  CheckCircle,
  ZoomIn
} from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';

interface PropertyDetailsProps {
  property: Property;
  onBack: () => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  onBack,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Map</span>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-gray-600">
                {property.address}, {property.city}, {property.state}
              </p>
              {property.propertyType && (
                <p className="text-sm text-gray-500 mt-1">
                  {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                </p>
              )}
            </div>
            <div className="text-right">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: scoreColor }}
              >
                {property.communityValueScore}
              </div>
              <p className="text-sm text-gray-600 mt-1">Community Value Score</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Photo Carousel */}
        <div className="mb-8">
          <PhotoCarousel
            images={(() => {
              // Create images array from property data
              const images = [];
              
              // Add main before image if available
              if (property.beforeImage) {
                images.push({
                  src: property.beforeImage,
                  alt: property.title,
                  width: 1200,
                  height: 800
                });
              }
              
              // Add additional images from media if available
              if (property.media?.images && Array.isArray(property.media.images)) {
                property.media.images.forEach((image, index) => {
                  if (image.size1440x960 && image.size1440x960 !== property.beforeImage) {
                    images.push({
                      src: image.size1440x960,
                      alt: `${property.title} - Image ${index + 1}`,
                      width: 1440,
                      height: 960
                    });
                  }
                });
              }
              
              // If no images found, add a placeholder
              if (images.length === 0) {
                images.push({
                  src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01NjAgMzIwSDY0MFY0ODBINjAwVjM0MEg1NjBWMzIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNTIwIDM2MEg2ODBWNDQwSDUyMFYzNjBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjYwMCIgeT0iNTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+',
                  alt: 'No image available',
                  width: 1200,
                  height: 800
                });
              }
              
              return images;
            })()}
            className="w-full"
          />
          
          {/* Impact Story Overlay */}
          <div className="mt-4 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
            <h2 className="text-2xl font-bold mb-2">{property.impactStory.title}</h2>
            <p className="text-lg opacity-90">{property.impactStory.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Score Breakdown */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Community Impact Analysis</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Neighborhood Renewal</span>
                    <span className="text-sm text-gray-600">{property.neighborhoodMetrics.renewalScore}%</span>
                  </div>
                  <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-2">
                    <Progress.Indicator
                      className="bg-secondary-500 w-full h-full transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(-${100 - property.neighborhoodMetrics.renewalScore}%)` }}
                    />
                  </Progress.Root>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Walkability Score</span>
                    <span className="text-sm text-gray-600">{property.neighborhoodMetrics.walkabilityScore}%</span>
                  </div>
                  <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-2">
                    <Progress.Indicator
                      className="bg-primary-500 w-full h-full transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(-${100 - property.neighborhoodMetrics.walkabilityScore}%)` }}
                    />
                  </Progress.Root>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Safety Score</span>
                    <span className="text-sm text-gray-600">{property.neighborhoodMetrics.safetyScore}%</span>
                  </div>
                  <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-2">
                    <Progress.Indicator
                      className="bg-accent-500 w-full h-full transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(-${100 - property.neighborhoodMetrics.safetyScore}%)` }}
                    />
                  </Progress.Root>
                </div>
              </CardContent>
            </Card>

            {/* Key Points */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Impact Highlights</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {property.impactStory.keyPoints.map((point) => (
                    <li key={point} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-secondary-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Property Description */}
            {property.description && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Property Description</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Community Voice */}
            {property.communityVoice && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Community Voice</h3>
                </CardHeader>
                <CardContent>
                  <blockquote className="border-l-4 border-accent-500 pl-4 italic text-gray-700 mb-4">
                    "{property.communityVoice.quote}"
                  </blockquote>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{property.communityVoice.author}</p>
                    <p>{property.communityVoice.role}, {property.communityVoice.organization}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Property Details</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Square className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{formatSquareFeet(property.size.squareFeet)} sq ft</p>
                    <p className="text-xs text-gray-600">Size</p>
                  </div>
                </div>

                {property.yearBuilt && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Built {property.yearBuilt}</p>
                      <p className="text-xs text-gray-600">Year Built</p>
                    </div>
                  </div>
                )}

                {property.bedrooms && property.bedrooms > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 text-gray-400">🛏️</div>
                    <div>
                      <p className="text-sm font-medium">{property.bedrooms} bedrooms</p>
                      <p className="text-xs text-gray-600">Bedrooms</p>
                    </div>
                  </div>
                )}

                {property.bathrooms && property.bathrooms > 0 && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 text-gray-400">🚿</div>
                    <div>
                      <p className="text-sm font-medium">{property.bathrooms} bathrooms</p>
                      <p className="text-xs text-gray-600">Bathrooms</p>
                    </div>
                  </div>
                )}

                {property.ber.rating && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 text-gray-400">⚡</div>
                    <div>
                      <p className="text-sm font-medium">BER {property.ber.rating}</p>
                      <p className="text-xs text-gray-600">Energy Rating</p>
                    </div>
                  </div>
                )}

                {property.seller && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 text-gray-400">🏢</div>
                    <div>
                      <p className="text-sm font-medium">{property.seller.name}</p>
                      <p className="text-xs text-gray-600">Estate Agent</p>
                    </div>
                  </div>
                )}

                {property.dates.publishDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">
                        Listed {new Date(property.dates.publishDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-600">Date Listed</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(property.estimatedRenovationCost, property.price?.currency || 'EUR')}</p>
                    <p className="text-xs text-gray-600">Est. Renovation Cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Impact */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Community Impact</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {property.communityImpact.blightRemoval && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Blight Removal</span>
                    </div>
                  )}
                  {property.communityImpact.nearSchool && (
                    <div className="flex items-center space-x-2 text-sm">
                      <School className="w-4 h-4 text-blue-500" />
                      <span>Near School</span>
                    </div>
                  )}
                  {property.communityImpact.nearPark && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Trees className="w-4 h-4 text-green-500" />
                      <span>Near Park</span>
                    </div>
                  )}
                  {property.communityImpact.nearTransit && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Bus className="w-4 h-4 text-purple-500" />
                      <span>Near Transit</span>
                    </div>
                  )}
                  {property.communityImpact.historicDistrict && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Landmark className="w-4 h-4 text-amber-500" />
                      <span>Historic District</span>
                    </div>
                  )}
                  {property.communityImpact.highYouthImpact && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4 text-pink-500" />
                      <span>High Youth Impact</span>
                    </div>
                  )}
                  {property.communityImpact.potentialGreenSpace && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Leaf className="w-4 h-4 text-emerald-500" />
                      <span>Potential Green Space</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Original Property Information */}
            {property.price && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Property Information</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Original Price</span>
                    <span className="text-lg font-bold text-primary-600">
                      {/* Use price.amount and price.currency directly from DB, fallback to formatted if available */}
                      {property.price && typeof property.price.amount === 'number'
                        ? formatCurrency(property.price.amount, property.price.currency || 'EUR')
                        : (property.price?.formatted || 'N/A')}
                    </span>
                  </div>
                  {property.features && property.features.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Property Features</p>
                      <div className="flex flex-wrap gap-2">
                        {property.features.map((feature) => (
                          <span key={feature} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {property.sections && property.sections.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Property Type</p>
                      <div className="flex flex-wrap gap-2">
                        {property.sections.map((section) => (
                          <span key={section} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            {section}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {property.metadata?.sellingType && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Selling Type</span>
                      <span className="text-sm text-gray-600">{property.metadata.sellingType}</span>
                    </div>
                  )}

                  {property.metadata?.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Category</span>
                      <span className="text-sm text-gray-600">{property.metadata.category}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Photo Gallery */}
            {property.media && property.media.images && property.media.images.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Photo Gallery</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {property.media.images.slice(0, 6).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          // This would need to be handled by the PhotoCarousel component
                          // For now, just show the image
                          console.log('Gallery image clicked:', index);
                        }}
                        className="relative group overflow-hidden rounded-lg aspect-square"
                      >
                        <img
                          src={image.size1440x960}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </button>
                    ))}
                    {property.media.images.length > 6 && (
                      <div className="flex items-center justify-center bg-gray-100 rounded-lg aspect-square">
                        <span className="text-sm text-gray-600">
                          +{property.media.images.length - 6} more
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Media Information */}
            {property.media && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Media & Tours</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Images</span>
                    <span className="text-sm text-gray-600">{property.media.totalImages}</span>
                  </div>
                  
                  {property.media.hasVideo && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Video Available</span>
                    </div>
                  )}
                  
                  {property.media.hasVirtualTour && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Virtual Tour Available</span>
                    </div>
                  )}
                  
                  {property.media.hasBrochure && (
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Brochure Available</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Potential Uses */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Potential Uses</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {property.potentialUses.map((use) => (
                    <div key={use} className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded">
                      {use}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
