import { useEffect, useRef, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import NativeEnergyAware, {
  type EnergyStatePayload,
} from '../NativeEnergyAware';
import { computeEnergyMode } from '../utils/computeEnergyMode';
import type { BatteryState, EnergyState, ThermalState } from '../types';

const EVENT_STATE_CHANGED = 'EnergyAware:stateChanged';

const DEFAULT_STATE: EnergyState = {
  batteryLevel: 1,
  batteryState: 'unknown',
  isLowPowerMode: false,
  thermalState: 'nominal',
  energyMode: 'normal',
};

function toEnergyState(raw: EnergyStatePayload): EnergyState {
  const batteryState = raw.batteryState as BatteryState;
  const thermalState = raw.thermalState as ThermalState;
  return {
    batteryLevel: raw.batteryLevel,
    batteryState,
    isLowPowerMode: raw.isLowPowerMode,
    thermalState,
    energyMode: computeEnergyMode(
      raw.batteryLevel,
      batteryState,
      raw.isLowPowerMode,
      thermalState
    ),
  };
}

export function useEnergyState(): EnergyState {
  const [state, setState] = useState<EnergyState>(DEFAULT_STATE);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    NativeEnergyAware.startMonitoring();

    NativeEnergyAware.getEnergyState().then((raw) => {
      if (mountedRef.current) {
        setState(toEnergyState(raw));
      }
    });

    const emitter = new NativeEventEmitter(NativeModules.EnergyAware);
    const subscription = emitter.addListener(
      EVENT_STATE_CHANGED,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (raw: any) => {
        setState(toEnergyState(raw as EnergyStatePayload));
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.remove();
      NativeEnergyAware.stopMonitoring();
    };
  }, []);

  return state;
}
