import React, { useState } from 'react';
import { Clock, Plane, MapPin, Percent, Users, Loader2, AlertTriangle, Calendar, ExternalLink } from 'lucide-react';
import { LastMinuteDeal } from '../types';
import { Button } from './ui/Button';
import { openBookingPage, getBookingProviderName } from '../services/bookingService';

interface LastMinuteDealsProps {
  onSearch: (origin: string, maxBudget?: number) => void;
  loading: boolean;
  deals: LastMinuteDeal[];
  onSelectDeal: (deal: LastMinuteDeal) => void;
  origin: string;
  onOriginChange: (origin: string) => void;
}

export const LastMinuteDeals: React.FC<LastMinuteDealsProps> = ({
  onSearch,
  loading,
  deals,
  onSelectDeal,
  origin,
  onOriginChange
}) => {
  const [maxBudget, setMaxBudget] = useState('');

  const handleSearch = () => {
    const budget = maxBudget ? parseInt(maxBudget) : undefined;
    onSearch(origin, budget);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (isoString: string) => {
    const departure = new Date(isoString);
    const today = new Date();
    const diffTime = departure.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const handleBookNow = (deal: LastMinuteDeal) => {
    // Open booking page in new tab
    openBookingPage({
      origin: deal.origin,
      destination: deal.destination,
      departureDate: deal.departureTime,
    });
    // Also save to trips
    onSelectDeal(deal);
  };

  return (
    <div className="space-y-4">
      {/* Search Section */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border border-orange-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
            <Clock className="text-white" size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Last Minute Deals</h3>
            <p className="text-xs text-slate-600">Grab deeply discounted flights departing within 7 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">
              Departing From
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={origin}
                onChange={(e) => onOriginChange(e.target.value.toUpperCase())}
                placeholder="JFK"
                maxLength={3}
                className="w-full pl-9 pr-3 py-2 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-900 placeholder:text-slate-400 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">
              Max Budget (Optional)
            </label>
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="e.g., 300"
              className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              isLoading={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Clock size={16} className="mr-2" />
              Find Deals
            </Button>
          </div>
        </div>

        <p className="text-xs text-orange-700 flex items-center gap-1">
          <AlertTriangle size={12} />
          Deals are limited and sell out fast. Book quickly!
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
          <Loader2 className="mx-auto text-orange-500 animate-spin mb-2" size={32} />
          <p className="text-sm text-slate-600">Hunting for the best last-minute deals...</p>
        </div>
      )}

      {/* Deals Grid */}
      {!loading && deals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Discount Banner */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 flex justify-between items-center">
                <div className="flex items-center gap-2 text-white">
                  <Percent size={14} />
                  <span className="font-bold">{deal.discount}% OFF</span>
                </div>
                <div className="flex items-center gap-1 text-orange-100 text-xs">
                  <Users size={12} />
                  <span>{deal.seatsLeft} seats left</span>
                </div>
              </div>

              <div className="p-4">
                {/* Destination */}
                <div className="mb-3">
                  <h4 className="font-bold text-lg text-slate-900">{deal.destinationCity}</h4>
                  <p className="text-xs text-slate-500">{deal.origin} → {deal.destination}</p>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                  <Calendar size={14} className="text-orange-500" />
                  <span>{formatDate(deal.departureTime)}</span>
                  <span className="text-orange-600 font-medium">({getDaysUntil(deal.departureTime)})</span>
                </div>

                {/* Flight Info */}
                <div className="flex items-center justify-between text-sm text-slate-600 mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    <Plane size={14} className="text-slate-400" />
                    <span>{deal.airline}</span>
                  </div>
                  <span>{deal.duration}</span>
                  <span className={deal.stops === 0 ? 'text-green-600' : 'text-slate-500'}>
                    {deal.stops === 0 ? 'Direct' : `${deal.stops} stop`}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-slate-400 line-through text-sm">${deal.originalPrice}</span>
                    <div className="text-2xl font-bold text-slate-900">${deal.price}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleBookNow(deal)}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 flex items-center gap-1"
                  >
                    Book Now
                    <ExternalLink size={12} />
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-right">via {getBookingProviderName()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && deals.length === 0 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-500 mb-4">
            <Clock size={24} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Find Last Minute Deals</h3>
          <p className="text-slate-500 text-sm">Enter your departure airport and click "Find Deals" to discover discounted flights.</p>
        </div>
      )}
    </div>
  );
};
