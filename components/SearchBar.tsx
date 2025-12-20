import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { DISTANCE_OPTIONS, SearchParams, AppTab } from '../types';

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  activeTab: AppTab;
  isHero?: boolean; // New prop to style specifically for Hero section
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, activeTab, isHero = false }) => {
  const [location, setLocation] = useState('');
  // Initialize with the first option (Casco Urbano / 0km)
  const [distance, setDistance] = useState(DISTANCE_OPTIONS[0].value);

  const isGourmet = activeTab === AppTab.GOURMET;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch({ location, distance });
    }
  };

  // --- Dynamic Styling ---
  
  // Container Background
  let containerClasses = "";
  if (isHero) {
    // Glassmorphism for Hero - Darker for visibility
    containerClasses = "bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl";
  } else {
    // Standard white for normal usage
    containerClasses = `bg-base-white shadow-soft border border-base-border ${isGourmet ? 'rounded-md' : 'rounded-3xl'}`;
  }

  // Input Fields Styling
  let inputGroupClasses = "";
  let textClasses = "";
  let labelClasses = "";
  let iconClasses = "";

  if (isHero) {
    inputGroupClasses = "bg-white/10 border border-white/10 hover:bg-white/20 focus-within:bg-white/20 focus-within:border-white/30 rounded-xl";
    textClasses = "text-white placeholder-white/70";
    labelClasses = "text-gourmet-gold/90";
    iconClasses = "text-gourmet-gold";
  } else {
    const focusRingClass = isGourmet ? "focus-within:ring-gourmet-primary" : "focus-within:ring-community-sage";
    inputGroupClasses = `bg-base-ivory/30 border border-transparent ${focusRingClass} focus-within:bg-white focus-within:border-base-border ${isGourmet ? 'rounded-sm' : 'rounded-xl'}`;
    textClasses = "text-base-text placeholder-gray-400";
    labelClasses = "text-base-textSec";
    iconClasses = isGourmet ? 'text-gourmet-gold' : 'text-community-sage';
  }

  // Submit Button
  let buttonClasses = "";
  if (isHero) {
    buttonClasses = "bg-[#DAAB2D] text-black hover:bg-[#F3E8D3] shadow-[0_0_15px_rgba(218,171,45,0.4)] rounded-xl";
  } else {
    buttonClasses = isGourmet
      ? "bg-gourmet-primary text-gourmet-accent hover:bg-black rounded-md"
      : "bg-community-sage text-base-text hover:bg-[#98a383] rounded-2xl";
  }

  return (
    <div className="w-full mx-auto relative z-50">
      <form 
        onSubmit={handleSubmit}
        autoComplete="off"
        className={`
          flex flex-col md:flex-row gap-3 p-3 transition-all duration-300
          ${containerClasses}
        `}
      >
        <div className={`flex-1 relative group px-4 py-2 transition-all ${inputGroupClasses}`}>
          <label htmlFor="location" className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 block ${labelClasses}`}>
            Ubicación
          </label>
          <div className="flex items-center">
            <MapPin className={`w-4 h-4 mr-2 ${iconClasses}`} />
            <input
              id="location"
              type="text"
              name="location_search_field_no_history"
              autoComplete="off"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej. Madrid, Sevilla..."
              className={`w-full bg-transparent border-none focus:ring-0 text-lg font-medium outline-none p-0 ${textClasses}`}
              required
            />
          </div>
        </div>

        <div className={`w-full md:w-48 relative group px-4 py-2 transition-all ${inputGroupClasses}`}>
          <label htmlFor="distance" className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 block ${labelClasses}`}>
            Radio
          </label>
          <select
            id="distance"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className={`w-full bg-transparent border-none focus:ring-0 text-lg font-medium outline-none cursor-pointer appearance-none p-0 ${textClasses}`}
          >
            {DISTANCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-black bg-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !location.trim()}
          className={`
            mt-1 md:mt-0 px-8 py-3 font-bold shadow-sm flex items-center justify-center gap-2 transition-all
            ${isLoading ? 'bg-gray-300 cursor-not-allowed text-gray-500' : buttonClasses}
          `}
        >
          {isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};