"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Settings, Save, CheckCircle, X, Plus, Trash2, Edit2 } from "lucide-react";

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
];

const EVENT_TYPES = [
  'Interest Rate', 'GDP', 'CPI', 'Employment', 'Trade Balance', 
  'Retail Sales', 'Manufacturing PMI', 'Services PMI', 'Speeches',
  'Non-Farm Payrolls', 'Unemployment Rate', 'Consumer Confidence',
  'Housing Data', 'Central Bank Minutes', 'Trade Agreements'
];

const DEFAULT_EVENTS = [
  { id: 1, time: '08:30', currency: 'USD', event: 'Core Retail Sales m/m', impact: 'high', previous: '0.3%', forecast: '0.4%', actual: '-', enabled: true },
  { id: 2, time: '08:30', currency: 'USD', event: 'Retail Sales m/m', impact: 'high', previous: '0.6%', forecast: '0.5%', actual: '-', enabled: true },
  { id: 3, time: '10:00', currency: 'USD', event: 'Business Optimism Index', impact: 'medium', previous: '98.2', forecast: '97.5', actual: '-', enabled: true },
  { id: 4, time: '10:00', currency: 'EUR', event: 'ECB President Speech', impact: 'high', previous: '-', forecast: '-', actual: '-', enabled: true },
  { id: 5, time: '14:00', currency: 'GBP', event: 'BoE MPC Meeting Minutes', impact: 'high', previous: '-', forecast: '-', actual: '-', enabled: true },
  { id: 6, time: '14:30', currency: 'USD', event: 'Crude Oil Inventories', impact: 'medium', previous: '-2.5M', forecast: '-1.8M', actual: '-', enabled: true },
  { id: 7, time: '18:00', currency: 'USD', event: 'Fed Chair Speech', impact: 'high', previous: '-', forecast: '-', actual: '-', enabled: true },
  { id: 8, time: '20:45', currency: 'NZD', event: 'Trade Balance', impact: 'medium', previous: '-1.2B', forecast: '-0.8B', actual: '-', enabled: true },
  { id: 9, time: '22:00', currency: 'AUD', event: 'RBA Rate Statement', impact: 'high', previous: '4.35%', forecast: '4.35%', actual: '-', enabled: true },
  { id: 10, time: '00:30', currency: 'JPY', event: 'BoJ Monetary Policy Statement', impact: 'high', previous: '-', forecast: '-', actual: '-', enabled: true },
  { id: 11, time: '02:00', currency: 'GBP', event: 'GDP m/m', impact: 'high', previous: '0.2%', forecast: '0.1%', actual: '-', enabled: true },
  { id: 12, time: '04:00', currency: 'AUD', event: 'Employment Change', impact: 'high', previous: '25.8K', forecast: '15.0K', actual: '-', enabled: true },
];

export default function EconomicCalendar() {
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [preferences, setPreferences] = useState({
    selectedCurrencies: ['USD', 'EUR', 'GBP', 'JPY'],
    selectedImpacts: ['high', 'medium', 'low'],
    customEvents: [],
    notifications: true
  });
  
  useEffect(() => {
    // Load saved preferences
    const savedPrefs = localStorage.getItem('calendarPreferences');
    if (savedPrefs) {
      const parsed = JSON.parse(savedPrefs);
      setPreferences(parsed);
    }
    setLoading(false);
  }, []);
  
  const savePreferences = () => {
    localStorage.setItem('calendarPreferences', JSON.stringify(preferences));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const toggleCurrency = (code) => {
    setPreferences(prev => ({
      ...prev,
      selectedCurrencies: prev.selectedCurrencies.includes(code)
        ? prev.selectedCurrencies.filter(c => c !== code)
        : [...prev.selectedCurrencies, code]
    }));
  };
  
  const toggleImpact = (impact) => {
    setPreferences(prev => ({
      ...prev,
      selectedImpacts: prev.selectedImpacts.includes(impact)
        ? prev.selectedImpacts.filter(i => i !== impact)
        : [...prev.selectedImpacts, impact]
    }));
  };
  
  const toggleEvent = (id) => {
    setEvents(prev => prev.map(e => 
      e.id === id ? { ...e, enabled: !e.enabled } : e
    ));
  };
  
  const addCustomEvent = (event) => {
    setPreferences(prev => ({
      ...prev,
      customEvents: [...prev.customEvents, { ...event, id: Date.now(), enabled: true }]
    }));
  };
  
  const removeCustomEvent = (id) => {
    setPreferences(prev => ({
      ...prev,
      customEvents: prev.customEvents.filter(e => e.id !== id)
    }));
  };
  
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-rose-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };
  
  const filteredEvents = events.filter(e => {
    const currencyMatch = preferences.selectedCurrencies.includes(e.currency);
    const impactMatch = preferences.selectedImpacts.includes(e.impact);
    return currencyMatch && impactMatch && e.enabled;
  });
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="h-6 w-6 text-amber-500" />
            Economic Calendar
          </h2>
          <p className="text-slate-400 text-sm">{dateStr}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-xl transition ${
              showSettings ? 'bg-blue-600 text-white' : 'glass hover:bg-white/10'
            }`}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-400" />
                Calendar Settings
              </h3>
              <button
                onClick={savePreferences}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold transition"
              >
                {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? 'Saved!' : 'Save'}
              </button>
            </div>
            
            {/* Currency Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">Select Currencies</h4>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => toggleCurrency(curr.code)}
                    className={`p-3 rounded-xl text-center transition border ${
                      preferences.selectedCurrencies.includes(curr.code)
                        ? 'bg-blue-600 border-blue-400'
                        : 'bg-slate-800/50 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="text-xl mb-1">{curr.flag}</div>
                    <div className={`text-xs font-bold ${preferences.selectedCurrencies.includes(curr.code) ? 'text-white' : 'text-slate-400'}`}>
                      {curr.code}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Impact Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">Select Impacts</h4>
              <div className="flex gap-3">
                {['high', 'medium', 'low'].map((impact) => (
                  <button
                    key={impact}
                    onClick={() => toggleImpact(impact)}
                    className={`flex-1 py-3 rounded-xl font-bold capitalize transition border ${
                      preferences.selectedImpacts.includes(impact)
                        ? impact === 'high' ? 'bg-rose-600 border-rose-400'
                        : impact === 'medium' ? 'bg-orange-600 border-orange-400'
                        : 'bg-green-600 border-green-400'
                        : 'bg-slate-800/50 border-white/5 hover:border-white/20 text-slate-400'
                    }`}
                  >
                    {impact} Impact
                  </button>
                ))}
              </div>
            </div>
            
            {/* Toggle Individual Events */}
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">Toggle Events</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getImpactColor(event.impact)}`} />
                      <span className="text-white text-sm">{event.event}</span>
                      <span className="text-xs text-slate-500">({event.currency})</span>
                    </div>
                    <button
                      onClick={() => toggleEvent(event.id)}
                      className={`w-10 h-6 rounded-full transition relative ${
                        event.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${
                        event.enabled ? 'left-5' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'high', 'medium', 'low'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              filter === f 
                ? f === 'high' ? 'bg-rose-600 text-white' 
                : f === 'medium' ? 'bg-orange-600 text-white'
                : f === 'low' ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white'
                : 'glass text-slate-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Events Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          Showing <span className="text-white font-bold">{filteredEvents.length}</span> events
        </span>
        <span className="text-slate-500">
          {preferences.selectedCurrencies.length} currencies selected
        </span>
      </div>
      
      {/* Events List */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-3 bg-slate-800/50 text-xs font-bold text-slate-400 uppercase">
          <div className="col-span-1">Time</div>
          <div className="col-span-1">Currency</div>
          <div className="col-span-4">Event</div>
          <div className="col-span-2">Previous</div>
          <div className="col-span-2">Forecast</div>
          <div className="col-span-2">Impact</div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
            />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No events match your preferences</p>
            <button 
              onClick={() => setShowSettings(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold"
            >
              Adjust Settings
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-12 gap-2 p-3 hover:bg-white/5 transition"
              >
                <div className="col-span-1 flex items-center">
                  <Clock className="h-4 w-4 text-slate-500 mr-1" />
                  <span className="text-white font-mono text-sm">{event.time}</span>
                </div>
                <div className="col-span-1 flex items-center">
                  <span className="text-lg">
                    {CURRENCIES.find(c => c.code === event.currency)?.flag || '💱'}
                  </span>
                  <span className="ml-1 text-white font-bold">{event.currency}</span>
                </div>
                <div className="col-span-4 flex items-center">
                  <span className="text-white font-medium">{event.event}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-slate-400 font-mono text-sm">{event.previous}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="text-blue-400 font-mono text-sm">{event.forecast}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getImpactColor(event.impact)}`} />
                  <span className="text-xs text-slate-400 capitalize">{event.impact}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-sm text-slate-400">High Impact</span>
          </div>
          <p className="text-2xl font-black text-white">
            {filteredEvents.filter(e => e.impact === 'high').length}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-sm text-slate-400">Medium Impact</span>
          </div>
          <p className="text-2xl font-black text-white">
            {filteredEvents.filter(e => e.impact === 'medium').length}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-slate-400">Low Impact</span>
          </div>
          <p className="text-2xl font-black text-white">
            {filteredEvents.filter(e => e.impact === 'low').length}
          </p>
        </div>
      </div>
    </div>
  );
}