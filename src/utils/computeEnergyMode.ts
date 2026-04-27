import type { BatteryState, EnergyMode, ThermalState } from '../types';

export function computeEnergyMode(
  batteryLevel: number,
  batteryState: BatteryState,
  isLowPowerMode: boolean,
  thermalState: ThermalState
): EnergyMode {
  if (thermalState === 'serious' || thermalState === 'critical') {
    return 'overheating';
  }

  const isCharging = batteryState === 'charging' || batteryState === 'full';

  if (!isCharging && batteryLevel >= 0) {
    if (batteryLevel < 0.15) return 'critical';
    if (isLowPowerMode && batteryLevel < 0.2) return 'critical';
  }

  if (isLowPowerMode || thermalState === 'fair') return 'saver';
  if (!isCharging && batteryLevel >= 0 && batteryLevel < 0.3) return 'saver';

  return 'normal';
}
