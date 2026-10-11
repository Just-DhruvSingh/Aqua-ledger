import React, { useState, useRef, useEffect } from 'react';
import { ScreenId } from '../types';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  selectedWard: string;
  onSelectWard: (ward: string) => void;
  isScadaSynced: boolean;
  onTriggerSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  selectedWard,
  onSelectWard,
  isScadaSynced,
  onTriggerSync,
}) => {
  const [wardDropdownOpen, setWardDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const wardRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const wards = ['Ward Alpha', 'Ward Beta', 'Ward Gamma', 'Ward Delta'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wardRef.current && !wardRef.current.contains(event.target as Node)) {
        setWardDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fff9ee]/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)] border-b border-[#eee7dd]">
      <div className="h-20 w-full px-5 lg:px-10 flex items-center justify-between">
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('network-map')}
            className="flex items-center gap-1.5 focus:outline-none text-left group"
          >
            <span className="material-symbols-outlined text-[#3d627f] text-[26px] group-hover:scale-105 transition-transform">
              water_drop
            </span>
            <span className="text-[18px] text-[#1d1b15] tracking-tight font-semibold">
              AquaLedger
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-7">
            <button
              onClick={() => onNavigate('network-map')}
              className={`text-[14px] transition-colors py-1 ${
                currentScreen === 'network-map'
                  ? 'text-[#1d1b15] font-semibold border-b-2 border-[#3d627f]'
                  : 'text-[#42474d] hover:text-[#1d1b15] font-normal'
              }`}
            >
              Network Map
            </button>
            <button
              onClick={() => onNavigate('telemetry-inspector')}
              className={`text-[14px] transition-colors py-1 ${
                currentScreen === 'telemetry-inspector'
                  ? 'text-[#1d1b15] font-semibold border-b-2 border-[#3d627f]'
                  : 'text-[#42474d] hover:text-[#1d1b15] font-normal'
              }`}
            >
              Telemetry Inspector
            </button>
            <button
              onClick={() => onNavigate('equity-analytics')}
              className={`text-[14px] transition-colors py-1 ${
                currentScreen === 'equity-analytics'
                  ? 'text-[#1d1b15] font-semibold border-b-2 border-[#3d627f]'
                  : 'text-[#42474d] hover:text-[#1d1b15] font-normal'
              }`}
            >
              Equity Analytics
            </button>
            <button
              onClick={() => onNavigate('system-settings')}
              className={`text-[14px] transition-colors py-1 ${
                currentScreen === 'system-settings'
                  ? 'text-[#1d1b15] font-semibold border-b-2 border-[#3d627f]'
                  : 'text-[#42474d] hover:text-[#1d1b15] font-normal'
              }`}
            >
              System Settings
            </button>
          </nav>
        </div>

        {/* Right: Ward selector, SCADA Synced, Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Ward selector dropdown */}
          <div className="relative" ref={wardRef}>
            <button
              onClick={() => setWardDropdownOpen(!wardDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f9f3e9] transition-colors rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-[#e8e2d8]"
            >
              <span className="material-symbols-outlined text-[#426370] text-[16px]">
                location_city
              </span>
              <span className="text-[12px] text-[#1d1b15] font-medium">
                {selectedWard}
              </span>
              <span className="material-symbols-outlined text-[#72787e] text-[16px]">
                expand_more
              </span>
            </button>

            {wardDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#e8e2d8] py-1.5 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#72787e]">
                  Hydraulic Districts
                </div>
                {wards.map((ward) => (
                  <button
                    key={ward}
                    onClick={() => {
                      onSelectWard(ward);
                      setWardDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between hover:bg-[#f9f3e9] transition-colors ${
                      selectedWard === ward
                        ? 'font-semibold text-[#3d627f] bg-[#f9f3e9]/60'
                        : 'text-[#1d1b15]'
                    }`}
                  >
                    <span>{ward}</span>
                    {selectedWard === ward && (
                      <span className="material-symbols-outlined text-[16px] text-[#3d627f]">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SCADA Synced Status Pill */}
          <button
            onClick={onTriggerSync}
            title="Click to trigger manual SCADA synchronization"
            className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#f9f3e9] transition-colors rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-[#e8e2d8] cursor-pointer"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isScadaSynced ? 'bg-[#426370] animate-pulse' : 'bg-[#ef8820]'
              }`}
            />
            <span className="text-[11px] uppercase text-[#426370] font-semibold tracking-wider">
              {isScadaSynced ? 'SCADA Synced' : 'Syncing...'}
            </span>
          </button>

          {/* Download Code ZIP button */}
          <a
            href="/aqualedger-source-code.zip"
            download="aqualedger-source-code.zip"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#3d627f] hover:bg-[#234a66] text-white rounded-xl text-[12px] font-semibold shadow-xs transition-colors cursor-pointer"
            title="Download full project source code as ZIP"
          >
            <span className="material-symbols-outlined text-[16px]">folder_zip</span>
            <span>Download ZIP</span>
          </a>

          {/* Profile Circle */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-8 h-8 rounded-full bg-[#3d627f] hover:bg-[#32516a] transition-colors flex items-center justify-center shadow-sm"
              title="Chief Hydrologist Operator Profile"
            >
              <span className="material-symbols-outlined text-white text-[18px]">
                person
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[#e8e2d8] p-3 z-50">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#eee7dd]">
                  <div className="w-9 h-9 rounded-full bg-[#3d627f] text-white flex items-center justify-center font-semibold text-xs">
                    CH
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1d1b15] truncate">
                      Dr. M. Vance
                    </p>
                    <p className="text-[11px] text-[#72787e] truncate">
                      Chief District Hydrologist
                    </p>
                  </div>
                </div>
                <div className="py-2 text-[12px] space-y-1 text-[#42474d]">
                  <div className="flex justify-between">
                    <span className="text-[#72787e]">SCADA Terminal:</span>
                    <span className="font-mono text-[#1d1b15]">HMI-04-A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#72787e]">Access Level:</span>
                    <span className="text-[#3d627f] font-medium">Supervisor (L4)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#72787e]">Key Cipher:</span>
                    <span className="font-mono text-[#1d1b15]">ChaCha20 #d481</span>
                  </div>
                </div>
                <a
                  href="/aqualedger-source-code.zip"
                  download="aqualedger-source-code.zip"
                  className="w-full mt-1 pt-2 border-t border-[#eee7dd] text-left text-[12px] text-[#3d627f] font-semibold hover:underline flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">folder_zip</span>
                    <span>Download Project ZIP</span>
                  </span>
                  <span className="material-symbols-outlined text-[16px]">
                    download
                  </span>
                </a>
                <button
                  onClick={() => {
                    onNavigate('system-settings');
                    setUserMenuOpen(false);
                  }}
                  className="w-full mt-1 pt-2 border-t border-[#eee7dd] text-left text-[12px] text-[#42474d] hover:text-[#1d1b15] font-semibold hover:underline flex items-center justify-between"
                >
                  <span>Open System Configuration</span>
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <div className="lg:hidden flex items-center justify-around border-t border-[#eee7dd] bg-[#fff9ee] py-2 px-3 text-[12px]">
        <button
          onClick={() => onNavigate('network-map')}
          className={`px-2 py-1 rounded-lg ${
            currentScreen === 'network-map'
              ? 'font-semibold text-[#3d627f] bg-white'
              : 'text-[#42474d]'
          }`}
        >
          Network Map
        </button>
        <button
          onClick={() => onNavigate('telemetry-inspector')}
          className={`px-2 py-1 rounded-lg ${
            currentScreen === 'telemetry-inspector'
              ? 'font-semibold text-[#3d627f] bg-white'
              : 'text-[#42474d]'
          }`}
        >
          Inspector
        </button>
        <button
          onClick={() => onNavigate('equity-analytics')}
          className={`px-2 py-1 rounded-lg ${
            currentScreen === 'equity-analytics'
              ? 'font-semibold text-[#3d627f] bg-white'
              : 'text-[#42474d]'
          }`}
        >
          Equity
        </button>
        <button
          onClick={() => onNavigate('system-settings')}
          className={`px-2 py-1 rounded-lg ${
            currentScreen === 'system-settings'
              ? 'font-semibold text-[#3d627f] bg-white'
              : 'text-[#42474d]'
          }`}
        >
          Settings
        </button>
      </div>
    </header>
  );
};
