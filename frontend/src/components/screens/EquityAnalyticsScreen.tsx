import React, { useState } from 'react';
import { SectorParityData, ScreenId } from '../../types';
import { INITIAL_SECTORS } from '../../data/mockData';
import { ExportLedgerModal } from '../modals/ExportLedgerModal';
import { MethodologyModal } from '../modals/MethodologyModal';

interface EquityAnalyticsScreenProps {
  selectedWard: string;
  onNavigate: (screen: ScreenId) => void;
  onInspectNode: (nodeId: string) => void;
}

export const EquityAnalyticsScreen: React.FC<EquityAnalyticsScreenProps> = ({
  selectedWard,
  onNavigate,
  onInspectNode,
}) => {
  const [sectors, setSectors] = useState<SectorParityData[]>(INITIAL_SECTORS);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [methodologyModalOpen, setMethodologyModalOpen] = useState<boolean>(false);
  const [dateRangeOpen, setDateRangeOpen] = useState<boolean>(false);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('Q2 2025 (Apr-Jun)');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedSectorDetail, setSelectedSectorDetail] = useState<SectorParityData | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<{ month: string; score: number } | null>(null);

  const monthsData = [
    { month: 'Jul', score: 74.2, x: 50, y: 148 },
    { month: 'Aug', score: 75.8, x: 96, y: 140 },
    { month: 'Sep', score: 77.1, x: 142, y: 130 },
    { month: 'Oct', score: 78.4, x: 188, y: 122 },
    { month: 'Nov', score: 79.9, x: 234, y: 110 },
    { month: 'Dec', score: 81.2, x: 280, y: 98 },
    { month: 'Jan', score: 82.0, x: 326, y: 90 },
    { month: 'Feb', score: 82.7, x: 372, y: 84 },
    { month: 'Mar', score: 83.5, x: 418, y: 74 },
    { month: 'Apr', score: 84.1, x: 464, y: 65 },
    { month: 'May', score: 84.6, x: 510, y: 56 },
  ];

  const filteredSectors = sectors.filter(
    (s) =>
      s.sectorName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.hub.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Editorial Header */}
      <div className="py-2 mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-1.5 text-[#3d627f] text-[11px] uppercase tracking-widest mb-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3d627f]"></span>
              Civic Audit • Q2 Hydrographic Record
            </div>
            <h1 className="text-[26px] sm:text-[30px] text-[#1d1b15] font-semibold tracking-tight">
              Municipal Water Equity & Distribution
            </h1>
            <p className="text-[14px] text-[#42474d] mt-1 max-w-2xl">
              Tracking hydraulic parity, uptime integrity, and clean water delivery across all municipal sectors.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl shadow-xs hover:bg-[#f9f3e9] transition-colors border border-[#e8e2d8]"
              >
                <span className="material-symbols-outlined text-[#426370] text-[18px]">
                  domain
                </span>
                <span className="text-[12px] text-[#1d1b15] font-semibold">
                  {selectedWard} (Central)
                </span>
              </button>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDateRangeOpen(!dateRangeOpen)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#1d1b15] rounded-xl shadow-xs hover:bg-[#f9f3e9] transition-colors border border-[#e8e2d8] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#42474d] text-[18px]">
                  tune
                </span>
                <span className="text-[12px] font-medium">{selectedDateRange}</span>
              </button>

              {dateRangeOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#e8e2d8] py-1.5 z-50">
                  {['Q2 2025 (Apr-Jun)', 'Q1 2025 (Jan-Mar)', 'Full Year 2024', 'Custom Date Range'].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setSelectedDateRange(r);
                        setDateRangeOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[12px] hover:bg-[#f9f3e9] transition-colors ${
                        selectedDateRange === r ? 'font-semibold text-[#3d627f]' : 'text-[#1d1b15]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#3d627f] text-white rounded-xl shadow-xs hover:bg-[#234a66] transition-colors cursor-pointer font-semibold text-[12px]"
            >
              <span className="material-symbols-outlined text-[18px]">ios_share</span>
              <span>Export Ledger</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-[#42474d] uppercase tracking-wider font-semibold">
              Ward Equity Score
            </span>
            <span className="w-8 h-8 rounded-full bg-[#f9f3e9] flex items-center justify-center text-[#3d627f] border border-[#eee7dd]">
              <span className="material-symbols-outlined text-[18px]">balance</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-telemetry-num text-[38px] text-[#1d1b15] font-semibold tracking-tight">
                84.6
              </span>
              <span className="text-[14px] text-[#72787e]">/ 100</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="material-symbols-outlined text-[#426370] text-[16px]">
                trending_up
              </span>
              <span className="text-[12px] text-[#426370] font-semibold">+4.2% YoY</span>
              <span className="text-[11px] text-[#72787e] ml-1">vs target 80.0</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-[#42474d] uppercase tracking-wider font-semibold">
              Supply Reliability
            </span>
            <span className="w-8 h-8 rounded-full bg-[#f9f3e9] flex items-center justify-center text-[#426370] border border-[#eee7dd]">
              <span className="material-symbols-outlined text-[18px]">valve</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-telemetry-num text-[38px] text-[#1d1b15] font-semibold tracking-tight">
                96.4%
              </span>
              <span className="text-[14px] text-[#72787e]">Uptime</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-[#426370]"></span>
              <span className="text-[12px] text-[#426370] font-semibold">
                Exceeds Mandate
              </span>
              <span className="text-[11px] text-[#72787e] ml-1">(95.0% min)</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-[#42474d] uppercase tracking-wider font-semibold">
              Daily Disparity
            </span>
            <span className="w-8 h-8 rounded-full bg-[#f9f3e9] flex items-center justify-center text-[#904d00] border border-[#eee7dd]">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-telemetry-num text-[38px] text-[#1d1b15] font-semibold tracking-tight">
                1.8
              </span>
              <span className="text-[14px] text-[#72787e]">hrs variance</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="material-symbols-outlined text-[#426370] text-[16px]">
                arrow_downward
              </span>
              <span className="text-[12px] text-[#426370] font-semibold">-0.4 hrs</span>
              <span className="text-[11px] text-[#72787e] ml-1">last 30 days</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-[#42474d] uppercase tracking-wider font-semibold">
              Non-Revenue Water
            </span>
            <span className="w-8 h-8 rounded-full bg-[#f9f3e9] flex items-center justify-center text-[#3d627f] border border-[#eee7dd]">
              <span className="material-symbols-outlined text-[18px]">opacity</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-telemetry-num text-[38px] text-[#1d1b15] font-semibold tracking-tight">
                18.2%
              </span>
              <span className="text-[14px] text-[#72787e]">NRW Loss</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="material-symbols-outlined text-[#426370] text-[16px]">
                check_circle
              </span>
              <span className="text-[12px] text-[#42474d] font-semibold">Optimal Band</span>
              <span className="text-[11px] text-[#72787e] ml-1">(&lt;20% benchmark)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: 12-Month Curve (7 cols) + Supply Reliability by Sector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* Left (7 cols): Evolution Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-[18px] text-[#1d1b15] font-semibold">
                  12-Month Equity Score Evolution
                </h2>
                <p className="text-[13px] text-[#42474d] mt-0.5">
                  Rolling parity metric tracked against municipal benchmark 80.0
                </p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="text-[11px] text-[#72787e] uppercase tracking-wider font-semibold">
                  Index Range
                </span>
                <span className="text-[12px] text-[#3d627f] font-semibold bg-[#c2e5f5]/40 px-2.5 py-1 rounded-xl border border-[#a5cbec]">
                  74 → 85
                </span>
              </div>
            </div>

            {/* SVG Graph */}
            <div className="w-full mt-4 relative">
              <svg
                className="w-full h-56 text-[#3d627f] overflow-visible"
                fill="none"
                viewBox="0 0 540 220"
              >
                <defs>
                  <linearGradient id="gradient-serene" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3D627F" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3D627F" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line x1="40" y1="30" x2="520" y2="30" stroke="#E8E2D8" strokeDasharray="3 3" strokeWidth="1" />
                <text x="32" y="34" fill="#72787E" fontFamily="Plus Jakarta Sans" fontSize="10" textAnchor="end">
                  90
                </text>

                {/* Benchmark line at 80 */}
                <line x1="40" y1="80" x2="520" y2="80" stroke="#A5CBEC" strokeDasharray="4 4" strokeWidth="1.2" />
                <text x="32" y="84" fill="#81A6C6" fontFamily="Plus Jakarta Sans" fontSize="10" textAnchor="end">
                  80
                </text>
                <text x="524" y="84" fill="#81A6C6" fontFamily="Plus Jakarta Sans" fontSize="9" textAnchor="start" fontWeight="600">
                  Benchmark
                </text>

                <line x1="40" y1="130" x2="520" y2="130" stroke="#E8E2D8" strokeDasharray="3 3" strokeWidth="1" />
                <text x="32" y="134" fill="#72787E" fontFamily="Plus Jakarta Sans" fontSize="10" textAnchor="end">
                  70
                </text>

                <line x1="40" y1="180" x2="520" y2="180" stroke="#E8E2D8" strokeWidth="1" />
                <text x="32" y="184" fill="#72787E" fontFamily="Plus Jakarta Sans" fontSize="10" textAnchor="end">
                  60
                </text>

                {/* Shaded Area */}
                <path
                  d="M 50 148 C 88 142, 126 130, 165 125 C 203 120, 242 110, 280 98 C 319 86, 357 82, 396 74 C 434 66, 472 60, 510 56 L 510 180 L 50 180 Z"
                  fill="url(#gradient-serene)"
                />

                {/* Smooth Curve */}
                <path
                  d="M 50 148 C 88 142, 126 130, 165 125 C 203 120, 242 110, 280 98 C 319 86, 357 82, 396 74 C 434 66, 472 60, 510 56"
                  fill="none"
                  stroke="#3D627F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                {monthsData.map((pt) => (
                  <g
                    key={pt.month}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredMonth({ month: pt.month, score: pt.score })}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#3D627F" />
                    <circle cx={pt.x} cy={pt.y} r="2" fill="#FFFFFF" />
                  </g>
                ))}

                {/* End Circle */}
                <circle cx="510" cy="56" r="4.5" fill="#3D627F" />
                <circle cx="510" cy="56" r="2" fill="#FFFFFF" />

                {/* Month labels */}
                <g fill="#72787E" fontFamily="Plus Jakarta Sans" fontSize="10" textAnchor="middle">
                  <text x="50" y="200">Jul</text>
                  <text x="96" y="200">Aug</text>
                  <text x="142" y="200">Sep</text>
                  <text x="188" y="200">Oct</text>
                  <text x="234" y="200">Nov</text>
                  <text x="280" y="200">Dec</text>
                  <text x="326" y="200">Jan</text>
                  <text x="372" y="200">Feb</text>
                  <text x="418" y="200">Mar</text>
                  <text x="464" y="200">Apr</text>
                  <text x="510" y="200">May</text>
                </g>
              </svg>

              {/* Tooltip */}
              {hoveredMonth && (
                <div className="absolute top-2 right-2 bg-[#33302a] text-[#f6f0e6] px-3 py-1 rounded-md text-[11px] font-mono shadow-md">
                  {hoveredMonth.month} Score: <strong>{hoveredMonth.score}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 bg-[#f9f3e9]/60 px-4 py-2.5 rounded-xl border border-[#eee7dd]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#426370] text-[16px]">
                verified
              </span>
              <span className="text-[13px] text-[#1d1b15]">
                Compliance maintained for 7 consecutive months above the civic standard.
              </span>
            </div>
            <button
              onClick={() => setMethodologyModalOpen(true)}
              className="text-[12px] text-[#3d627f] font-semibold hover:underline cursor-pointer"
            >
              Methodology →
            </button>
          </div>
        </div>

        {/* Right (5 cols): Supply Reliability by Sector */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-[18px] text-[#1d1b15] font-semibold">
                  Supply Reliability by Sector
                </h2>
                <p className="text-[13px] text-[#42474d] mt-0.5">
                  Top municipal subdivisions vs 95% threshold
                </p>
              </div>
              <span className="text-[11px] text-[#72787e] uppercase tracking-wider font-semibold">
                {selectedWard}
              </span>
            </div>

            <div className="space-y-4 mt-5">
              {sectors.slice(0, 5).map((sector) => {
                const isTarget = sector.reliabilityPercent >= 95;
                return (
                  <div key={sector.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[12px] font-medium text-[#1d1b15]">
                        {sector.sectorName}
                      </span>
                      <span
                        className={`text-[12px] font-semibold ${
                          isTarget ? 'text-[#3d627f]' : 'text-[#ef8820]'
                        }`}
                      >
                        {sector.reliabilityPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-[#f3ede3] rounded-full h-2 overflow-hidden border border-[#eee7dd]">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          isTarget ? 'bg-[#3d627f]' : 'bg-[#ef8820]'
                        }`}
                        style={{ width: `${sector.reliabilityPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 flex items-center justify-between text-[13px] text-[#42474d] border-t border-[#eee7dd]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3d627f]"></span>
              <span className="text-[11px] text-[#72787e] font-semibold">≥95% Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef8820]"></span>
              <span className="text-[11px] text-[#72787e] font-semibold">&lt;95% Attention</span>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('parity-roster-table');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[12px] text-[#3d627f] font-semibold hover:underline cursor-pointer"
            >
              Detailed Feed →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Sub-District Parity Roster Table */}
      <div id="parity-roster-table" className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-[18px] text-[#1d1b15] font-semibold">
              Sub-District Parity Roster
            </h2>
            <p className="text-[13px] text-[#42474d] mt-0.5">
              Audited hydraulic readings, pressure regularity, and household parity breakdown
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#72787e] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter sector or hub..."
                className="pl-9 pr-4 py-2 text-[13px] bg-[#f9f3e9] rounded-xl text-[#1d1b15] placeholder:text-[#72787e] focus:outline-none focus:bg-white border border-[#eee7dd] w-48 sm:w-64 transition-colors"
              />
            </div>
            <button
              onClick={() => setSectors([...sectors].reverse())}
              className="p-2 bg-[#f9f3e9] text-[#42474d] rounded-xl hover:bg-[#eee7dd] transition-colors border border-[#eee7dd] cursor-pointer"
              title="Reverse Order"
            >
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase text-[#72787e] tracking-wider font-semibold border-b border-[#eee7dd] bg-[#f9f3e9]/60">
                <th className="py-3 px-3">District Zone</th>
                <th className="py-3 px-3">Connected Households</th>
                <th className="py-3 px-3">Mean Pressure (Bar)</th>
                <th className="py-3 px-3">Daily Availability</th>
                <th className="py-3 px-3">NRW Ratio</th>
                <th className="py-3 px-3">Parity Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee7dd]/60 text-[13px]">
              {filteredSectors.slice(0, 5).map((sector) => (
                <tr key={sector.id} className="hover:bg-[#f9f3e9]/40 transition-colors">
                  <td className="py-4 px-3">
                    <div className="font-semibold text-[#1d1b15]">{sector.sectorName}</div>
                    <div className="text-[12px] text-[#72787e]">{sector.hub}</div>
                  </td>
                  <td className="py-4 px-3 text-[#1d1b15] font-mono">
                    {sector.households.toLocaleString()}
                  </td>
                  <td className="py-4 px-3 text-[#1d1b15]">
                    <span className="font-mono">{sector.pressureBar.toFixed(2)}</span>{' '}
                    <span className="text-[11px] text-[#72787e]">bar</span>
                  </td>
                  <td className="py-4 px-3 text-[#1d1b15]">
                    <span className="font-mono">{sector.dailyAvailabilityHours.toFixed(1)}</span>{' '}
                    <span className="text-[11px] text-[#72787e]">hrs/day</span>
                  </td>
                  <td className="py-4 px-3 text-[#1d1b15] font-mono">
                    {sector.nrwRatioPercent}%
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        sector.parityStatus === 'High Parity'
                          ? 'bg-[#c2e5f5]/60 text-[#466774] border-[#a5cbec]'
                          : sector.parityStatus === 'Moderate'
                          ? 'bg-[#f3ede3] text-[#42474d] border-[#e8e2d8]'
                          : 'bg-[#ffdcc3] text-[#6e3900] border-[#ffb77d]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          sector.parityStatus === 'High Parity'
                            ? 'bg-[#426370]'
                            : sector.parityStatus === 'Moderate'
                            ? 'bg-[#72787e]'
                            : 'bg-[#904d00]'
                        }`}
                      ></span>
                      {sector.parityStatus}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedSectorDetail(sector);
                      }}
                      className="text-[#42474d] hover:text-[#3d627f] transition-colors p-1 rounded-lg cursor-pointer"
                      title="Inspect Sector Diagnostics"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        chevron_right
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 text-[13px] text-[#42474d] border-t border-[#eee7dd] mt-2">
          <div>Showing 5 of 18 hydraulic sectors in {selectedWard}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-[#f9f3e9] rounded-xl text-[#1d1b15] font-medium hover:bg-[#eee7dd] transition-colors disabled:opacity-40 border border-[#eee7dd] cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 text-[12px] text-[#1d1b15] font-semibold">
              {currentPage} of 4
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(4, currentPage + 1))}
              className="px-3 py-1.5 bg-[#f9f3e9] rounded-xl text-[#1d1b15] font-medium hover:bg-[#eee7dd] transition-colors border border-[#eee7dd] cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Sector Quick Inspect Drawer/Modal if opened */}
      {selectedSectorDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-[#e8e2d8] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#3d627f] text-[20px]">
                  domain
                </span>
                <h3 className="text-[17px] font-semibold text-[#1d1b15]">
                  {selectedSectorDetail.sectorName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSectorDetail(null)}
                className="text-[#72787e] hover:text-[#1d1b15] p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between p-2.5 bg-[#f9f3e9] rounded-lg">
                <span className="text-[#42474d]">Assigned Hub:</span>
                <span className="font-semibold text-[#1d1b15]">{selectedSectorDetail.hub}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#f9f3e9] rounded-lg">
                <span className="text-[#42474d]">Connected Households:</span>
                <span className="font-semibold text-[#1d1b15]">
                  {selectedSectorDetail.households.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#f9f3e9] rounded-lg">
                <span className="text-[#42474d]">Mean Line Pressure:</span>
                <span className="font-semibold text-[#1d1b15]">
                  {selectedSectorDetail.pressureBar} bar (~{(selectedSectorDetail.pressureBar * 14.5038).toFixed(1)} PSI)
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#f9f3e9] rounded-lg">
                <span className="text-[#42474d]">Supply Reliability:</span>
                <span className="font-semibold text-[#3d627f]">
                  {selectedSectorDetail.reliabilityPercent}%
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#f9f3e9] rounded-lg">
                <span className="text-[#42474d]">Non-Revenue Water Loss:</span>
                <span className="font-semibold text-[#904d00]">
                  {selectedSectorDetail.nrwRatioPercent}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eee7dd]">
              <button
                onClick={() => setSelectedSectorDetail(null)}
                className="px-4 py-2 rounded-lg bg-[#f3ede3] hover:bg-[#eee7dd] text-[#1d1b15] text-[13px] font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedSectorDetail(null);
                  onInspectNode('TK-408');
                  onNavigate('telemetry-inspector');
                }}
                className="px-4 py-2 rounded-lg bg-[#3d627f] hover:bg-[#234a66] text-white text-[13px] font-semibold"
              >
                Open Node Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ExportLedgerModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        ward={selectedWard}
      />

      <MethodologyModal
        isOpen={methodologyModalOpen}
        onClose={() => setMethodologyModalOpen(false)}
      />
    </div>
  );
};
