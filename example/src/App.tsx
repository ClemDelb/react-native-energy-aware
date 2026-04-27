import { StyleSheet, Text, View } from 'react-native';
import {
  EnergyAwareAnimation,
  EnergyDebugOverlay,
  useAdaptiveInterval,
  useCanRunExpensiveTask,
  useEnergyState,
  useRecommendedFPS,
  useShouldReduceAnimations,
  useShouldReduceQuality,
} from 'react-native-energy-aware';

export default function App() {
  const energy = useEnergyState();
  const reduceAnimations = useShouldReduceAnimations();
  const reduceQuality = useShouldReduceQuality();
  const fps = useRecommendedFPS();
  const canRunHeavyTask = useCanRunExpensiveTask();
  const syncInterval = useAdaptiveInterval({
    normal: 5000,
    saver: 30000,
    critical: 60000,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>react-native-energy-aware</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Battery level</Text>
        <Text style={styles.value}>
          {energy.batteryLevel >= 0
            ? `${Math.round(energy.batteryLevel * 100)}%`
            : 'unknown'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Battery state</Text>
        <Text style={styles.value}>{energy.batteryState}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Low power mode</Text>
        <Text style={styles.value}>{energy.isLowPowerMode ? 'on' : 'off'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Thermal state</Text>
        <Text style={styles.value}>{energy.thermalState}</Text>
      </View>

      <View style={[styles.section, styles.modeRow]}>
        <Text style={styles.label}>Energy mode</Text>
        <Text style={[styles.value, styles.mode]}>{energy.energyMode}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.label}>Reduce animations</Text>
        <Text style={styles.value}>{reduceAnimations ? 'yes' : 'no'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Reduce quality</Text>
        <Text style={styles.value}>{reduceQuality ? 'yes' : 'no'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Recommended FPS</Text>
        <Text style={styles.value}>{fps}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Can run heavy task</Text>
        <Text style={styles.value}>{canRunHeavyTask ? 'yes' : 'no'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Adaptive sync interval</Text>
        <Text style={styles.value}>{syncInterval / 1000}s</Text>
      </View>

      <View style={styles.divider} />

      <EnergyAwareAnimation
        fallback={
          <View style={styles.animationBox}>
            <Text style={styles.animationLabel}>⚡ Static (energy saving)</Text>
          </View>
        }
      >
        <View style={[styles.animationBox, styles.animationBoxActive]}>
          <Text style={styles.animationLabel}>✨ Animated content here</Text>
        </View>
      </EnergyAwareAnimation>

      {__DEV__ && <EnergyDebugOverlay position="bottom-right" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  label: {
    color: '#666',
  },
  value: {
    fontWeight: '500',
  },
  mode: {
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  modeRow: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
    marginVertical: 8,
  },
  animationBox: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationBoxActive: {
    backgroundColor: '#e8f5e9',
  },
  animationLabel: {
    fontSize: 13,
    color: '#444',
  },
});
