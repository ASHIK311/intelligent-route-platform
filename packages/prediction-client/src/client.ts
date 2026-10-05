import { PredictionInput, PredictionResult } from '@intelligent-route/shared-types';
import { GradientBoostedTravelTimeModel } from './ml-model.js';
import { HistoricalBaselinePredictor } from './baseline.js';

export interface PredictionServiceConfig {
  enableMl?: boolean;
  enableBaselineFallback?: boolean;
  externalServiceUrl?: string;
}

/**
 * Resilient Prediction Service implementing Section 58 Fallback Cascade:
 * ML Prediction -> Historical Baseline -> Current Travel Observation -> Free-flow Base Speed.
 */
export class PredictionService {
  private readonly mlModel = new GradientBoostedTravelTimeModel();
  private readonly baselinePredictor = new HistoricalBaselinePredictor();
  private config: PredictionServiceConfig;

  constructor(config: PredictionServiceConfig = {}) {
    this.config = {
      enableMl: config.enableMl ?? true,
      enableBaselineFallback: config.enableBaselineFallback ?? true,
      externalServiceUrl: config.externalServiceUrl
    };
  }

  public async predictTravelTime(input: PredictionInput): Promise<PredictionResult> {
    // Priority 1: Primary ML Model
    if (this.config.enableMl) {
      try {
        const mlResult = this.mlModel.predict(input);
        return mlResult;
      } catch (err) {
        console.warn('[PredictionService] ML Model inference failed, initiating fallback cascade:', err);
      }
    }

    // Priority 2: Historical Baseline
    if (this.config.enableBaselineFallback) {
      try {
        const baselineResult = this.baselinePredictor.predict(input);
        return baselineResult;
      } catch (err) {
        console.warn('[PredictionService] Baseline fallback failed, dropping to current observations:', err);
      }
    }

    // Priority 3: Current Travel Time Observation
    if (input.currentTravelTimeMin > 0) {
      return {
        predictedTravelTimeMin: input.currentTravelTimeMin,
        predictedDelayMin: 0,
        confidence: 0.5,
        delayProbability: 0.3,
        source: 'CURRENT_OBSERVATION'
      };
    }

    // Priority 4: Free-flow base speed fallback
    const fallbackSpeed = input.roadType === 'highway' ? 80 : 40;
    const baseMin = Math.max(1, (input.distanceKm / fallbackSpeed) * 60);

    return {
      predictedTravelTimeMin: Math.round(baseMin * 10) / 10,
      predictedDelayMin: 0,
      confidence: 0.4,
      delayProbability: 0.1,
      source: 'FALLBACK_BASE'
    };
  }

  public getActiveModelMetadata() {
    return {
      modelId: this.mlModel.modelId,
      version: this.mlModel.version,
      algorithm: this.mlModel.algorithm,
      status: 'ACTIVE' as const,
      features: [
        'hourSin',
        'hourCos',
        'isRushHour',
        'isWeekend',
        'distanceKm',
        'currentTravelTimeMin',
        'trafficLevelOrdinal',
        'roadTypeHighway',
        'roadTypeArterial',
        'roadTypeLocal',
        'recentTrafficTrendRatio'
      ]
    };
  }
}
