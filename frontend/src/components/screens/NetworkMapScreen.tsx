import React, { useState } from 'react';
import { TelemetryNode, ScreenId } from '../../types';
import { NodeCalibrationModal } from '../modals/NodeCalibrationModal';

interface NetworkMapScreenProps {
  nodes: TelemetryNode[];
  selectedWard: string;
  onNavigate: (screen: ScreenId) => void;
  onSelectNodeForInspector: (nodeId: string) => void;
}

export const NetworkMapScreen: React.FC<NetworkMapScreenProps> = ({
  nodes,
  selectedWard,
  onNavigate,
  onSelectNodeForInspector,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('HUB-ALPHA');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [mapLayer, setMapLayer] = useState<'vector' | 'satellite'>('vector');
  const [showFlowVectors, setShowFlowVectors] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [calibrationModalOpen, setCalibrationModalOpen] = useState<boolean>(false);

  const selectedNode =
    nodes.find((n) => n.id === selectedNodeId) || nodes[2] || nodes[0];

  const handleSelectNode = (id: string) => {
    setSelectedNodeId(id);
    setIsDrawerOpen(true);
  };

  const handleOpenInspectorForCurrentNode = () => {
    onSelectNodeForInspector(selectedNode.id);
    onNavigate('telemetry-inspector');
  };

  const filteredNodes = nodes.filter(
    (n) =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.assetId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Ward Hydraulic Overview Sub-Header */}
      <section className="w-full mb-5">
        <div className="bg-white rounded-xl shadow-xs p-5 lg:p-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 border border-[#e8e2d8]">
          {/* Title & Context */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[#42474d] mb-1">
              <span className="material-symbols-outlined text-[#3d627f] text-[18px]">
                share_location
              </span>
              <span className="text-[11px] uppercase tracking-wider text-[#72787e] font-semibold">
                District Hydrology • Grid 04-A
              </span>
            </div>
            <h1 className="text-[26px] sm:text-[30px] text-[#1d1b15] tracking-tight font-semibold">
              {selectedWard} Hydraulic Network
            </h1>
          </div>

          {/* Discreet Metrics Wells & Search Input */}
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Metric 1: Total Flow */}
            <div className="bg-[#f9f3e9] px-4 py-1.5 rounded-lg flex items-baseline gap-1.5 shadow-xs border border-[#eee7dd]">
              <span className="text-[12px] text-[#42474d]">Flow:</span>
              <span className="font-telemetry-num text-[24px] text-[#1d1b15] font-semibold">
                42.8
              </span>
              <span className="text-[11px] text-[#72787e] font-medium">MLD</span>
            </div>

            {/* Metric 2: Mean Pressure */}
            <div className="bg-[#f9f3e9] px-4 py-1.5 rounded-lg flex items-baseline gap-1.5 shadow-xs border border-[#eee7dd]">
              <span className="text-[12px] text-[#42474d]">Pressure:</span>
              <span className="font-telemetry-num text-[24px] text-[#1d1b15] font-semibold">
                61.4
              </span>
              <span className="text-[11px] text-[#72787e] font-medium">PSI</span>
            </div>

            {/* Metric 3: Network Health */}
            <div className="bg-[#f9f3e9] px-4 py-1.5 rounded-lg flex items-center gap-2 shadow-xs border border-[#eee7dd]">
              <span className="w-2 h-2 rounded-full bg-[#426370]"></span>
              <span className="text-[12px] text-[#42474d]">Health:</span>
              <span className="text-[18px] text-[#1d1b15] font-semibold">98.8%</span>
              <span className="text-[11px] text-[#426370] font-medium">Optimal</span>
            </div>

            {/* Quick Filter / Search Node */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#72787e] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search node, sector, or main..."
                className="w-full bg-[#f9f3e9] rounded-lg pl-9 pr-3 py-2 text-[#1d1b15] text-[13px] placeholder:text-[#72787e] focus:outline-none focus:bg-white border border-[#eee7dd] shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#72787e] hover:text-[#1d1b15]"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Canvas Stage: Expansive GIS Vector Map Area */}
      <section className="relative w-full h-[620px] rounded-xl bg-white overflow-hidden shadow-xs border border-[#e8e2d8] select-none">
        {/* Architectural Vector Cartography Grid (SVG Base Simulation) */}
        <svg
          className={`absolute inset-0 w-full h-full ${
            mapLayer === 'satellite' ? 'opacity-85' : 'text-[#81a6c6]'
          }`}
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 1200 620"
        >
          <defs>
            {/* Soft grid pattern for CAD / GIS precision */}
            <pattern
              id="gis-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke={mapLayer === 'satellite' ? '#5a6e7c' : 'currentColor'}
                strokeOpacity={mapLayer === 'satellite' ? '0.2' : '0.1'}
                strokeWidth="0.8"
              />
              <circle
                cx="0"
                cy="0"
                r="1"
                fill={mapLayer === 'satellite' ? '#a5cbec' : 'currentColor'}
                fillOpacity="0.3"
              />
            </pattern>

            {/* Fluid flow gradient */}
            <linearGradient id="flow-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#81a6c6" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#3d627f" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#81a6c6" stopOpacity="0.25" />
            </linearGradient>

            {/* Satellite terrain simulation background */}
            <radialGradient id="satellite-glow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#253846" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#172733" stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Satellite base fill if toggled */}
          {mapLayer === 'satellite' ? (
            <rect width="100%" height="100%" fill="url(#satellite-glow)" />
          ) : (
            <rect width="100%" height="100%" fill="#ffffff" />
          )}

          {/* Cartographic Ground Plane Grid */}
          <rect width="100%" height="100%" fill="url(#gis-grid)" />

          {/* Natural Hydrological Aquifer Basin & River Corridor */}
          <path
            d="M-50,180 C240,140 380,310 650,290 C890,270 1020,160 1250,210 L1250,330 C1010,260 880,410 620,400 C360,390 210,240 -50,300 Z"
            fill={mapLayer === 'satellite' ? '#2f5975' : '#c2e5f5'}
            fillOpacity={mapLayer === 'satellite' ? '0.45' : '0.28'}
          />

          {/* Regional Contour Elevation Lines */}
          <path
            d="M 50,550 Q 300,520 540,580 T 1050,540"
            fill="none"
            stroke={mapLayer === 'satellite' ? '#466774' : '#c2c7ce'}
            strokeDasharray="4 4"
            strokeWidth="0.75"
          />
          <path
            d="M 120,80 Q 420,120 720,70 T 1140,110"
            fill="none"
            stroke={mapLayer === 'satellite' ? '#466774' : '#c2c7ce'}
            strokeDasharray="4 4"
            strokeWidth="0.75"
          />

          {/* Primary Arterial Trunk Mains (Pressurized Aqueducts) */}
          <path
            d="M 110,95 L 340,190 L 590,260 L 830,220 L 1090,340"
            stroke={mapLayer === 'satellite' ? '#81a6c6' : '#3d627f'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Secondary Feeders */}
          <path
            d="M 340,190 L 320,380 L 480,470 L 760,490"
            stroke={mapLayer === 'satellite' ? '#a5cbec' : '#81a6c6'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 590,260 L 610,430 L 820,450"
            stroke={mapLayer === 'satellite' ? '#a5cbec' : '#81a6c6'}
            strokeDasharray="5 3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 830,220 L 980,140 L 1110,180"
            stroke={mapLayer === 'satellite' ? '#a5cbec' : '#81a6c6'}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Flow Vector Directed Particles / Animation Pulses */}
          {showFlowVectors && (
            <>
              <circle cx="225" cy="142" r="3.5" fill={mapLayer === 'satellite' ? '#c5e8f7' : '#3d627f'}>
                <animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" values="0.3;1;0.3" />
              </circle>
              <circle cx="465" cy="225" r="3.5" fill={mapLayer === 'satellite' ? '#c5e8f7' : '#3d627f'}>
                <animate attributeName="opacity" dur="2.8s" repeatCount="indefinite" values="0.4;1;0.4" />
              </circle>
              <circle cx="710" cy="240" r="3.5" fill={mapLayer === 'satellite' ? '#c5e8f7' : '#3d627f'}>
                <animate attributeName="opacity" dur="2.2s" repeatCount="indefinite" values="0.2;1;0.2" />
              </circle>
              <circle cx="400" cy="425" r="2.5" fill={mapLayer === 'satellite' ? '#c5e8f7' : '#81a6c6'}>
                <animate attributeName="opacity" dur="3s" repeatCount="indefinite" values="0.2;0.9;0.2" />
              </circle>

              {/* Flow direction vector indicator chevrons */}
              <g
                fill="none"
                opacity="0.7"
                stroke={mapLayer === 'satellite' ? '#c5e8f7' : '#3d627f'}
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M 215,138 L 223,142 L 215,146" />
                <path d="M 455,221 L 463,225 L 455,229" />
                <path d="M 700,236 L 708,240 L 700,244" />
                <path d="M 390,421 L 398,425 L 390,429" />
              </g>
            </>
          )}
        </svg>

        {/* Node Elements: High Precision Geo-Telemetry Nodes Overlaid */}

        {/* Node A: Reservoir Intake 01 */}
        <div
          style={{ left: '9%', top: '15%' }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform ${
            selectedNodeId === 'N-101' ? 'scale-110 z-20' : 'z-10'
          }`}
          onClick={() => handleSelectNode('N-101')}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 rounded-full bg-[#81a6c6]/20 animate-ping"></div>
            <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-[#3d627f] border border-[#e8e2d8] group-hover:scale-110 transition-transform">
              <div className="w-3 h-3 rounded-full bg-[#3d627f]"></div>
            </div>
          </div>
          <div className="mt-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md shadow-xs border border-[#e8e2d8] whitespace-nowrap text-center">
            <p className="text-[11px] font-semibold text-[#1d1b15]">Reservoir Intake 01</p>
            <p className="text-[10px] text-[#72787e]">18.4 MLD • Nominal</p>
          </div>
        </div>

        {/* Node B: PRV-204 Valve Bank */}
        <div
          style={{ left: '28%', top: '30%' }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform ${
            selectedNodeId === 'PRV-204' ? 'scale-110 z-20' : 'z-10'
          }`}
          onClick={() => handleSelectNode('PRV-204')}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-[#426370] border border-[#e8e2d8] group-hover:scale-110 transition-transform">
            <div className="w-2.5 h-2.5 rounded-full bg-[#426370]"></div>
          </div>
          <div className="mt-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md shadow-xs border border-[#e8e2d8] whitespace-nowrap text-center">
            <p className="text-[11px] font-semibold text-[#1d1b15]">PRV-204 Valve Bank</p>
            <p className="text-[10px] text-[#72787e]">64.1 PSI</p>
          </div>
        </div>

        {/* Node C: Alpha Central Nexus (Primary Focus) */}
        <div
          style={{ left: '49%', top: '42%' }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform ${
            selectedNodeId === 'HUB-ALPHA' ? 'scale-110 z-20' : 'z-10'
          }`}
          onClick={() => handleSelectNode('HUB-ALPHA')}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute w-10 h-10 rounded-full bg-[#426370]/15"></div>
            <div className="w-7 h-7 rounded-full bg-[#3d627f] text-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[16px]">hub</span>
            </div>
          </div>
          <div className="mt-2 bg-white px-3 py-1 rounded-lg shadow-md border border-[#e8e2d8] whitespace-nowrap text-center">
            <p className="text-[12px] font-semibold text-[#1d1b15]">Alpha Central Nexus</p>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#426370] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#426370]"></span>
              42.8 MLD Thruput
            </span>
          </div>
        </div>

        {/* Node D: Terminal Station E-4 */}
        <div
          style={{ left: '69%', top: '35%' }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform ${
            selectedNodeId === 'ND-410' ? 'scale-110 z-20' : 'z-10'
          }`}
          onClick={() => handleSelectNode('ND-410')}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-[#3d627f] border border-[#e8e2d8] group-hover:scale-110 transition-transform">
            <div className="w-2.5 h-2.5 rounded-full bg-[#81a6c6]"></div>
          </div>
          <div className="mt-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md shadow-xs border border-[#e8e2d8] whitespace-nowrap text-center">
            <p className="text-[11px] font-semibold text-[#1d1b15]">Terminal Station E-4</p>
            <p className="text-[10px] text-[#72787e]">58.9 PSI</p>
          </div>
        </div>

        {/* Node E: Southern Feeder S-1 */}
        <div
          style={{ left: '40%', top: '76%' }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform ${
            selectedNodeId === 'JN-88' ? 'scale-110 z-20' : 'z-10'
          }`}
          onClick={() => handleSelectNode('JN-88')}
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center text-[#426370] border border-[#e8e2d8] group-hover:scale-110 transition-transform">
            <div className="w-2 h-2 rounded-full bg-[#426370]"></div>
          </div>
          <div className="mt-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded shadow-xs border border-[#e8e2d8] whitespace-nowrap text-center">
            <p className="text-[11px] text-[#1d1b15] font-semibold">Southern Feeder S-1</p>
          </div>
        </div>

        {/* Floating Top-Right Layer Dock */}
        <div className="absolute top-4 right-4 z-20 flex items-center bg-white/90 backdrop-blur-md rounded-xl shadow-md p-1 gap-1 border border-[#e8e2d8]">
          <button
            onClick={() => setMapLayer('vector')}
            className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${
              mapLayer === 'vector'
                ? 'bg-[#eee7dd] text-[#1d1b15] font-semibold'
                : 'text-[#42474d] hover:text-[#1d1b15]'
            }`}
          >
            Vector CAD
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${
              mapLayer === 'satellite'
                ? 'bg-[#eee7dd] text-[#1d1b15] font-semibold'
                : 'text-[#42474d] hover:text-[#1d1b15]'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setShowFlowVectors(!showFlowVectors)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium transition-colors hover:bg-[#f9f3e9] ${
              showFlowVectors ? 'text-[#3d627f]' : 'text-[#72787e]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                showFlowVectors ? 'bg-[#3d627f]' : 'bg-[#72787e]'
              }`}
            ></span>
            Flow Vectors
          </button>
          <div className="w-px h-4 bg-[#c2c7ce] mx-0.5" />
          <button
            onClick={() => {
              setSelectedNodeId('HUB-ALPHA');
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#42474d] hover:text-[#1d1b15] hover:bg-[#f9f3e9] transition-colors"
            title="Recenter View"
          >
            <span className="material-symbols-outlined text-[18px]">
              filter_center_focus
            </span>
          </button>
        </div>

        {/* Floating Map Scale & Compass Watermark */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-4 text-[#72787e]">
          <div className="flex flex-col gap-0.5">
            <div className="w-24 h-1 bg-[#c2c7ce] relative rounded-full overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#42474d]"></div>
            </div>
            <span className="text-[11px] font-mono">500 m • EPSG:3857</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] bg-white/80 backdrop-blur-xs px-2 py-1 rounded-md shadow-xs border border-[#e8e2d8]">
            <span className="material-symbols-outlined text-[14px] text-[#426370]">
              explore
            </span>
            <span className="font-mono">Grid N 04° 12' E</span>
          </div>
        </div>

        {/* Floating Active Node Summary Pill at Map Center-Bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-[#e8e2d8]">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#426370] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#426370]"></span>
          </span>
          <span className="text-[13px] text-[#1d1b15]">
            Selected:{' '}
            <strong className="font-semibold text-[#1d1b15]">
              {selectedNode.name} ({selectedNode.sector})
            </strong>
          </span>
          <div className="w-px h-3.5 bg-[#c2c7ce]"></div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="text-[12px] text-[#3d627f] hover:text-[#113c57] font-semibold inline-flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            <span>Open Node Inspector</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Slideable Clean Node Detail Flyout Sheet (Drawer) */}
        <div
          className={`absolute top-0 right-0 w-84 h-full bg-white shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out z-30 border-l border-[#e8e2d8] ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#426370]"></span>
                <span className="text-[11px] uppercase tracking-wider text-[#72787e] font-semibold">
                  Telemetry Record
                </span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-[#42474d] hover:text-[#1d1b15] p-1 rounded-md"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <h3 className="text-[20px] font-semibold text-[#1d1b15] mt-3">
              {selectedNode.name}
            </h3>
            <p className="text-[13px] text-[#42474d]">
              Asset ID: {selectedNode.assetId} • {selectedWard}
            </p>

            {/* Metric Details List */}
            <div className="mt-6 flex flex-col gap-2.5">
              <div className="bg-[#f9f3e9] p-3 rounded-lg flex items-center justify-between border border-[#eee7dd]">
                <span className="text-[13px] text-[#42474d]">
                  Throughput Velocity
                </span>
                <span className="font-telemetry-num text-[17px] font-semibold text-[#1d1b15]">
                  {selectedNode.throughputVelocity}
                </span>
              </div>
              <div className="bg-[#f9f3e9] p-3 rounded-lg flex items-center justify-between border border-[#eee7dd]">
                <span className="text-[13px] text-[#42474d]">
                  Barometric Pressure
                </span>
                <span className="font-telemetry-num text-[17px] font-semibold text-[#1d1b15]">
                  {selectedNode.pressurePSI.toFixed(1)} PSI
                </span>
              </div>
              <div className="bg-[#f9f3e9] p-3 rounded-lg flex items-center justify-between border border-[#eee7dd]">
                <span className="text-[13px] text-[#42474d]">
                  Water Residual Chlorine
                </span>
                <span className="font-telemetry-num text-[17px] font-semibold text-[#426370]">
                  {selectedNode.chlorineResidual}
                </span>
              </div>
              <div className="bg-[#f9f3e9] p-3 rounded-lg flex items-center justify-between border border-[#eee7dd]">
                <span className="text-[13px] text-[#42474d]">
                  SCADA Timestamp
                </span>
                <span className="text-[11px] text-[#72787e] font-mono">
                  Just now ({selectedNode.lastScadaPoll})
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-2 border-t border-[#eee7dd]">
            <button
              onClick={() => setCalibrationModalOpen(true)}
              className="w-full bg-[#81a6c6] hover:bg-[#3d627f] text-white py-2.5 px-4 rounded-lg text-[13px] font-semibold transition-colors text-center shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Calibrate Valve Setpoint</span>
            </button>
            <button
              onClick={handleOpenInspectorForCurrentNode}
              className="w-full bg-[#3d627f] hover:bg-[#234a66] text-white py-2.5 px-4 rounded-lg text-[13px] font-semibold transition-colors text-center shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Inspect Full Telemetry Record</span>
            </button>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-full bg-[#f9f3e9] hover:bg-[#eee7dd] text-[#1d1b15] py-2 px-4 rounded-lg text-[13px] font-medium transition-colors text-center cursor-pointer"
            >
              Dismiss Inspector
            </button>
          </div>
        </div>
      </section>

      {/* Auxiliary Subtle Ground Plane Information Grid */}
      <section className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Sector Flow Balance Card */}
        <div className="bg-white rounded-xl p-6 shadow-xs flex flex-col justify-between border border-[#e8e2d8]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#72787e] font-semibold">
              District Supply Equity
            </span>
            <span className="material-symbols-outlined text-[#426370] text-[18px]">
              tune
            </span>
          </div>
          <div className="my-5">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[13px] text-[#42474d]">
                Zone Supply Equality Index
              </span>
              <span className="font-telemetry-num text-[26px] text-[#1d1b15] font-semibold">
                0.94
              </span>
            </div>
            <div className="w-full bg-[#f9f3e9] h-2 rounded-full overflow-hidden border border-[#eee7dd]">
              <div
                className="bg-[#426370] h-full rounded-full transition-all duration-700"
                style={{ width: '94%' }}
              ></div>
            </div>
          </div>
          <p className="text-[13px] text-[#42474d]">
            No hydraulic deprivation detected in peripheral micro-sectors.
          </p>
        </div>

        {/* Active Pipeline Integrity */}
        <div className="bg-white rounded-xl p-6 shadow-xs flex flex-col justify-between border border-[#e8e2d8]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#72787e] font-semibold">
              Acoustic Leak Telemetry
            </span>
            <span className="material-symbols-outlined text-[#3d627f] text-[18px]">
              graphic_eq
            </span>
          </div>
          <div className="my-5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-telemetry-num text-[26px] text-[#1d1b15] font-semibold">
                0
              </span>
              <span className="text-[13px] text-[#42474d]">
                Critical transients in 24h
              </span>
            </div>
            <p className="text-[11px] text-[#426370] font-medium mt-1">
              Transient log: all pulses under 2.4 bar delta
            </p>
          </div>
          <p className="text-[13px] text-[#42474d]">
            Continuous acoustic vibration arrays report stable conduit resonance.
          </p>
        </div>

        {/* Water Quality Vector Summary */}
        <div className="bg-white rounded-xl p-6 shadow-xs flex flex-col justify-between border border-[#e8e2d8]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#72787e] font-semibold">
              Turbidity & Turbophoresis
            </span>
            <span className="material-symbols-outlined text-[#426370] text-[18px]">
              science
            </span>
          </div>
          <div className="my-5 flex items-baseline justify-between">
            <div>
              <span className="font-telemetry-num text-[26px] text-[#1d1b15] font-semibold">
                0.32
              </span>
              <span className="text-[11px] text-[#72787e] font-medium ml-1">NTU</span>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded bg-[#f9f3e9] text-[#426370] font-semibold border border-[#eee7dd]">
              Safe Drinking Tier 1
            </span>
          </div>
          <p className="text-[13px] text-[#42474d]">
            Real-time spectrophotometric analysis verified at 12 telemetry outposts.
          </p>
        </div>
      </section>

      {/* Setpoint calibration modal */}
      <NodeCalibrationModal
        node={selectedNode}
        isOpen={calibrationModalOpen}
        onClose={() => setCalibrationModalOpen(false)}
        onCalibrate={(newPressure) => {
          selectedNode.pressurePSI = newPressure;
        }}
      />
    </div>
  );
};
