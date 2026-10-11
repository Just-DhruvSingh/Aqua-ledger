import React, { useState } from 'react';
import { SystemSettingsState } from '../../types';
import { DEFAULT_SETTINGS } from '../../data/mockData';
import { GisBoundaryModal } from '../modals/GisBoundaryModal';
import { AuditLogModal } from '../modals/AuditLogModal';

interface SystemSettingsScreenProps {
  selectedWard: string;
}

export const SystemSettingsScreen: React.FC<SystemSettingsScreenProps> = ({ selectedWard }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'general' | 'gateways' | 'security' | 'thresholds'
  >('general');

  const [settings, setSettings] = useState<SystemSettingsState>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [gisModalOpen, setGisModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [shortcutFeedback, setShortcutFeedback] = useState('');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 600);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="flex flex-col w-full pb-36">
      {/* Top Editorial Header */}
      <section className="w-full mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#42474d]">
              <span className="text-[11px] uppercase tracking-widest text-[#3d627f] font-semibold">
                Civic Infrastructure Node
              </span>
              <span className="text-[#c2c7ce] text-[11px]">•</span>
              <span className="text-[11px] uppercase tracking-wider text-[#72787e] font-semibold">
                Cluster SCADA-94
              </span>
            </div>
            <h1 className="text-[26px] sm:text-[34px] text-[#1d1b15] tracking-tight font-semibold">
              System Settings & Telemetry Scope
            </h1>
            <p className="text-[14px] text-[#42474d] max-w-2xl">
              Configure regional administrative identifiers, telemetry ingestion parameters, and spatial reference constraints for {selectedWard} water infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f9f3e9] shadow-xs border border-[#eee7dd]">
              <span className="w-2 h-2 rounded-full bg-[#426370] animate-pulse"></span>
              <span className="text-[11px] uppercase tracking-wider text-[#426370] font-semibold">
                Ledger Sync OK
              </span>
            </span>

            <button
              onClick={() => setAuditModalOpen(true)}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-xs hover:bg-[#f9f3e9] transition-colors text-[#42474d] hover:text-[#1d1b15] border border-[#e8e2d8] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span className="text-[12px] font-medium">Audit Log</span>
            </button>
          </div>
        </div>

        {/* Architectural Sub-Tabs */}
        <div className="flex items-center gap-8 border-b border-[#eee7dd] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('general')}
            className={`relative pb-3 text-[14px] whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'general'
                ? 'text-[#1d1b15] font-semibold'
                : 'text-[#42474d] hover:text-[#1d1b15]'
            }`}
          >
            <span>General Organization & Telemetry Scope</span>
            {activeSubTab === 'general' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#3d627f] rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('gateways')}
            className={`relative pb-3 text-[14px] whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'gateways'
                ? 'text-[#1d1b15] font-semibold'
                : 'text-[#42474d] hover:text-[#1d1b15]'
            }`}
          >
            <span>Telemetry Gateways & RTU Nodes</span>
            {activeSubTab === 'gateways' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#3d627f] rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('security')}
            className={`relative pb-3 text-[14px] whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'security'
                ? 'text-[#1d1b15] font-semibold'
                : 'text-[#42474d] hover:text-[#1d1b15]'
            }`}
          >
            <span>Security & ChaCha20 Cryptokeys</span>
            {activeSubTab === 'security' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#3d627f] rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('thresholds')}
            className={`relative pb-3 text-[14px] whitespace-nowrap transition-colors cursor-pointer ${
              activeSubTab === 'thresholds'
                ? 'text-[#1d1b15] font-semibold'
                : 'text-[#42474d] hover:text-[#1d1b15]'
            }`}
          >
            <span>Threshold Calibration & Alerts</span>
            {activeSubTab === 'thresholds' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#3d627f] rounded-full"></span>
            )}
          </button>
        </div>
      </section>

      {/* SUB-TAB: GENERAL ORGANIZATION & TELEMETRY SCOPE (Matches Image 7) */}
      {activeSubTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Primary Configuration Cards (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* CARD 1: Municipal Profile */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8]">
              <div className="flex items-start justify-between pb-3 mb-4 border-b border-[#eee7dd]">
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#72787e] font-semibold">
                    Section 01
                  </span>
                  <h2 className="text-[18px] text-[#1d1b15] font-semibold">
                    Municipal Profile & Geo-Spatial Extents
                  </h2>
                  <p className="text-[13px] text-[#42474d]">
                    Legal entity assignment and jurisdictional boundary mapping
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#72787e] text-[22px]">
                  corporate_fare
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="block text-[12px] font-semibold text-[#1d1b15] mb-1.5"
                    htmlFor="entity-name"
                  >
                    Designated Municipal Authority
                  </label>
                  <div className="relative">
                    <input
                      id="entity-name"
                      type="text"
                      value={settings.municipalAuthority}
                      onChange={(e) =>
                        setSettings({ ...settings, municipalAuthority: e.target.value })
                      }
                      className="w-full bg-[#f9f3e9] px-4 py-2.5 rounded-lg text-[14px] text-[#1d1b15] focus:outline-none focus:bg-white border border-[#eee7dd] transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-[#72787e] text-[18px]">
                      verified
                    </span>
                  </div>
                  <p className="text-[12px] text-[#72787e] mt-1.5">
                    Official civic authority tied to SCADA block signing certificates.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-[12px] font-semibold text-[#1d1b15] mb-1.5"
                      htmlFor="scada-timezone"
                    >
                      SCADA Sync Timezone
                    </label>
                    <div className="relative">
                      <select
                        id="scada-timezone"
                        value={settings.timezone}
                        onChange={(e) =>
                          setSettings({ ...settings, timezone: e.target.value })
                        }
                        className="w-full appearance-none bg-[#f9f3e9] px-4 py-2.5 rounded-lg text-[14px] text-[#1d1b15] focus:outline-none focus:bg-white border border-[#eee7dd] transition-all cursor-pointer"
                      >
                        <option value="utc+05:30">UTC+05:30 (IST • Colombo / Delhi)</option>
                        <option value="utc+00:00">UTC+00:00 (GMT • London / Reykjavik)</option>
                        <option value="utc-05:00">UTC-05:00 (EST • Washington / Ottawa)</option>
                        <option value="utc+01:00">UTC+01:00 (CET • Geneva / Berlin)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 text-[#72787e] text-[18px] pointer-events-none">
                        unfold_more
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-[12px] font-semibold text-[#1d1b15] mb-1.5"
                      htmlFor="hydro-code"
                    >
                      Hydrological Node Code
                    </label>
                    <input
                      id="hydro-code"
                      type="text"
                      value={settings.hydroNodeCode}
                      onChange={(e) =>
                        setSettings({ ...settings, hydroNodeCode: e.target.value })
                      }
                      className="w-full bg-[#f9f3e9] px-4 py-2.5 rounded-lg text-[14px] text-[#1d1b15] focus:outline-none focus:bg-white border border-[#eee7dd] transition-all font-mono"
                    />
                  </div>
                </div>

                {/* GIS Boundary Well */}
                <div className="p-4 bg-[#f9f3e9] rounded-xl border border-[#eee7dd] mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#e8e2d8] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#3d627f] text-[22px]">
                        map
                      </span>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1d1b15] leading-tight">
                        Jurisdiction Boundary Map
                      </p>
                      <p className="text-[12px] text-[#42474d]">
                        GeoJSON spatial envelope: 42.8 sq km ({selectedWard} perimeter)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGisModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[12px] text-[#3d627f] font-semibold hover:text-[#113c57] transition-colors py-1 cursor-pointer"
                  >
                    <span>GIS Boundary Preview</span>
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* CARD 2: Measurement Standards & Hydraulics */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8]">
              <div className="flex items-start justify-between pb-3 mb-4 border-b border-[#eee7dd]">
                <div className="space-y-0.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#72787e] font-semibold">
                    Section 02
                  </span>
                  <h2 className="text-[18px] text-[#1d1b15] font-semibold">
                    Hydrological Units & Burst Physics
                  </h2>
                  <p className="text-[13px] text-[#42474d]">
                    Calibration metrics for flow volumetric calculations and baseline alarms
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#72787e] text-[22px]">
                  tune
                </span>
              </div>

              <div className="space-y-6">
                {/* Flow Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] text-[#1d1b15] font-medium">
                      Volumetric Flow Unit Metric
                    </p>
                    <p className="text-[12px] text-[#42474d]">
                      Applied globally across all pipe sensors and water main transducers
                    </p>
                  </div>
                  <div className="inline-flex p-1 bg-[#f9f3e9] rounded-lg shrink-0 border border-[#eee7dd]">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, flowUnit: 'L/s' })}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                        settings.flowUnit === 'L/s'
                          ? 'bg-white shadow-xs text-[#1d1b15]'
                          : 'text-[#42474d] hover:text-[#1d1b15]'
                      }`}
                    >
                      Liters / Sec (L/s)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, flowUnit: 'GPM' })}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                        settings.flowUnit === 'GPM'
                          ? 'bg-white shadow-xs text-[#1d1b15]'
                          : 'text-[#42474d] hover:text-[#1d1b15]'
                      }`}
                    >
                      Gallons / Min (GPM)
                    </button>
                  </div>
                </div>

                {/* Pressure Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] text-[#1d1b15] font-medium">
                      Static Hydraulic Pressure Standard
                    </p>
                    <p className="text-[12px] text-[#42474d]">
                      Affects pipeline stress models and water column friction equations
                    </p>
                  </div>
                  <div className="inline-flex p-1 bg-[#f9f3e9] rounded-lg shrink-0 border border-[#eee7dd]">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, pressureUnit: 'Bar' })}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                        settings.pressureUnit === 'Bar'
                          ? 'bg-white shadow-xs text-[#1d1b15]'
                          : 'text-[#42474d] hover:text-[#1d1b15]'
                      }`}
                    >
                      Metric SI (Bar / kPa)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, pressureUnit: 'PSI' })}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                        settings.pressureUnit === 'PSI'
                          ? 'bg-white shadow-xs text-[#1d1b15]'
                          : 'text-[#42474d] hover:text-[#1d1b15]'
                      }`}
                    >
                      Imperial US (PSI)
                    </button>
                  </div>
                </div>

                {/* Main Burst Threshold Slider */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <label
                        className="text-[13px] text-[#1d1b15] font-medium"
                        htmlFor="burst-slider"
                      >
                        Main Burst Velocity Transient Threshold
                      </label>
                      <p className="text-[12px] text-[#42474d]">
                        Sudden differential trip point that locks automatic shutoff isolation valves
                      </p>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-[#f9f3e9] font-telemetry-num text-[13px] text-[#3d627f] font-semibold border border-[#eee7dd]">
                      +{settings.burstThreshold.toFixed(1)} L/s • Δ1.8s
                    </div>
                  </div>
                  <div className="relative pt-2">
                    <input
                      id="burst-slider"
                      type="range"
                      min="10"
                      max="80"
                      value={settings.burstThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          burstThreshold: parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-1.5 bg-[#eee7dd] rounded-lg appearance-none cursor-pointer accent-[#3d627f]"
                    />
                    <div className="flex justify-between text-[11px] text-[#72787e] mt-1.5">
                      <span>10 L/s (Ultra-Sensitive)</span>
                      <span>40 L/s (Nominal Urban)</span>
                      <span>80 L/s (High Transmission)</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Setting: Auto-failover */}
                <div className="flex items-center justify-between p-3.5 bg-[#f9f3e9] rounded-xl border border-[#eee7dd]">
                  <div className="space-y-0.5">
                    <span className="text-[13px] text-[#1d1b15] font-semibold">
                      Automatic Sub-District Flow Bypass
                    </span>
                    <p className="text-[12px] text-[#42474d]">
                      Reroute around {selectedWard} Section-3 in anomalous pressure events
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoBypassEnabled}
                      onChange={(e) =>
                        setSettings({ ...settings, autoBypassEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#e8e2d8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e8e2d8] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#81a6c6]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Telemetry Status, Encryption & Quick Links (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* CARD 3: SCADA Link Status & Encryption Assurance */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#426370]"></span>
                  <h3 className="text-[17px] text-[#1d1b15] font-semibold">
                    SCADA Ingress Link
                  </h3>
                </div>
                <span className="text-[11px] uppercase px-2.5 py-0.5 rounded bg-[#c2e5f5] text-[#466774] font-semibold border border-[#a5cbec]">
                  Live Stream
                </span>
              </div>

              {/* Telemetry Spec Indicators */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-[#f9f3e9] space-y-1 border border-[#eee7dd]">
                  <span className="text-[11px] uppercase tracking-wider text-[#72787e] font-semibold">
                    Network Latency
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-telemetry-num text-[24px] text-[#1d1b15] font-semibold">
                      14
                    </span>
                    <span className="text-[12px] text-[#42474d]">ms</span>
                  </div>
                  <span className="text-[11px] text-[#426370] font-medium block">
                    Optimal WireGuard Tunnel
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#f9f3e9] space-y-1 border border-[#eee7dd]">
                  <span className="text-[11px] uppercase tracking-wider text-[#72787e] font-semibold">
                    Sync Drift
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-telemetry-num text-[24px] text-[#1d1b15] font-semibold">
                      0.03
                    </span>
                    <span className="text-[12px] text-[#42474d]">s</span>
                  </div>
                  <span className="text-[11px] text-[#426370] font-medium block">
                    Stratum 1 Atomic Time
                  </span>
                </div>
              </div>

              {/* ChaCha20 Badge Well */}
              <div className="p-3.5 rounded-lg bg-[#f9f3e9] border border-[#eee7dd] flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 text-[#3d627f] shadow-xs border border-[#e8e2d8]">
                  <span className="material-symbols-outlined text-[20px]">
                    shield_lock
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#1d1b15] font-semibold">
                      ChaCha20-Poly1305
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e8e2d8] text-[#42474d] uppercase font-mono font-semibold">
                      AEAD
                    </span>
                  </div>
                  <p className="text-[12px] text-[#42474d]">
                    Every hydrological delta signed cryptographically before ingress into AquaLedger state tree.
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 4: Telemetry Ingestion Gauge & Capacity */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[17px] text-[#1d1b15] font-semibold">
                    Telemetry Ingestion Rate
                  </h3>
                  <p className="text-[13px] text-[#42474d]">
                    Transducer samples processed per second
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#72787e] text-[20px]">
                  speed
                </span>
              </div>

              {/* Circular Gauge and Throughput Bar */}
              <div className="flex items-center gap-6 my-2">
                <div className="relative w-28 h-28 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="stroke-[#eee7dd]"
                      cx="50"
                      cy="50"
                      r="40"
                      strokeWidth="7"
                      fill="transparent"
                    />
                    <circle
                      className="stroke-[#81a6c6]"
                      cx="50"
                      cy="50"
                      r="40"
                      strokeWidth="7"
                      strokeDasharray="251.2"
                      strokeDashoffset="80.3"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-telemetry-num text-[22px] text-[#1d1b15] font-semibold leading-none">
                      68%
                    </span>
                    <span className="text-[10px] text-[#72787e] uppercase font-semibold mt-0.5">
                      HEADROOM
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-2 flex-1 min-w-0">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[11px] uppercase text-[#72787e] font-semibold">
                        Current Throughput
                      </span>
                      <span className="text-[13px] text-[#1d1b15] font-semibold font-mono">
                        1,420 msgs/s
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#eee7dd] overflow-hidden">
                      <div className="h-full bg-[#81a6c6] rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#42474d]">
                    98.9% capacity allocated to high-frequency acoustic leak microphones across District Alpha.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-[12px] text-[#42474d] border-t border-[#eee7dd]">
                <span>
                  Active Edge Sensors: <strong className="text-[#1d1b15]">342 Devices</strong>
                </span>
                <span className="text-[#426370] font-semibold">0 Dropped Packets (24h)</span>
              </div>
            </div>

            {/* CARD 5: Quick Access Integrations Card */}
            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8]">
              <h3 className="text-[17px] text-[#1d1b15] font-semibold mb-3">
                System Subsystem Shortcuts
              </h3>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShortcutFeedback('API endpoint: https://api.aqualedger.civic/v1/stream (Active token)');
                    setTimeout(() => setShortcutFeedback(''), 4000);
                  }}
                  className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-[#f9f3e9] transition-colors border border-transparent hover:border-[#eee7dd] cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f9f3e9] group-hover:bg-white flex items-center justify-center text-[#3d627f] transition-colors border border-[#eee7dd]">
                      <span className="material-symbols-outlined text-[18px]">webhook</span>
                    </div>
                    <div>
                      <span className="text-[13px] text-[#1d1b15] font-semibold block">
                        API Integrations & Webhooks
                      </span>
                      <span className="text-[12px] text-[#42474d]">
                        REST, MQTT v5 and Kafka regional relays
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#72787e] group-hover:text-[#3d627f] transition-colors text-[20px]">
                    chevron_right
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShortcutFeedback('Alert matrix verified: SMS dispatch to Ward Duty Hydrologist armed.');
                    setTimeout(() => setShortcutFeedback(''), 4000);
                  }}
                  className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-[#f9f3e9] transition-colors border border-transparent hover:border-[#eee7dd] cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f9f3e9] group-hover:bg-white flex items-center justify-center text-[#3d627f] transition-colors border border-[#eee7dd]">
                      <span className="material-symbols-outlined text-[18px]">
                        notifications_active
                      </span>
                    </div>
                    <div>
                      <span className="text-[13px] text-[#1d1b15] font-semibold block">
                        Alert Threshold Matrix
                      </span>
                      <span className="text-[12px] text-[#42474d]">
                        Municipal escalation protocol and SMS dispatch
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#72787e] group-hover:text-[#3d627f] transition-colors text-[20px]">
                    chevron_right
                  </span>
                </button>

                {shortcutFeedback && (
                  <p className="text-[12px] text-[#3d627f] font-medium p-2 bg-[#f9f3e9] rounded-lg">
                    {shortcutFeedback}
                  </p>
                )}
              </div>
            </div>

            {/* CARD 6: Civic Infrastructure Photo Insight (Hotlink image as required) */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-[#e8e2d8] flex items-center gap-4">
              <img
                className="w-20 h-20 rounded-lg object-cover shrink-0 border border-[#eee7dd]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHkYMh1mT6OyscwhZyhuDXwKBsiSBFqeXLffcdRA-ULF3UOJ_kdZ_llunDGyl9MR1lDuKgmh-useEnGkigZNC8jJiqrLvV1dLgCNoC3u8SAwZbxZ0BhaNlntPsV784o-OTupxiraEqDk0hogUBOAagVX83Yxq_4LLklNJTotif58TU5pLd1W5djfc1_mazv-iuHd-lYcZtmqRVlM8Itq0YObYnJuUnOfvcIzlGvNV-NC_HYTBpoWERuw"
                alt="Modern serene municipal water filtration telemetry station with polished stainless steel conduits"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <span className="text-[11px] uppercase tracking-wider text-[#72787e] font-semibold">
                  Physical Site Node
                </span>
                <p className="text-[15px] font-semibold text-[#1d1b15] truncate">
                  Alpha Central Pressure Station
                </p>
                <p className="text-[12px] text-[#42474d]">
                  Inspected: 12 Oct 2025 by Chief Hydrologist
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: GATEWAYS & RTU NODES */}
      {activeSubTab === 'gateways' && (
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
            <div>
              <h2 className="text-[18px] text-[#1d1b15] font-semibold">
                Remote Terminal Units (RTUs) & SCADA Concentrators
              </h2>
              <p className="text-[13px] text-[#42474d]">
                Hardware concentrator topology for {selectedWard}
              </p>
            </div>
            <span className="px-3 py-1 bg-[#f9f3e9] text-[#426370] rounded-full text-[12px] font-semibold border border-[#eee7dd]">
              6 Active Concentrators
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'RTU-01-NEXUS', loc: 'Central Nexus Pump Room', ip: '10.240.4.12', poll: '1.2s', status: 'Online' },
              { id: 'RTU-02-RESERV', loc: 'North Intake Elevation Tower', ip: '10.240.4.14', poll: '1.5s', status: 'Online' },
              { id: 'RTU-03-VALVE', loc: 'PRV-204 Underground Vault', ip: '10.240.4.18', poll: '1.8s', status: 'Online' },
              { id: 'RTU-04-AQUIFER', loc: 'Eastern Basin Hydrological Well', ip: '10.240.4.22', poll: '2.0s', status: 'Online' },
            ].map((rtu) => (
              <div key={rtu.id} className="p-4 bg-[#f9f3e9] rounded-xl border border-[#eee7dd] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-[13px] text-[#1d1b15]">{rtu.id}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#426370] bg-white px-2 py-0.5 rounded-full border border-[#eee7dd]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#426370]"></span>
                    {rtu.status}
                  </span>
                </div>
                <p className="text-[12px] text-[#42474d]">{rtu.loc}</p>
                <div className="flex justify-between text-[11px] text-[#72787e] font-mono pt-1 border-t border-[#e8e2d8]">
                  <span>IP: {rtu.ip}</span>
                  <span>Poll Cadence: {rtu.poll}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: SECURITY & CHACHA20 */}
      {activeSubTab === 'security' && (
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
            <div>
              <h2 className="text-[18px] text-[#1d1b15] font-semibold">
                ChaCha20-Poly1305 Cryptographic Integrity
              </h2>
              <p className="text-[13px] text-[#42474d]">
                Zero-trust municipal pipeline state signing keys
              </p>
            </div>
            <button
              onClick={() => {
                alert('ChaCha20 Cryptographic key rotated successfully. Hash updated in SCADA ring.');
              }}
              className="px-3 py-1.5 bg-[#3d627f] text-white rounded-lg text-[12px] font-semibold hover:bg-[#234a66]"
            >
              Rotate Key Pair
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-[#f9f3e9] rounded-xl border border-[#eee7dd] space-y-2">
              <span className="text-[12px] uppercase font-semibold text-[#72787e]">Active Ledger Signing Key</span>
              <p className="font-mono text-[12px] text-[#1d1b15] break-all bg-white p-2.5 rounded-lg border border-[#eee7dd]">
                ed25519:7e29b109af328bc4e892cfa0901237c08272f6a7391104e112d8a5948301fed2
              </p>
              <div className="flex justify-between text-[11px] text-[#42474d]">
                <span>Algorithm: ChaCha20-Poly1305 AEAD</span>
                <span>Expiry: 31 Dec 2026</span>
              </div>
            </div>

            <div className="p-4 bg-[#f9f3e9] rounded-xl border border-[#eee7dd] space-y-1 text-[13px]">
              <span className="font-semibold text-[#1d1b15] block">SCADA Ring Authentication Status</span>
              <p className="text-[#42474d]">
                All 342 edge transducer units sign 1-second delta packets with HMAC authenticated tokens before entry to the central message bus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: THRESHOLD CALIBRATION & ALERTS */}
      {activeSubTab === 'thresholds' && (
        <div className="bg-white rounded-xl p-6 shadow-xs border border-[#e8e2d8] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
            <div>
              <h2 className="text-[18px] text-[#1d1b15] font-semibold">
                Critical Hydraulic Alarm Thresholds
              </h2>
              <p className="text-[13px] text-[#42474d]">
                Triggers automatic safety shutdown valves and emergency paging
              </p>
            </div>
            <span className="text-[12px] text-[#426370] font-semibold bg-[#f9f3e9] px-3 py-1 rounded-full border border-[#eee7dd]">
              4 Safety Interlocks Armed
            </span>
          </div>

          <div className="space-y-3 text-[13px]">
            <div className="p-3.5 bg-[#f9f3e9] rounded-xl border border-[#eee7dd] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#1d1b15]">Cavitation Shock Suppression</p>
                <p className="text-[12px] text-[#42474d]">Lock actuator when negative suction head &lt; 0.4 bar</p>
              </div>
              <span className="text-[12px] font-semibold text-[#3d627f] bg-white px-2.5 py-1 rounded-lg border border-[#eee7dd]">
                ARMED
              </span>
            </div>
            <div className="p-3.5 bg-[#f9f3e9] rounded-xl border border-[#eee7dd] flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#1d1b15]">Rapid Surge Overpressure Trip</p>
                <p className="text-[12px] text-[#42474d]">Instant relief diverter opens if pressure &gt; 78.0 PSI for 250ms</p>
              </div>
              <span className="text-[12px] font-semibold text-[#3d627f] bg-white px-2.5 py-1 rounded-lg border border-[#eee7dd]">
                ARMED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FIXED FLOATING BOTTOM PREFERENCE BAR */}
      <aside className="fixed bottom-6 left-0 right-0 z-40 px-5 lg:px-10 pointer-events-none">
        <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-md rounded-xl p-3 sm:px-6 sm:py-3.5 shadow-xl border border-[#e8e2d8] pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#426370] text-[20px]">
              check_circle
            </span>
            <span className="text-[13px] text-[#1d1b15]">
              Configuration state valid •{' '}
              <span className="text-[#42474d]">
                Unsaved local adjustments persist automatically to browser session.
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleReset}
              type="button"
              className="px-4 py-2 rounded-lg bg-[#f3ede3] hover:bg-[#eee7dd] text-[#1d1b15] text-[12px] font-medium transition-colors cursor-pointer"
            >
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              type="button"
              className={`px-4 py-2 rounded-lg text-white text-[12px] font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                saveSuccess
                  ? 'bg-[#426370]'
                  : 'bg-[#3d627f] hover:bg-[#234a66]'
              }`}
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    sync
                  </span>
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">done</span>
                  <span>Saved to SCADA</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Modals */}
      <GisBoundaryModal
        isOpen={gisModalOpen}
        onClose={() => setGisModalOpen(false)}
        ward={selectedWard}
      />

      <AuditLogModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />
    </div>
  );
};
