import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface EnergyStatePayload {
  batteryLevel: number;
  batteryState: string;
  isLowPowerMode: boolean;
  thermalState: string;
}

export interface Spec extends TurboModule {
  getEnergyState(): Promise<EnergyStatePayload>;
  startMonitoring(): void;
  stopMonitoring(): void;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('EnergyAware');
