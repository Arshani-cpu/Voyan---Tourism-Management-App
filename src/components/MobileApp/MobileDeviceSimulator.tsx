import React, { useState } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, Maximize2, Minimize2, RotateCcw, X, Sparkles } from 'lucide-react';

export type DeviceModel = 'iphone16' | 'pixel9' | 'fullscreen_mobile';

interface MobileDeviceSimulatorProps {
  children: React.ReactNode;
  isMobileSimActive: boolean;
  onToggleMobileSim: () => void;
  activeDevice?: DeviceModel;
  onDeviceChange?: (device: DeviceModel) => void;
}

export const MobileDeviceSimulator: React.FC<MobileDeviceSimulatorProps> = ({
  children,
  isMobileSimActive,
  onToggleMobileSim,
  activeDevice = 'iphone16',
  onDeviceChange,
}) => {
  const [device, setDevice] = useState<DeviceModel>(activeDevice);

  const handleSelectDevice = (d: DeviceModel) => {
    setDevice(d);
    if (onDeviceChange) onDeviceChange(d);
  };

  if (!isMobileSimActive) {
    return <>{children}</>;
  }

  // Fullscreen Mobile Web View (replaces desktop completely with pure mobile layout)
  if (device === 'fullscreen_mobile') {
    return (
      <div className="min-h-screen bg-[#FBFBFA] flex flex-col max-w-md mx-auto shadow-2xl border-x border-stone-200 relative">
        {/* Top Control Bar for Mobile Mode */}
        <div className="sticky top-0 z-50 bg-stone-900 text-white px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-teal-400" />
            <span className="font-bold">Voyan Mobile PWA</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectDevice('iphone16')}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-[11px] font-medium"
            >
              Device Frame
            </button>
            <button
              onClick={onToggleMobileSim}
              className="px-2.5 py-0.5 rounded bg-teal-800 hover:bg-teal-700 text-white font-bold text-[11px]"
            >
              Exit Mobile
            </button>
          </div>
        </div>

        {/* Pure Mobile Content */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    );
  }

  // Device Chassis Mode (iPhone 16 Pro or Pixel 9)
  const isIphone = device === 'iphone16';

  return (
    <div className="min-h-screen bg-[#0F172A] py-4 px-2 sm:px-4 flex flex-col items-center justify-center relative select-none">
      {/* Top Floating Control Bar */}
      <div className="mb-3 flex items-center justify-between w-full max-w-[420px] px-3 py-1.5 rounded-2xl bg-stone-900/90 backdrop-blur-md border border-stone-800 text-stone-300 text-xs shadow-lg">
        <div className="flex items-center gap-2 font-bold text-white">
          <div className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[10px]">
            ●
          </div>
          <span>Voyan Mobile App</span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-stone-800 p-0.5 rounded-xl text-[11px]">
          <button
            onClick={() => handleSelectDevice('iphone16')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              device === 'iphone16' ? 'bg-teal-800 text-white font-bold' : 'hover:text-white'
            }`}
          >
            iPhone
          </button>
          <button
            onClick={() => handleSelectDevice('pixel9')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              device === 'pixel9' ? 'bg-teal-800 text-white font-bold' : 'hover:text-white'
            }`}
          >
            Pixel 9
          </button>
          <button
            onClick={() => handleSelectDevice('fullscreen_mobile')}
            className="px-2 py-1 rounded-lg hover:text-white transition-colors cursor-pointer"
            title="Expand to Fullscreen Mobile View"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={onToggleMobileSim}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold transition-colors cursor-pointer border border-stone-700 text-[11px]"
        >
          <Monitor className="w-3 h-3 text-stone-300" />
          <span>Desktop</span>
        </button>
      </div>

      {/* Realistic Smartphone Chassis Frame */}
      <div
        className={`relative w-full ${
          isIphone ? 'max-w-[393px] h-[852px] rounded-[55px]' : 'max-w-[412px] h-[860px] rounded-[48px]'
        } bg-[#FBFBFA] shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_0_12px_#1E293B,0_0_0_14px_#334155] overflow-hidden flex flex-col border border-stone-800 transition-all`}
      >
        {/* Native Mobile Status Bar & Dynamic Island / Punch Hole */}
        <div className="h-11 bg-[#FBFBFA] shrink-0 px-7 flex items-center justify-between text-stone-900 text-xs font-semibold select-none z-50">
          <span className="font-mono text-[11px] font-bold">9:41</span>

          {/* Dynamic Island (iPhone) or Punch Hole (Pixel) */}
          {isIphone ? (
            <div className="w-24 h-5 rounded-full bg-black flex items-center justify-end px-2 gap-1.5 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-stone-800" />
            </div>
          ) : (
            <div className="w-3.5 h-3.5 rounded-full bg-black shadow-xs mx-auto" />
          )}

          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="text-[10px] font-bold">5G</span>
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 text-stone-900" />
          </div>
        </div>

        {/* Scrollable Mobile App Viewport */}
        <div className="flex-1 overflow-y-auto scrollbar-thin text-left flex flex-col relative">
          {children}
        </div>

        {/* Home Bar Gesture Indicator */}
        <div className="h-4 bg-[#FBFBFA] shrink-0 flex items-center justify-center relative select-none">
          <div className="w-32 h-1 bg-stone-900/40 rounded-full" />
        </div>
      </div>

      <div className="mt-3 text-[11px] text-stone-400 text-center">
        ⚡ PWA Enabled • Offline SQLite/Cache Ready • DGCA Travel Safe
      </div>
    </div>
  );
};
