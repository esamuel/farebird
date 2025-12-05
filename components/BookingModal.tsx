import React, { useState, useEffect } from 'react';
import {
  X,
  Plane,
  User,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Clock,
  Luggage,
  Shield,
  ChevronLeft
} from 'lucide-react';
import { Button } from './ui/Button';
import { Flight } from '../types';
import {
  DuffelOffer,
  DuffelPassenger,
  DuffelService,
  isDuffelEnabled,
  getOffer,
  createOrder,
  duffelOfferToFlight,
  parseDuration
} from '../services/duffelService';
import {
  isPayPalEnabled,
  renderPayPalButtons,
  PayPalOrderDetails
} from '../services/paypalService';

// ==========================================
// 🔧 TYPES
// ==========================================

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: Flight & { duffelOfferId?: string };
  duffelOffer?: DuffelOffer;
}

type BookingStep = 'details' | 'passengers' | 'extras' | 'payment' | 'confirmation';

interface PassengerForm {
  given_name: string;
  family_name: string;
  email: string;
  phone_number: string;
  born_on: string;
  gender: 'male' | 'female' | '';
  title: 'mr' | 'ms' | 'mrs' | 'miss' | 'dr' | '';
}

// ==========================================
// 🎨 COMPONENT
// ==========================================

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  flight,
  duffelOffer: initialOffer,
}) => {
  // State
  const [step, setStep] = useState<BookingStep>('details');
  const [offer, setOffer] = useState<DuffelOffer | null>(initialOffer || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);

  // Passenger form state
  const [passengers, setPassengers] = useState<PassengerForm[]>([{
    given_name: '',
    family_name: '',
    email: '',
    phone_number: '',
    born_on: '',
    gender: '',
    title: '',
  }]);

  // Selected extras
  const [selectedServices, setSelectedServices] = useState<Map<string, number>>(new Map());

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  // Load offer details if we have a Duffel offer ID
  useEffect(() => {
    if (isOpen && flight.duffelOfferId && !offer && isDuffelEnabled()) {
      loadOffer();
    }
  }, [isOpen, flight.duffelOfferId]);

  // Render PayPal buttons when on payment step
  useEffect(() => {
    if (step === 'payment' && paymentMethod === 'paypal' && isPayPalEnabled()) {
      const cleanup = renderPayPalButtons('paypal-button-container', {
        amount: calculateTotal(),
        currency: flight.currency || 'USD',
        description: `Flight ${flight.flightNumber} - ${flight.origin} to ${flight.destination}`,
        referenceId: flight.duffelOfferId || flight.id,
        onApprove: handlePayPalApprove,
        onError: (err) => setError(err.message),
        onCancel: () => setError('Payment cancelled'),
      });

      return () => {
        cleanup.then(fn => fn()).catch(() => { });
      };
    }
  }, [step, paymentMethod]);

  const loadOffer = async () => {
    if (!flight.duffelOfferId) return;

    setLoading(true);
    setError(null);

    try {
      const offerData = await getOffer(flight.duffelOfferId);
      setOffer(offerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flight details');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (): number => {
    let total = flight.price;

    // Add selected services
    if (offer) {
      for (const [serviceId, quantity] of selectedServices) {
        const service = offer.available_services?.find(s => s.id === serviceId);
        if (service) {
          total += parseFloat(service.total_amount) * quantity;
        }
      }
    }

    return total;
  };

  const handlePassengerChange = (index: number, field: keyof PassengerForm, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const validatePassengers = (): boolean => {
    for (const p of passengers) {
      if (!p.given_name || !p.family_name || !p.email || !p.born_on) {
        setError('Please fill in all required passenger details');
        return false;
      }
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }
    return true;
  };

  const handlePayPalApprove = async (orderId: string, _payerInfo: PayPalOrderDetails['payer']) => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, you would:
      // 1. Verify the PayPal payment on your backend
      // 2. Create the Duffel order with the payment confirmation
      // For now, we'll simulate the booking

      if (isDuffelEnabled() && flight.duffelOfferId) {
        const duffelPassengers: DuffelPassenger[] = passengers.map((p, idx) => ({
          id: `passenger_${idx}`,
          type: 'adult' as const,
          given_name: p.given_name,
          family_name: p.family_name,
          email: p.email,
          phone_number: p.phone_number,
          born_on: p.born_on,
          gender: p.gender as 'male' | 'female' | undefined,
          title: p.title as DuffelPassenger['title'],
        }));

        const services = Array.from(selectedServices.entries()).map(([id, quantity]) => ({
          id,
          quantity,
        }));

        const order = await createOrder({
          offer_id: flight.duffelOfferId,
          passengers: duffelPassengers,
          services: services.length > 0 ? services : undefined,
          metadata: {
            paypal_order_id: orderId,
          },
        });

        setBookingReference(order.booking_reference);
      } else {
        // Fallback for non-Duffel bookings
        setBookingReference(`FB${Date.now().toString(36).toUpperCase()}`);
      }

      setStep('confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!validatePassengers()) return;

    setLoading(true);
    setError(null);

    try {
      if (isDuffelEnabled() && flight.duffelOfferId) {
        const duffelPassengers: DuffelPassenger[] = passengers.map((p, idx) => ({
          id: `passenger_${idx}`,
          type: 'adult' as const,
          given_name: p.given_name,
          family_name: p.family_name,
          email: p.email,
          phone_number: p.phone_number,
          born_on: p.born_on,
          gender: p.gender as 'male' | 'female' | undefined,
          title: p.title as DuffelPassenger['title'],
        }));

        const services = Array.from(selectedServices.entries()).map(([id, quantity]) => ({
          id,
          quantity,
        }));

        // In production, you would use Duffel's payment component here
        // For now, create the order directly (requires Duffel balance)
        const order = await createOrder({
          offer_id: flight.duffelOfferId,
          passengers: duffelPassengers,
          services: services.length > 0 ? services : undefined,
        });

        setBookingReference(order.booking_reference);
        setStep('confirmation');
      } else {
        // Demo mode - simulate booking
        await new Promise(resolve => setTimeout(resolve, 2000));
        setBookingReference(`FB${Date.now().toString(36).toUpperCase()}`);
        setStep('confirmation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setError(null);

    if (step === 'details') {
      setStep('passengers');
    } else if (step === 'passengers') {
      if (validatePassengers()) {
        setStep(offer?.available_services?.length ? 'extras' : 'payment');
      }
    } else if (step === 'extras') {
      setStep('payment');
    }
  };

  const prevStep = () => {
    setError(null);

    if (step === 'passengers') {
      setStep('details');
    } else if (step === 'extras') {
      setStep('passengers');
    } else if (step === 'payment') {
      setStep(offer?.available_services?.length ? 'extras' : 'passengers');
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              {step !== 'details' && step !== 'confirmation' && (
                <button
                  onClick={prevStep}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
              )}
              <h2 className="text-lg font-semibold text-slate-900">
                {step === 'details' && 'Flight Details'}
                {step === 'passengers' && 'Passenger Information'}
                {step === 'extras' && 'Add Extras'}
                {step === 'payment' && 'Payment'}
                {step === 'confirmation' && 'Booking Confirmed!'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Progress Steps */}
          {step !== 'confirmation' && (
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                {['details', 'passengers', 'extras', 'payment'].map((s, idx) => {
                  const steps = ['details', 'passengers', 'extras', 'payment'];
                  const currentIdx = steps.indexOf(step);
                  const isActive = idx <= currentIdx;
                  const isCurrent = s === step;

                  // Skip extras step if no services available
                  if (s === 'extras' && !offer?.available_services?.length) {
                    return null;
                  }

                  return (
                    <div key={s} className="flex items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${isCurrent ? 'bg-sky-600 text-white' : isActive ? 'bg-sky-100 text-sky-600' : 'bg-slate-200 text-slate-500'}
                      `}>
                        {idx + 1}
                      </div>
                      {idx < 3 && (
                        <div className={`w-12 h-0.5 mx-2 ${isActive ? 'bg-sky-200' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Step: Flight Details */}
            {step === 'details' && (
              <div className="space-y-6">
                {/* Flight Summary */}
                <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl p-5 border border-sky-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Plane className="text-sky-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{flight.airline}</p>
                      <p className="text-sm text-slate-500">{flight.flightNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{formatTime(flight.departureTime)}</p>
                      <p className="text-sm text-slate-600">{flight.origin}</p>
                      <p className="text-xs text-slate-400">{formatDate(flight.departureTime)}</p>
                    </div>

                    <div className="flex-1 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-px flex-1 bg-slate-300" />
                        <div className="flex flex-col items-center">
                          <Clock size={14} className="text-slate-400 mb-1" />
                          <span className="text-xs text-slate-500">{flight.duration}</span>
                          <span className="text-xs text-green-600 font-medium">
                            {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                          </span>
                        </div>
                        <div className="h-px flex-1 bg-slate-300" />
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">{formatTime(flight.arrivalTime)}</p>
                      <p className="text-sm text-slate-600">{flight.destination}</p>
                    </div>
                  </div>

                  {/* Return Flight */}
                  {flight.returnFlight && (
                    <>
                      <div className="my-4 border-t border-slate-200 border-dashed"></div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Plane className="text-sky-600 rotate-180" size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{flight.returnFlight.airline}</p>
                          <p className="text-sm text-slate-500">{flight.returnFlight.flightNumber}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900">{formatTime(flight.returnFlight.departureTime)}</p>
                          <p className="text-sm text-slate-600">{flight.destination}</p>
                          <p className="text-xs text-slate-400">{formatDate(flight.returnFlight.departureTime)}</p>
                        </div>

                        <div className="flex-1 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-px flex-1 bg-slate-300" />
                            <div className="flex flex-col items-center">
                              <Clock size={14} className="text-slate-400 mb-1" />
                              <span className="text-xs text-slate-500">{flight.returnFlight.duration}</span>
                              <span className="text-xs text-green-600 font-medium">
                                {flight.returnFlight.stops === 0 ? 'Direct' : `${flight.returnFlight.stops} stop${flight.returnFlight.stops > 1 ? 's' : ''}`}
                              </span>
                            </div>
                            <div className="h-px flex-1 bg-slate-300" />
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900">{formatTime(flight.returnFlight.arrivalTime)}</p>
                          <p className="text-sm text-slate-600">{flight.origin}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">Price Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Base fare (1 adult)</span>
                      <span className="text-slate-900">${flight.price.toFixed(2)}</span>
                    </div>
                    {flight.baggageFees && (
                      <>
                        {flight.baggageFees.carryOn > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Carry-on bag</span>
                            <span className="text-slate-500">+${flight.baggageFees.carryOn.toFixed(2)}</span>
                          </div>
                        )}
                        {flight.baggageFees.checkedBag > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Checked bag</span>
                            <span className="text-slate-500">+${flight.baggageFees.checkedBag.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="pt-3 border-t border-slate-200 flex justify-between">
                      <span className="font-semibold text-slate-900">Total</span>
                      <span className="font-bold text-xl text-slate-900">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Fare Conditions */}
                {offer?.conditions && (
                  <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
                    <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                      <Shield size={16} />
                      Fare Conditions
                    </h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {offer.conditions.refund_before_departure && (
                        <li>
                          {offer.conditions.refund_before_departure.allowed
                            ? `✓ Refundable (${offer.conditions.refund_before_departure.penalty_amount ? `$${offer.conditions.refund_before_departure.penalty_amount} fee` : 'no fee'})`
                            : '✗ Non-refundable'
                          }
                        </li>
                      )}
                      {offer.conditions.change_before_departure && (
                        <li>
                          {offer.conditions.change_before_departure.allowed
                            ? `✓ Changes allowed (${offer.conditions.change_before_departure.penalty_amount ? `$${offer.conditions.change_before_departure.penalty_amount} fee` : 'no fee'})`
                            : '✗ No changes allowed'
                          }
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Step: Passengers */}
            {step === 'passengers' && (
              <div className="space-y-6">
                {passengers.map((passenger, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="text-slate-600" size={18} />
                      <h3 className="font-semibold text-slate-900">Passenger {idx + 1}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Title
                        </label>
                        <select
                          value={passenger.title}
                          onChange={(e) => handlePassengerChange(idx, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        >
                          <option value="">Select</option>
                          <option value="mr">Mr</option>
                          <option value="ms">Ms</option>
                          <option value="mrs">Mrs</option>
                          <option value="miss">Miss</option>
                          <option value="dr">Dr</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Gender
                        </label>
                        <select
                          value={passenger.gender}
                          onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={passenger.given_name}
                          onChange={(e) => handlePassengerChange(idx, 'given_name', e.target.value)}
                          placeholder="As on passport"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={passenger.family_name}
                          onChange={(e) => handlePassengerChange(idx, 'family_name', e.target.value)}
                          placeholder="As on passport"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={passenger.born_on}
                          onChange={(e) => handlePassengerChange(idx, 'born_on', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={passenger.email}
                          onChange={(e) => handlePassengerChange(idx, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={passenger.phone_number}
                          onChange={(e) => handlePassengerChange(idx, 'phone_number', e.target.value)}
                          placeholder="+1 234 567 8900"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step: Extras */}
            {step === 'extras' && offer?.available_services && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-4">
                  Add extras to enhance your journey
                </p>

                {offer.available_services.map((service) => (
                  <div
                    key={service.id}
                    className={`
                      p-4 rounded-xl border-2 transition-colors cursor-pointer
                      ${selectedServices.has(service.id)
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-slate-200 hover:border-slate-300'
                      }
                    `}
                    onClick={() => {
                      const newSelected = new Map(selectedServices);
                      if (newSelected.has(service.id)) {
                        newSelected.delete(service.id);
                      } else {
                        newSelected.set(service.id, 1);
                      }
                      setSelectedServices(newSelected);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${selectedServices.has(service.id) ? 'bg-sky-100' : 'bg-slate-100'}
                        `}>
                          <Luggage className={selectedServices.has(service.id) ? 'text-sky-600' : 'text-slate-500'} size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {service.type === 'baggage'
                              ? `${service.metadata?.type === 'checked' ? 'Checked Bag' : 'Carry-on Bag'} (${service.metadata?.maximum_weight_kg}kg)`
                              : service.type
                            }
                          </p>
                          <p className="text-sm text-slate-500">
                            {service.metadata?.disclosures?.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          +${parseFloat(service.total_amount).toFixed(2)}
                        </p>
                        {selectedServices.has(service.id) && (
                          <p className="text-xs text-sky-600">Selected</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step: Payment */}
            {step === 'payment' && (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        {flight.returnFlight ? 'Round-trip' : 'Flight'} ({flight.origin} {flight.returnFlight ? '⇄' : '→'} {flight.destination})
                      </span>
                      <span>${flight.price.toFixed(2)}</span>
                    </div>
                    {Array.from(selectedServices.entries()).map(([serviceId, qty]) => {
                      const service = offer?.available_services?.find(s => s.id === serviceId);
                      if (!service) return null;
                      return (
                        <div key={serviceId} className="flex justify-between">
                          <span className="text-slate-600">
                            {service.type === 'baggage' ? 'Extra Baggage' : service.type} x{qty}
                          </span>
                          <span>+${(parseFloat(service.total_amount) * qty).toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div className="pt-2 border-t border-slate-300 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-lg">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`
                        p-4 rounded-xl border-2 transition-colors flex items-center gap-3
                        ${paymentMethod === 'card'
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <CreditCard className={paymentMethod === 'card' ? 'text-sky-600' : 'text-slate-500'} size={24} />
                      <span className={paymentMethod === 'card' ? 'text-sky-700 font-medium' : 'text-slate-700'}>
                        Credit Card
                      </span>
                    </button>

                    {isPayPalEnabled() && (
                      <button
                        onClick={() => setPaymentMethod('paypal')}
                        className={`
                          p-4 rounded-xl border-2 transition-colors flex items-center gap-3
                          ${paymentMethod === 'paypal'
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-slate-200 hover:border-slate-300'
                          }
                        `}
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={paymentMethod === 'paypal' ? '#0070ba' : '#64748b'}>
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.629h6.724c2.237 0 3.913.476 4.98 1.414.476.42.83.925 1.05 1.5.228.593.303 1.286.222 2.06-.01.092-.023.184-.038.278-.49 3.166-2.168 4.776-4.987 4.776h-1.59a.77.77 0 0 0-.758.63l-.727 4.588-.206 1.305a.641.641 0 0 1-.633.74h-2.66z" />
                        </svg>
                        <span className={paymentMethod === 'paypal' ? 'text-sky-700 font-medium' : 'text-slate-700'}>
                          PayPal
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* PayPal Button Container */}
                {paymentMethod === 'paypal' && (
                  <div id="paypal-button-container" className="min-h-[150px]" />
                )}

                {/* Card Payment Form Placeholder */}
                {paymentMethod === 'card' && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 text-center">
                      {isDuffelEnabled()
                        ? 'Duffel secure payment will be processed'
                        : 'Demo mode - No actual payment will be processed'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step: Confirmation */}
            {step === 'confirmation' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-600" size={40} />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Booking Confirmed!
                </h3>

                <p className="text-slate-600 mb-6">
                  Your flight has been booked successfully.
                </p>

                {bookingReference && (
                  <div className="bg-slate-100 rounded-xl p-4 inline-block mb-6">
                    <p className="text-sm text-slate-500 mb-1">Booking Reference</p>
                    <p className="text-2xl font-mono font-bold text-slate-900">{bookingReference}</p>
                  </div>
                )}

                <div className="bg-sky-50 rounded-xl p-4 border border-sky-200 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-sky-900 mb-2">What's next?</h4>
                  <ul className="text-sm text-sky-700 space-y-2">
                    <li>✓ Confirmation email sent to {passengers[0]?.email}</li>
                    <li>✓ E-ticket will be available within 24 hours</li>
                    <li>✓ Check-in opens 24 hours before departure</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {step !== 'confirmation' && (
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-2xl font-bold text-slate-900">${calculateTotal().toFixed(2)}</p>
              </div>

              {step === 'payment' && paymentMethod === 'card' ? (
                <Button
                  onClick={handleCardPayment}
                  size="lg"
                  isLoading={loading}
                  className="min-w-[160px]"
                >
                  Pay Now
                </Button>
              ) : step !== 'payment' ? (
                <Button
                  onClick={nextStep}
                  size="lg"
                  isLoading={loading}
                  className="min-w-[160px]"
                >
                  Continue <ArrowRight size={18} className="ml-2" />
                </Button>
              ) : null}
            </div>
          )}

          {/* Close button for confirmation */}
          {step === 'confirmation' && (
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-center">
              <Button onClick={onClose} size="lg" className="min-w-[200px]">
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
