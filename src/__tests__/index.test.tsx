import { describe, expect, it } from '@jest/globals';
import { computeEnergyMode } from '../utils/computeEnergyMode';

describe('computeEnergyMode', () => {
  describe('overheating', () => {
    it('returns overheating when thermalState is serious', () => {
      expect(computeEnergyMode(0.8, 'unplugged', false, 'serious')).toBe(
        'overheating'
      );
    });

    it('returns overheating when thermalState is critical', () => {
      expect(computeEnergyMode(0.8, 'unplugged', false, 'critical')).toBe(
        'overheating'
      );
    });

    it('returns overheating even when charging', () => {
      expect(computeEnergyMode(0.9, 'charging', false, 'critical')).toBe(
        'overheating'
      );
    });
  });

  describe('critical', () => {
    it('returns critical when battery is below 15% and unplugged', () => {
      expect(computeEnergyMode(0.1, 'unplugged', false, 'nominal')).toBe(
        'critical'
      );
    });

    it('returns critical when low power mode is on and battery below 20%', () => {
      expect(computeEnergyMode(0.18, 'unplugged', true, 'nominal')).toBe(
        'critical'
      );
    });

    it('does not return critical when charging with low battery', () => {
      expect(computeEnergyMode(0.1, 'charging', false, 'nominal')).toBe(
        'normal'
      );
    });
  });

  describe('saver', () => {
    it('returns saver when low power mode is on with enough battery', () => {
      expect(computeEnergyMode(0.5, 'unplugged', true, 'nominal')).toBe(
        'saver'
      );
    });

    it('returns saver when thermalState is fair', () => {
      expect(computeEnergyMode(0.8, 'unplugged', false, 'fair')).toBe('saver');
    });

    it('returns saver when battery is below 30% and unplugged', () => {
      expect(computeEnergyMode(0.25, 'unplugged', false, 'nominal')).toBe(
        'saver'
      );
    });

    it('does not return saver when charging at 25%', () => {
      expect(computeEnergyMode(0.25, 'charging', false, 'nominal')).toBe(
        'normal'
      );
    });
  });

  describe('normal', () => {
    it('returns normal for a typical healthy state', () => {
      expect(computeEnergyMode(0.85, 'unplugged', false, 'nominal')).toBe(
        'normal'
      );
    });

    it('returns normal when battery state is full', () => {
      expect(computeEnergyMode(1.0, 'full', false, 'nominal')).toBe('normal');
    });

    it('returns normal when battery level is unknown (-1) and unplugged', () => {
      expect(computeEnergyMode(-1, 'unplugged', false, 'nominal')).toBe(
        'normal'
      );
    });
  });
});
