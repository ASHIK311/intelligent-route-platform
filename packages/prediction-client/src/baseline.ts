import { PredictionInput, PredictionResult } from '@intelligent-route/shared-types';

/**
 * Historical Moving Average Baseline Predictor.
 * Serves as a reference benchmark to measure ML improvements.
 */
export class HistoricalBaselinePredictor {
  public predict(input: PredictionInput): PredictionResult {
    // Basic heuristic baseline based solely on road type speed limits
    const avgSpeed = input.roadType === 'highway' ? 80 : input.roadType === 'arterial' ? 45 : 30;
    const baseTimeMin = (input.distanceKm / avgSpeed) * 60;

    // Simple time-of-day multiplier without non-linear interaction
    const isRushHour = !input.isWeekend && ((input.hour >= 8 && input.hour <= 9) || (input.hour >= 17 && input.hour <= 18));
    const factor = isRushHour ? 1.4 : 1.05;
    const predictedTime = Math.max(1, Math.round(baseTimeMin * factor * 10) / 10);
    const delay = Math.max(0, predictedTime - baseTimeMin);

    return {
      predictedTravelTimeMin: predictedTime,
      predictedDelayMin: Math.round(delay * 10) / 10,
      confidence: 0.65,
      delayProbability: isRushHour ? 0.6 : 0.2,
      source: 'HISTORICAL_BASELINE'
    };
  }
}
