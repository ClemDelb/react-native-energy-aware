# ⚡ react-native-energy-aware

**React Native hooks that adapt your app to battery, thermal, and power save state — automatically.**

Stop draining your users' battery. Stop ignoring thermal warnings. One hook, zero boilerplate.

[![npm version](https://img.shields.io/npm/v/react-native-energy-aware)](https://www.npmjs.com/package/react-native-energy-aware)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Platform iOS](https://img.shields.io/badge/iOS-000000?logo=apple)](https://developer.apple.com)
[![Platform Android](https://img.shields.io/badge/Android-3DDC84?logo=android&logoColor=white)](https://developer.android.com)

---

## Why?

Most apps ignore the device energy state entirely. They animate at 60 FPS on a 5% battery, run heavy syncs when the device is overheating, and poll every 5 seconds regardless of power save mode.

`react-native-energy-aware` gives you a simple API to make your app a **good energy citizen** — without having to deal with `UIDevice`, `NSProcessInfo`, `PowerManager`, or `BroadcastReceiver` yourself.

---

## Installation

```sh
npm install react-native-energy-aware
# or
yarn add react-native-energy-aware
```

> Requires **React Native 0.75+**. Built on the New Architecture (TurboModule) with old architecture support via the interop layer.

---

## Quick start

```tsx
import { useEnergyState } from 'react-native-energy-aware';

export function MyScreen() {
  const { energyMode, batteryLevel, thermalState } = useEnergyState();

  if (energyMode === 'critical') {
    return <LightweightView />;
  }

  return <FullFeaturedView />;
}
```

That's it. `energyMode` is a single computed value that combines battery level, low power mode, and thermal state — so you don't have to.

---

## API

### `useEnergyState()` — the main hook

Returns the full energy state of the device, updated in real time.

```tsx
const {
  batteryLevel,    // number — 0.0 to 1.0 (-1 if unknown)
  batteryState,    // 'charging' | 'unplugged' | 'full' | 'unknown'
  isLowPowerMode,  // boolean
  thermalState,    // 'nominal' | 'fair' | 'serious' | 'critical'
  energyMode,      // 'normal' | 'saver' | 'critical' | 'overheating'
} = useEnergyState();
```

#### `energyMode` logic

| Mode | Triggers |
|---|---|
| `overheating` | thermalState is `serious` or `critical` |
| `critical` | battery < 15%, or (low power + battery < 20%) — not charging |
| `saver` | low power mode on, or thermalState `fair`, or battery < 30% |
| `normal` | everything else |

---

### Derived hooks

For most use cases, you don't even need `energyMode` — just use the purpose-built hooks:

#### `useShouldReduceAnimations()`

```tsx
import { useShouldReduceAnimations } from 'react-native-energy-aware';

function MyComponent() {
  const reduceAnimations = useShouldReduceAnimations();

  return reduceAnimations
    ? <StaticBanner />
    : <AnimatedBanner />;
}
```

Returns `true` in `saver`, `critical`, or `overheating` mode.

#### `useShouldReduceQuality()`

```tsx
import { useShouldReduceQuality } from 'react-native-energy-aware';

function Feed() {
  const reduceQuality = useShouldReduceQuality();

  return (
    <Image
      source={{ uri: reduceQuality ? thumbnailUrl : hdUrl }}
    />
  );
}
```

Returns `true` in `critical` or `overheating` mode.

#### `useRecommendedFPS()`

```tsx
import { useRecommendedFPS } from 'react-native-energy-aware';

function GameLoop() {
  const fps = useRecommendedFPS(); // 60 | 30 | 15

  useEffect(() => {
    startLoop({ targetFPS: fps });
  }, [fps]);
}
```

| Mode | FPS |
|---|---|
| `normal` | 60 |
| `saver` | 30 |
| `critical` / `overheating` | 15 |

#### `useCanRunExpensiveTask()`

```tsx
import { useCanRunExpensiveTask } from 'react-native-energy-aware';

function SyncButton() {
  const canSync = useCanRunExpensiveTask();

  return (
    <Button
      onPress={canSync ? runHeavySync : showDeferredMessage}
      title={canSync ? 'Sync now' : 'Sync deferred (low battery)'}
    />
  );
}
```

Returns `true` only in `normal` mode. Use this to gate ML inference, large uploads, image processing, etc.

---

## Real-world example

```tsx
import {
  useEnergyState,
  useRecommendedFPS,
  useShouldReduceAnimations,
  useCanRunExpensiveTask,
} from 'react-native-energy-aware';

export function VideoFeed() {
  const { energyMode, batteryLevel } = useEnergyState();
  const fps = useRecommendedFPS();
  const reduceAnimations = useShouldReduceAnimations();
  const canRunHeavy = useCanRunExpensiveTask();

  return (
    <View>
      {energyMode === 'overheating' && (
        <Banner message="⚠️ Device is hot — quality reduced" />
      )}

      <VideoPlayer
        targetFPS={fps}
        quality={energyMode === 'normal' ? 'high' : 'low'}
        autoplay={energyMode !== 'critical'}
      />

      {reduceAnimations
        ? <StaticRecommendations />
        : <AnimatedRecommendations />}

      {canRunHeavy && (
        <Button onPress={runMLRecommendations} title="Get AI picks" />
      )}

      <Text>{Math.round(batteryLevel * 100)}% battery</Text>
    </View>
  );
}
```

---

## Platform support

| Feature | iOS | Android |
|---|---|---|
| Battery level | ✅ `UIDevice.batteryLevel` | ✅ `BatteryManager` |
| Battery state | ✅ `UIDevice.batteryState` | ✅ `ACTION_BATTERY_CHANGED` |
| Low power mode | ✅ `NSProcessInfo.isLowPowerModeEnabled` | ✅ `PowerManager.isPowerSaveMode` |
| Thermal state | ✅ `NSProcessInfo.thermalState` | ✅ `PowerManager.currentThermalStatus` (API 29+) |
| Real-time updates | ✅ | ✅ |

> On Android < API 29, `thermalState` always returns `'nominal'` — there is no thermal API on older versions.

---

## Architecture

Built on the **New Architecture (TurboModule + Codegen)**. Old architecture is supported via the interop layer.

- Native observers are **ref-counted** — multiple `useEnergyState` instances share a single native subscription.
- No context or provider required for v0.1 — hooks are self-contained.

---

## Roadmap

- **v0.2** — Drop-in components (`<EnergyAwareImage>`, `<EnergyAwareAnimation>`), `useAdaptiveInterval`, debug overlay
- **v1.0** — `<EnergyProvider>` context, deferred task runner, plugin system for Reanimated / FlashList / Vision Camera / TanStack Query
- **v1.1+** — Energy budget tracker, background task throttling, carbon-aware scheduling

---

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT © [ClemDelb](https://github.com/ClemDelb)
