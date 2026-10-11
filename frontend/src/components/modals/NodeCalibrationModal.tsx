import React, { useState } from 'react';
import { TelemetryNode } from '../../types';

interface NodeCalibrationModalProps {
  node: TelemetryNode;
  isOpen: boolean;
  onClose: () => void;
  onCalibrate: (newPressure: number) => void;
}

export const NodeCalibrationModal: React.FC<NodeCalibrationModalProps> = ({
  node,
  isOpen,
  onClose,
  onCalibrate,
}) => {
  const [pressureSetpoint, setPressureSetpoint] = useState(node.pressurePSI);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleApply = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setSuccessMessage('Setpoint written to SCADA PLC gateway.');
      onCalibrate(pressureSetpoint);
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-[#e8e2d8] p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3d627f] text-[20px]">
              tune
            </span>
            <h3 className="text-[17px] font-semibold text-[#1d1b15]">
              Calibrate Valve Setpoint
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#72787e] hover:text-[#1d1b15] p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div>
          <p className="text-[13px] text-[#42474d] mb-1">
            Targeting: <strong className="text-[#1d1b15]">{node.name}</strong> ({node.assetId})
          </p>
          <p className="text-[12px] text-[#72787e]">
            Adjusting servo setpoint modifies downstream manifold pressure.
          </p>
        </div>

        <div className="bg-[#f9f3e9] p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] uppercase font-semibold text-[#72787e] tracking-wider">
              Desired Pressure
            </span>
            <span className="font-mono text-[18px] font-semibold text-[#3d627f]">
              {pressureSetpoint.toFixed(1)} PSI
            </span>
          </div>
          <input
            type="range"
            min="45"
            max="80"
            step="0.5"
            value={pressureSetpoint}
            onChange={(e) => setPressureSetpoint(parseFloat(e.target.value))}
            className="w-full accent-[#3d627f] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#72787e]">
            <span>45.0 PSI (Low)</span>
            <span>62.0 PSI (Target)</span>
            <span>80.0 PSI (High)</span>
          </div>
        </div>

        {successMessage ? (
          <div className="p-3 bg-[#c2e5f5]/50 border border-[#a5cbec] text-[#113c57] rounded-lg text-[13px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#426370]">
              check_circle
            </span>
            <span>{successMessage}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#f3ede3] hover:bg-[#eee7dd] text-[#1d1b15] text-[13px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={isCalibrating}
            className="px-5 py-2 rounded-lg bg-[#3d627f] hover:bg-[#234a66] text-white text-[13px] font-semibold transition-colors shadow-sm flex items-center gap-1.5"
          >
            {isCalibrating ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  sync
                </span>
                <span>Writing to SCADA...</span>
              </>
            ) : (
              'Apply Calibration'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
