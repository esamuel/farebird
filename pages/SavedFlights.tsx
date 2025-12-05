import React, { useState, useEffect } from 'react';
import { Bookmark, Search } from 'lucide-react';
import { Flight } from '../types';
import { FlightCard } from '../components/FlightCard';
import { NavLink } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const SavedFlights: React.FC = () => {
  const [savedFlights, setSavedFlights] = useState<Flight[]>([]);

  useEffect(() => {
    // Fetch from localStorage
    const saved = JSON.parse(localStorage.getItem('farebird_saved') || '[]');
    setSavedFlights(saved);
  }, []);

  const handleRemove = (flight: Flight) => {
    const newFlights = savedFlights.filter(f => f.id !== flight.id);
    setSavedFlights(newFlights);
    localStorage.setItem('farebird_saved', JSON.stringify(newFlights));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Flights</h1>
          <p className="text-slate-500">Track prices and manage your potential trips.</p>
        </div>
        <div className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-sm font-medium">
          {savedFlights.length} Saved
        </div>
      </div>
      
      {savedFlights.length > 0 ? (
        <div className="grid gap-4">
          {savedFlights.map((flight, idx) => (
            <FlightCard 
              key={`${flight.id}-${idx}`} 
              flight={flight} 
              onSelect={handleRemove}
              actionLabel="Remove"
              actionVariant="danger"
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
            <Bookmark size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No saved flights yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">
            Track flights in your dashboard to get notified when prices drop.
          </p>
          <NavLink to="/dashboard">
            <Button>
              <Search className="mr-2" size={18} />
              Find Flights
            </Button>
          </NavLink>
        </div>
      )}
    </div>
  );
};