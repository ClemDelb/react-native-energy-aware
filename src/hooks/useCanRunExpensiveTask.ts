import { useEnergyState } from './useEnergyState';

export function useCanRunExpensiveTask(): boolean {
  const { energyMode, batteryState } = useEnergyState();
  if (batteryState === 'charging' || batteryState === 'full') return true;
  return energyMode === 'normal';
}
