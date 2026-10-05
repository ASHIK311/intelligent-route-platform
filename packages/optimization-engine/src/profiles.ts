import { OptimizationProfileType, OptimizationWeights } from '@intelligent-route/shared-types';
import { normalizeWeights } from '@intelligent-route/routing-engine';

/**
 * Standard optimization weight presets as specified in SRS Section 7.
 */
export const PROFILE_PRESETS: Record<OptimizationProfileType, OptimizationWeights> = {
  fastest: normalizeWeights({
    travelTime: 0.70,
    distance: 0.10,
    monetaryCost: 0.05,
    predictedDelay: 0.10,
    risk: 0.03,
    userPreference: 0.02
  }),
  cheapest: normalizeWeights({
    monetaryCost: 0.60,
    distance: 0.20,
    travelTime: 0.10,
    predictedDelay: 0.05,
    risk: 0.03,
    userPreference: 0.02
  }),
  shortest: normalizeWeights({
    distance: 0.75,
    travelTime: 0.15,
    monetaryCost: 0.05,
    predictedDelay: 0.03,
    risk: 0.01,
    userPreference: 0.01
  }),
  balanced: normalizeWeights({
    distance: 0.25,
    travelTime: 0.30,
    monetaryCost: 0.15,
    predictedDelay: 0.20,
    risk: 0.05,
    userPreference: 0.05
  }),
  custom: normalizeWeights({
    distance: 0.25,
    travelTime: 0.25,
    monetaryCost: 0.20,
    predictedDelay: 0.15,
    risk: 0.08,
    userPreference: 0.07
  })
};

/**
 * Resolves effective weights from profile type and optional user overrides.
 */
export function resolveEffectiveWeights(
  profile: OptimizationProfileType,
  customOverrides?: Partial<OptimizationWeights>
): OptimizationWeights {
  const base = PROFILE_PRESETS[profile] || PROFILE_PRESETS.balanced;
  if (!customOverrides) return base;

  const merged: OptimizationWeights = {
    distance: customOverrides.distance ?? (profile === 'custom' ? 0 : base.distance),
    travelTime: customOverrides.travelTime ?? (profile === 'custom' ? 0 : base.travelTime),
    monetaryCost: customOverrides.monetaryCost ?? (profile === 'custom' ? 0 : base.monetaryCost),
    predictedDelay: customOverrides.predictedDelay ?? (profile === 'custom' ? 0 : base.predictedDelay),
    risk: customOverrides.risk ?? (profile === 'custom' ? 0 : base.risk),
    userPreference: customOverrides.userPreference ?? (profile === 'custom' ? 0 : base.userPreference)
  };

  return normalizeWeights(merged);
}
