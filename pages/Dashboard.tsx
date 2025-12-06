import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, MapPin, CheckCircle2, ArrowUpDown, Wifi, Cpu, TrendingDown, AlertCircle, Sparkles, ArrowLeftRight, ArrowRight, Clock, Users, Zap, Plane } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FlightCard } from '../components/FlightCard';
import { PriceChart } from '../components/PriceChart';
import { NaturalSearch } from '../components/NaturalSearch';
import { PriceMatrix } from '../components/PriceMatrix';
import { VibeSearch } from '../components/VibeSearch';
import { LastMinuteDeals } from '../components/LastMinuteDeals';
import { MistakeFareAlert, MistakeFare } from '../components/MistakeFareAlert';
import { DatePicker } from '../components/DatePicker';
import { TravelersSelector, CabinClass } from '../components/TravelersSelector';
import { BaggageCalculator } from '../components/BaggageCalculator';
import {
  searchFlightsWithAI,
  getPriceInsights,
  parseNaturalLanguageQuery,
  generatePriceMatrix,
  getVibeDestinations,
  getLastMinuteDeals,
  getMistakeFares
} from '../services/geminiService';
import { Flight, SearchParams, FlightSortOption, PriceMatrixCell, VibeCategory, LastMinuteDeal, CabinClass as CabinClassType } from '../types';
import { searchFlights as searchDuffelFlights, duffelOfferToFlight, isDuffelEnabled } from '../services/duffelService';

export const Dashboard: React.FC = () => {
  const [params, setParams] = useState<SearchParams>({
    origin: localStorage.getItem('farebird_home_airport') || 'JFK',
    destination: 'LHR',
    date: new Date().toISOString().split('T')[0],
    returnDate: '',
    tripType: 'oneWay',
    passengers: 1,
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'economy',
    includeCarryOn: false,
    includeCheckedBag: false
  });

  const [flights, setFlights] = useState<Flight[]>([]);
  const [dataSource, setDataSource] = useState<'API' | 'AI' | 'DUFFEL'>('AI');
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<FlightSortOption>(FlightSortOption.BEST);

  // New feature states
  const [searchMode, setSearchMode] = useState<'traditional' | 'natural' | 'vibe' | 'lastMinute' | 'mistakeFares'>('traditional');
  const [priceMatrix, setPriceMatrix] = useState<PriceMatrixCell[]>([]);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [vibeDestinations, setVibeDestinations] = useState<any[]>([]);
  const [loadingVibe, setLoadingVibe] = useState(false);
  const [parsingNL, setParsingNL] = useState(false);
  const [lastMinuteDeals, setLastMinuteDeals] = useState<LastMinuteDeal[]>([]);
  const [loadingLastMinute, setLoadingLastMinute] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTravelersSelector, setShowTravelersSelector] = useState(false);
  const [mistakeFares, setMistakeFares] = useState<MistakeFare[]>([]);
  const [loadingMistakeFares, setLoadingMistakeFares] = useState(false);
  const [mistakeFareAlerts, setMistakeFareAlerts] = useState(false);

  // Load initial demo data on mount
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (overrideParams?: SearchParams) => {
    const searchParams = overrideParams || params;
    if (!searchParams.origin || !searchParams.destination) return;

    setLoading(true);
    setLoadingInsight(true);
    setLoadingMatrix(true);
    setInsight(null);
    setFlights([]);
    setPriceMatrix([]);

    try {
      const flightPromise = searchFlightsWithAI(searchParams);
      const insightPromise = getPriceInsights(searchParams.origin, searchParams.destination);
      const matrixPromise = generatePriceMatrix(searchParams);

      const [flightResults, insightResult, matrixData] = await Promise.all([
        flightPromise,
        insightPromise,
        matrixPromise
      ]);

      setFlights(flightResults.data);
      setDataSource(flightResults.source);
      setInsight(insightResult);

      // Transform matrix data
      const matrixCells: PriceMatrixCell[] = matrixData.map((item: any) => ({
        date: item.date,
        price: item.price,
        isSelected: item.date === searchParams.date
      }));
      setPriceMatrix(matrixCells);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
      setLoadingInsight(false);
      setLoadingMatrix(false);
    }
  };

  const handleNaturalLanguageSearch = async (query: string) => {
    setParsingNL(true);
    try {
      const parsed = await parseNaturalLanguageQuery(query);
      if (parsed) {
        const newParams: SearchParams = {
          ...params,
          origin: parsed.origin || params.origin,
          destination: parsed.destination || params.destination,
          date: parsed.date || params.date,
          passengers: parsed.passengers || params.passengers
        };
        setParams(newParams);
        setNotification('✨ Query parsed! Searching flights...');
        setTimeout(() => setNotification(null), 2000);

        // Trigger search with the new params directly to avoid stale closure
        handleSearch(newParams);
      }
    } catch (error) {
      console.error("NL Parse Error:", error);
      setNotification('❌ Could not parse query. Try being more specific.');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setParsingNL(false);
    }
  };

  const handleVibeSearch = async (vibe: VibeCategory, budget?: number) => {
    setLoadingVibe(true);
    try {
      const destinations = await getVibeDestinations(vibe, params.origin, budget);
      setVibeDestinations(destinations);
    } catch (error) {
      console.error("Vibe search error:", error);
    } finally {
      setLoadingVibe(false);
    }
  };

  const handleLastMinuteSearch = async (origin: string, maxBudget?: number) => {
    setLoadingLastMinute(true);
    try {
      const deals = await getLastMinuteDeals(origin, maxBudget);
      setLastMinuteDeals(deals);
    } catch (error) {
      console.error("Last minute deals error:", error);
    } finally {
      setLoadingLastMinute(false);
    }
  };

  const handleSelectLastMinuteDeal = (deal: LastMinuteDeal) => {
    const saved = JSON.parse(localStorage.getItem('farebird_saved') || '[]');
    const flightData = {
      id: deal.id,
      airline: deal.airline,
      flightNumber: deal.flightNumber,
      origin: deal.origin,
      destination: deal.destination,
      departureTime: deal.departureTime,
      arrivalTime: deal.arrivalTime,
      price: deal.price,
      currency: 'USD',
      duration: deal.duration,
      stops: deal.stops,
      tags: [`${deal.discount}% OFF`, 'Last Minute']
    };
    if (!saved.some((f: Flight) => f.id === flightData.id)) {
      localStorage.setItem('farebird_saved', JSON.stringify([...saved, flightData]));
      setNotification(`Last minute deal to ${deal.destinationCity} saved!`);
    } else {
      setNotification(`This deal is already in your saved trips.`);
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMatrixDateSelect = (date: string) => {
    setParams({ ...params, date });
    setPriceMatrix(priceMatrix.map(cell => ({
      ...cell,
      isSelected: cell.date === date
    })));
    handleSearch();
  };

  // Mistake Fare handlers
  const handleFetchMistakeFares = async () => {
    setLoadingMistakeFares(true);
    try {
      const fares = await getMistakeFares();
      setMistakeFares(fares);
    } catch (error) {
      console.error('Error fetching mistake fares:', error);
    } finally {
      setLoadingMistakeFares(false);
    }
  };

  const handleToggleMistakeFareAlerts = () => {
    setMistakeFareAlerts(!mistakeFareAlerts);
    if (!mistakeFareAlerts) {
      setNotification('Mistake fare alerts enabled! You\'ll be notified of new deals.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleSaveFlight = (flight: Flight) => {
    const saved = JSON.parse(localStorage.getItem('farebird_saved') || '[]');
    if (!saved.some((f: Flight) => f.id === flight.id)) {
      localStorage.setItem('farebird_saved', JSON.stringify([...saved, flight]));
      setNotification(`Flight to ${flight.destination} saved to your trips!`);
    } else {
      setNotification(`This flight is already in your saved trips.`);
    }

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Duffel test search: uses real Duffel offers so bookings appear in Duffel dashboard
  const handleDuffelTestSearch = async () => {
    if (!isDuffelEnabled()) {
      setNotification('Duffel not configured. Add VITE_DUFFEL_API_KEY to use real bookings.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setLoading(true);
    setInsight(null);
    setPriceMatrix([]);

    try {
      const cabinMap: Record<CabinClassType, 'economy' | 'premium_economy' | 'business' | 'first'> = {
        economy: 'economy',
        premiumEconomy: 'premium_economy',
        business: 'business',
        first: 'first',
      };

      const offers = await searchDuffelFlights({
        slices: [
          {
            origin: params.origin,
            destination: params.destination,
            departure_date: params.date,
          },
        ],
        passengers: Array.from({ length: params.adults || 1 }).map(() => ({ type: 'adult' })),
        cabin_class: cabinMap[params.cabinClass as CabinClassType],
        return_offers: true,
      });

      const mapped: Flight[] = offers.map((offer) => ({
        ...duffelOfferToFlight(offer),
        tags: ['Duffel', 'Real inventory'],
      }));

      setFlights(mapped);
      setDataSource('DUFFEL');
      setNotification('Showing real Duffel offers. Booking will appear in your Duffel dashboard.');
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      console.error('Duffel search failed', error);
      setNotification('Duffel search failed. Check your DUFFEL_API_KEY and Duffel dashboard.');
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse duration string "2h 45m" into minutes for sorting
  const parseDuration = (durationStr: string): number => {
    const parts = durationStr.split(' ');
    let minutes = 0;
    for (const part of parts) {
      if (part.includes('h')) minutes += parseInt(part) * 60;
      if (part.includes('m')) minutes += parseInt(part);
    }
    return minutes;
  };

  // Calculate real cost with baggage
  const calculateRealCost = (flight: Flight): number => {
    let total = flight.price;
    if (params.includeCarryOn && flight.baggageFees?.carryOn) {
      total += flight.baggageFees.carryOn;
    }
    if (params.includeCheckedBag && flight.baggageFees?.checkedBag) {
      total += flight.baggageFees.checkedBag;
    }
    return total;
  };

  // Sorting Logic with real cost
  const sortedFlights = useMemo(() => {
    // First, filter by stops if maxStops is set
    let filtered = [...flights];
    if (params.maxStops !== undefined && params.maxStops < 2) {
      filtered = filtered.filter(flight => flight.stops <= params.maxStops);
    }

    // Then sort
    switch (sortBy) {
      case FlightSortOption.CHEAPEST:
        return filtered.sort((a, b) => calculateRealCost(a) - calculateRealCost(b));
      case FlightSortOption.FASTEST:
        return filtered.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration));
      case FlightSortOption.BEST:
      default:
        return filtered.sort((a, b) => {
          const scoreA = calculateRealCost(a) + (parseDuration(a.duration) * 0.5);
          const scoreB = calculateRealCost(b) + (parseDuration(b.duration) * 0.5);
          return scoreA - scoreB;
        });
    }
  }, [flights, sortBy, params.includeCarryOn, params.includeCheckedBag, params.maxStops]);

  // Clear results when switching modes
  useEffect(() => {
    setFlights([]);
    setPriceMatrix([]);
    setInsight(null);
    setVibeDestinations([]);
    setNotification(null);
  }, [searchMode]);

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle2 className="text-green-400" size={20} />
            <p className="text-sm font-medium">{notification}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Find Flights</h1>
          <p className="text-slate-500">Search and compare prices across 500+ airlines.</p>
        </div>

        {/* Search Mode Toggle */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setSearchMode('traditional')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${searchMode === 'traditional'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Traditional
          </button>
          <button
            onClick={() => setSearchMode('natural')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${searchMode === 'natural'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Sparkles size={14} />
            Natural
          </button>
          <button
            onClick={() => setSearchMode('vibe')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${searchMode === 'vibe'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            Vibe
          </button>
          <button
            onClick={() => setSearchMode('lastMinute')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${searchMode === 'lastMinute'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Clock size={14} />
            Last Minute
          </button>
          <button
            onClick={() => {
              setSearchMode('mistakeFares');
              if (mistakeFares.length === 0) handleFetchMistakeFares();
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${searchMode === 'mistakeFares'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
              : 'text-amber-600 hover:text-amber-700 bg-amber-50'
              }`}
          >
            <Zap size={14} />
            Mistake Fares
            <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded-full ml-1">PRO</span>
          </button>
        </div>
      </div>

      {/* Data Source Indicator */}
      {dataSource === 'AI' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
          <Cpu className="text-amber-600 flex-shrink-0" size={18} />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
              Demo Mode Active
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Showing AI-generated results. Go to <a href="/settings" className="underline font-medium">Settings</a> to add Amadeus API keys, or configure them in Netlify dashboard for production.
            </p>
          </div>
        </div>
      ) : dataSource === 'DUFFEL' ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
          <Plane className="text-emerald-600 flex-shrink-0" size={18} />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-emerald-800">Duffel Live Inventory</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Showing real offers from Duffel. Bookings should appear in your Duffel dashboard (test mode).
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
          <Wifi className="text-green-600 flex-shrink-0" size={18} />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-800">Live Data Active</h4>
            <p className="text-xs text-green-700 mt-0.5">
              Connected to Amadeus API. Showing real-time availability.
            </p>
          </div>
        </div>
      )}

      {/* Search Interface - Conditional based on mode */}
      {searchMode === 'natural' && (
        <NaturalSearch
          onParsed={handleNaturalLanguageSearch}
          isLoading={parsingNL}
          origin={params.origin}
          onOriginChange={(origin) => setParams({ ...params, origin })}
        />
      )}

      {searchMode === 'vibe' && (
        <VibeSearch
          onVibeSelect={handleVibeSearch}
          loading={loadingVibe}
          destinations={vibeDestinations}
          origin={params.origin}
          onOriginChange={(origin) => setParams({ ...params, origin })}
        />
      )}

      {searchMode === 'lastMinute' && (
        <LastMinuteDeals
          onSearch={handleLastMinuteSearch}
          loading={loadingLastMinute}
          deals={lastMinuteDeals}
          onSelectDeal={handleSelectLastMinuteDeal}
          origin={params.origin}
          onOriginChange={(origin) => setParams({ ...params, origin })}
        />
      )}

      {searchMode === 'mistakeFares' && (
        <MistakeFareAlert
          fares={mistakeFares}
          loading={loadingMistakeFares}
          onRefresh={handleFetchMistakeFares}
          isSubscribed={mistakeFareAlerts}
          onToggleSubscription={handleToggleMistakeFareAlerts}
          origin={params.origin}
          onOriginChange={(origin) => setParams({ ...params, origin })}
        />
      )}

      {searchMode === 'traditional' && (
        <>
          {/* Traditional Search Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            {/* Trip Type Toggle */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setParams({ ...params, tripType: 'oneWay', returnDate: '' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${params.tripType === 'oneWay'
                  ? 'bg-sky-100 text-sky-700 border-2 border-sky-500'
                  : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                  }`}
              >
                <ArrowRight size={16} />
                One Way
              </button>
              <button
                onClick={() => setParams({ ...params, tripType: 'roundTrip' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${params.tripType === 'roundTrip'
                  ? 'bg-sky-100 text-sky-700 border-2 border-sky-500'
                  : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                  }`}
              >
                <ArrowLeftRight size={16} />
                Round Trip
              </button>

              {/* Travelers & Class Button */}
              <button
                onClick={() => setShowTravelersSelector(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100 transition-all"
              >
                <Users size={16} />
                {params.adults + params.children + params.infants} Traveler{params.adults + params.children + params.infants !== 1 ? 's' : ''}, {params.cabinClass === 'economy' ? 'Economy' : params.cabinClass === 'premiumEconomy' ? 'Premium' : params.cabinClass === 'business' ? 'Business' : 'First'}
              </button>

              {/* Stops Filter */}
              <div className="relative">
                <select
                  value={params.maxStops ?? 2}
                  onChange={(e) => setParams({ ...params, maxStops: parseInt(e.target.value) })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100 transition-all appearance-none pr-8 cursor-pointer"
                >
                  <option value={0}>Direct only</option>
                  <option value={1}>Max 1 stop</option>
                  <option value={2}>Any stops</option>
                </select>
                <Plane size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1 mb-1 block">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={params.origin}
                    onChange={(e) => setParams({ ...params, origin: e.target.value.toUpperCase() })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none font-medium text-slate-900 placeholder:text-slate-400 uppercase"
                    placeholder="Origin (e.g. JFK)"
                    maxLength={3}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1 mb-1 block">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={params.destination}
                    onChange={(e) => setParams({ ...params, destination: e.target.value.toUpperCase() })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none font-medium text-slate-900 placeholder:text-slate-400 uppercase"
                    placeholder="Destination"
                    maxLength={3}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1 mb-1 block">
                  {params.tripType === 'roundTrip' ? 'Dates' : 'Departure'}
                </label>
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none font-medium text-slate-900 text-left text-sm relative"
                >
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  {params.date ? (
                    <span>
                      {new Date(params.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {params.tripType === 'roundTrip' && params.returnDate && (
                        <span> - {new Date(params.returnDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-400">Select dates</span>
                  )}
                </button>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={() => handleSearch()} isLoading={loading} className="w-full h-[42px]">
                  <Search size={18} className="mr-2" />
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap h-[42px]"
                  onClick={handleDuffelTestSearch}
                  isLoading={loading}
                >
                  <Plane size={16} className="mr-1" />
                  Duffel test search
                </Button>
              </div>
            </div>
          </div>

          {/* Baggage Calculator */}
          <BaggageCalculator
            includeCarryOn={params.includeCarryOn || false}
            includeCheckedBag={params.includeCheckedBag || false}
            onToggleCarryOn={(value) => setParams({ ...params, includeCarryOn: value })}
            onToggleCheckedBag={(value) => setParams({ ...params, includeCheckedBag: value })}
          />

          {/* Price Matrix */}
          <PriceMatrix
            matrix={priceMatrix}
            onDateSelect={handleMatrixDateSelect}
            loading={loadingMatrix}
          />
        </>
      )}

      {(searchMode === 'traditional' || searchMode === 'natural') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results Column */}
          <div className="lg:col-span-2 space-y-4">

            {/* Sorting Controls */}
            {flights.length > 0 && (
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-slate-500 font-medium">{flights.length} flights found</span>
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-500 mr-2">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as FlightSortOption)}
                    className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-sky-500 focus:border-sky-500 block p-1.5 outline-none"
                  >
                    <option value={FlightSortOption.BEST}>Best Deal</option>
                    <option value={FlightSortOption.CHEAPEST}>Cheapest</option>
                    <option value={FlightSortOption.FASTEST}>Fastest</option>
                  </select>
                </div>
              </div>
            )}

            {loading ? (
              [...Array(3)].map((_, n) => (
                <div key={n} className="bg-white p-6 rounded-xl border border-slate-100 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-1/4 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-10 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-10 bg-slate-100 rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : sortedFlights.length > 0 ? (
              sortedFlights.map((flight, idx) => {
                const realCost = calculateRealCost(flight);
                const hasBaggageFees = realCost > flight.price;

                return (
                  <div key={flight.id} className="relative">
                    {/* Badge for the very first item if sorted by Best */}
                    {idx === 0 && sortBy === FlightSortOption.BEST && (
                      <div className="absolute -top-3 left-6 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm flex items-center gap-1">
                        <TrendingDown size={10} /> BEST DEAL
                      </div>
                    )}
                    {idx === 0 && sortBy === FlightSortOption.CHEAPEST && (
                      <div className="absolute -top-3 left-6 bg-sky-600 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 shadow-sm">
                        CHEAPEST
                      </div>
                    )}

                    <div className="space-y-2">
                      <FlightCard
                        flight={flight}
                        onSelect={handleSaveFlight}
                        actionLabel="Save Flight"
                        actionVariant="primary"
                        showBookButton={true}
                      />

                      {/* Real Cost Display */}
                      {hasBaggageFees && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700">Base fare:</span>
                            <span className="font-medium text-slate-900">${flight.price}</span>
                          </div>
                          {params.includeCarryOn && flight.baggageFees?.carryOn && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-700">Carry-on bag:</span>
                              <span className="font-medium text-slate-900">+${flight.baggageFees.carryOn}</span>
                            </div>
                          )}
                          {params.includeCheckedBag && flight.baggageFees?.checkedBag && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-700">Checked bag:</span>
                              <span className="font-medium text-slate-900">+${flight.baggageFees.checkedBag}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 mt-2 border-t border-emerald-300">
                            <span className="font-semibold text-emerald-900">Real Total:</span>
                            <span className="font-bold text-lg text-emerald-900">${realCost}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <Search size={24} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No flights found</h3>
                <p className="text-slate-500">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-sky-900 to-slate-900 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-sky-500/20 rounded-md">
                  <TrendingDown size={18} className="text-sky-300" />
                </div>
                <h3 className="font-semibold text-lg">AI Price Insight</h3>
              </div>

              {loadingInsight ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                </div>
              ) : (
                <p className="text-sm text-sky-100 leading-relaxed opacity-90">
                  {insight || "Enter search details to get AI predictions on whether you should book now or wait."}
                </p>
              )}

              {!loadingInsight && insight && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs font-medium text-sky-300">
                    <AlertCircle size={12} />
                    <span>Based on historical trends</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Price History (Avg)</h3>
              <PriceChart />
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
              <h4 className="font-semibold text-amber-800 text-sm mb-1">Travel Hack</h4>
              <p className="text-xs text-amber-700">Flying on a Tuesday or Wednesday usually saves up to 15% compared to weekends.</p>
            </div>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DatePicker
          departureDate={params.date}
          returnDate={params.returnDate || ''}
          tripType={params.tripType}
          onDepartureChange={(date) => setParams({ ...params, date })}
          onReturnChange={(date) => setParams({ ...params, returnDate: date })}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {/* Travelers Selector Modal */}
      {showTravelersSelector && (
        <TravelersSelector
          adults={params.adults}
          children={params.children}
          infants={params.infants}
          cabinClass={params.cabinClass as CabinClass}
          onAdultsChange={(count) => setParams({ ...params, adults: count, passengers: count + params.children + params.infants })}
          onChildrenChange={(count) => setParams({ ...params, children: count, passengers: params.adults + count + params.infants })}
          onInfantsChange={(count) => setParams({ ...params, infants: count, passengers: params.adults + params.children + count })}
          onCabinClassChange={(cabin) => setParams({ ...params, cabinClass: cabin })}
          onClose={() => setShowTravelersSelector(false)}
        />
      )}
    </div>
  );
};