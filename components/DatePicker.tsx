import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  departureDate: string;
  returnDate: string;
  tripType: 'oneWay' | 'roundTrip';
  onDepartureChange: (date: string) => void;
  onReturnChange: (date: string) => void;
  onClose: () => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  departureDate,
  returnDate,
  tripType,
  onDepartureChange,
  onReturnChange,
  onClose
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // 'departure' or 'return' - which field is being edited
  const [activeField, setActiveField] = useState<'departure' | 'return'>('departure');

  // Reset to departure when switching to one-way
  useEffect(() => {
    if (tripType === 'oneWay') {
      setActiveField('departure');
    }
  }, [tripType]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getNextMonth = (date: Date) => {
    const next = new Date(date);
    next.setMonth(next.getMonth() + 1);
    return next;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateInRange = (dateStr: string) => {
    if (!departureDate || !returnDate) return false;
    return dateStr > departureDate && dateStr < returnDate;
  };

  const isDateSelected = (dateStr: string) => {
    return dateStr === departureDate || dateStr === returnDate;
  };

  const isPastDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  };

  const handleDateClick = (dateStr: string) => {
    if (isPastDate(dateStr)) return;

    if (activeField === 'departure') {
      onDepartureChange(dateStr);
      // If return date is before new departure, clear it
      if (returnDate && dateStr >= returnDate) {
        onReturnChange('');
      }
      // Auto-switch to return for round trip
      if (tripType === 'roundTrip') {
        setActiveField('return');
      }
    } else {
      // Selecting return
      if (dateStr <= departureDate) {
        // If clicked date is before or same as departure, set as new departure instead
        onDepartureChange(dateStr);
        onReturnChange('');
      } else {
        onReturnChange(dateStr);
      }
    }
  };

  const renderMonth = (monthDate: Date) => {
    const { firstDay, daysInMonth, year, month } = getDaysInMonth(monthDate);
    const days = [];

    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateString(year, month, day);
      const isPast = isPastDate(dateStr);
      const isSelected = isDateSelected(dateStr);
      const isInRange = isDateInRange(dateStr);
      const isDeparture = dateStr === departureDate;
      const isReturn = dateStr === returnDate;

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(dateStr)}
          disabled={isPast}
          className={`
            h-10 w-10 rounded-full text-sm font-medium transition-all
            ${isPast ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-sky-100 cursor-pointer'}
            ${isSelected ? 'bg-sky-600 text-white hover:bg-sky-700' : ''}
            ${isInRange ? 'bg-sky-100 text-sky-800' : ''}
            ${isDeparture && returnDate ? 'rounded-r-none' : ''}
            ${isReturn ? 'rounded-l-none' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="flex-1">
        <h3 className="text-center font-semibold text-slate-900 mb-4">
          {monthNames[month]} {year}
        </h3>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day, i) => (
            <div key={i} className="h-8 flex items-center justify-center text-xs font-medium text-slate-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const goToPrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    const today = new Date();
    if (prev.getFullYear() > today.getFullYear() || 
        (prev.getFullYear() === today.getFullYear() && prev.getMonth() >= today.getMonth())) {
      setCurrentMonth(prev);
    }
  };

  const goToNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {tripType === 'roundTrip' ? 'Select Dates' : 'Select Departure Date'}
            </h2>
            <p className="text-sm text-slate-500">
              {activeField === 'return' && tripType === 'roundTrip' 
                ? 'Now select your return date' 
                : tripType === 'roundTrip' 
                  ? 'Click a date for departure'
                  : 'Click on a date to select'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Selected Dates Display - Clickable to switch between departure/return */}
        <div className="px-6 py-3 bg-sky-50 border-b border-sky-100 flex gap-4">
          <button
            onClick={() => setActiveField('departure')}
            className={`flex-1 p-3 rounded-lg text-left transition-all ${
              activeField === 'departure'
                ? 'bg-white border-2 border-sky-500 shadow-sm' 
                : 'bg-white/50 hover:bg-white/80 border-2 border-transparent'
            }`}
          >
            <p className="text-xs text-slate-500 uppercase font-medium">Departure</p>
            <p className="text-sm font-semibold text-slate-900">
              {departureDate ? new Date(departureDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select date'}
            </p>
          </button>
          {tripType === 'roundTrip' && (
            <button
              onClick={() => setActiveField('return')}
              className={`flex-1 p-3 rounded-lg text-left transition-all ${
                activeField === 'return'
                  ? 'bg-white border-2 border-sky-500 shadow-sm' 
                  : 'bg-white/50 hover:bg-white/80 border-2 border-transparent'
              }`}
            >
              <p className="text-xs text-slate-500 uppercase font-medium">Return</p>
              <p className="text-sm font-semibold text-slate-900">
                {returnDate ? new Date(returnDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Select date'}
              </p>
            </button>
          )}
        </div>

        {/* Calendar Navigation */}
        <div className="px-6 py-4 flex items-center justify-between">
          <button 
            onClick={goToPrevMonth}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <button 
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Calendars */}
        <div className="px-6 pb-6 flex gap-8">
          {renderMonth(currentMonth)}
          {renderMonth(getNextMonth(currentMonth))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            disabled={!departureDate || (tripType === 'roundTrip' && !returnDate)}
            className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
