import React from 'react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const logs = [
    { time: 'Today 14:12 UTC', op: 'M. Vance (L4)', action: 'Set Burst Threshold to 42.5 L/s', hash: '0x99B4...F12' },
    { time: 'Today 11:05 UTC', op: 'System Daemon', action: 'Auto Re-balanced Sector 3 Pressure', hash: '0x882A...E91' },
    { time: 'Yesterday 18:30 UTC', op: 'R. Silva (L3)', action: 'Valve Servomechanism Inspection Check', hash: '0x334C...A20' },
    { time: 'Yesterday 09:15 UTC', op: 'Key Rotation', action: 'ChaCha20-Poly1305 Key Pair Refreshed', hash: '0x11FF...09B' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-[#e8e2d8] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3d627f] text-[22px]">
              history
            </span>
            <h3 className="text-[17px] font-semibold text-[#1d1b15]">
              System Audit & Change Ledger
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#72787e] hover:text-[#1d1b15] p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {logs.map((log, index) => (
            <div key={index} className="p-3 bg-[#f9f3e9] rounded-lg text-[13px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1d1b15]">{log.action}</span>
                <span className="text-[11px] text-[#72787e]">{log.time}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#42474d]">
                <span>Operator: {log.op}</span>
                <span className="font-mono text-[#72787e]">{log.hash}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#3d627f] hover:bg-[#234a66] text-white text-[13px] font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
