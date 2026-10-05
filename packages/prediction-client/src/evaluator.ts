import { PredictionInput } from '@intelligent-route/shared-types';
import { HistoricalBaselinePredictor } from './baseline.js';
import { GradientBoostedTravelTimeModel } from './ml-model.js';

export interface GroundTruthObservation {
  input: PredictionInput;
  actualTravelTimeMin: number;
}

export interface ModelEvaluationMetrics {
  modelName: string;
  mae: number;
  rmse: number;
  mape: number;
  sampleCount: number;
}

export function evaluateModelPerformance(
  predictions: number[],
  actuals: number[],
  modelName: string
): ModelEvaluationMetrics {
  const n = actuals.length;
  if (n === 0) {
    return { modelName, mae: 0, rmse: 0, mape: 0, sampleCount: 0 };
  }

  let totalAbsError = 0;
  let totalSqError = 0;
  let totalPctError = 0;

  for (let i = 0; i < n; i++) {
    const error = Math.abs(predictions[i] - actuals[i]);
    totalAbsError += error;
    totalSqError += error * error;
    totalPctError += (error / actuals[i]) * 100;
  }

  return {
    modelName,
    mae: Math.round((totalAbsError / n) * 100) / 100,
    rmse: Math.round(Math.sqrt(totalSqError / n) * 100) / 100,
    mape: Math.round((totalPctError / n) * 10) / 10,
    sampleCount: n
  };
}

/**
 * Runs comparative evaluation between Historical Baseline and ML Gradient Boosted Model.
 */
export function runComparativeEvaluation(dataset: GroundTruthObservation[]): {
  baseline: ModelEvaluationMetrics;
  mlModel: ModelEvaluationMetrics;
  maeImprovementPct: number;
} {
  const baselinePredictor = new HistoricalBaselinePredictor();
  const mlPredictor = new GradientBoostedTravelTimeModel();

  const actuals = dataset.map(d => d.actualTravelTimeMin);
  const baselinePreds = dataset.map(d => baselinePredictor.predict(d.input).predictedTravelTimeMin);
  const mlPreds = dataset.map(d => mlPredictor.predict(d.input).predictedTravelTimeMin);

  const baselineMetrics = evaluateModelPerformance(baselinePreds, actuals, 'Historical Moving Average Baseline');
  const mlMetrics = evaluateModelPerformance(mlPreds, actuals, mlPredictor.modelId);

  const maeImprovementPct =
    baselineMetrics.mae > 0
      ? Math.round(((baselineMetrics.mae - mlMetrics.mae) / baselineMetrics.mae) * 1000) / 10
      : 0;

  return {
    baseline: baselineMetrics,
    mlModel: mlMetrics,
    maeImprovementPct
  };
}
