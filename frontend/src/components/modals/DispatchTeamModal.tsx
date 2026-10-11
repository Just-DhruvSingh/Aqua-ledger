import React, { useState } from 'react';

interface DispatchTeamModalProps {
  nodeId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const DispatchTeamModal: React.FC<DispatchTeamModalProps> = ({
  nodeId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [crew, setCrew] = useState('Unit 4-Delta (M. Vance)');
  const [priority, setPriority] = useState('Standard');
  const [workType, setWorkType] = useState('Actuator Zero Calibration & Seal Inspection');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccess(`Work Order #WO-991 dispatched to ${crew} for node #${nodeId}.`);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-[#e8e2d8] p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3d627f] text-[22px]">
              engineering
            </span>
            <h3 className="text-[17px] font-semibold text-[#1d1b15]">
              Dispatch Field Team
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#72787e] hover:text-[#1d1b15] p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#72787e] mb-1">
              Destination Asset
            </label>
            <div className="p-3 bg-[#f9f3e9] rounded-lg text-[13px] text-[#1d1b15] font-mono">
              Node #{nodeId} • Reservoir Junction, Ward 4-Alpha
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#1d1b15] mb-1">
                Assigned District Crew
              </label>
              <select
                value={crew}
                onChange={(e) => setCrew(e.target.value)}
                className="w-full bg-[#f9f3e9] px-3 py-2 rounded-lg text-[13px] border border-[#e8e2d8] focus:outline-none"
              >
                <option value="Unit 4-Delta (M. Vance)">Unit 4-Delta (M. Vance)</option>
                <option value="Unit 2-Beta (R. Silva)">Unit 2-Beta (R. Silva)</option>
                <option value="Emergency Rapid Crew E-1">Emergency Rapid Crew E-1</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#1d1b15] mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#f9f3e9] px-3 py-2 rounded-lg text-[13px] border border-[#e8e2d8] focus:outline-none"
              >
                <option value="Standard">Standard Routine (4h SLA)</option>
                <option value="Elevated">Elevated (1h SLA)</option>
                <option value="Critical">Critical Surge Response (15m SLA)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#1d1b15] mb-1">
              Field Work Directive
            </label>
            <input
              type="text"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full bg-[#f9f3e9] px-3 py-2 rounded-lg text-[13px] border border-[#e8e2d8] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eee7dd]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#f3ede3] hover:bg-[#eee7dd] text-[#1d1b15] text-[13px] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#3d627f] hover:bg-[#234a66] text-white text-[13px] font-semibold shadow-sm flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    sync
                  </span>
                  <span>Generating Work Order...</span>
                </>
              ) : (
                'Transmit Work Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
