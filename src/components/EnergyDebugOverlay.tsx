import { StyleSheet, Text, View } from 'react-native';
import { useEnergyState } from '../hooks/useEnergyState';
import { useRecommendedFPS } from '../hooks/useRecommendedFPS';
import type { EnergyMode } from '../types';

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface EnergyDebugOverlayProps {
  position?: Position;
}

const MODE_COLORS: Record<EnergyMode, string> = {
  normal: '#4CAF50',
  saver: '#FF9800',
  critical: '#F44336',
  overheating: '#9C27B0',
};

const POSITION_STYLES: Record<Position, object> = {
  'top-left': { top: 40, left: 10 },
  'top-right': { top: 40, right: 10 },
  'bottom-left': { bottom: 40, left: 10 },
  'bottom-right': { bottom: 40, right: 10 },
};

export function EnergyDebugOverlay({
  position = 'bottom-right',
}: EnergyDebugOverlayProps) {
  const energy = useEnergyState();
  const fps = useRecommendedFPS();

  return (
    <View
      style={[styles.container, POSITION_STYLES[position]]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.badge,
          { backgroundColor: MODE_COLORS[energy.energyMode] },
        ]}
      >
        <Text style={styles.mode}>{energy.energyMode.toUpperCase()}</Text>
      </View>
      <Row
        label="Battery"
        value={
          energy.batteryLevel >= 0
            ? `${Math.round(energy.batteryLevel * 100)}%`
            : 'unknown'
        }
      />
      <Row label="State" value={energy.batteryState} />
      <Row label="Thermal" value={energy.thermalState} />
      <Row label="Low power" value={energy.isLowPowerMode ? 'on' : 'off'} />
      <Row label="FPS" value={String(fps)} />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 8,
    padding: 8,
    minWidth: 160,
    zIndex: 9999,
    gap: 2,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  mode: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  value: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
});
