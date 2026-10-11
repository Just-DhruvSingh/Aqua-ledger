import React, { useState } from 'react';

interface ExportLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ward: string;
}

export const ExportLedgerModal: React.FC<ExportLedgerModalProps> = ({
  isOpen,
  onClose,
  ward,
}) => {
  const [format, setFormat] = useState<'csv' | 'json' | 'hash'>('csv');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mockHash = 'SHA256: 7e29b109af328bc4e892cfa0901237c08272f6a7391104e112d8a5948301fed2';

  const handleDownload = () => {
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'csv') {
      content = `Timestamp,Event,Reading,Operator,State,LedgerHash\n` +
        `14:28:10 UTC,Flow Stabilized,1420 LPM • 64.2 PSI,Automated PLC Routine,Nominal,0x8F94...4C0\n` +
        `13:50:02 UTC,Actuator Micro-Step,82% -> 84%,HMI Console,Executed,0x3E11...99A\n` +
        `11:15:44 UTC,Pressure Wave Attenuation,+3.4 PSI peak damped,Surge Anticipator V-12,Nominal,0xA77B...82D`;
      filename = `AquaLedger_${ward.replace(/\s+/g, '_')}_Audit.csv`;
      mimeType = 'text/csv';
    } else if (format === 'json') {
      content = JSON.stringify({
        ward,
        standard: 'ISO-14046',
        records: 842,
        syncBlock: '0x8F94...4C0',
        timestamp: new Date().toISOString(),
        verified: true,
      }, null, 2);
      filename = `AquaLedger_${ward.replace(/\s+/g, '_')}_Stream.json`;
      mimeType = 'application/json';
    } else {
      content = mockHash;
      filename = `AquaLedger_Root_Hash.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  const copyHash = () => {
    navigator.clipboard.writeText(mockHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-[#e8e2d8] p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3d627f] text-[22px]">
              download
            </span>
            <h3 className="text-[17px] font-semibold text-[#1d1b15]">
              Export Telemetry Ledger
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#72787e] hover:text-[#1d1b15] p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-[13px] text-[#42474d]">
          Export immutable SCADA telemetry blocks and audit timestamps for{' '}
          <strong className="text-[#1d1b15]">{ward}</strong>.
        </p>

        <div className="space-y-2">
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#72787e]">
            Choose Export Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`py-2 px-3 rounded-lg text-[13px] font-medium border text-center transition-colors ${
                format === 'csv'
                  ? 'border-[#3d627f] bg-[#c2e5f5]/30 text-[#3d627f] font-semibold'
                  : 'border-[#e8e2d8] text-[#42474d] hover:bg-[#f9f3e9]'
              }`}
            >
              CSV Table
            </button>
            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`py-2 px-3 rounded-lg text-[13px] font-medium border text-center transition-colors ${
                format === 'json'
                  ? 'border-[#3d627f] bg-[#c2e5f5]/30 text-[#3d627f] font-semibold'
                  : 'border-[#e8e2d8] text-[#42474d] hover:bg-[#f9f3e9]'
              }`}
            >
              JSON Stream
            </button>
            <button
              type="button"
              onClick={() => setFormat('hash')}
              className={`py-2 px-3 rounded-lg text-[13px] font-medium border text-center transition-colors ${
                format === 'hash'
                  ? 'border-[#3d627f] bg-[#c2e5f5]/30 text-[#3d627f] font-semibold'
                  : 'border-[#e8e2d8] text-[#42474d] hover:bg-[#f9f3e9]'
              }`}
            >
              Root Hash
            </button>
          </div>
        </div>

        <div className="p-3 bg-[#f9f3e9] rounded-lg space-y-1.5 font-mono text-[11px] text-[#42474d] break-all">
          <div className="flex items-center justify-between font-sans text-[12px] text-[#72787e] font-semibold">
            <span>Cryptographic Proof</span>
            <button
              onClick={copyHash}
              className="text-[#3d627f] hover:underline flex items-center gap-1 font-normal font-sans"
            >
              <span className="material-symbols-outlined text-[14px]">
                content_copy
              </span>
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p>{mockHash}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eee7dd]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#f3ede3] hover:bg-[#eee7dd] text-[#1d1b15] text-[13px] font-medium"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-5 py-2 rounded-lg bg-[#3d627f] hover:bg-[#234a66] text-white text-[13px] font-semibold shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download Package</span>
          </button>
        </div>
      </div>
    </div>
  );
};
