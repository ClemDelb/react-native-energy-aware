export { useEnergyState } from './hooks/useEnergyState';
export { useShouldReduceAnimations } from './hooks/useShouldReduceAnimations';
export { useShouldReduceQuality } from './hooks/useShouldReduceQuality';
export { useRecommendedFPS } from './hooks/useRecommendedFPS';
export { useCanRunExpensiveTask } from './hooks/useCanRunExpensiveTask';
export {
  useAdaptiveInterval,
  type AdaptiveIntervalConfig,
} from './hooks/useAdaptiveInterval';
export { EnergyAwareAnimation } from './components/EnergyAwareAnimation';
export { EnergyDebugOverlay } from './components/EnergyDebugOverlay';
export type {
  BatteryState,
  ThermalState,
  EnergyMode,
  EnergyState,
} from './types';
