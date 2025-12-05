import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface NaturalSearchProps {
    onParsed: (params: any) => void;
    isLoading: boolean;
    origin: string;
    onOriginChange: (origin: string) => void;
}

export const NaturalSearch: React.FC<NaturalSearchProps> = ({ onParsed, isLoading, origin, onOriginChange }) => {
    const [query, setQuery] = useState('');
    const [showExamples, setShowExamples] = useState(true);

    const examples = [
        "Weekend trip to somewhere warm in December under $400",
        "Cheap flight to Paris next month",
        "I want to visit Tokyo in spring for 2 people",
        "Beach vacation in July under $600"
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onParsed(query);
            setShowExamples(false);
        }
    };

    const handleExampleClick = (example: string) => {
        setQuery(example);
        setShowExamples(false);
    };

    return (
        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 p-6 rounded-xl border border-sky-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg">
                    <Sparkles className="text-white" size={18} />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900">Natural Language Search</h3>
                    <p className="text-xs text-slate-600">Just describe what you're looking for</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-1">
                        <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">
                            Departure From
                        </label>
                        <input
                            type="text"
                            value={origin}
                            onChange={(e) => onOriginChange(e.target.value.toUpperCase())}
                            placeholder="JFK"
                            maxLength={3}
                            className="w-full px-4 py-3 bg-white border-2 border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900 placeholder:text-slate-400 uppercase"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="md:col-span-3 relative">
                        <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">
                            Your Request
                        </label>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., Weekend trip to somewhere warm in December under $400"
                            className="w-full px-4 py-3 bg-white border-2 border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-slate-900 placeholder:text-slate-400"
                            disabled={isLoading}
                        />
                        {isLoading && (
                            <Loader2 className="absolute right-3 top-[2.3rem] text-sky-500 animate-spin" size={20} />
                        )}
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className="w-full"
                >
                    <Sparkles size={16} className="mr-2" />
                    {isLoading ? 'Parsing...' : 'Search with AI'}
                </Button>
            </form>

            {showExamples && (
                <div className="mt-4 pt-4 border-t border-sky-200">
                    <p className="text-xs font-medium text-slate-600 mb-2">Try these examples:</p>
                    <div className="space-y-1.5">
                        {examples.map((example, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleExampleClick(example)}
                                className="w-full text-left text-xs text-sky-700 hover:text-sky-900 bg-white hover:bg-sky-50 px-3 py-2 rounded-md transition-colors border border-sky-100 hover:border-sky-300"
                            >
                                "{example}"
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
