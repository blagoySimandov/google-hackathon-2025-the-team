import React, { useState } from 'react';
import { RenovationDetails, RenovationItem } from '../api/firestore/types';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Wrench, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';

interface RenovationDetailsSectionProps {
  renovationDetails: RenovationDetails;
}

const RenovationItemCard: React.FC<{ item: RenovationItem }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
            <Wrench className="w-5 h-5 text-orange-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{item.item}</h4>
            <p className="text-sm text-gray-500">
              €{item.price.toLocaleString()} • {item.amount}
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            €{item.price.toLocaleString()}
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
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Reason</p>
              <p className="text-sm text-gray-900">{item.reason}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Material</p>
                <p className="text-sm font-medium text-gray-900">{item.material}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Amount</p>
                <p className="text-sm font-medium text-gray-900">{item.amount}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Price</p>
              <p className="text-sm font-medium text-gray-900">
                €{item.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const RenovationDetailsSection: React.FC<RenovationDetailsSectionProps> = ({
  renovationDetails,
}) => {
  const sortedItems = [...renovationDetails.items].sort((a, b) => b.price - a.price);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wrench className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-gray-900">Renovation Details</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {renovationDetails.items.length} renovation item{renovationDetails.items.length === 1 ? '' : 's'} identified
        </p>
      </CardHeader>

      <CardContent>
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-700" />
              <span className="text-sm font-medium text-orange-900">Total Renovation Cost</span>
            </div>
            <span className="text-2xl font-bold text-orange-900">
              €{renovationDetails.total_cost.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {sortedItems.map((item, index) => (
            <RenovationItemCard key={index} item={item} />
          ))}
        </div>

        {renovationDetails.items.length === 0 && (
          <p className="text-center text-gray-500 py-8">No renovation items available</p>
        )}
      </CardContent>
    </Card>
  );
};
