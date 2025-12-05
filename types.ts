export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  duration: string;
  stops: number;
  tags?: string[]; // e.g., "Eco-friendly", "Fastest", "Cheapest"
  baggageFees?: {
    carryOn: number;
    checkedBag: number;
  };
  duffelOfferId?: string; // If set, this flight comes from Duffel and can be booked for real
}

export type CabinClass = 'economy' | 'premiumEconomy' | 'business' | 'first';

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  returnDate?: string;
  tripType: 'oneWay' | 'roundTrip';
  passengers: number;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  includeCarryOn?: boolean;
  includeCheckedBag?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export enum FlightSortOption {
  CHEAPEST = 'CHEAPEST',
  FASTEST = 'FASTEST',
  BEST = 'BEST'
}

export interface PriceMatrixCell {
  date: string;
  price: number | null;
  isSelected: boolean;
}

export interface VibeDestination {
  city: string;
  country: string;
  airport: string;
  vibe: string;
  description: string;
  estimatedPrice: number;
}

export type VibeCategory = 'nightlife' | 'hiking' | 'romantic' | 'beach' | 'culture' | 'adventure';

export interface LastMinuteDeal {
  id: string;
  origin: string;
  destination: string;
  destinationCity: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  originalPrice: number;
  discount: number;
  duration: string;
  stops: number;
  seatsLeft: number;
}