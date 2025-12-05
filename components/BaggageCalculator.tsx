import React from 'react';
import { Briefcase, ShoppingBag, Info } from 'lucide-react';

interface BaggageCalculatorProps {
    includeCarryOn: boolean;
    includeCheckedBag: boolean;
    onToggleCarryOn: (value: boolean) => void;
    onToggleCheckedBag: (value: boolean) => void;
}

export const BaggageCalculator: React.FC<BaggageCalculatorProps> = ({
    includeCarryOn,
    includeCheckedBag,
    onToggleCarryOn,
    onToggleCheckedBag,
}) => {
    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                    <Briefcase className="text-white" size={16} />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Real Cost Calculator</h4>
                    <p className="text-xs text-slate-600">See the true price with baggage fees</p>
                </div>
            </div>

            <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="text-emerald-600" size={18} />
                        <div>
                            <div className="text-sm font-medium text-slate-900">Carry-On Bag</div>
                            <div className="text-xs text-slate-500">Personal item + overhead bin</div>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={includeCarryOn}
                        onChange={(e) => onToggleCarryOn(e.target.checked)}
                        className="w-5 h-5 text-emerald-600 bg-white border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2"
                    />
                </label>

                <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <Briefcase className="text-emerald-600" size={18} />
                        <div>
                            <div className="text-sm font-medium text-slate-900">Checked Bag</div>
                            <div className="text-xs text-slate-500">Standard checked luggage</div>
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        checked={includeCheckedBag}
                        onChange={(e) => onToggleCheckedBag(e.target.checked)}
                        className="w-5 h-5 text-emerald-600 bg-white border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2"
                    />
                </label>
            </div>

            {(includeCarryOn || includeCheckedBag) && (
                <div className="mt-3 pt-3 border-t border-emerald-200 flex items-start gap-2 text-xs text-emerald-800">
                    <Info size={14} className="flex-shrink-0 mt-0.5" />
                    <p>
                        Prices shown include selected baggage fees. Actual fees may vary by airline.
                    </p>
                </div>
            )}
        </div>
    );
};
