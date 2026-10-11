/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenId, TelemetryNode } from './types';
import { INITIAL_NODES } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { NetworkMapScreen } from './components/screens/NetworkMapScreen';
import { TelemetryInspectorScreen } from './components/screens/TelemetryInspectorScreen';
import { EquityAnalyticsScreen } from './components/screens/EquityAnalyticsScreen';
import { SystemSettingsScreen } from './components/screens/SystemSettingsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('network-map');
  const [selectedWard, setSelectedWard] = useState<string>('Ward Alpha');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('TK-408');
  const [isScadaSynced, setIsScadaSynced] = useState<boolean>(true);
  const [nodes, setNodes] = useState<TelemetryNode[]>(INITIAL_NODES);
  const [toastMessage, setToastMessage] = useState<string>('');

  const triggerManualSync = () => {
    setIsScadaSynced(false);
    setToastMessage('Polling SCADA RTU network and recalculating Gini parity...');
    setTimeout(() => {
      setIsScadaSynced(true);
      setToastMessage('SCADA Synced • Cryptographic ledger state up to date.');
      setTimeout(() => setToastMessage(''), 3000);
    }, 900);
  };

  const handleSelectNodeForInspector = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setCurrentScreen('telemetry-inspector');
  };

  return (
    <div className="min-h-screen bg-[#fff9ee] text-[#1d1b15] font-sans flex flex-col justify-between">
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        selectedWard={selectedWard}
        onSelectWard={(w) => {
          setSelectedWard(w);
          setToastMessage(`Switched active hydro-district to ${w}.`);
          setTimeout(() => setToastMessage(''), 2500);
        }}
        isScadaSynced={isScadaSynced}
        onTriggerSync={triggerManualSync}
      />

      {/* Main Viewport Container */}
      <main className="w-full pt-20 px-5 lg:px-10 bg-[#fff9ee] min-h-[calc(100vh-80px)] flex-1">
        {toastMessage && (
          <div className="fixed top-22 right-6 z-50 bg-[#1d1b15] text-[#f6f0e6] px-4 py-2 rounded-xl shadow-lg text-[13px] flex items-center gap-2 border border-[#42474d]/40 animate-fade-in">
            <span className="material-symbols-outlined text-[16px] text-[#81a6c6]">
              info
            </span>
            <span>{toastMessage}</span>
          </div>
        )}

        {currentScreen === 'network-map' && (
          <NetworkMapScreen
            nodes={nodes}
            selectedWard={selectedWard}
            onNavigate={setCurrentScreen}
            onSelectNodeForInspector={handleSelectNodeForInspector}
          />
        )}

        {currentScreen === 'telemetry-inspector' && (
          <TelemetryInspectorScreen
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNodeId={setSelectedNodeId}
            onNavigate={setCurrentScreen}
            selectedWard={selectedWard}
          />
        )}

        {currentScreen === 'equity-analytics' && (
          <EquityAnalyticsScreen
            selectedWard={selectedWard}
            onNavigate={setCurrentScreen}
            onInspectNode={handleSelectNodeForInspector}
          />
        )}

        {currentScreen === 'system-settings' && (
          <SystemSettingsScreen selectedWard={selectedWard} />
        )}
      </main>

      {/* Unified Civic Footer */}
      <Footer />
    </div>
  );
}
