import React, { useState, useCallback, useRef } from 'react';
import { SearchBar } from './components/SearchBar';
import { RestaurantCard } from './components/RestaurantCard';
import { fetchRestaurants } from './services/gemini';
import { generateMobileGuideHTML } from './utils/exportUtils';
import { Restaurant, AppTab, SearchParams } from './types';
import { Download, RotateCcw, UtensilsCrossed } from 'lucide-react';

const HERO_IMAGE = "/assets/images/hero-bg.jpg";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.GOURMET);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [gourmetRestaurants, setGourmetRestaurants] = useState<Restaurant[]>([]);
  const [communityRestaurants, setCommunityRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Swipe Gesture Logic
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || !touchStartY.current || !touchEndY.current) return;

    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = touchStartY.current - touchEndY.current;

    // Require horizontal swipe to be dominant (more X movement than Y movement)
    // and exceed threshold of 60px
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    const isValidDistance = Math.abs(distanceX) > 60;

    if (isHorizontalSwipe && isValidDistance) {
      const isLeftSwipe = distanceX > 0;
      const isRightSwipe = distanceX < 0;

      if (isLeftSwipe && activeTab === AppTab.GOURMET) {
        handleTabChange(AppTab.COMMUNITY);
      } else if (isRightSwipe && activeTab === AppTab.COMMUNITY) {
        handleTabChange(AppTab.GOURMET);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const handleSearch = useCallback(async (params: SearchParams) => {
    setSearchParams(params);
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setGourmetRestaurants([]);
    setCommunityRestaurants([]);

    try {
      const [gourmetResults, rawCommunityResults] = await Promise.all([
        fetchRestaurants(params.location, params.distance, AppTab.GOURMET),
        fetchRestaurants(params.location, params.distance, AppTab.COMMUNITY)
      ]);

      const gourmetNames = new Set(gourmetResults.map(r => r.name.toLowerCase().trim()));
      const filteredCommunityResults = rawCommunityResults.filter(r =>
        !gourmetNames.has(r.name.toLowerCase().trim())
      );

      setGourmetRestaurants(gourmetResults);
      // Slice to 12 to meet the requirement: min 10, max 12.
      // We request slightly more from API to ensure we have enough after filtering.
      setCommunityRestaurants(filteredCommunityResults.slice(0, 12));
    } catch (err) {
      setError("Hubo un error buscando los restaurantes. Verifica tu conexión.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setHasSearched(false);
    setGourmetRestaurants([]);
    setCommunityRestaurants([]);
    setSearchParams(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTabChange = useCallback((tab: AppTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleExport = useCallback(() => {
    if (!searchParams) return;
    const htmlContent = generateMobileGuideHTML(
      gourmetRestaurants,
      communityRestaurants,
      searchParams.location
    );
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Guia_ElBuenComer_${searchParams.location}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [searchParams, gourmetRestaurants, communityRestaurants]);

  const currentRestaurants = activeTab === AppTab.GOURMET ? gourmetRestaurants : communityRestaurants;
  const isGourmet = activeTab === AppTab.GOURMET;

  return (
    <div
      className={`
        min-h-screen relative overflow-x-hidden font-sans transition-all duration-1000
        ${hasSearched
          ? (isGourmet
            ? 'bg-gourmet-champagne text-gourmet-primary selection:bg-gourmet-primary selection:text-gourmet-gold'
            : 'bg-base-ivory text-base-text selection:bg-community-sage selection:text-white')
          : 'bg-black text-white'
        }
      `}
      style={isGourmet && hasSearched ? {
        backgroundImage: 'radial-gradient(circle at 50% 0%, #FFFDF5 0%, #F3E8D3 100%)'
      } : {}}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* --- FONDO PRINCIPAL NÍTIDO --- */}
      <div className={`
        fixed inset-0 z-0 bg-black transition-opacity duration-1000 ease-in-out
        ${hasSearched ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}>
        <div className="absolute inset-0 scale-105 animate-[ken-burns_40s_linear_infinite]">
          <img
            src={HERO_IMAGE}
            alt="Terraza alpina exclusiva"
            className="w-full h-full object-cover opacity-100 brightness-100 shadow-inner"
          />
        </div>
        {/* Gradientes reducidos para máxima visibilidad de la imagen */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Parpadeo sutil para indicar clickabilidad */
        @keyframes soft-blink {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.98); }
        }
        .animate-soft-blink {
          animation: soft-blink 2.5s ease-in-out infinite;
        }
        .animate-hero-content {
          animation: fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Brillo adicional para selección */
        .text-glow-gold {
          text-shadow: 0 0 20px rgba(218, 171, 45, 0.8), 0 0 10px rgba(218, 171, 45, 0.4);
        }
        .text-glow-white {
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.9), 0 0 10px rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* --- HEADER --- */}
      <header className={`
        z-50 transition-all duration-1000 ease-in-out w-full
        ${hasSearched
          ? 'fixed top-0 left-0 right-0 h-20 md:h-24 border-b backdrop-blur-2xl shadow-sm ' + (isGourmet ? 'bg-gourmet-champagne/90 border-gourmet-gold/30' : 'bg-base-ivory/90 border-base-border')
          : 'relative min-h-[100dvh] flex flex-col items-center justify-center'
        }
      `}>

        <div className={`
          container mx-auto px-4 h-full flex items-center transition-all duration-1000
          ${hasSearched ? 'justify-between flex-row' : 'flex-col justify-center'}
        `}>

          {/* BRANDING */}
          <div className={`
             flex flex-col transition-all duration-1000
             ${hasSearched
              ? 'items-start mr-4 shrink-0 ' + (hasSearched ? 'hidden md:flex' : 'flex')
              : 'items-center max-w-5xl gap-12 animate-hero-content w-full'
            }
          `}>

            <div className={`
                flex flex-col transition-all duration-1000
                ${hasSearched ? 'items-start text-left' : 'items-center justify-center text-center'}
            `}>
              <h1 className={`
                  font-serif font-light tracking-[-0.04em] transition-all duration-1000 cursor-pointer hover:opacity-80
                  ${hasSearched
                  ? 'text-2xl md:text-3xl mb-0 text-[#1a1a1a]'
                  : 'text-7xl md:text-9xl mb-6 text-white drop-shadow-[0_15px_50px_rgba(0,0,0,1)]'
                }
              `}
                onClick={hasSearched ? handleReset : undefined}
              >
                El Buen Comer
              </h1>
              <p className={`
                  font-sans font-light tracking-[0.5em] uppercase transition-all duration-1000
                  ${hasSearched
                  ? (isGourmet ? 'text-gourmet-sub text-[9px] mt-1' : 'text-base-textSec text-[9px] mt-1')
                  : 'text-white/95 text-sm md:text-xl drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]'
                }
              `}>
                {hasSearched && searchParams ? `Guía de ${searchParams.location}` : 'Gastronomía en la Cima'}
              </p>
            </div>

            {/* TABS & SEARCH BAR (Wrapper to handle positioning) */}
            <div className={`
                transition-all duration-1000 flex
                ${hasSearched
                ? 'md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 relative mx-auto md:mx-0'
                : 'w-full justify-center mt-12 flex-col items-center'
              }
             `}>
              <div className={`
                  relative flex items-center p-1.5 md:p-2 rounded-full border transition-all duration-1000 gap-1 md:gap-2
                  ${hasSearched
                  ? (isGourmet ? 'bg-black/5 border-black/5 scale-90 md:scale-90' : 'bg-white/40 border-gray-200/50 scale-90 md:scale-90')
                  : 'bg-black/60 border-white/10 shadow-2xl backdrop-blur-md'
                }
                `}>

                <button
                  onClick={() => handleTabChange(AppTab.GOURMET)}
                  className={`
                      relative px-5 md:px-16 py-2.5 md:py-4 rounded-full text-[10px] md:text-[12px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase transition-all duration-500
                      ${activeTab === AppTab.GOURMET
                      ? 'bg-white text-black shadow-lg md:shadow-2xl ring-1 ring-white/50'
                      : (hasSearched && !isGourmet ? 'text-gray-500 hover:bg-gray-200/50' : 'text-white/70 hover:text-white')
                    }
                    `}
                >
                  <span className={`
                      block transition-all duration-500
                      ${activeTab === AppTab.GOURMET
                      ? 'text-[#DAAB2D] text-glow-gold scale-105 opacity-100'
                      : 'animate-soft-blink opacity-80'
                    }
                    `}>
                    Gourmet
                  </span>
                </button>

                <button
                  onClick={() => handleTabChange(AppTab.COMMUNITY)}
                  className={`
                      relative px-5 md:px-16 py-2.5 md:py-4 rounded-full text-[10px] md:text-[12px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase transition-all duration-500
                      ${activeTab === AppTab.COMMUNITY
                      ? 'bg-[#A9B494] text-white shadow-lg md:shadow-2xl ring-1 ring-white/20'
                      : (hasSearched && isGourmet ? 'text-gray-500 hover:bg-gray-200/50' : 'text-white/70 hover:text-white')
                    }
                    `}
                >
                  <span className={`
                      block transition-all duration-500
                      ${activeTab === AppTab.COMMUNITY
                      ? 'text-white text-glow-white scale-105 opacity-100'
                      : 'animate-soft-blink opacity-80'
                    }
                    `}>
                    Comunidad
                  </span>
                </button>
              </div>

              {!hasSearched && (
                <div className="w-full max-w-2xl mt-8">
                  <SearchBar
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    activeTab={activeTab}
                    isHero={true}
                  />
                </div>
              )}
            </div>

          </div>
          {/* END OF BRANDING DIV */}

          {/* HEADER ACTIONS - Now a sibling, correctly positioned on the right */}
          {hasSearched && (
            <div className="flex items-center gap-2 md:gap-3 shrink-0 z-50">
              <button
                onClick={handleReset}
                title="Nueva búsqueda"
                className={`
                    group flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                    h-10 md:h-12 overflow-hidden
                    w-10 md:w-12 hover:w-40 md:hover:w-48 hover:px-4
                    active:scale-95
                    ${isGourmet
                    ? 'bg-black/90 text-gourmet-gold border border-gourmet-gold/20 hover:bg-black'
                    : 'bg-community-olive text-white border border-transparent hover:bg-[#5a7a1b]'
                  }
                  `}
              >
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap ml-0 group-hover:ml-2 text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  Nueva búsqueda
                </span>
              </button>

              {currentRestaurants.length > 0 && (
                <button
                  onClick={handleExport}
                  title="Descargar Guía HTML"
                  className={`
                      group flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                      h-10 md:h-12 overflow-hidden
                      w-10 md:w-12 hover:w-40 md:hover:w-48 hover:px-4
                      active:scale-95
                      ${isGourmet
                      ? 'bg-[#DAAB2D] text-black hover:brightness-110'
                      : 'bg-community-coral text-white hover:brightness-110'
                    }
                    `}
                >
                  <Download className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                  <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap ml-0 group-hover:ml-2 text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                    Descargar Guía
                  </span>
                </button>
              )}
            </div>
          )}

        </div>
      </header>

      {/* --- RESULTS --- */}
      <main className={`container mx-auto px-4 relative z-30 transition-all duration-1000 ${hasSearched ? 'pt-32 pb-20 opacity-100' : 'py-0 h-0 opacity-0 overflow-hidden pointer-events-none'}`}>

        {error && (
          <div className="max-w-md mx-auto p-10 bg-red-50 border border-red-100 rounded-[32px] text-center text-red-600 mb-16 shadow-lg">
            <p className="font-semibold text-xl mb-3">Algo no ha ido bien</p>
            <p className="text-sm opacity-80 mb-6">{error}</p>
            <button onClick={handleReset} className="text-xs font-bold uppercase tracking-[0.25em] px-8 py-4 bg-red-100 hover:bg-red-200 rounded-full transition-all">Nueva consulta</button>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-[580px] rounded-[40px] animate-pulse ${isGourmet ? 'bg-black/5' : 'bg-gray-200/50'}`}></div>
            ))}
          </div>
        )}

        {/* EMPTY STATE - NO RESULTS FOUND */}
        {!isLoading && hasSearched && currentRestaurants.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 animate-hero-content">
            <div className={`p-8 rounded-full mb-6 ${isGourmet ? 'bg-gourmet-gold/10' : 'bg-community-sage/20'}`}>
              <UtensilsCrossed className={`w-12 h-12 ${isGourmet ? 'text-gourmet-gold' : 'text-community-olive'}`} />
            </div>
            <h3 className={`text-2xl font-serif mb-3 text-center ${isGourmet ? 'text-black' : 'text-community-text'}`}>
              Sin resultados oficiales
            </h3>
            <p className="text-center max-w-md text-sm opacity-60 leading-relaxed mb-8">
              {isGourmet
                ? "No hemos encontrado restaurantes en esta zona que figuren en las guías Michelin, Repsol o Macarfi."
                : "No se encontraron restaurantes destacados por la comunidad en este radio."}
            </p>
            <button
              onClick={handleReset}
              className={`
                px-8 py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase transition-all
                ${isGourmet
                  ? 'bg-black text-gourmet-gold hover:bg-gray-900'
                  : 'bg-community-olive text-white hover:bg-[#5a7a1b]'}
              `}
            >
              Probar otra ubicación
            </button>
          </div>
        )}

        {!isLoading && currentRestaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 auto-rows-fr animate-hero-content">
            {currentRestaurants.map((restaurant, idx) => (
              <div key={idx} className="h-full">
                <RestaurantCard restaurant={restaurant} type={activeTab} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- ACTIONS REMOVED (Moved to Header) --- */}
    </div>
  );
};

export default App;