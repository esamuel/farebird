import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, Key, RefreshCcw, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getAmadeusCredentials } from '../services/geminiService';

export const Settings: React.FC = () => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [homeAirport, setHomeAirport] = useState('');
  const [homeCountry, setHomeCountry] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load existing keys
    const creds = getAmadeusCredentials();
    setClientId(creds.id);
    setClientSecret(creds.secret);

    // Load preferences
    setHomeAirport(localStorage.getItem('farebird_home_airport') || '');
    setHomeCountry(localStorage.getItem('farebird_home_country') || '');
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('farebird_amadeus_id', clientId);
      localStorage.setItem('farebird_amadeus_secret', clientSecret);
      localStorage.setItem('farebird_home_airport', homeAirport);
      localStorage.setItem('farebird_home_country', homeCountry);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (e) {
      setStatus('error');
    }
  };

  const handleClear = () => {
    localStorage.removeItem('farebird_amadeus_id');
    localStorage.removeItem('farebird_amadeus_secret');
    localStorage.removeItem('farebird_home_airport');
    localStorage.removeItem('farebird_home_country');
    setClientId('');
    setClientSecret('');
    setHomeAirport('');
    setHomeCountry('');
    setStatus('idle');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your API connections and preferences.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-sky-100 p-2 rounded-lg text-sky-600">
              <MapPin size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Default Location</h2>
          </div>
          <p className="text-sm text-slate-500">
            Set your default departure location to save time on every search.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Home Airport (IATA)</label>
              <input
                type="text"
                value={homeAirport}
                onChange={(e) => setHomeAirport(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none uppercase"
                placeholder="e.g. JFK"
                maxLength={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country / Region</label>
              <input
                type="text"
                value={homeCountry}
                onChange={(e) => setHomeCountry(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="e.g. United States"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-sky-100 p-2 rounded-lg text-sky-600">
              <Key size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Amadeus Flight API</h2>
          </div>
          <p className="text-sm text-slate-500">
            To see real flight data, create a free account at <a href="https://developers.amadeus.com" target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">Amadeus for Developers</a> and paste your keys below.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">API Key (Client ID)</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="e.g. d3K9..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">API Secret (Client Secret)</label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="e.g. 8fA..."
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
              <CheckCircle2 size={16} />
              <span>Settings saved successfully!</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" />
              Save Configuration
            </Button>
            <Button variant="ghost" onClick={handleClear} className="text-slate-500 hover:text-red-600">
              <RefreshCcw size={16} className="mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
          <div className="flex gap-2 text-xs text-slate-500">
            <AlertCircle size={14} className="mt-0.5" />
            <p>
              Your keys and preferences are stored locally in your browser and never sent to our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};