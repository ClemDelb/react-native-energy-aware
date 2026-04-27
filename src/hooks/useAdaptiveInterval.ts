import { useEnergyState } from './useEnergyState';

export interface AdaptiveIntervalConfig {
  normal: number;
  saver: number;
  critical: number;
}

export function useAdaptiveInterval(config: AdaptiveIntervalConfig): number {
  const { energyMode } = useEnergyState();
  if (energyMode === 'critical' || energyMode === 'overheating')
    return config.critical;
  if (energyMode === 'saver') return config.saver;
  return config.normal;
}
