import React from 'react';
import { Calendar, TrendingDown } from 'lucide-react';
import { PriceMatrixCell } from '../types';

interface PriceMatrixProps {
    matrix: PriceMatrixCell[];
    onDateSelect: (date: string) => void;
    loading?: boolean;
}

export const PriceMatrix: React.FC<PriceMatrixProps> = ({ matrix, onDateSelect, loading }) => {
    if (loading) {
        return (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="text-sky-600" size={18} />
                    <h3 className="font-semibold text-slate-900">Flexible Dates</h3>
                </div>
                <div className="grid grid-cols-7 gap-2 animate-pulse">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="h-20 bg-slate-100 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (matrix.length === 0) return null;

    const minPrice = Math.min(...matrix.filter(m => m.price !== null).map(m => m.price as number));

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        return { day, dayNum, month };
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="text-sky-600" size={18} />
                    <h3 className="font-semibold text-slate-900">Flexible Dates</h3>
                </div>
                <span className="text-xs text-slate-500">Click a date to select</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {matrix.map((cell) => {
                    const { day, dayNum, month } = formatDate(cell.date);
                    const isCheapest = cell.price === minPrice;
                    const isSelected = cell.isSelected;

                    return (
                        <button
                            key={cell.date}
                            onClick={() => onDateSelect(cell.date)}
                            disabled={cell.price === null}
                            className={`
                relative p-3 rounded-lg border-2 transition-all text-center
                ${cell.price === null
                                    ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-50'
                                    : isSelected
                                        ? 'bg-sky-100 border-sky-500 shadow-md'
                                        : isCheapest
                                            ? 'bg-green-50 border-green-400 hover:bg-green-100 hover:border-green-500'
                                            : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                }
              `}
                        >
                            {isCheapest && cell.price !== null && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                    <TrendingDown size={12} />
                                </div>
                            )}

                            <div className="text-[10px] font-medium text-slate-500 uppercase">{day}</div>
                            <div className="text-lg font-bold text-slate-900 my-0.5">{dayNum}</div>
                            <div className="text-[9px] text-slate-400 uppercase mb-1">{month}</div>

                            {cell.price !== null ? (
                                <div className={`text-xs font-semibold ${isCheapest ? 'text-green-700' : 'text-sky-700'}`}>
                                    ${cell.price}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400">N/A</div>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                    <span>Cheapest</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-sky-500 rounded"></div>
                    <span>Selected</span>
                </div>
            </div>
        </div>
    );
};
