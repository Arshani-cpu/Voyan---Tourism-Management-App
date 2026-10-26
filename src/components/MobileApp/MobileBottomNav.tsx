import React from 'react';
import { Compass, Map, FolderArchive, DollarSign, Luggage, Zap } from 'lucide-react';

interface MobileBottomNavProps {
  activeView: 'home' | 'planner';
  plannerSubTab?: 'itinerary' | 'vault' | 'packing' | 'budget_transit' | 'nearby';
  onNavigateHome: () => void;
  onNavigatePlanner: () => void;
  onNavigateVault: () => void;
  onNavigatePacking: () => void;
  onNavigateExpenses: () => void;
  onOpenAppsHub?: () => void;
  vaultItemsCount?: number;
  isSimulated?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  plannerSubTab = 'itinerary',
  onNavigateHome,
  onNavigatePlanner,
  onNavigateVault,
  onNavigatePacking,
  onNavigateExpenses,
  onOpenAppsHub,
  vaultItemsCount = 5,
  isSimulated = false,
}) => {
  const positionClass = isSimulated
    ? 'sticky bottom-0 left-0 right-0 z-40'
    : 'fixed bottom-0 left-0 right-0 z-40 lg:hidden';

  return (
    <nav
      className={`voyan-mobile-nav ${positionClass} bg-[#FBFBFA]/97 backdrop-blur-lg border-t border-stone-200/90 pt-1 px-1 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.08)]`}
      style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom, 6px))' }}
    >
      {/* 1. Explore */}
      <button
        onClick={onNavigateHome}
        className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer min-w-0 flex-1 ${
          activeView === 'home'
            ? 'text-teal-900 font-extrabold'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Compass className={`w-5 h-5 shrink-0 ${activeView === 'home' ? 'text-teal-800 stroke-[2.5]' : ''}`} />
        <span className="text-[9px] font-semibold leading-tight whitespace-nowrap">Explore</span>
      </button>

      {/* 2. Itinerary */}
      <button
        onClick={onNavigatePlanner}
        aria-current={activeView === 'planner' && plannerSubTab === 'itinerary' ? 'page' : undefined}
        aria-label="Open itinerary"
        className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer min-w-0 flex-1 ${
          activeView === 'planner' && plannerSubTab === 'itinerary'
            ? 'text-teal-900 font-extrabold'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Map
          className={`w-5 h-5 shrink-0 ${
            activeView === 'planner' && plannerSubTab === 'itinerary'
              ? 'text-teal-800 stroke-[2.5]'
              : ''
          }`}
        />
        <span className="text-[9px] font-semibold leading-tight whitespace-nowrap">Itinerary</span>
      </button>

      {/* 3. Trip Vault (Boarding Passes & Tickets) */}
      <button
        onClick={onNavigateVault}
        aria-current={activeView === 'planner' && plannerSubTab === 'vault' ? 'page' : undefined}
        aria-label="Open trip vault"
        className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all relative cursor-pointer min-w-0 flex-1 ${
          activeView === 'planner' && plannerSubTab === 'vault'
            ? 'text-teal-900 font-extrabold'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <div className="relative">
          <FolderArchive
            className={`w-5 h-5 shrink-0 ${
              activeView === 'planner' && plannerSubTab === 'vault'
                ? 'text-teal-800 stroke-[2.5]'
                : ''
            }`}
          />
          {vaultItemsCount > 0 && (
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-teal-800 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
              {vaultItemsCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-semibold leading-tight whitespace-nowrap">Vault</span>
      </button>

      {/* 4. Automated Packing List */}
      <button
        onClick={onNavigatePacking}
        aria-current={activeView === 'planner' && plannerSubTab === 'packing' ? 'page' : undefined}
        aria-label="Open packing list"
        className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer min-w-0 flex-1 ${
          activeView === 'planner' && plannerSubTab === 'packing'
            ? 'text-teal-900 font-extrabold'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Luggage
          className={`w-5 h-5 shrink-0 ${
            activeView === 'planner' && plannerSubTab === 'packing'
              ? 'text-teal-800 stroke-[2.5]'
              : ''
          }`}
        />
        <span className="text-[9px] font-semibold leading-tight whitespace-nowrap">Packing</span>
      </button>

      {/* 5. Expenses & Split */}
      <button
        onClick={onNavigateExpenses}
        aria-current={activeView === 'planner' && plannerSubTab === 'budget_transit' ? 'page' : undefined}
        aria-label="Open expenses and transit"
        className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer min-w-0 flex-1 ${
          activeView === 'planner' && plannerSubTab === 'budget_transit'
            ? 'text-teal-900 font-extrabold'
            : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <DollarSign
          className={`w-5 h-5 shrink-0 ${
            activeView === 'planner' && plannerSubTab === 'budget_transit'
              ? 'text-teal-800 stroke-[2.5]'
              : ''
          }`}
        />
        <span className="text-[9px] font-semibold leading-tight whitespace-nowrap">Expenses</span>
      </button>

      {/* 6. On-Demand Apps (Cabs, Food & Shopping) */}
      {onOpenAppsHub && (
        <button
          onClick={onOpenAppsHub}
          aria-label="Open on-demand travel, food, and shopping apps"
          className="flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl transition-all cursor-pointer text-amber-700 hover:text-amber-900 active:scale-95 min-w-0 flex-1"
        >
          <div className="relative shrink-0">
            <Zap className="w-5 h-5 text-amber-600 fill-amber-500" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          </div>
          <span className="text-[9px] font-bold text-amber-900 leading-tight whitespace-nowrap">Apps</span>
        </button>
      )}
    </nav>
  );
};
