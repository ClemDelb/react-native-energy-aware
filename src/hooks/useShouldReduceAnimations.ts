import { useEnergyState } from './useEnergyState';

export function useShouldReduceAnimations(): boolean {
  const { energyMode } = useEnergyState();
  return energyMode !== 'normal';
}
