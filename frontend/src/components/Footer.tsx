import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#f9f3e9] mt-12 py-8 border-t border-[#eee7dd]">
      <div className="w-full px-5 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#3d627f] text-[18px]">
            water_drop
          </span>
          <span className="text-[13px] text-[#42474d]">
            AquaLedger Municipal Water Systems Architecture • Civic Telemetry Platform
          </span>
        </div>
        <div className="flex items-center gap-8">
          <span className="text-[11px] text-[#72787e] uppercase tracking-wider font-semibold">
            ISO-14046 Verified
          </span>
          <span className="text-[13px] text-[#42474d]">
            © 2025 Municipal Water Works Directorate
          </span>
        </div>
      </div>
    </footer>
  );
};
