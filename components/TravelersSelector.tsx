import React from 'react';
import { Users, Minus, Plus, X } from 'lucide-react';

export type CabinClass = 'economy' | 'premiumEconomy' | 'business' | 'first';

interface TravelersSelectorProps {
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  onAdultsChange: (count: number) => void;
  onChildrenChange: (count: number) => void;
  onInfantsChange: (count: number) => void;
  onCabinClassChange: (cabin: CabinClass) => void;
  onClose: () => void;
}

const cabinOptions: { value: CabinClass; label: string; description: string }[] = [
  { value: 'economy', label: 'Economy', description: 'Standard seating' },
  { value: 'premiumEconomy', label: 'Premium Economy', description: 'Extra legroom & comfort' },
  { value: 'business', label: 'Business', description: 'Lie-flat seats & premium service' },
  { value: 'first', label: 'First Class', description: 'Ultimate luxury experience' },
];

export const TravelersSelector: React.FC<TravelersSelectorProps> = ({
  adults,
  children,
  infants,
  cabinClass,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
  onCabinClassChange,
  onClose
}) => {
  const totalTravelers = adults + children + infants;

  const CounterButton: React.FC<{
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
  }> = ({ value, min, max, onChange }) => (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-600 hover:border-sky-500 hover:text-sky-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus size={16} />
      </button>
      <span className="w-8 text-center font-semibold text-slate-900">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max || totalTravelers >= 9}
        className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-600 hover:border-sky-500 hover:text-sky-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Plus size={16} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Users size={20} className="text-sky-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Travelers & Class</h2>
              <p className="text-sm text-slate-500">{totalTravelers} traveler{totalTravelers !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Travelers Section */}
        <div className="p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Travelers</h3>
          
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Adults</p>
              <p className="text-sm text-slate-500">12+ years</p>
            </div>
            <CounterButton
              value={adults}
              min={1}
              max={9}
              onChange={onAdultsChange}
            />
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Children</p>
              <p className="text-sm text-slate-500">2-11 years</p>
            </div>
            <CounterButton
              value={children}
              min={0}
              max={8}
              onChange={onChildrenChange}
            />
          </div>

          {/* Infants */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Infants</p>
              <p className="text-sm text-slate-500">Under 2 years</p>
            </div>
            <CounterButton
              value={infants}
              min={0}
              max={adults} // Infants can't exceed adults
              onChange={onInfantsChange}
            />
          </div>

          {infants > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
              Infants must sit on an adult's lap. Max 1 infant per adult.
            </p>
          )}
        </div>

        {/* Cabin Class Section */}
        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Cabin Class</h3>
          <div className="grid grid-cols-2 gap-2">
            {cabinOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onCabinClassChange(option.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  cabinClass === option.value
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className={`font-medium ${cabinClass === option.value ? 'text-sky-700' : 'text-slate-900'}`}>
                  {option.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
