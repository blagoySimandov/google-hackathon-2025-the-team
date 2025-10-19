import React, { useState } from 'react';
import { School } from '../api/firestore/types';
import { Card, CardHeader, CardContent } from './ui/Card';
import { School as SchoolIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils/cn';

interface SchoolsSectionProps {
  primarySchools: School[];
  secondarySchools: School[];
}

const SchoolCard: React.FC<{ school: School; isPrimary: boolean }> = ({ school, isPrimary }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            isPrimary ? "bg-blue-100" : "bg-purple-100"
          )}>
            <SchoolIcon className={cn(
              "w-5 h-5",
              isPrimary ? "text-blue-600" : "text-purple-600"
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{school.schoolName}</h4>
            <p className="text-sm text-gray-500">
              {school.distance.value.toFixed(2)} {school.distance.unit} away
            </p>
          </div>

          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            isPrimary ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
          )}>
            {isPrimary ? "Primary" : "Secondary"}
          </span>
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
              <p className="text-xs text-gray-500 mb-1">Number of Pupils</p>
              <p className="text-sm font-medium text-gray-900">{school.numPupils.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Distance</p>
              <p className="text-sm font-medium text-gray-900">
                {school.distance.value.toFixed(2)} {school.distance.unit}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Location</p>
              <p className="text-sm font-medium text-gray-900">
                {school.location.lat}, {school.location.lon}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SchoolsSection: React.FC<SchoolsSectionProps> = ({
  primarySchools,
  secondarySchools,
}) => {
  const sortedPrimary = [...primarySchools].sort((a, b) => a.distance.value - b.distance.value);
  const sortedSecondary = [...secondarySchools].sort((a, b) => a.distance.value - b.distance.value);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <SchoolIcon className="w-6 h-6 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-900">Nearby Schools</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {primarySchools.length + secondarySchools.length} schools within the area
        </p>
      </CardHeader>

      <CardContent>
        {sortedPrimary.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Primary Schools ({sortedPrimary.length})
            </h4>
            <div className="space-y-2">
              {sortedPrimary.map((school, index) => (
                <SchoolCard key={index} school={school} isPrimary={true} />
              ))}
            </div>
          </div>
        )}

        {sortedSecondary.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Secondary Schools ({sortedSecondary.length})
            </h4>
            <div className="space-y-2">
              {sortedSecondary.map((school, index) => (
                <SchoolCard key={index} school={school} isPrimary={false} />
              ))}
            </div>
          </div>
        )}

        {primarySchools.length === 0 && secondarySchools.length === 0 && (
          <p className="text-center text-gray-500 py-8">No schools data available</p>
        )}
      </CardContent>
    </Card>
  );
};
