import React from 'react';
import { Compass, Globe, Shield } from 'lucide-react';

interface FooterProps {
  onNavigateHome: () => void;
  onOpenMyTrips: () => void;
  onOpenSOS?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateHome, onOpenMyTrips, onOpenSOS }) => {
  return (
    <footer className="border-t border-stone-200/80 bg-white text-stone-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-teal-800 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0F172A]">
                Voyan
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed max-w-sm mb-6">
              AI-driven travel planning built for mindful adventurers. Generate day-by-day itineraries, discover authentic regional cuisine, and navigate with ease.
            </p>
            <div className="flex items-center gap-3 text-xs text-stone-500">
              <span className="flex items-center gap-1 font-medium">
                <Globe className="w-3.5 h-3.5 text-stone-400" />
                <span>India · INR (₹)</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-medium">
                <Shield className="w-3.5 h-3.5 text-stone-400" />
                <span>Verified Local Partners</span>
              </span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-500">
              <li>
                <button onClick={onNavigateHome} className="hover:text-teal-900 transition-colors">
                  Featured Journeys
                </button>
              </li>
              <li>
                <a href="#popular-destinations" className="hover:text-teal-900 transition-colors">
                  Hill Stations & Valleys
                </a>
              </li>
              <li>
                <a href="#popular-destinations" className="hover:text-teal-900 transition-colors">
                  Heritage Palaces & Forts
                </a>
              </li>
              <li>
                <a href="#popular-destinations" className="hover:text-teal-900 transition-colors">
                  Coastal Retreats
                </a>
              </li>
            </ul>
          </div>

          {/* Planning Tools */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">
              Planning Tools
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-500">
              <li>
                <button onClick={onOpenMyTrips} className="hover:text-teal-900 transition-colors">
                  Saved Itineraries
                </button>
              </li>
              {onOpenSOS && (
                <li>
                  <button
                    onClick={onOpenSOS}
                    className="text-red-600 hover:text-red-700 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Emergency SOS Hub (112)</span>
                  </button>
                </li>
              )}
              <li>
                <span className="text-stone-400">Budget Estimator (INR)</span>
              </li>
              <li>
                <span className="text-stone-400">Local Transit Timetables</span>
              </li>
              <li>
                <span className="text-stone-400">Regional Cuisine Guides</span>
              </li>
            </ul>
          </div>

          {/* Voyan Guarantee */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-4">
              About Voyan
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed mb-4">
              Original intelligent travel synthesizer tailored to real transport intervals and verified budget limits.
            </p>
            <div className="text-[11px] text-stone-400">
              © {new Date().getFullYear()} Voyan Travel Technologies. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
