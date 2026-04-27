import { useEnergyState } from './useEnergyState';

export function useShouldReduceQuality(): boolean {
  const { energyMode } = useEnergyState();
  return energyMode !== 'normal';
}
