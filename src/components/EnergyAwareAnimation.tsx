import type { ReactNode } from 'react';
import { useShouldReduceAnimations } from '../hooks/useShouldReduceAnimations';

interface EnergyAwareAnimationProps {
  children: ReactNode;
  fallback: ReactNode;
}

export function EnergyAwareAnimation({
  children,
  fallback,
}: EnergyAwareAnimationProps): ReactNode {
  const reduce = useShouldReduceAnimations();
  return reduce ? fallback : children;
}
