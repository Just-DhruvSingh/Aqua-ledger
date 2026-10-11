export type ScreenId = 'network-map' | 'telemetry-inspector' | 'equity-analytics' | 'system-settings';

export interface TelemetryNode {
  id: string;
  name: string;
  sector: string;
  assetId: string;
  flowMLD: number;
  pressurePSI: number;
  status: 'Nominal' | 'Optimal' | 'Caution' | 'Active';
  type: 'reservoir' | 'valve' | 'hub' | 'terminal' | 'feeder';
  x: number; // percentage coordinates for map
  y: number;
  throughputVelocity: string;
  chlorineResidual: string;
  lastScadaPoll: string;
}

export interface NodeEventLog {
  id: string;
  timestamp: string;
  eventClass: string;
  reading: string;
  operator: string;
  state: 'Nominal' | 'Executed' | 'Routine' | 'Passed' | 'Warning';
  hash: string;
}

export interface SectorParityData {
  id: string;
  sectorName: string;
  hub: string;
  households: number;
  pressureBar: number;
  dailyAvailabilityHours: number;
  nrwRatioPercent: number;
  reliabilityPercent: number;
  parityStatus: 'High Parity' | 'Moderate' | 'Needs Attention';
}

export interface SystemSettingsState {
  municipalAuthority: string;
  timezone: string;
  hydroNodeCode: string;
  flowUnit: 'L/s' | 'GPM';
  pressureUnit: 'Bar' | 'PSI';
  burstThreshold: number; // 10 to 80
  autoBypassEnabled: boolean;
}
