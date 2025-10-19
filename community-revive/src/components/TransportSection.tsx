import React, { useState } from "react";
import { PublicTransport } from "../api/firestore/types";
import { Card, CardHeader, CardContent } from "./ui/Card";
import {
  Bus,
  Train,
  TramFront as Tram,
  ChevronDown,
  ChevronUp,
  Navigation,
} from "lucide-react";
import { cn } from "../utils/cn";

interface TransportSectionProps {
  publicTransports: PublicTransport[];
}

const TransportIcon: React.FC<{ type: PublicTransport["type"] }> = ({
  type,
}) => {
  const iconClass = "w-5 h-5";

  switch (type) {
    case "Bus":
      return <Bus className={iconClass} />;
    case "Rail":
      return <Train className={iconClass} />;
    case "Tram":
      return <Tram className={iconClass} />;
    default:
      return <Navigation className={iconClass} />;
  }
};

const getTransportColor = (type: PublicTransport["type"]) => {
  switch (type) {
    case "Bus":
      return {
        bg: "bg-green-100",
        text: "text-green-600",
        badge: "bg-green-100 text-green-700",
      };
    case "Rail":
      return {
        bg: "bg-orange-100",
        text: "text-orange-600",
        badge: "bg-orange-100 text-orange-700",
      };
    case "Tram":
      return {
        bg: "bg-indigo-100",
        text: "text-indigo-600",
        badge: "bg-indigo-100 text-indigo-700",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-600",
        badge: "bg-gray-100 text-gray-700",
      };
  }
};

const TransportCard: React.FC<{ transport: PublicTransport }> = ({
  transport,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = getTransportColor(transport.type);

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              colors.bg,
            )}
          >
            <div className={colors.text}>
              <TransportIcon type={transport.type} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 truncate">
                {transport.stop}
              </h4>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  colors.badge,
                )}
              >
                {transport.type}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">
              Route {transport.route} • {transport.distance.value.toFixed(2)}{" "}
              {transport.distance.unit}
            </p>
          </div>
        </div>

        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Route</p>
              <p className="text-sm font-medium text-gray-900">
                {transport.route}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Distance</p>
              <p className="text-sm font-medium text-gray-900">
                {transport.distance.value.toFixed(2)} {transport.distance.unit}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Destination</p>
              <p className="text-sm font-medium text-gray-900">
                {transport.destination}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Provider</p>
              <p className="text-sm font-medium text-gray-900">
                {transport.provider}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="text-sm font-medium text-gray-900">
                {transport.location.lat}, {transport.location.lon}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const TransportSection: React.FC<TransportSectionProps> = ({
  publicTransports,
}) => {
  const sortedTransports = [...publicTransports].sort(
    (a, b) => a.distance.value - b.distance.value,
  );

  const busTransports = sortedTransports.filter((t) => t.type === "Bus");
  const railTransports = sortedTransports.filter((t) => t.type === "Rail");
  const tramTransports = sortedTransports.filter((t) => t.type === "Tram");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Navigation className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-900">Public Transport</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {publicTransports.length} transport options nearby
        </p>
      </CardHeader>

      <CardContent>
        {busTransports.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Bus className="w-4 h-4 text-green-600" />
              Bus Stops ({busTransports.length})
            </h4>
            <div className="space-y-2">
              {busTransports.map((transport, index) => (
                <TransportCard key={`bus-${index}`} transport={transport} />
              ))}
            </div>
          </div>
        )}

        {railTransports.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Train className="w-4 h-4 text-orange-600" />
              Rail Stations ({railTransports.length})
            </h4>
            <div className="space-y-2">
              {railTransports.map((transport, index) => (
                <TransportCard key={`rail-${index}`} transport={transport} />
              ))}
            </div>
          </div>
        )}

        {tramTransports.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Tram className="w-4 h-4 text-indigo-600" />
              Tram Stops ({tramTransports.length})
            </h4>
            <div className="space-y-2">
              {tramTransports.map((transport, index) => (
                <TransportCard key={`tram-${index}`} transport={transport} />
              ))}
            </div>
          </div>
        )}

        {publicTransports.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No public transport data available
          </p>
        )}
      </CardContent>
    </Card>
  );
};
