import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractFeatures,
  HistoricalBaselinePredictor,
  GradientBoostedTravelTimeModel,
  PredictionService,
  runComparativeEvaluation,
  GroundTruthObservation
} from './index.js';
import { PredictionInput } from '@intelligent-route/shared-types';

test('Feature engineering encodes cyclical time and identifies rush hour', () => {
  const morningCommute: PredictionInput = {
    distanceKm: 12.0,
    currentTravelTimeMin: 18.0,
    hour: 8,
    minute: 30,
    dayOfWeek: 2, // Tuesday
    isWeekend: false,
    roadType: 'highway',
    trafficLevel: 'HIGH',
    recentTrafficTrendRatio: 1.25
  };

  const feat = extractFeatures(morningCommute);
  assert.equal(feat.isRushHour, 1.0);
  assert.equal(feat.isWeekend, 0);
  assert.equal(feat.trafficLevelOrdinal, 2);
  assert.equal(feat.roadTypeHighway, 1);
  assert.equal(feat.roadTypeLocal, 0);

  const midnightWeekend: PredictionInput = {
    distanceKm: 5.0,
    currentTravelTimeMin: 6.0,
    hour: 1,
    minute: 15,
    dayOfWeek: 6, // Saturday
    isWeekend: true,
    roadType: 'local',
    trafficLevel: 'LOW'
  };

  const featWeekend = extractFeatures(midnightWeekend);
  assert.equal(featWeekend.isRushHour, 0);
  assert.equal(featWeekend.isWeekend, 1);
});

test('ML Model predicts realistic travel times and confidence', () => {
  const model = new GradientBoostedTravelTimeModel();
  const input: PredictionInput = {
    distanceKm: 15.0,
    currentTravelTimeMin: 20.0,
    hour: 8,
    minute: 15,
    dayOfWeek: 1,
    isWeekend: false,
    roadType: 'arterial',
    trafficLevel: 'HIGH',
    recentTrafficTrendRatio: 1.2
  };

  const result = model.predict(input);
  assert.ok(result.predictedTravelTimeMin >= 20.0, 'Predicted travel time during peak traffic should be >= current');
  assert.ok(result.confidence >= 0.8 && result.confidence <= 1.0);
  assert.ok(result.delayProbability > 0.5);
  assert.equal(result.source, 'ML_GRADIENT_BOOST');
});

test('PredictionService fallback cascade gracefully falls back to baseline and current observations', async () => {
  const input: PredictionInput = {
    distanceKm: 10.0,
    currentTravelTimeMin: 15.0,
    hour: 14,
    minute: 0,
    dayOfWeek: 3,
    isWeekend: false,
    roadType: 'highway',
    trafficLevel: 'LOW'
  };

  // 1. With ML enabled
  const mlService = new PredictionService({ enableMl: true });
  const mlRes = await mlService.predictTravelTime(input);
  assert.equal(mlRes.source, 'ML_GRADIENT_BOOST');

  // 2. With ML disabled -> should fall back to Historical Baseline
  const fallbackService = new PredictionService({ enableMl: false, enableBaselineFallback: true });
  const fallbackRes = await fallbackService.predictTravelTime(input);
  assert.equal(fallbackRes.source, 'HISTORICAL_BASELINE');

  // 3. With ML & Baseline disabled -> should fall back to Current Observation
  const degradedService = new PredictionService({ enableMl: false, enableBaselineFallback: false });
  const degradedRes = await degradedService.predictTravelTime(input);
  assert.equal(degradedRes.source, 'CURRENT_OBSERVATION');
  assert.equal(degradedRes.predictedTravelTimeMin, 15.0);
});

test('Comparative evaluation: ML model outperforms Historical Baseline on unseen test data', () => {
  // Benchmark dataset simulating real-world observations with rush hour spikes
  const dataset: GroundTruthObservation[] = [
    {
      input: {
        distanceKm: 10,
        currentTravelTimeMin: 12,
        hour: 8,
        minute: 15,
        dayOfWeek: 1,
        isWeekend: false,
        roadType: 'highway',
        trafficLevel: 'HIGH',
        recentTrafficTrendRatio: 1.3
      },
      actualTravelTimeMin: 18.5
    },
    {
      input: {
        distanceKm: 8,
        currentTravelTimeMin: 10,
        hour: 8,
        minute: 45,
        dayOfWeek: 2,
        isWeekend: false,
        roadType: 'arterial',
        trafficLevel: 'HIGH',
        recentTrafficTrendRatio: 1.2
      },
      actualTravelTimeMin: 15.2
    },
    {
      input: {
        distanceKm: 14,
        currentTravelTimeMin: 14,
        hour: 13,
        minute: 30,
        dayOfWeek: 3,
        isWeekend: false,
        roadType: 'highway',
        trafficLevel: 'LOW',
        recentTrafficTrendRatio: 0.95
      },
      actualTravelTimeMin: 14.1
    },
    {
      input: {
        distanceKm: 5,
        currentTravelTimeMin: 9,
        hour: 17,
        minute: 30,
        dayOfWeek: 4,
        isWeekend: false,
        roadType: 'local',
        trafficLevel: 'CONGESTED',
        recentTrafficTrendRatio: 1.4
      },
      actualTravelTimeMin: 15.0
    },
    {
      input: {
        distanceKm: 12,
        currentTravelTimeMin: 13,
        hour: 22,
        minute: 0,
        dayOfWeek: 5,
        isWeekend: false,
        roadType: 'highway',
        trafficLevel: 'LOW',
        recentTrafficTrendRatio: 1.0
      },
      actualTravelTimeMin: 12.8
    }
  ];

  const evalResult = runComparativeEvaluation(dataset);
  assert.ok(
    evalResult.mlModel.mae <= evalResult.baseline.mae,
    `ML Model MAE (${evalResult.mlModel.mae}) should be <= Baseline MAE (${evalResult.baseline.mae})`
  );
  assert.ok(evalResult.mlModel.rmse <= evalResult.baseline.rmse);
});
