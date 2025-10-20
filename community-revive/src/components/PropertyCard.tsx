import React from "react";
import { Property } from "../types";
import { Card, CardContent } from "./ui/Card";
import { getScoreColor } from "../utils/scoreUtils";
import {
  School,
  Trees,
  Bus,
  Landmark,
  Users,
  Leaf,
  Square,
  MapPin,
} from "lucide-react";

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onClick: () => void;
  onViewOnMap?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSelected = false,
  onClick,
  onViewOnMap,
}) => {
  const scoreColor = getScoreColor(property.communityScore);

  const handleViewOnMap = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onViewOnMap?.();
  };

  const formatCurrency = (amount: number, currency: string = "EUR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatSquareFeet = (sqft: number) => {
    return new Intl.NumberFormat("en-US").format(sqft);
  };

  const getTopImpacts = () => {
    const impacts = [];
    if (property.communityImpact.nearSchool) {
      impacts.push({
        icon: <School className="w-3 h-3" />,
        label: "Near School",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
      });
    }
    if (property.communityImpact.nearPark) {
      impacts.push({
        icon: <Trees className="w-3 h-3" />,
        label: "Near Park",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
      });
    }
    if (property.communityImpact.nearTransit) {
      impacts.push({
        icon: <Bus className="w-3 h-3" />,
        label: "Near Transit",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
      });
    }
    if (property.communityImpact.historicDistrict) {
      impacts.push({
        icon: <Landmark className="w-3 h-3" />,
        label: "Historic",
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
      });
    }
    if (property.communityImpact.highYouthImpact) {
      impacts.push({
        icon: <Users className="w-3 h-3" />,
        label: "Youth Impact",
        bgColor: "bg-pink-50",
        textColor: "text-pink-700",
      });
    }
    if (property.communityImpact.potentialGreenSpace) {
      impacts.push({
        icon: <Leaf className="w-3 h-3" />,
        label: "Green Space",
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
      });
    }
    if (property.communityImpact.blightRemoval) {
      impacts.push({
        icon: null,
        label: "Blight Removal",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
      });
    }
    return impacts.slice(0, 3);
  };

  const topImpacts = getTopImpacts();

  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 overflow-hidden bg-white ${
        isSelected
          ? "ring-2 ring-accent-500 shadow-soft-lg scale-[1.02]"
          : "hover:shadow-soft-lg hover:-translate-y-1"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Full-width Image Header */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          <img
            src={property.beforeImage}
            alt={property.address}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />

          {/* Valiability Score Badge - Top Left */}
          <div className="absolute top-3 left-3">
            <div className="glass rounded-full px-3 py-1.5 shadow-lg ring-1 ring-white/20">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse-slow"
                  style={{
                    backgroundColor: getScoreColor(property.validityScore),
                  }}
                ></div>
                <span className="font-bold text-sm text-gray-900">
                  {property.validityScore}
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  Valiability
                </span>
              </div>
            </div>
          </div>

          {/* Community Score Badge - Top Right */}
          <div className="absolute top-3 right-3">
            <div className="glass rounded-full px-3 py-1.5 shadow-lg ring-1 ring-white/20">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse-slow"
                  style={{ backgroundColor: scoreColor }}
                ></div>
                <span className="font-bold text-sm text-gray-900">
                  {property.communityScore}
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  Community
                </span>
              </div>
            </div>
          </div>

          {/* Price Tag - Bottom Right */}
          <div className="absolute bottom-3 right-3">
            <div className="glass-dark text-white px-3 py-1.5 rounded-lg shadow-lg">
              <span className="text-sm font-bold">
                {formatCurrency(
                  property.price?.amount || 0,
                  property.price?.currency || "EUR",
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 space-y-3">
          {/* Address & Location */}
          <div>
            <h3 className="font-bold text-base text-gray-900 leading-tight line-clamp-1">
              {property.address}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {property.city &&
                property.city !== property.address &&
                `${property.city}, `}
              {property.state}
            </p>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Square className="w-4 h-4 text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Size</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {formatSquareFeet(property.size.squareFeet)} ft²
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-600 font-bold text-sm">€</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Renovation</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {formatCurrency(
                    property.estimatedRenovationCost,
                    property.price?.currency || "EUR",
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* See on Map Button */}
          {onViewOnMap && (
            <button
              onClick={handleViewOnMap}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                bg-accent-500 hover:bg-accent-600 active:bg-accent-700
                text-white rounded-lg text-sm font-semibold 
                transition-all duration-200 button-press
                shadow-sm hover:shadow-md"
            >
              <MapPin className="w-4 h-4" />
              <span>View on Map</span>
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
