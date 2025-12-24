import React, { useState, useCallback, useRef } from 'react';
import { SearchBar } from './components/SearchBar';
import { RestaurantCard } from './components/RestaurantCard';
import { fetchRestaurants } from './services/gemini';
import { generateMobileGuideHTML } from './utils/exportUtils';
import { Restaurant, AppTab, SearchParams } from './types';
import { Download, Search, UtensilsCrossed, RefreshCw, Fuel, Disc } from 'lucide-react'; // Changed icon imports

const HERO_IMAGE = "/hero-new.jpg";

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
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 80;
    const isRightSwipe = distance < -80;

    if (isLeftSwipe && activeTab === AppTab.GOURMET) {
      handleTabChange(AppTab.COMMUNITY);
    } else if (isRightSwipe && activeTab === AppTab.COMMUNITY) {
      handleTabChange(AppTab.GOURMET);
    }

    touchStartX.current = null;
    touchEndX.current = null;
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
        fetchRestaurants(params.location, params.distance, AppTab.GOURMET, (partial) => {
          setGourmetRestaurants(partial);
        }),
        fetchRestaurants(params.location, params.distance, AppTab.COMMUNITY, (partial) => {
          // Live update for community (filtering happens at the end)
          setCommunityRestaurants(partial.slice(0, 12));
        })
      ]);

      const gourmetNames = new Set(gourmetResults.map(r => r.name.toLowerCase().trim()));
      const filteredCommunityResults = rawCommunityResults.filter(r =>
        !gourmetNames.has(r.name.toLowerCase().trim())
      );

      setGourmetRestaurants(gourmetResults);
      // Slice to 12 to meet the requirement: min 10, max 12.
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

  // --- BUTTON STYLES FOR HEADER ---
  const headerBtnBase = "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300";
  const resetBtnClass = isGourmet
    ? "text-gourmet-sub hover:text-white hover:bg-white/10"
    : "text-community-sub hover:text-community-text hover:bg-black/5";

  const exportBtnClass = isGourmet
    ? "bg-gourmet-gold text-black hover:bg-[#F3E8D3] shadow-[0_0_15px_rgba(218,171,45,0.3)]"
    : "bg-community-olive text-white hover:bg-[#5a7a1b] shadow-md";

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
        .text-glow-gold {
          text-shadow: 0 0 20px rgba(218, 171, 45, 0.8), 0 0 10px rgba(218, 171, 45, 0.4);
        }
        .text-glow-white {
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.9), 0 0 10px rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* --- HEADER --- */}
      <header className={`
        relative z-40 transition-all duration-1000 ease-in-out w-full
        ${hasSearched
          ? 'sticky top-0 py-4 border-b backdrop-blur-xl shadow-sm ' + (isGourmet ? 'bg-gourmet-champagne/80 border-gourmet-gold/20' : 'bg-base-ivory/80 border-base-border')
          : 'min-h-[100dvh] flex flex-col items-center justify-center'
        }
      `}>

        <div className={`
          container mx-auto px-4 flex flex-col items-center transition-all duration-1000 relative
          ${hasSearched ? 'gap-0' : 'justify-center'}
        `}>

          <div className={`
             flex flex-col items-center w-full transition-all duration-1000
             ${hasSearched
              ? 'max-w-none'
              : 'max-w-5xl gap-12 animate-hero-content'
            }
          `}>

            <div className="flex flex-col items-center justify-center text-center">
              <h1 className={`
                  font-serif font-light tracking-[-0.04em] transition-all duration-1000 cursor-pointer
                  ${hasSearched
                  ? 'text-4xl md:text-5xl mb-1 text-[#1a1a1a]'
                  : 'text-5xl md:text-7xl mb-6 text-white drop-shadow-[0_15px_50px_rgba(0,0,0,1)]'
                }
              `} onClick={() => hasSearched && window.scrollTo({ top: 0, behavior: 'smooth' })}>
                El Buen Comer
              </h1>

              {!hasSearched && (
                <p className='font-sans font-light tracking-[0.5em] uppercase text-white/95 text-sm md:text-lg drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]'>
                  Gastronomía en la Cima
                </p>
              )}

              {/* LOCALIDAD BUSCADA (Visible solo tras búsqueda) */}
              {hasSearched && searchParams && (
                <div className={`
                  animate-fade-in-up mt-1 mb-2
                  flex items-center gap-3 opacity-80
                `}>
                  <span className={`h-px w-4 md:w-8 ${isGourmet ? 'bg-gourmet-gold' : 'bg-community-olive'}`}></span>
                  <p className={`
                     font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.25em]
                     ${isGourmet ? 'text-gourmet-sub' : 'text-community-sub'}
                   `}>
                    Guía de <span className={isGourmet ? 'text-gourmet-gold' : 'text-community-olive'}>{searchParams.location}</span>
                  </p>
                  <span className={`h-px w-4 md:w-8 ${isGourmet ? 'bg-gourmet-gold' : 'bg-community-olive'}`}></span>
                </div>
              )}
            </div>

            <div className={`flex justify-center w-full ${hasSearched ? 'mt-2 mb-1' : ''}`}>
              <div className={`
                relative flex items-center p-1.5 md:p-2 rounded-full border transition-all duration-1000 gap-2
                ${hasSearched
                  ? (isGourmet ? 'bg-black/5 border-black/5 scale-90' : 'bg-white/40 border-gray-200/50 scale-90')
                  : 'bg-black/60 border-white/10 shadow-2xl backdrop-blur-md'
                }
              `}>
                <button
                  onClick={() => handleTabChange(AppTab.GOURMET)}
                  className={`
                    relative px-8 md:px-12 py-3 md:py-4 rounded-full text-xs md:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-500
                    ${activeTab === AppTab.GOURMET
                      ? 'bg-white text-black shadow-2xl ring-1 ring-white/50'
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
                    relative px-8 md:px-12 py-3 md:py-4 rounded-full text-xs md:text-sm font-bold tracking-[0.2em] uppercase transition-all duration-500
                    ${activeTab === AppTab.COMMUNITY
                      ? 'bg-[#A9B494] text-white shadow-2xl ring-1 ring-white/20'
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
            </div>

            {!hasSearched && (
              <div className="w-full max-w-2xl mt-4">
                <SearchBar
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  activeTab={activeTab}
                  isHero={true}
                />
              </div>
            )}
          </div>

          {/* --- TOP LEFT LINKS (SYMMETRY) --- */}
          {hasSearched && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3">
              <a
                href="https://guide.michelin.com/es/es/restaurantes"
                target="_blank"
                rel="noopener noreferrer"
                className={`${headerBtnBase} ${resetBtnClass}`}
                title="Guía Michelin"
              >
                <Disc className="w-4 h-4" />
                <span className="hidden md:inline">Michelin</span>
              </a>

              <a
                href="https://www.guiarepsol.com/es/soletes/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${headerBtnBase} ${resetBtnClass}`}
                title="Guía Repsol"
              >
                <Fuel className="w-4 h-4" />
                <span className="hidden md:inline">Repsol</span>
              </a>
            </div>
          )}

          {/* --- TOP RIGHT ACTIONS (VISIBLE ONLY WHEN SEARCHED) --- */}
          {hasSearched && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3">
              {/* Reset Button */}
              <button
                onClick={handleReset}
                className={`${headerBtnBase} ${resetBtnClass}`}
                title="Nueva Búsqueda"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Buscar</span>
              </button>

              {/* Export Button (only if results exist) */}
              {currentRestaurants.length > 0 && (
                <button
                  onClick={handleExport}
                  className={`${headerBtnBase} ${exportBtnClass}`}
                  title="Descargar Guía HTML"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">Guía</span>
                </button>
              )}
            </div>
          )}

        </div>
      </header>

      {/* --- RESULTS --- */}
      <main className={`container mx-auto px-4 relative z-30 transition-all duration-1000 ${hasSearched ? 'py-10 pb-20 opacity-100' : 'py-0 h-0 opacity-0 overflow-hidden pointer-events-none'}`}>

        {error && (
          <div className="max-w-md mx-auto p-10 bg-red-50 border border-red-100 rounded-[32px] text-center text-red-600 mb-16 shadow-lg">
            <p className="font-semibold text-xl mb-3">Algo no ha ido bien</p>
            <p className="text-sm opacity-80 mb-6">{error}</p>
            <button onClick={handleReset} className="text-xs font-bold uppercase tracking-[0.25em] px-8 py-4 bg-red-100 hover:bg-red-200 rounded-full transition-all">Nueva consulta</button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col gap-8">
            {/* Mensaje de carga parpadeante */}
            <div className="flex flex-col items-center justify-center py-4 animate-pulse space-y-2">
              <h2 className={`text-2xl md:text-3xl font-serif italic text-center ${isGourmet ? 'text-gourmet-gold' : 'text-community-olive'}`}>
                {isGourmet ? "Consultando registros oficiales..." : "Analizando reseñas locales..."}
              </h2>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isGourmet ? 'text-gourmet-sub' : 'text-community-sub'}`}>
                Buscando en {searchParams?.location}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-[580px] rounded-[40px] animate-pulse ${isGourmet ? 'bg-black/5' : 'bg-gray-200/50'}`}></div>
              ))}
            </div>
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
    </div>
  );
};

export default App;