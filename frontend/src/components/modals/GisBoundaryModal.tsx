import React from 'react';

interface GisBoundaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ward: string;
}

export const GisBoundaryModal: React.FC<GisBoundaryModalProps> = ({
  isOpen,
  onClose,
  ward,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full border border-[#e8e2d8] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eee7dd]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#3d627f] text-[22px]">
              map
            </span>
            <h3 className="text-[17px] font-semibold text-[#1d1b15]">
              GIS Boundary Envelope — {ward}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#72787e] hover:text-[#1d1b15] p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="h-48 w-full bg-[#f9f3e9] rounded-xl relative overflow-hidden flex items-center justify-center border border-[#e8e2d8]">
          <svg className="w-full h-full text-[#81a6c6]" viewBox="0 0 400 200" fill="none">
            <rect width="100%" height="100%" fill="#f9f3e9" />
            <polygon
              points="60,30 220,20 350,70 380,160 210,180 80,150 40,90"
              fill="#c2e5f5"
              fillOpacity="0.4"
              stroke="#3d627f"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <circle cx="60" cy="30" r="4" fill="#3d627f" />
            <circle cx="220" cy="20" r="4" fill="#3d627f" />
            <circle cx="350" cy="70" r="4" fill="#3d627f" />
            <circle cx="380" cy="160" r="4" fill="#3d627f" />
            <circle cx="210" cy="180" r="4" fill="#3d627f" />
            <circle cx="80" cy="150" r="4" fill="#3d627f" />
            <circle cx="40" cy="90" r="4" fill="#3d627f" />
            <text x="180" y="105" fill="#3d627f" fontSize="12" fontWeight="600" textAnchor="middle">
              42.8 sq km Polygons
            </text>
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div className="p-3 bg-[#f9f3e9] rounded-lg">
            <span className="text-[#72787e] block">Datum & Projection:</span>
            <span className="font-semibold text-[#1d1b15]">WGS 84 / EPSG:3857</span>
          </div>
          <div className="p-3 bg-[#f9f3e9] rounded-lg">
            <span className="text-[#72787e] block">Perimeter Vertex Count:</span>
            <span className="font-semibold text-[#1d1b15]">284 High-Precision Nodes</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#3d627f] hover:bg-[#234a66] text-white text-[13px] font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
