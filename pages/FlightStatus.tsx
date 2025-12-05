import React, { useState } from 'react';
import { getFlightStatus, FlightStatus as FlightStatusType } from '../services/aviationStackService';
import { Plane, Clock, MapPin, AlertTriangle, Search, CheckCircle } from 'lucide-react';

export const FlightStatus: React.FC = () => {
    const [flightNumber, setFlightNumber] = useState('');
    const [status, setStatus] = useState<FlightStatusType | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!flightNumber.trim()) return;

        setLoading(true);
        setError('');
        setStatus(null);

        try {
            const data = await getFlightStatus(flightNumber.trim().toUpperCase());
            if (data) {
                setStatus(data);
            } else {
                setError('Flight not found. Please check the flight number (e.g., AA123).');
            }
        } catch (err) {
            setError('Failed to fetch flight status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'landed':
                return 'text-green-500';
            case 'scheduled':
                return 'text-blue-500';
            case 'cancelled':
            case 'diverted':
                return 'text-red-500';
            case 'incident':
                return 'text-orange-500';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Plane className="w-8 h-8 text-blue-600" />
                Flight Status Tracker
            </h1>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={flightNumber}
                            onChange={(e) => setFlightNumber(e.target.value)}
                            placeholder="Enter Flight Number (e.g. AA100)"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Searching...' : 'Track Flight'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}
            </div>

            {status && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">{status.flight_date}</div>
                            <div className="text-2xl font-bold flex items-center gap-3">
                                {status.airline.name} <span className="text-gray-400">|</span> {status.flight.iata}
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide bg-opacity-10 ${getStatusColor(status.flight_status).replace('text-', 'bg-')} ${getStatusColor(status.flight_status)}`}>
                            {status.flight_status}
                        </div>
                    </div>

                    {/* Route Info */}
                    <div className="p-8 grid md:grid-cols-3 gap-8 relative">
                        {/* Departure */}
                        <div className="text-center md:text-left">
                            <div className="text-4xl font-black text-gray-900 mb-2">{status.departure.iata}</div>
                            <div className="text-lg text-gray-600 mb-4">{status.departure.airport}</div>
                            <div className="space-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2 md:justify-start justify-center">
                                    <Clock className="w-4 h-4" />
                                    Scheduled: {new Date(status.departure.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {status.departure.terminal && (
                                    <div className="flex items-center gap-2 md:justify-start justify-center">
                                        <MapPin className="w-4 h-4" />
                                        Terminal: {status.departure.terminal}
                                    </div>
                                )}
                                {status.departure.gate && (
                                    <div className="font-semibold text-blue-600">Gate: {status.departure.gate}</div>
                                )}
                            </div>
                        </div>

                        {/* Flight Path Visual */}
                        <div className="flex flex-col items-center justify-center relative">
                            <div className="w-full h-0.5 bg-gray-200 absolute top-1/2 transform -translate-y-1/2 z-0"></div>
                            <div className="bg-white p-2 rounded-full z-10 border-2 border-blue-100">
                                <Plane className="w-6 h-6 text-blue-600 transform rotate-90" />
                            </div>
                            {status.departure.delay > 0 && (
                                <div className="mt-4 text-red-500 font-medium text-sm flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    Delayed {status.departure.delay}m
                                </div>
                            )}
                        </div>

                        {/* Arrival */}
                        <div className="text-center md:text-right">
                            <div className="text-4xl font-black text-gray-900 mb-2">{status.arrival.iata}</div>
                            <div className="text-lg text-gray-600 mb-4">{status.arrival.airport}</div>
                            <div className="space-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2 md:justify-end justify-center">
                                    <Clock className="w-4 h-4" />
                                    Scheduled: {new Date(status.arrival.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {status.arrival.terminal && (
                                    <div className="flex items-center gap-2 md:justify-end justify-center">
                                        <MapPin className="w-4 h-4" />
                                        Terminal: {status.arrival.terminal}
                                    </div>
                                )}
                                {status.arrival.gate && (
                                    <div className="font-semibold text-blue-600">Gate: {status.arrival.gate}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
