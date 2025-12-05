import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap, Clock, ExternalLink, Bell, BellOff, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { openBookingPage } from '../services/bookingService';

export interface MistakeFare {
  id: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  normalPrice: number;
  mistakePrice: number;
  discount: number;
  airline: string;
  departureDate: string;
  expiresIn: string; // e.g., "2 hours", "30 minutes"
  isVerified: boolean;
  bookingClass: string;
}

interface MistakeFareAlertProps {
  fares: MistakeFare[];
  loading: boolean;
  onRefresh: () => void;
  isSubscribed: boolean;
  onToggleSubscription: () => void;
  origin: string;
  onOriginChange: (origin: string) => void;
}

export const MistakeFareAlert: React.FC<MistakeFareAlertProps> = ({
  fares,
  loading,
  onRefresh,
  isSubscribed,
  onToggleSubscription,
  origin,
  onOriginChange
}) => {
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  // Simulate countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key] > 0) {
            updated[key] -= 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initialize timers for new fares
  useEffect(() => {
    const newTimers: Record<string, number> = {};
    fares.forEach(fare => {
      if (!timeLeft[fare.id]) {
        // Parse expiresIn to seconds (simplified)
        const match = fare.expiresIn.match(/(\d+)\s*(hour|minute|min)/i);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          newTimers[fare.id] = unit.startsWith('hour') ? value * 3600 : value * 60;
        } else {
          newTimers[fare.id] = 3600; // Default 1 hour
        }
      }
    });
    if (Object.keys(newTimers).length > 0) {
      setTimeLeft(prev => ({ ...prev, ...newTimers }));
    }
  }, [fares]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return 'EXPIRED';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const handleBook = (fare: MistakeFare) => {
    openBookingPage({
      origin: fare.origin,
      destination: fare.destination,
      departureDate: fare.departureDate,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-xl p-5 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Zap size={24} className="text-yellow-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Mistake Fare Alerts
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">
                  PRO Feature
                </span>
              </h2>
              <p className="text-sm text-white/80 mt-0.5">
                Airlines accidentally post fares up to 90% off. Grab them before they're fixed!
              </p>
            </div>
          </div>

          <button
            onClick={onToggleSubscription}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isSubscribed
              ? 'bg-white/20 hover:bg-white/30'
              : 'bg-white text-orange-600 hover:bg-white/90'
              }`}
          >
            {isSubscribed ? (
              <>
                <Bell size={16} />
                Alerts On
              </>
            ) : (
              <>
                <BellOff size={16} />
                Enable Alerts
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
            <Sparkles size={14} />
            <span>{fares.length} active deals</span>
          </div>

          <div className="flex-1 max-w-xs">
            <div className="relative">
              <input
                type="text"
                value={origin}
                onChange={(e) => onOriginChange(e.target.value.toUpperCase())}
                placeholder="Filter by Origin (e.g. JFK)"
                maxLength={3}
                className="w-full pl-3 pr-3 py-1.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none text-white placeholder:text-white/60 uppercase text-sm"
              />
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors ml-auto"
          >
            <Clock size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="text-amber-800 font-medium">How Mistake Fares Work</p>
          <p className="text-amber-700 mt-0.5">
            Airlines sometimes post incorrect prices due to human error or system glitches.
            These fares are usually honored but can be fixed within hours. Book fast!
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-500 mb-3 animate-pulse">
            <Zap size={24} />
          </div>
          <p className="text-slate-600">Scanning for mistake fares...</p>
        </div>
      )}

      {/* Fares Grid */}
      {!loading && fares.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fares
            .filter(fare => !origin || fare.origin.includes(origin))
            .map((fare) => {
              const seconds = timeLeft[fare.id] || 0;
              const isExpired = seconds <= 0;
              const isUrgent = seconds < 1800; // Less than 30 minutes

              return (
                <div
                  key={fare.id}
                  className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${isExpired
                    ? 'border-slate-200 opacity-60'
                    : isUrgent
                      ? 'border-red-400 shadow-lg shadow-red-100'
                      : 'border-amber-300 shadow-md'
                    }`}
                >
                  {/* Urgency Banner */}
                  <div className={`px-4 py-2 flex items-center justify-between ${isExpired
                    ? 'bg-slate-100'
                    : isUrgent
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500'
                    }`}>
                    <div className="flex items-center gap-2 text-white">
                      <Zap size={14} />
                      <span className="font-bold text-sm">
                        {fare.discount}% OFF - MISTAKE FARE
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-mono ${isExpired ? 'text-slate-500' : 'text-white'
                      }`}>
                      <Clock size={12} />
                      <span>{formatTime(seconds)}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Route */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {fare.originCity} → {fare.destinationCity}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {fare.origin} → {fare.destination} • {fare.airline}
                        </p>
                      </div>
                      {fare.isVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <p className="text-sm text-slate-600 mb-3">
                      {new Date(fare.departureDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>

                    {/* Price */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-slate-400 line-through text-sm">${fare.normalPrice}</p>
                        <p className="text-3xl font-bold text-green-600">${fare.mistakePrice}</p>
                        <p className="text-xs text-slate-500">{fare.bookingClass}</p>
                      </div>
                      <Button
                        onClick={() => handleBook(fare)}
                        disabled={isExpired}
                        size="sm"
                        className={`flex items-center gap-1 ${isExpired
                          ? 'bg-slate-300'
                          : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                          }`}
                      >
                        {isExpired ? 'Expired' : 'Book Now'}
                        {!isExpired && <ExternalLink size={14} />}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Empty State */}
      {!loading && fares.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
            <Zap size={24} />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No Mistake Fares Right Now</h3>
          <p className="text-slate-500 text-sm mb-4">
            Mistake fares are rare but amazing. Enable alerts to get notified instantly!
          </p>
          {!isSubscribed && (
            <Button onClick={onToggleSubscription} size="sm">
              <Bell size={14} className="mr-1" />
              Enable Alerts
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
