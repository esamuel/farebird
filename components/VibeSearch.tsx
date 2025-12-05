import React, { useState } from 'react';
import { Compass, Music, Mountain, Heart, Waves, Landmark, Zap, Loader2, MapPin } from 'lucide-react';
import { VibeCategory } from '../types';

interface VibeSearchProps {
    onVibeSelect: (vibe: VibeCategory, budget?: number) => void;
    loading?: boolean;
    destinations?: any[];
    origin: string;
    onOriginChange: (origin: string) => void;
}

const vibeOptions: { vibe: VibeCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { vibe: 'nightlife', label: 'Nightlife', icon: <Music size={20} />, color: 'from-purple-500 to-pink-500' },
    { vibe: 'hiking', label: 'Hiking', icon: <Mountain size={20} />, color: 'from-green-500 to-emerald-600' },
    { vibe: 'romantic', label: 'Romantic', icon: <Heart size={20} />, color: 'from-rose-500 to-red-500' },
    { vibe: 'beach', label: 'Beach', icon: <Waves size={20} />, color: 'from-cyan-500 to-blue-500' },
    { vibe: 'culture', label: 'Culture', icon: <Landmark size={20} />, color: 'from-amber-500 to-orange-500' },
    { vibe: 'adventure', label: 'Adventure', icon: <Zap size={20} />, color: 'from-yellow-500 to-amber-600' },
];

export const VibeSearch: React.FC<VibeSearchProps> = ({ onVibeSelect, loading, destinations, origin, onOriginChange }) => {
    const [selectedVibe, setSelectedVibe] = useState<VibeCategory | null>(null);
    const [budget, setBudget] = useState<string>('');

    const handleVibeClick = (vibe: VibeCategory) => {
        setSelectedVibe(vibe);
        const budgetNum = budget ? parseInt(budget) : undefined;
        onVibeSelect(vibe, budgetNum);
    };

    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Compass className="text-white" size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Vibe Search</h3>
                        <p className="text-xs text-slate-600">Discover destinations by mood</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">
                            Departure From
                        </label>
                        <input
                            type="text"
                            value={origin}
                            onChange={(e) => onOriginChange(e.target.value.toUpperCase())}
                            placeholder="JFK"
                            maxLength={3}
                            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 placeholder:text-slate-400 uppercase"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">
                            Max Budget (Optional)
                        </label>
                        <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="e.g., 500"
                            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {vibeOptions.map(({ vibe, label, icon, color }) => (
                        <button
                            key={vibe}
                            onClick={() => handleVibeClick(vibe)}
                            disabled={loading}
                            className={`
                relative p-4 rounded-xl border-2 transition-all group
                ${selectedVibe === vibe
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                                }
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
                        >
                            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} text-white mb-2`}>
                                {icon}
                            </div>
                            <div className="text-sm font-semibold text-slate-900">{label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Destinations Results */}
            {loading && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                    <Loader2 className="mx-auto text-indigo-500 animate-spin mb-2" size={32} />
                    <p className="text-sm text-slate-600">Finding perfect destinations...</p>
                </div>
            )}

            {!loading && destinations && destinations.length > 0 && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <MapPin size={16} className="text-indigo-600" />
                        Recommended Destinations
                    </h4>
                    <div className="space-y-3">
                        {destinations.map((dest, idx) => (
                            <div
                                key={idx}
                                className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h5 className="font-bold text-slate-900">{dest.city}, {dest.country}</h5>
                                        <p className="text-xs text-slate-500">{dest.airport}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-indigo-700">${dest.estimatedPrice}</div>
                                        <div className="text-xs text-slate-500">est. price</div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{dest.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
