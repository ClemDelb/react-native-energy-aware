export type BatteryState = 'charging' | 'unplugged' | 'full' | 'unknown';
export type ThermalState = 'nominal' | 'fair' | 'serious' | 'critical';
export type EnergyMode = 'normal' | 'saver' | 'critical' | 'overheating';

export interface EnergyState {
  batteryLevel: number;
  batteryState: BatteryState;
  isLowPowerMode: boolean;
  thermalState: ThermalState;
  energyMode: EnergyMode;
}
