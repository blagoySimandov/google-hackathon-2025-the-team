import React, { useState } from 'react';
import { Property } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { getScoreColor } from '../data/mockData';
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
  Download,
  CheckCircle
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Progress from '@radix-ui/react-progress';

interface PropertyDetailsProps {
  property: Property;
  onBack: () => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  onBack,
}) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const scoreColor = getScoreColor(property.communityValueScore);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
              <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
              <p className="text-gray-600">
                {property.city}, {property.state} {property.zipCode}
              </p>
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
        {/* Hero Image */}
        <div className="mb-8">
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <img
              src={property.beforeImage}
              alt={property.address}
              className="w-full h-64 lg:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-2xl font-bold mb-2">{property.impactStory.title}</h2>
              <p className="text-lg opacity-90">{property.impactStory.description}</p>
            </div>
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

                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(property.estimatedRenovationCost)}</p>
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

            {/* Call to Action */}
            <Card>
              <CardContent className="pt-6">
                <Dialog.Root open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                  <Dialog.Trigger asChild>
                    <Button className="w-full" size="lg">
                      <Download className="w-4 h-4 mr-2" />
                      Download Impact Report
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 z-50">
                      <Dialog.Title className="text-lg font-semibold mb-4">
                        Generating Impact Report
                      </Dialog.Title>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                            <Download className="w-4 h-4 text-accent-600" />
                          </div>
                          <div>
                            <p className="font-medium">Report is being generated...</p>
                            <p className="text-sm text-gray-600">
                              This may take a few moments
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsReportDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              // Simulate report generation
                              setTimeout(() => {
                                setIsReportDialogOpen(false);
                                alert('Report generated successfully!');
                              }, 2000);
                            }}
                          >
                            Continue
                          </Button>
                        </div>
                      </div>
                    </Dialog.Content>
                  </Dialog.Portal>
                </Dialog.Root>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
