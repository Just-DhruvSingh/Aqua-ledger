import React, { useState } from 'react';
import { TelemetryNode, NodeEventLog, ScreenId } from '../../types';
import { INITIAL_EVENT_LOGS } from '../../data/mockData';
import { DispatchTeamModal } from '../modals/DispatchTeamModal';
import { ExportLedgerModal } from '../modals/ExportLedgerModal';

interface TelemetryInspectorScreenProps {
  nodes: TelemetryNode[];
  selectedNodeId: string;
  onSelectNodeId: (id: string) => void;
  onNavigate: (screen: ScreenId) => void;
  selectedWard: string;
}

export const TelemetryInspectorScreen: React.FC<TelemetryInspectorScreenProps> = ({
  nodes,
  selectedNodeId,
  onSelectNodeId,
  onNavigate,
  selectedWard,
}) => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [pressure, setPressure] = useState<number>(64.2);
  const [flow, setFlow] = useState<number>(1420);
  const [valveOpen, setValveOpen] = useState<number>(84);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [eventLogs, setEventLogs] = useState<NodeEventLog[]>(INITIAL_EVENT_LOGS);
  const [dispatchModalOpen, setDispatchModalOpen] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [chartHoverPoint, setChartHoverPoint] = useState<{
    x: number;
    y: number;
    time: string;
    psi: string;
    flow: string;
  } | null>(null);

  const currentNode =
    nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleSyncStream = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const newP = +(64.0 + Math.random() * 0.5).toFixed(1);
      const newF = Math.round(1415 + Math.random() * 12);
      setPressure(newP);
      setFlow(newF);
      setActionFeedback('SCADA stream synchronized. Cryptographic block #842 verified.');
      setTimeout(() => setActionFeedback(''), 4000);
    }, 700);
  };

  const handleCalibrateZero = () => {
    setActionFeedback('Null-point recalibration sent to Fisher 667 Actuator.');
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const handleDiagnosticPulse = () => {
    setActionFeedback('Diagnostic packet injected. Latency response: 14ms (Pass).');
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const filteredLogs = eventLogs.filter(
    (log) =>
      log.eventClass.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.reading.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.operator.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.state.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.hash.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Breadcrumb & Metadata Action Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-1.5">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('network-map')}
              className="flex items-center gap-1 text-[13px] text-[#42474d] hover:text-[#3d627f] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Network Map</span>
            </button>
            <span className="text-[#42474d]/40 text-[13px]">/</span>
            <span className="text-[13px] text-[#42474d] font-medium">Diagnostic Nodes</span>
            <span className="text-[#42474d]/40 text-[13px]">/</span>
            <span className="text-[13px] text-[#3d627f] font-semibold">{currentNode.id}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="text-[26px] sm:text-[30px] text-[#1d1b15] tracking-tight font-semibold">
              Telemetry Node Inspector
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-xs border border-[#e8e2d8]">
              <span className="material-symbols-outlined text-[16px] text-[#3d627f]">hub</span>
              <select
                value={selectedNodeId}
                onChange={(e) => onSelectNodeId(e.target.value)}
                className="text-[12px] text-[#1d1b15] font-semibold tracking-wide bg-transparent focus:outline-none cursor-pointer"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    Node #{n.id} • {n.name}
                  </option>
                ))}
              </select>
              <span className="text-[#42474d]/40 text-[10px]">•</span>
              <span className="text-[12px] text-[#42474d]">
                {currentNode.sector}, {selectedWard}
              </span>
            </div>
          </div>
        </div>

        {/* Live Telemetry Status & Utility Actions */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-xs border border-[#e8e2d8]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a9ccdb] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#426370]"></span>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#426370]">
              Operational
            </span>
            <span className="text-[#c2c7ce] text-[11px]">|</span>
            <span className="text-[11px] text-[#42474d] font-mono">SCADA POLL 1.8s</span>
          </div>

          <button
            onClick={handleSyncStream}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#f9f3e9] transition-colors rounded-xl shadow-xs border border-[#e8e2d8] text-[#1d1b15] cursor-pointer"
          >
            <span
              className={`material-symbols-outlined text-[18px] text-[#42474d] ${
                isSyncing ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span className="text-[12px] font-medium">Sync Stream</span>
          </button>

          <button
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#3d627f] hover:bg-[#234a66] text-white transition-colors rounded-xl shadow-xs cursor-pointer font-semibold text-[12px]"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Ledger</span>
          </button>
        </div>
      </div>

      {/* Top Row: 4 Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {/* Metric 1: Hydraulic Pressure */}
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#42474d] font-semibold">
                Hydraulic Pressure
              </span>
              <span className="px-2 py-0.5 rounded-full text-[#426370] bg-[#f9f3e9] text-[11px] font-semibold border border-[#eee7dd]">
                Nominal
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-telemetry-num text-[36px] sm:text-[40px] text-[#1d1b15] font-semibold tracking-tight">
                {pressure.toFixed(1)}
              </span>
              <span className="text-[18px] text-[#42474d] font-medium">PSI</span>
            </div>
            <p className="text-[13px] text-[#42474d]">Safe envelope: 58.0 – 72.0 PSI</p>
          </div>
          <div className="mt-4 pt-2">
            <svg
              className="w-full h-10 overflow-visible"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 200 40"
            >
              <defs>
                <linearGradient id="pressure-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#81A6C6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#81A6C6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,28 Q25,20 50,22 T100,16 T150,24 T200,14 L200,40 L0,40 Z"
                fill="url(#pressure-grad)"
              />
              <path
                d="M0,28 Q25,20 50,22 T100,16 T150,24 T200,14"
                fill="none"
                stroke="#3D627F"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="200" cy="14" r="3" fill="#3D627F" />
            </svg>
          </div>
        </div>

        {/* Metric 2: Flow Velocity */}
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#42474d] font-semibold">
                Flow Velocity
              </span>
              <span className="material-symbols-outlined text-[#426370] text-[20px]">
                air
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-telemetry-num text-[36px] sm:text-[40px] text-[#1d1b15] font-semibold tracking-tight">
                {flow.toLocaleString()}
              </span>
              <span className="text-[18px] text-[#42474d] font-medium">LPM</span>
            </div>
            <p className="text-[13px] text-[#42474d]">
              Borehole Velocity: <strong className="text-[#1d1b15] font-medium">2.38 m/s</strong>
            </p>
          </div>
          <div className="mt-4 pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-[#42474d]">
              <span>Capacity Usage</span>
              <span className="font-semibold">71% of Peak Max</span>
            </div>
            <div className="w-full bg-[#f3ede3] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#3d627f] h-1.5 rounded-full transition-all duration-700"
                style={{ width: '71%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric 3: Actuator Position */}
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#42474d] font-semibold">
                Actuator Position
              </span>
              <span className="px-2 py-0.5 rounded-full text-[#3d627f] text-[11px] font-semibold bg-[#f9f3e9] border border-[#eee7dd]">
                VLV-9921-B
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-telemetry-num text-[36px] sm:text-[40px] text-[#1d1b15] font-semibold tracking-tight">
                {valveOpen}%
              </span>
              <span className="text-[18px] text-[#42474d] font-medium">Open</span>
            </div>
            <p className="text-[13px] text-[#42474d]">Servo angle: 75.6° • Calibrated</p>
          </div>
          <div className="mt-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-full bg-[#f3ede3] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#426370] h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${valveOpen}%` }}
                ></div>
              </div>
              <span className="text-[11px] text-[#42474d] font-mono whitespace-nowrap">
                STEP 4/5
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: Rupture Hazard Model */}
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#42474d] font-semibold">
                Rupture Hazard Model
              </span>
              <span className="material-symbols-outlined text-[#426370] text-[20px]">
                shield
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-telemetry-num text-[36px] sm:text-[40px] text-[#1d1b15] font-semibold tracking-tight">
                1.2%
              </span>
              <span className="text-[18px] text-[#426370] font-medium">Low Prob.</span>
            </div>
            <p className="text-[13px] text-[#42474d]">Automated cavitation lock armed</p>
          </div>
          <div className="mt-4 pt-2">
            <div className="flex items-center gap-2 text-[#42474d] text-[13px]">
              <span className="material-symbols-outlined text-[16px] text-[#426370]">
                verified_user
              </span>
              <span>Acoustic leak baseline normal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Asymmetric 60/40 Telemetry Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
        {/* Left Area (60%): 24-Hour Telemetry History Area Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] text-[#1d1b15] font-semibold">
                    {timeframe === '24h'
                      ? '24-Hour Synchronized Stream'
                      : timeframe === '7d'
                      ? '7-Day Synchronized Stream'
                      : '30-Day Aggregated Stream'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[#42474d] bg-[#f9f3e9] text-[11px] font-semibold border border-[#eee7dd]">
                    UTC-04
                  </span>
                </div>
                <p className="text-[13px] text-[#42474d] mt-0.5">
                  Hydraulic Pressure (PSI) juxtaposed with Velocity Flow (LPM)
                </p>
              </div>

              {/* Metric Granularity Switcher */}
              <div className="flex items-center bg-[#f3ede3] rounded-xl p-1 gap-1 self-start sm:self-auto border border-[#eee7dd]">
                <button
                  onClick={() => setTimeframe('24h')}
                  className={`px-3 py-1 text-[12px] rounded-lg transition-colors cursor-pointer ${
                    timeframe === '24h'
                      ? 'bg-white text-[#1d1b15] font-semibold shadow-xs'
                      : 'text-[#42474d] hover:text-[#1d1b15]'
                  }`}
                >
                  24h
                </button>
                <button
                  onClick={() => setTimeframe('7d')}
                  className={`px-3 py-1 text-[12px] rounded-lg transition-colors cursor-pointer ${
                    timeframe === '7d'
                      ? 'bg-white text-[#1d1b15] font-semibold shadow-xs'
                      : 'text-[#42474d] hover:text-[#1d1b15]'
                  }`}
                >
                  7d
                </button>
                <button
                  onClick={() => setTimeframe('30d')}
                  className={`px-3 py-1 text-[12px] rounded-lg transition-colors cursor-pointer ${
                    timeframe === '30d'
                      ? 'bg-white text-[#1d1b15] font-semibold shadow-xs'
                      : 'text-[#42474d] hover:text-[#1d1b15]'
                  }`}
                >
                  30d
                </button>
              </div>
            </div>

            {/* Chart Legend & Status Pills */}
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#3d627f]"></span>
                <span className="text-[12px] text-[#1d1b15] font-medium">
                  Pressure Gradient (PSI)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[#81a6c6] rounded"></span>
                <span className="text-[12px] text-[#42474d] font-medium">
                  Discharge Volume (LPM)
                </span>
              </div>
            </div>

            {/* Visual Area Chart SVG */}
            <div className="relative w-full h-72 sm:h-80 my-2">
              <svg
                className="w-full h-full overflow-visible"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 600 240"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const xRel = ((e.clientX - rect.left) / rect.width) * 600;
                  const hours = Math.floor((xRel / 600) * 24);
                  const psiVal = (62 + Math.sin(xRel / 40) * 4).toFixed(1);
                  const flowVal = (1.3 + Math.cos(xRel / 50) * 0.2).toFixed(2);
                  setChartHoverPoint({
                    x: Math.max(20, Math.min(580, xRel)),
                    y: 80 + Math.sin(xRel / 40) * 25,
                    time: `${String(hours).padStart(2, '0')}:00 UTC`,
                    psi: `${psiVal} PSI`,
                    flow: `${flowVal}k L`,
                  });
                }}
                onMouseLeave={() => setChartHoverPoint(null)}
              >
                <defs>
                  <linearGradient id="area-ice-blue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#81A6C6" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#C2E5F5" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                  </linearGradient>
                  <pattern
                    id="chart-grid-pattern"
                    width="60"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 60 0 L 0 0 0 60"
                      fill="none"
                      stroke="#E8E2D8"
                      strokeDasharray="2 4"
                      strokeWidth="0.75"
                    />
                  </pattern>
                </defs>

                {/* Grid */}
                <rect width="600" height="200" fill="url(#chart-grid-pattern)" />

                {/* Tolerance Boundary (58-72 PSI equivalent band) */}
                <rect x="0" y="55" width="600" height="90" fill="#E8E2D8" fillOpacity="0.25" />
                <line
                  x1="0"
                  y1="55"
                  x2="600"
                  y2="55"
                  stroke="#72787E"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  opacity="0.4"
                />
                <line
                  x1="0"
                  y1="145"
                  x2="600"
                  y2="145"
                  stroke="#72787E"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  opacity="0.4"
                />

                {/* Area under Primary Pressure Path */}
                <path
                  d="M 0,135 Q 60,140 100,120 T 200,90 T 300,105 T 380,80 T 480,95 T 550,75 L 600,85 L 600,200 L 0,200 Z"
                  fill="url(#area-ice-blue)"
                />

                {/* Pressure Line Path */}
                <path
                  d="M 0,135 Q 60,140 100,120 T 200,90 T 300,105 T 380,80 T 480,95 T 550,75 L 600,85"
                  fill="none"
                  stroke="#3D627F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Secondary Flow Curve */}
                <path
                  d="M 0,165 Q 80,150 140,140 T 260,110 T 370,125 T 450,115 T 530,95 L 600,100"
                  fill="none"
                  stroke="#81A6C6"
                  strokeDasharray="4 4"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                {/* Active Intersection Pin */}
                <line
                  x1={chartHoverPoint ? chartHoverPoint.x : 380}
                  y1="20"
                  x2={chartHoverPoint ? chartHoverPoint.x : 380}
                  y2="200"
                  stroke="#3D627F"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />
                <circle
                  cx={chartHoverPoint ? chartHoverPoint.x : 380}
                  cy={chartHoverPoint ? chartHoverPoint.y : 80}
                  r="5"
                  fill="#3D627F"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <circle
                  cx={chartHoverPoint ? chartHoverPoint.x : 380}
                  cy={125}
                  r="4"
                  fill="#81A6C6"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />

                {/* Floating Inspector Tag on Chart */}
                <g
                  transform={`translate(${
                    chartHoverPoint
                      ? Math.min(480, chartHoverPoint.x + 10)
                      : 390
                  }, 50)`}
                >
                  <rect
                    width="114"
                    height="42"
                    rx="6"
                    fill="#33302A"
                    fillOpacity="0.95"
                  />
                  <text
                    x="10"
                    y="16"
                    fill="#F6F0E6"
                    fontFamily="Plus Jakarta Sans"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {chartHoverPoint ? chartHoverPoint.time : '14:00 UTC'}
                  </text>
                  <text
                    x="10"
                    y="32"
                    fill="#C2E5F5"
                    fontFamily="Plus Jakarta Sans"
                    fontSize="11"
                    fontWeight="500"
                  >
                    {chartHoverPoint
                      ? `${chartHoverPoint.psi} • ${chartHoverPoint.flow}`
                      : '64.2 PSI • 1.42k L'}
                  </text>
                </g>

                {/* Axes Labels */}
                <g fill="#72787E" fontFamily="Plus Jakarta Sans" fontSize="10">
                  <text x="0" y="222">
                    00:00
                  </text>
                  <text x="120" y="222">
                    04:00
                  </text>
                  <text x="240" y="222">
                    08:00
                  </text>
                  <text x="360" y="222">
                    12:00
                  </text>
                  <text x="480" y="222">
                    16:00
                  </text>
                  <text x="570" y="222">
                    20:00
                  </text>
                  <text textAnchor="start" x="5" y="60">
                    72 PSI (High Target)
                  </text>
                  <text textAnchor="start" x="5" y="140">
                    58 PSI (Low Target)
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* Footer Micro Metas */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 bg-[#f9f3e9]/60 p-3 rounded-xl border border-[#eee7dd]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-[#3d627f]">
                analytics
              </span>
              <span className="text-[13px] text-[#42474d]">
                Daily Mean Vol:{' '}
                <strong className="text-[#1d1b15] font-semibold">1.38M Liters</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-[#42474d]">
                Standard Variance:{' '}
                <strong className="text-[#1d1b15] font-semibold">± 4.1%</strong>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[#426370] bg-white text-[11px] font-semibold border border-[#eee7dd]">
                In Compliance
              </span>
            </div>
          </div>
        </div>

        {/* Right Area (40%): Actuator Specifications & Diagnostics Deck */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#42474d] font-semibold">
                  Hardware Manifest
                </span>
                <h2 className="text-[18px] text-[#1d1b15] font-semibold mt-0.5">
                  Valve Servomechanism
                </h2>
              </div>
              <div className="p-2 bg-[#f9f3e9] rounded-xl border border-[#eee7dd]">
                <span className="material-symbols-outlined text-[#3d627f] text-[22px]">
                  settings_input_component
                </span>
              </div>
            </div>

            {/* Hardware Specs Data Wells */}
            <div className="space-y-2 mt-4">
              <div className="p-3 bg-[#f9f3e9] rounded-lg flex items-center justify-between border border-[#eee7dd]">
                <span className="text-[13px] text-[#42474d]">Actuator Model ID</span>
                <span className="text-[12px] font-mono text-[#1d1b15] font-semibold">
                  VLV-9921-B (Fisher 667)
                </span>
              </div>
              <div className="p-3 bg-[#f9f3e9] rounded-lg flex items-center justify-between border border-[#eee7dd]">
                <span className="text-[13px] text-[#42474d]">Firmware Release</span>
                <span className="text-[12px] font-mono text-[#1d1b15] font-semibold">
                  v4.8.19-LTS • Hash #d481
                </span>
              </div>
              <div className="p-3 bg-[#f9f3e9] rounded-lg flex items-center justify-between border border-[#eee7dd]">
                <span className="text-[13px] text-[#42474d]">Last Physical Audit</span>
                <div className="text-right">
                  <span className="text-[12px] text-[#1d1b15] font-semibold block">
                    18 Oct 2024
                  </span>
                  <span className="text-[11px] text-[#42474d]">
                    Torque verified (98 Nm)
                  </span>
                </div>
              </div>
              <div className="p-3 bg-[#f9f3e9] rounded-lg flex items-center justify-between border border-[#eee7dd]">
                <span className="text-[13px] text-[#42474d]">Assigned District Crew</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#426370]"></span>
                  <span className="text-[12px] text-[#1d1b15] font-semibold">
                    Unit 4-Delta (M. Vance)
                  </span>
                </div>
              </div>
              <div className="p-3 bg-[#f9f3e9] rounded-lg flex items-center justify-between border border-[#eee7dd]">
                <span className="text-[13px] text-[#42474d]">Fail-Safe Disposition</span>
                <span className="text-[12px] text-[#1d1b15] font-semibold">
                  Fail-as-is (Manual Override Capable)
                </span>
              </div>
            </div>
          </div>

          {/* Operational Action Center */}
          <div className="mt-6 pt-3 space-y-2 border-t border-[#eee7dd]">
            <span className="text-[11px] uppercase tracking-wider text-[#42474d] font-semibold block mb-1">
              Supervisory Control Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCalibrateZero}
                className="flex items-center justify-center gap-2 p-2.5 bg-[#f3ede3] hover:bg-[#eee7dd] transition-colors rounded-xl text-[#1d1b15] text-[12px] font-semibold cursor-pointer border border-[#e8e2d8]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#3d627f]">
                  tune
                </span>
                <span>Calibrate Zero</span>
              </button>
              <button
                onClick={handleDiagnosticPulse}
                className="flex items-center justify-center gap-2 p-2.5 bg-[#f3ede3] hover:bg-[#eee7dd] transition-colors rounded-xl text-[#1d1b15] text-[12px] font-semibold cursor-pointer border border-[#e8e2d8]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#426370]">
                  memory
                </span>
                <span>Diagnostic Pulse</span>
              </button>
            </div>
            <button
              onClick={() => setDispatchModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-[#3d627f] text-white hover:bg-[#234a66] transition-colors rounded-xl text-[12px] font-semibold shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">engineering</span>
              <span>Dispatch Field Team to Node #{currentNode.id}</span>
            </button>
            <p
              className={`text-center text-[11px] text-[#426370] min-h-[16px] transition-opacity font-medium ${
                actionFeedback ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {actionFeedback || 'Telemetry instruction dispatched to SCADA Gateway.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Node Event Ledger */}
      <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] text-[#1d1b15] font-semibold">
                Recent Node Event Ledger
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[#42474d] bg-[#f9f3e9] text-[11px] font-semibold border border-[#eee7dd]">
                {filteredLogs.length} Records
              </span>
            </div>
            <p className="text-[13px] text-[#42474d] mt-0.5">
              Immutable audit trail recorded by Regional SCADA Node Concentrator
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter telemetry entries..."
                className="bg-[#f9f3e9] px-3 py-1.5 pl-8 rounded-xl text-[#1d1b15] text-[13px] placeholder:text-[#72787e] focus:outline-none focus:bg-white border border-[#eee7dd] transition-colors w-48 sm:w-64"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-[#72787e]">
                search
              </span>
            </div>
            <button
              onClick={() => {
                setEventLogs([...eventLogs].reverse());
              }}
              title="Reverse Order"
              className="p-2 bg-[#f9f3e9] hover:bg-[#eee7dd] rounded-xl text-[#42474d] transition-colors border border-[#eee7dd] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f9f3e9]/60 text-[#42474d] text-[11px] uppercase tracking-wider font-semibold border-b border-[#eee7dd]">
                <th className="py-3 px-4 rounded-l-lg">Timestamp</th>
                <th className="py-3 px-4">Event Class</th>
                <th className="py-3 px-4">Telemetry Reading</th>
                <th className="py-3 px-4">Operator / Origin</th>
                <th className="py-3 px-4">System State</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Ledger Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee7dd]/60 text-[13px]">
              {filteredLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-[#f9f3e9]/40 transition-colors">
                  <td className="py-4 px-4 font-mono text-[#1d1b15]">{log.timestamp}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.state === 'Nominal'
                            ? 'bg-[#426370]'
                            : log.state === 'Executed'
                            ? 'bg-[#3d627f]'
                            : log.state === 'Passed'
                            ? 'bg-[#426370]'
                            : 'bg-[#81a6c6]'
                        }`}
                      ></span>
                      <span className="font-medium text-[#1d1b15]">
                        {log.eventClass}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#42474d]">{log.reading}</td>
                  <td className="py-4 px-4 text-[#42474d]">{log.operator}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        log.state === 'Nominal'
                          ? 'text-[#426370] bg-[#f9f3e9] border-[#eee7dd]'
                          : log.state === 'Executed'
                          ? 'text-[#3d627f] bg-[#c2e5f5]/30 border-[#a5cbec]'
                          : log.state === 'Passed'
                          ? 'text-[#426370] bg-[#f9f3e9] border-[#eee7dd]'
                          : 'text-[#3d627f] bg-[#f9f3e9] border-[#eee7dd]'
                      }`}
                    >
                      {log.state}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-[#72787e] text-[11px]">
                    {log.hash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-[#eee7dd]">
          <span className="text-[13px] text-[#42474d]">
            Displaying 5 of 842 cryptographic telemetry blocks for node #{currentNode.id}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[#f9f3e9] hover:bg-[#eee7dd] text-[#42474d] text-[12px] font-medium rounded-lg transition-colors disabled:opacity-50 border border-[#eee7dd] cursor-pointer"
            >
              Previous
            </button>
            <span className="text-[12px] text-[#1d1b15] px-2 font-semibold">
              Page {currentPage} of 169
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 bg-[#f9f3e9] hover:bg-[#eee7dd] text-[#42474d] text-[12px] font-medium rounded-lg transition-colors border border-[#eee7dd] cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DispatchTeamModal
        nodeId={currentNode.id}
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        onSuccess={(msg) => {
          setActionFeedback(msg);
          setTimeout(() => setActionFeedback(''), 4000);
        }}
      />

      <ExportLedgerModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        ward={selectedWard}
      />
    </div>
  );
};
