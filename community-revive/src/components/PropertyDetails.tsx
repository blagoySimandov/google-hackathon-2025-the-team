import React from 'react';
import { Property } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { ImageViewer } from './ImageViewer';
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
  Building,
  Home,
  MapPin,
  TrendingUp,
  Clock,
  Star,
  Target,
  BarChart3,
  Activity
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

  // Calculate additional building statistics
  const buildingAge = property.yearBuilt ? new Date().getFullYear() - property.yearBuilt : null;
  const yearsSinceLastOccupied = property.lastOccupied ? new Date().getFullYear() - property.lastOccupied : null;
  const pricePerSqFt = property.price && property.size?.squareFeet ? 
    Math.round(property.price.amount / property.size.squareFeet) : null;
  const renovationROI = property.price && property.estimatedRenovationCost ? 
    Math.round(((property.price.amount + property.estimatedRenovationCost) / property.price.amount - 1) * 100) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Enhanced */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:bg-white/20 shadow-none mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Map</span>
            </Button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3 leading-tight">{property.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-primary-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">
                    {property.address}
                    {property.city && property.city !== property.address && `, ${property.city}`}
                    {property.state && `, ${property.state}`}
                    {property.zipCode && property.zipCode !== property.address && property.zipCode !== property.city && ` ${property.zipCode}`}
                  </span>
                </div>
                {property.propertyType && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <Home className="w-4 h-4" />
                    <span className="capitalize font-medium">{property.propertyType}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl ring-4 ring-white/20"
                style={{ backgroundColor: scoreColor }}
              >
                {property.communityValueScore}
              </div>
              <p className="text-sm text-primary-100 mt-3 font-semibold">Community Score</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Image Viewer */}
        <div className="mb-8">
          <ImageViewer
            images={(() => {
              // Create images array from property data
              const images: Array<{src: string; alt: string; width: number; height: number}> = [];
              
              // Add main before image if available
              if (property.beforeImage) {
                images.push({
                  src: property.beforeImage,
                  alt: property.title,
                  width: 1200,
                  height: 1000
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
          
          {/* Impact Story Overlay - Enhanced */}
          <div className="mt-6 p-8 bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-2xl text-white shadow-soft-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{property.impactStory.title}</h2>
                <p className="text-lg text-primary-100 leading-relaxed">{property.impactStory.description}</p>
              </div>
            </div>
            {property.impactStory.keyPoints && property.impactStory.keyPoints.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {property.impactStory.keyPoints.map((point) => (
                  <div key={point} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{point}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content - Takes up 3 columns */}
          <div className="xl:col-span-3 space-y-8">
            {/* Key Statistics Grid - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price Information */}
              <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-0 shadow-soft hover:shadow-soft-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-sm">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Current Price</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {property.price ? formatCurrency(property.price.amount, property.price.currency || 'EUR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Building Size */}
              <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-0 shadow-soft hover:shadow-soft-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 bg-secondary-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Square className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Size</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatSquareFeet(property.size.squareFeet)} ft²
                      </p>
                      {pricePerSqFt && (
                        <p className="text-xs text-gray-600 font-medium mt-1">€{pricePerSqFt}/sq ft</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Building Age */}
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-soft hover:shadow-soft-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Building Age</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {buildingAge ? `${buildingAge} years` : 'Unknown'}
                      </p>
                      {property.yearBuilt && (
                        <p className="text-xs text-gray-600 font-medium mt-1">Built in {property.yearBuilt}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Renovation Cost */}
              <Card className="bg-gradient-to-br from-accent-50 to-accent-100 border-0 shadow-soft hover:shadow-soft-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center shadow-sm">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Renovation Cost</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(property.estimatedRenovationCost, property.price?.currency || 'EUR')}
                      </p>
                      {renovationROI && (
                        <p className="text-xs text-gray-600 font-medium mt-1">{renovationROI}% potential ROI</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Community Impact Analysis */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center space-x-2">
                  <BarChart3 className="w-6 h-6" />
                  <span>Community Impact Analysis</span>
                </h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Neighborhood Renewal</span>
                      <span className="text-sm text-gray-600">{property.neighborhoodMetrics.renewalScore}%</span>
                    </div>
                    <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-3">
                      <Progress.Indicator
                        className="bg-blue-500 w-full h-full transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${100 - property.neighborhoodMetrics.renewalScore}%)` }}
                      />
                    </Progress.Root>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Walkability Score</span>
                      <span className="text-sm text-gray-600">{property.neighborhoodMetrics.walkabilityScore}%</span>
                    </div>
                    <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-3">
                      <Progress.Indicator
                        className="bg-green-500 w-full h-full transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${100 - property.neighborhoodMetrics.walkabilityScore}%)` }}
                      />
                    </Progress.Root>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Safety Score</span>
                      <span className="text-sm text-gray-600">{property.neighborhoodMetrics.safetyScore}%</span>
                    </div>
                    <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-3">
                      <Progress.Indicator
                        className="bg-purple-500 w-full h-full transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${100 - property.neighborhoodMetrics.safetyScore}%)` }}
                      />
                    </Progress.Root>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact Story */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                  <Target className="w-6 h-6" />
                  <span>{property.impactStory.title}</span>
                </h2>
                <p className="text-lg opacity-90 mb-6">{property.impactStory.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.impactStory.keyPoints.map((point) => (
                    <div key={point} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                      <span className="text-white">{point}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Building Details */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center space-x-2">
                  <Building className="w-6 h-6" />
                  <span>Building Details</span>
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {property.bedrooms && property.bedrooms > 0 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">🛏️</div>
                      <p className="text-lg font-semibold">{property.bedrooms}</p>
                      <p className="text-sm text-gray-600">Bedrooms</p>
                    </div>
                  )}

                  {property.bathrooms && property.bathrooms > 0 && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">🚿</div>
                      <p className="text-lg font-semibold">{property.bathrooms}</p>
                      <p className="text-sm text-gray-600">Bathrooms</p>
                    </div>
                  )}

                  {property.ber.rating && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">⚡</div>
                      <p className="text-lg font-semibold">BER {property.ber.rating}</p>
                      <p className="text-sm text-gray-600">Energy Rating</p>
                    </div>
                  )}

                  {yearsSinceLastOccupied && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl mb-2">🏚️</div>
                      <p className="text-lg font-semibold">{yearsSinceLastOccupied} years</p>
                      <p className="text-sm text-gray-600">Vacant</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Description */}
            {property.description && (
              <Card>
                <CardHeader>
                  <h3 className="text-xl font-semibold">Property Description</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-lg">{property.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Takes up 1 column */}
          <div className="space-y-6">
            {/* Community Impact Indicators */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Community Impact</span>
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {property.communityImpact.blightRemoval && (
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Blight Removal Potential</span>
                    </div>
                  )}
                  {property.communityImpact.nearSchool && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <School className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium">Near School</span>
                    </div>
                  )}
                  {property.communityImpact.nearPark && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Trees className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium">Near Park</span>
                    </div>
                  )}
                  {property.communityImpact.nearTransit && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Bus className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium">Near Transit</span>
                    </div>
                  )}
                  {property.communityImpact.historicDistrict && (
                    <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                      <Landmark className="w-5 h-5 text-amber-500" />
                      <span className="text-sm font-medium">Historic District</span>
                    </div>
                  )}
                  {property.communityImpact.highYouthImpact && (
                    <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                      <Users className="w-5 h-5 text-pink-500" />
                      <span className="text-sm font-medium">High Youth Impact</span>
                    </div>
                  )}
                  {property.communityImpact.potentialGreenSpace && (
                    <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
                      <Leaf className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium">Green Space Potential</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Potential Uses */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Potential Uses</span>
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {property.potentialUses.map((use) => (
                    <div key={use} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{use}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Property Timeline */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Property Timeline</span>
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {property.yearBuilt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Built in {property.yearBuilt}</p>
                        <p className="text-xs text-gray-500">{buildingAge} years old</p>
                      </div>
                    </div>
                  )}
                  
                  {property.dates.publishDate && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Listed for Sale</p>
                        <p className="text-xs text-gray-500">
                          {new Date(property.dates.publishDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {yearsSinceLastOccupied && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Home className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Last Occupied</p>
                        <p className="text-xs text-gray-500">{yearsSinceLastOccupied} years ago</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {property.seller && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Contact Agent</span>
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">{property.seller.name}</p>
                      <p className="text-sm text-gray-600">{property.seller.type.replace('_', ' ')}</p>
                    </div>
                    
                    {property.seller.branch && (
                      <div className="text-sm text-gray-600">
                        <p>{property.seller.branch}</p>
                      </div>
                    )}
                    
                    {property.seller.phone && (
                      <div className="text-sm">
                        <a 
                          href={`tel:${property.seller.phone}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {property.seller.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
