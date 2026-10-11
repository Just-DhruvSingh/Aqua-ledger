import React from 'react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-[#e8e2d8] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3d627f] text-[22px]">
              science
            </span>
            <h3 className="text-[17px] font-semibold text-[#1d1b15]">
              Hydraulic Parity Methodology
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#72787e] hover:text-[#1d1b15] p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-3 text-[13px] text-[#42474d] leading-relaxed">
          <p>
            The <strong>Ward Equity Score</strong> measures distribution symmetry across all sub-district nodes, incorporating:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[12px]">
            <li><strong>Hydraulic Head Regularity (40%):</strong> Gini coefficient of static dynamic pressure delta between civic center and peripheral zones.</li>
            <li><strong>Temporal Continuity (35%):</strong> Hours of pressurized clean water delivery per 24-hour cycle across household meters.</li>
            <li><strong>Acoustic Leak Ratio (25%):</strong> Differential flow balance between primary trunk aqueducts and localized service lines.</li>
          </ul>
          <div className="p-3 bg-[#f9f3e9] rounded-lg text-[12px] text-[#1d1b15]">
            <span className="font-semibold block mb-0.5">International Standards Compliance:</span>
            ISO-14046 Water Footprint Assessment & WHO Safe Drinking Water Mandate Tier-1.
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#3d627f] hover:bg-[#234a66] text-white text-[13px] font-semibold"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
