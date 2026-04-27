import { useEnergyState } from './useEnergyState';

export function useRecommendedFPS(): 60 | 30 | 15 {
  const { energyMode } = useEnergyState();
  if (energyMode === 'critical' || energyMode === 'overheating') return 15;
  if (energyMode === 'saver') return 30;
  return 60;
}
