import React, { useState } from 'react';
import { Flight } from '../types';
import { Plane, ArrowRight, Tag, Calendar, ExternalLink, ChevronDown, ShoppingCart } from 'lucide-react';
import { Button, ButtonProps } from './ui/Button';
import { openBookingPage, getBookingProviderName, hasDirectBooking, getBookingOptions } from '../services/bookingService';
import { isDuffelEnabled } from '../services/duffelService';
import { BookingModal } from './BookingModal';

interface FlightCardProps {
  flight: Flight & { duffelOfferId?: string };
  onSelect: (flight: Flight) => void;
  actionLabel?: string;
  actionVariant?: ButtonProps['variant'];
  showBookButton?: boolean;
  enableInAppBooking?: boolean; // Use new in-app booking flow
}

export const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  onSelect,
  actionLabel = 'Select Flight',
  actionVariant = 'primary',
  showBookButton = false,
  enableInAppBooking = true // Default to in-app booking when available
}) => {
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Check if in-app booking is available (Duffel configured or demo mode)
  const canBookInApp = enableInAppBooking && (isDuffelEnabled() || true); // Always allow for demo
  
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const bookingParams = {
    origin: flight.origin,
    destination: flight.destination,
    departureDate: flight.departureTime,
    airline: flight.airline,
    flightNumber: flight.flightNumber,
  };

  const handleBook = () => {
    if (canBookInApp) {
      setShowBookingModal(true);
    } else {
      openBookingPage(bookingParams);
    }
  };
  
  const bookingOptions = getBookingOptions(bookingParams);
  const hasDirect = hasDirectBooking(flight.airline);
  const providerName = getBookingProviderName(bookingParams);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow duration-300 group">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

        {/* Airline Info */}
        <div className="flex items-center gap-4 w-full md:w-1/4">
          <div className="h-10 w-10 rounded-full bg-sky-50 group-hover:bg-sky-100 transition-colors flex items-center justify-center text-sky-600">
            <Plane size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{flight.airline}</h3>
            <p className="text-xs text-slate-500">{flight.flightNumber}</p>
            <p className="text-xs text-sky-600 flex items-center gap-1 mt-0.5">
              <Calendar size={10} />
              {formatDate(flight.departureTime)}
            </p>
          </div>
        </div>

        {/* Route Info */}
        <div className="flex flex-1 items-center justify-center gap-6 w-full md:w-auto">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{formatTime(flight.departureTime)}</p>
            <p className="text-xs text-slate-500 uppercase">{flight.origin}</p>
          </div>

          <div className="flex flex-col items-center w-24">
            <p className="text-xs text-slate-400 mb-1">{flight.duration}</p>
            <div className="w-full h-[2px] bg-slate-200 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-200 p-1 rounded-full">
                <ArrowRight size={12} className="text-slate-400" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-1 font-medium">
              {flight.stops === 0 ? 'Direct' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
            </p>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">{formatTime(flight.arrivalTime)}</p>
            <p className="text-xs text-slate-500 uppercase">{flight.destination}</p>
          </div>
        </div>

        {/* Price & Action */}
        <div className="w-full md:w-1/4 flex flex-col items-end gap-2">
          <div>
            <div className="text-2xl font-bold text-slate-900">
              ${flight.price}
            </div>
            {flight.baggageFees && (flight.baggageFees.carryOn > 0 || flight.baggageFees.checkedBag > 0) && (
              <div className="text-xs text-slate-500 mt-1">
                Base fare
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onSelect(flight)}
              size="sm"
              variant={actionVariant}
            >
              {actionLabel}
            </Button>
            {showBookButton && (
              <div className="relative">
                <div className="flex">
                  {/* Primary Book Button - In-app or External */}
                  <Button
                    onClick={handleBook}
                    size="sm"
                    variant={canBookInApp ? 'primary' : 'outline'}
                    className={`flex items-center gap-1 ${!canBookInApp ? 'rounded-r-none border-r-0' : ''}`}
                  >
                    {canBookInApp ? (
                      <>Book Now <ShoppingCart size={12} /></>
                    ) : (
                      <>{hasDirect ? `Book on ${flight.airline.split(' ')[0]}` : 'Book'} <ExternalLink size={12} /></>
                    )}
                  </Button>
                  
                  {/* Dropdown for external booking options (only when not using in-app) */}
                  {!canBookInApp && (
                    <Button
                      onClick={() => setShowBookingOptions(!showBookingOptions)}
                      size="sm"
                      variant="outline"
                      className="px-2 rounded-l-none"
                    >
                      <ChevronDown size={14} className={`transition-transform ${showBookingOptions ? 'rotate-180' : ''}`} />
                    </Button>
                  )}
                </div>
                
                {/* Booking Options Dropdown (external providers) */}
                {showBookingOptions && !canBookInApp && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                      Book via
                    </div>
                    {bookingOptions.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          window.open(option.url, '_blank', 'noopener,noreferrer');
                          setShowBookingOptions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className={option.type === 'direct' ? 'font-medium text-sky-600' : 'text-slate-700'}>
                          {option.name}
                        </span>
                        {option.type === 'direct' && (
                          <span className="text-[10px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded">Direct</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {showBookButton && (
            <p className="text-[10px] text-slate-400 mt-1">
              {canBookInApp ? 'Book & pay securely in Farebird' : (hasDirect ? 'Direct airline booking' : `via ${providerName}`)}
            </p>
          )}
        </div>
      </div>
      
      {/* In-App Booking Modal */}
      {showBookingModal && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          flight={flight}
        />
      )}

      {flight.tags && flight.tags.length > 0 && (
        <div className="mt-4 flex gap-2 pt-4 border-t border-slate-100">
          {flight.tags.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlightCard;