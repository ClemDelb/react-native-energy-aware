# react-native-energy-aware

> Une librairie React Native pour adapter automatiquement le comportement d'une app selon l'état énergétique du device (
> batterie, mode économie d'énergie, état thermique).

---

## 🎯 Vision

Permettre aux apps RN d'être de **bons citoyens énergétiques** : préserver la batterie, éviter la surchauffe, respecter
le mode économie d'énergie — sans que les devs aient à gérer manuellement la complexité de chaque plateforme.

---

## 🧩 Plateformes natives wrappées

| Capacité                    | iOS                                            | Android                                            |
|-----------------------------|------------------------------------------------|----------------------------------------------------|
| Niveau de batterie          | `UIDevice.batteryLevel`                        | `BatteryManager.BATTERY_PROPERTY_CAPACITY`         |
| État de charge              | `UIDevice.batteryState`                        | `Intent.ACTION_BATTERY_CHANGED`                    |
| Mode économie d'énergie     | `NSProcessInfo.isLowPowerModeEnabled`          | `PowerManager.isPowerSaveMode()`                   |
| État thermique              | `NSProcessInfo.thermalState`                   | `PowerManager.getCurrentThermalStatus()` (API 29+) |
| Notifications de changement | `NSProcessInfoPowerStateDidChangeNotification` | `ACTION_POWER_SAVE_MODE_CHANGED`                   |

---

## 🚀 Roadmap & Features

### ✅ v0.1 — MVP (Core API) — released 2026-04-27

#### 1. Hook central `useEnergyState`

```js
const {
  batteryLevel,        // 0-1
  batteryState,        // 'charging' | 'unplugged' | 'full' | 'unknown'
  isLowPowerMode,      // boolean
  thermalState,        // 'nominal' | 'fair' | 'serious' | 'critical'
  energyMode,          // 'normal' | 'saver' | 'critical' | 'overheating'
} = useEnergyState();
```

`energyMode` est une valeur calculée intelligente combinant les 4 dimensions — la plupart des devs ne veulent qu'un seul
switch à gérer.

#### 2. Hooks dérivés haut niveau

```js
const shouldReduceMotion = useShouldReduceAnimations();
const shouldReduceQuality = useShouldReduceQuality();
const recommendedFPS = useRecommendedFPS();      // 60 / 30 / 15
const canDoHeavyTask = useCanRunExpensiveTask();
```

L'idée : la lib applique les best practices, le dev consomme juste un boolean.

---

### 🚧 v0.2 — Adaptation automatique (in progress)

#### 3. Composants drop-in

```jsx
<EnergyAwareImage
  source={{ uri }}
  highQuality={hdImage}
  lowQuality={compressedImage}
/>

<EnergyAwareVideo
  source={video}
  pauseOnLowPower
  reducedQualityWhenHot
/>

<EnergyAwareAnimation fallback={<StaticView />}>
  <LottieView ... />
</EnergyAwareAnimation>
```

#### 4. Polling adaptatif

```js
const interval = useAdaptiveInterval({
  normal: 5000,
  saver: 30000,
  critical: 60000,
});

useEffect(() => {
  const id = setInterval(fetchData, interval);
  return () => clearInterval(id);
}, [interval]);
```

**Cas d'usage** : refresh feed, polling websocket fallback, geo-tracking, etc.

#### 5. Debug overlay

```jsx
{
  __DEV__ && <EnergyDebugOverlay position="bottom-right" />
}
```

Affiche en temps réel : batterie, thermal, low-power, FPS recommandé, tâches différées, impact énergétique estimé.

---

### v1.0 — Stable

#### 6. Wrapper pour tâches lourdes

```js
const { runWhenSafe } = useEnergyAwareTask();

await runWhenSafe(async () => {
  await heavyComputation();
}, {
  requiresCharging: false,
  maxThermalState: 'fair',
  deferIfCritical: true,
});
```

Différé automatiquement si l'état est mauvais.

#### 7. Stratégies prédéfinies

```jsx
<EnergyProvider strategy="aggressive-saver">
  {/* App entière s'adapte */}
</EnergyProvider>
```

Stratégies : `aggressive-saver` | `balanced` | `performance` | `custom`

#### 8. Plugins pour libs populaires

One-line plugins pour :

- **Reanimated** : désactive `withSpring` complexes en mode saver
- **FlashList / FlatList** : réduit `windowSize` et `maxToRenderPerBatch`
- **Vision Camera** : baisse résolution et FPS
- **TanStack Query** : ajuste `staleTime` et `refetchInterval`

```js
import { withEnergyAwareness } from 'react-native-energy-aware/reanimated';

const AdaptiveAnimation = withEnergyAwareness(Animated.View);
```

---

### v1.1+ — Différenciation

#### 9. Energy budget tracker

```js
EnergyTracker.measure('image-processing', () => {
  // ...
});

const report = EnergyTracker.getReport();
// { 'image-processing': { calls: 42, estimatedCost: 'high' } }
```

Utile pour debug et reporting Sentry/analytics.

#### 10. Background task throttling

API pour `BGTaskScheduler` (iOS) / `WorkManager` (Android) qui respecte automatiquement les contraintes énergétiques.

#### 11. Carbon awareness (bonus original)

```js
const { gridIntensity } = useCarbonAwareness({
  apiKey: 'electricity-maps-key',
});
```

Permettre de différer des syncs lourdes quand le mix électrique local est carboné. Niche mais différenciant pour les
apps engagées.

#### 12. Telemetry opt-in

Permet aux apps d'envoyer (anonymisé) des stats énergie pour identifier les écrans/features qui consomment anormalement.

---

## 🤔 Questions de design ouvertes

1. **Naming** : `useEnergyState` ou `useDeviceEnergy` (pour matcher `useColorScheme` de RN core) ?
2. **Hooks dérivés** : hooks séparés (`useShouldReduceAnimations`) ou un seul objet (
   `recommendations.reduceAnimations`) ?
3. **Plugins** : intégrés dans le package principal ou packages séparés (`@energy-aware/reanimated`) ?
4. **Architecture** : TurboModule (new arch) only, ou compat old arch aussi ?

---

## 📦 Structure de packages envisagée

```
react-native-energy-aware              # core
@energy-aware/reanimated               # plugin Reanimated
@energy-aware/flash-list               # plugin FlashList
@energy-aware/vision-camera            # plugin Vision Camera
@energy-aware/tanstack-query           # plugin TanStack Query
@energy-aware/devtools                 # debug overlay (séparé pour ne pas bloat le bundle)
```

---

## 🎯 Public cible

- Apps **media-heavy** (vidéo, streaming, jeux) → réduction qualité automatique
- Apps **fitness / tracking** (GPS, sensors) → polling adaptatif
- Apps **fintech / e-commerce** → différer syncs non-critiques
- Apps **éco-engagées** → carbon awareness
- Apps **AR / ML on-device** → respect du thermal state

---

## 🏆 Pourquoi ça pourrait marcher

- Aucune lib RN ne fait ça proprement aujourd'hui
- Apple et Google poussent activement vers des apps "responsibly designed"
- Pain point réel : apps qui surchauffent, vident la batterie, ou ignorent le mode éco
- API simple à adopter incrémentalement (un hook → puis composants → puis plugins)
- Future-proof : les contraintes énergétiques vont devenir plus strictes (régulations EU, etc.)
