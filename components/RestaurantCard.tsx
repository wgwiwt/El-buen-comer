import React from 'react';
import { Restaurant, AppTab } from '../types';
import { MapPin, ChefHat, Store, Utensils, Award } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  type: AppTab;
}

const cleanPrice = (price: string | number): string => {
  if (typeof price === 'number') return `${price} €`;
  // Clean up if the model returns symbols or text mixed with numbers
  const justNumbers = price.replace(/[^0-9\-]/g, '');
  if (justNumbers) return `${justNumbers} €`;
  return String(price); // Fallback
};

export const RestaurantCard = React.memo<RestaurantCardProps>(({ restaurant, type }) => {
  const isGourmet = type === AppTab.GOURMET;
  const displayPrice = cleanPrice(restaurant.price);
  
  // --- TARJETA GOURMET (Diseño Oscuro Premium) ---
  if (isGourmet) {
    const infoLine = [
      `${restaurant.rating} ★`,
      restaurant.awards ? restaurant.awards : null,
      displayPrice
    ].filter(Boolean).join(" • ");

    return (
      <div className="group h-full flex flex-col relative z-0 perspective-1000 transition-all duration-500 hover:-translate-y-3">
        {/* Card Container with 3D Shadow */}
        <div className="h-full flex flex-col rounded-2xl overflow-hidden relative bg-[#121212] shadow-3d-gourmet group-hover:shadow-3d-gourmet-hover transition-all duration-500 border border-white/5">
          
          {/* Subtle gold gradient top - simulates light hitting the edge */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gourmet-gold/60 to-transparent opacity-30 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="p-8 flex flex-col h-full relative z-20 gap-5 text-center">
            
            {/* 1. Nombre Restaurante */}
            <h3 className="font-serif text-3xl text-gourmet-text tracking-tight leading-tight group-hover:text-gourmet-gold transition-colors drop-shadow-md">
              {restaurant.name}
            </h3>

            {/* 2. Valoración - Distinción - Precio */}
            <div className="text-xs font-sans font-medium tracking-widest uppercase text-gourmet-gold/90 border-t border-b border-white/5 py-3 bg-white/[0.02]">
              {infoLine}
            </div>

            {/* 3. Descripción propuesta chef */}
            <div className="flex-grow flex flex-col items-center gap-2">
              <ChefHat className="w-4 h-4 text-white/20" />
              <p className="font-serif italic text-white/70 text-sm leading-relaxed">
                "{restaurant.description}"
              </p>
            </div>

            {/* 4. Tipo de local */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Espacio</span>
              <p className="text-sm font-sans text-white/90">{restaurant.ambiance}</p>
            </div>

            {/* 5. Plato Estrella */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40">Plato Estrella</span>
              <p className="text-sm font-sans text-gourmet-accent">{restaurant.signatureDish}</p>
            </div>

            {/* 6. Ubicación + Icono Maps */}
            <div className="mt-4 pt-4 border-t border-white/10 w-full flex items-center justify-center gap-3">
              <span className="text-xs uppercase tracking-wide text-white/50">{restaurant.address}</span>
              <a 
                href={restaurant.googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gourmet-gold/10 text-gourmet-gold hover:bg-gourmet-gold hover:text-black transition-all shadow-[0_0_10px_rgba(201,162,77,0.2)]"
                title="Ver en Google Maps"
              >
                <MapPin className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- TARJETA COMUNIDAD (Diseño Colorido y Vibrante) ---
  return (
    <div className="group h-full flex flex-col transition-all duration-500 hover:-translate-y-2">
      {/* 3D Volumetric Card with Gradient Background */}
      <div className="h-full flex flex-col bg-gradient-to-br from-white to-[#fcfdfa] rounded-2xl overflow-hidden font-sans border border-community-sage/30 shadow-3d-community group-hover:shadow-3d-community-hover transition-all duration-500 relative">
        
        {/* Top Colorful Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-community-sage via-community-olive to-community-terracotta"></div>

        <div className="p-6 flex flex-col h-full gap-4 relative">
          
          {/* Header: Name and Category Badge */}
          <div className="flex flex-col gap-2 items-start">
             <div className="flex justify-between w-full items-start">
                <span className="bg-community-terracotta/10 text-community-terracotta px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-community-terracotta/20">
                  {restaurant.category || 'CASUAL'}
                </span>
                <div className="flex items-center gap-1 bg-community-olive text-white px-2 py-1 rounded-lg shadow-sm">
                   <span className="text-xs font-bold">{restaurant.rating}</span>
                   <Award className="w-3 h-3" />
                </div>
             </div>
             
             <h3 className="font-montserrat font-bold text-xl text-gray-800 leading-tight group-hover:text-community-olive transition-colors">
               {restaurant.name}
             </h3>
             <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Precio medio: <span className="text-gray-600">{displayPrice}</span>
             </p>
          </div>

          <div className="h-px w-full bg-gray-100 my-1"></div>

          {/* Description */}
          <div className="flex-grow">
             <p className="text-gray-600 text-sm leading-relaxed">
               {restaurant.description}
             </p>
          </div>

          {/* Color Grids for Details */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            {/* Ambiente Box */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-community-sage/15 border border-community-sage/10 text-center transition-colors hover:bg-community-sage/25">
               <Store className="w-5 h-5 text-community-olive mb-1" />
               <span className="text-[9px] uppercase font-bold text-community-olive/70 mb-1">Ambiente</span>
               <span className="text-xs font-bold text-community-dark leading-tight">{restaurant.ambiance}</span>
            </div>
            
            {/* Plato Box */}
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-community-coral/10 border border-community-coral/10 text-center transition-colors hover:bg-community-coral/20">
               <Utensils className="w-5 h-5 text-community-terracotta mb-1" />
               <span className="text-[9px] uppercase font-bold text-community-terracotta/70 mb-1">Imperdible</span>
               <span className="text-xs font-bold text-community-dark leading-tight">{restaurant.signatureDish}</span>
            </div>
          </div>

          {/* Footer: Address & Button */}
          <div className="mt-4 pt-0 w-full flex items-center justify-between gap-2">
             <div className="flex items-center gap-1 text-gray-400 overflow-hidden">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="text-[10px] font-bold uppercase truncate">{restaurant.address}</span>
             </div>
             
             <a 
               href={restaurant.googleMapsUrl} 
               target="_blank" 
               rel="noopener noreferrer" 
               className="px-4 py-2 rounded-full bg-community-olive text-white text-xs font-bold hover:bg-[#5a7a1b] transition-all shadow-md hover:shadow-lg flex items-center gap-1 flex-shrink-0"
             >
               Ver Mapa
             </a>
          </div>

        </div>
      </div>
    </div>
  );
});

RestaurantCard.displayName = 'RestaurantCard';