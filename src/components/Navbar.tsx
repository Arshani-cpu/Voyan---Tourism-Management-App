import React, { useState, useRef, useEffect } from 'react';
import { Compass, Bookmark, Sparkles, User, LogOut, ChevronDown, Check, Shield, Ticket, Smartphone, Headphones, ShieldAlert, IndianRupee, Zap, MapPin } from 'lucide-react';
import { TravellerGroupType } from '../types/travel';

export interface NavbarUser {
  name: string;
  email: string;
  groupPreference?: TravellerGroupType;
}

interface NavbarProps {
  currentView: 'home' | 'planner';
  onNavigateHome: () => void;
  onOpenPlanner: () => void;
  onOpenVault: () => void;
  onOpenPacking?: () => void;
  onOpenMyTrips: () => void;
  onOpenSignIn: () => void;
  onOpenSoundscapes: () => void;
  savedTripsCount: number;
  currentUser?: NavbarUser | null;
  onSignOut?: () => void;
  onToggleMobileSim?: () => void;
  isMobileSimActive?: boolean;
  onOpenSOS?: () => void;
  onOpenDocuments?: () => void;
  onOpenUPIPay?: () => void;
  onOpenAppsHub?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateHome,
  onOpenPlanner,
  onOpenVault,
  onOpenPacking,
  onOpenMyTrips,
  onOpenSignIn,
  onOpenSoundscapes,
  savedTripsCount,
  currentUser,
  onSignOut,
  onToggleMobileSim,
  isMobileSimActive,
  onOpenSOS,
  onOpenDocuments,
  onOpenUPIPay,
  onOpenAppsHub,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getGroupLabel = (group?: TravellerGroupType) => {
    switch (group) {
      case 'seniors':
        return 'Senior Explorer';
      case 'couple':
        return 'Couple';
      case 'family':
        return 'Family Group';
      case 'friends':
        return 'Friends Trip';
      case 'solo':
        return 'Solo Explorer';
      default:
        return 'Traveler';
    }
  };

  return (
    <header className="voyan-site-header sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center gap-3">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-md cursor-pointer shrink-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-800 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-900 transition-colors">
            <Compass className="w-4.5 h-4.5" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-[#0F172A] whitespace-nowrap">
            Voyan
          </span>
        </button>
        {/* Zone 2: Navigation — each item navigates to exactly one unique feature/section */}
        <nav className="hidden lg:flex flex-1 min-w-0 overflow-x-hidden items-center gap-4 text-sm font-medium text-stone-600">
          {/* Trip Vault — always visible at lg+ */}
          <button
            onClick={onOpenVault}
            className="flex items-center gap-1.5 hover:text-teal-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer group"
          >
            <Ticket className="w-4 h-4 text-sky-700 group-hover:scale-110 transition-transform" />
            <span>Trip Vault</span>
            <span className="w-4 h-4 rounded-full bg-teal-800 text-white text-[9px] font-bold flex items-center justify-center">
              5
            </span>
          </button>

          {/* Soundscapes — ambient travel music modal, xl+; genuinely different from Trip Vault */}
          <button
            onClick={onOpenSoundscapes}
            className="hidden xl:flex items-center gap-1.5 hover:text-teal-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer group"
            title="Ambient travel soundscapes & AI music"
          >
            <Headphones className="w-4 h-4 text-violet-600 group-hover:scale-110 transition-transform" />
            <span>Soundscapes</span>
          </button>

          {/* AI Prompts — scrolls to example prompts section on home page, xl+; genuinely different from Trip Vault */}
          <a
            href="#example-prompts"
            onClick={(e) => {
              if (currentView === 'planner') {
                e.preventDefault();
                onNavigateHome();
                setTimeout(() => {
                  document.getElementById('example-prompts')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hidden xl:flex items-center gap-1.5 hover:text-teal-900 transition-colors whitespace-nowrap shrink-0"
            title="Example AI trip planning prompts"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Prompts</span>
          </a>

          {/* Group Planner — visible at 2xl+ */}
          <a
            href="#who-is-travelling"
            onClick={(e) => {
              if (currentView === 'planner') {
                e.preventDefault();
                onNavigateHome();
                setTimeout(() => {
                  document.getElementById('who-is-travelling')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hidden 2xl:block hover:text-teal-900 transition-colors whitespace-nowrap shrink-0"
          >
            Groups
          </a>


          {/* Destinations — visible at 2xl+ */}
          <a
            href="#popular-destinations"
            onClick={(e) => {
              if (currentView === 'planner') {
                e.preventDefault();
                onNavigateHome();
                setTimeout(() => {
                  document.getElementById('popular-destinations')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hidden xl:block hover:text-teal-900 transition-colors whitespace-nowrap shrink-0"
          >
            Destinations
          </a>

          {/* My Trips — always visible at lg+ */}
          <button
            onClick={onOpenMyTrips}
            className="flex items-center gap-1.5 hover:text-teal-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Bookmark className="w-4 h-4 text-stone-400" />
            <span>My Trips</span>
            {savedTripsCount > 0 && (
              <span className="text-xs text-teal-800 font-semibold tabular-nums ml-0.5">
                ({savedTripsCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Actions — ml-auto + shrink-0 ensures always visible at right edge */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Mobile App View Simulator Toggle — only at xl+ to save space at lg */}
          {onToggleMobileSim && (
            <button
              onClick={onToggleMobileSim}
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isMobileSimActive
                  ? 'bg-stone-900 text-teal-400 border-stone-800 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-teal-700 hover:text-teal-900'
              }`}
              title="Toggle mobile app device preview"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-700" />
              <span>{isMobileSimActive ? 'Web Mode' : 'Mobile App'}</span>
            </button>
          )}

          {/* UPI Pay — compact action button, visible at xl+; moved from Zone 2 since it is an action not navigation */}
          {onOpenUPIPay && (
            <button
              onClick={onOpenUPIPay}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
              title="UPI Fast Pay & QR Code"
            >
              <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
              <span>UPI Pay</span>
            </button>
          )}

          {/* Emergency SOS Quick Hub Trigger — icon-only on mobile, label on sm+ */}
          {onOpenSOS && (
            <button
              onClick={onOpenSOS}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-black bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer shadow-2xs group"
              title="Emergency SOS Hub - Auto-Sends SMS & GPS to Contacts (Shift + S)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600 group-hover:text-white transition-colors animate-pulse" />
              <span className="hidden sm:inline">SOS</span>
            </button>
          )}

          {/* On-Demand Apps Hub — hidden on mobile (accessible via bottom nav) */}
          {onOpenAppsHub && (
            <button
              onClick={onOpenAppsHub}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-950 border border-amber-200/90 hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
              title="On-Demand Cabs, Food & Shopping (Rapido, Uber, Zomato, Swiggy, Meesho, Amazon, Flipkart)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Apps</span>
            </button>
          )}

          {currentUser ? (
            /* Logged in state dropdown */
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-stone-200/90 hover:border-teal-600 bg-white shadow-2xs transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-800 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs max-w-[110px] truncate">
                  <span className="block font-semibold text-stone-900 truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-teal-700 font-medium truncate">
                    {getGroupLabel(currentUser.groupPreference)}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 inline-block text-[10px] bg-teal-50 text-teal-800 font-semibold px-2 py-0.5 rounded">
                      Style: {getGroupLabel(currentUser.groupPreference)}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenVault();
                      }}
                      className="w-full px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-sky-700" />
                        <span>Trip Vault & Passes</span>
                      </span>
                      <span className="text-[10px] bg-teal-100 text-teal-900 px-1.5 rounded font-bold">5</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenMyTrips();
                      }}
                      className="w-full px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-stone-400" />
                        <span>Saved Itineraries</span>
                      </span>
                      <span className="text-[11px] font-semibold text-teal-800">
                        {savedTripsCount}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenSignIn();
                      }}
                      className="w-full px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-stone-400" />
                      <span>Account Settings</span>
                    </button>

                    {onOpenDocuments && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenDocuments();
                        }}
                        className="w-full px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Travel Document Locker</span>
                      </button>
                    )}

                    {onOpenUPIPay && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenUPIPay();
                        }}
                        className="w-full px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                      >
                        <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
                        <span>UPI Fast Pay & QR</span>
                      </button>
                    )}

                    {onOpenAppsHub && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenAppsHub();
                        }}
                        className="w-full px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Cabs, Food & Shopping Apps</span>
                      </button>
                    )}

                    {onOpenSOS && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenSOS();
                        }}
                        className="w-full px-4 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        <span>Emergency SOS Hub</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onSignOut?.();
                      }}
                      className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged out state */
            <button
              onClick={onOpenSignIn}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-xs font-semibold text-stone-700 hover:text-teal-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <User className="w-4 h-4 text-stone-500" />
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={onOpenPlanner}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-white bg-teal-800 rounded-lg hover:bg-teal-900 active:scale-[0.98] transition-all shadow-xs whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span className="hidden sm:inline">Plan My Trip</span>
            <span className="sm:hidden">Plan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
