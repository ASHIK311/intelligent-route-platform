import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PROFILE_PRESETS,
  resolveEffectiveWeights,
  validateHardConstraints,
  calculateRouteConfidence,
  generateRouteExplanation,
  evaluateAndRankRoutes
} from './index.js';
import { GraphEdge } from '@intelligent-route/shared-types';
import { CandidateRawRoute } from '@intelligent-route/routing-engine';

test('PROFILE_PRESETS contains fastest, cheapest, shortest, balanced', () => {
  assert.ok(PROFILE_PRESETS.fastest);
  assert.ok(PROFILE_PRESETS.cheapest);
  assert.ok(PROFILE_PRESETS.shortest);
  assert.ok(PROFILE_PRESETS.balanced);
  assert.ok(PROFILE_PRESETS.fastest.travelTime > PROFILE_PRESETS.cheapest.travelTime);
  assert.ok(PROFILE_PRESETS.cheapest.monetaryCost > PROFILE_PRESETS.fastest.monetaryCost);
});

test('resolveEffectiveWeights correctly applies custom overrides', () => {
  const custom = resolveEffectiveWeights('custom', { distance: 0.9, travelTime: 0.1 });
  assert.ok(custom.distance > 0.8);
});

test('validateHardConstraints catches budget and deadline violations', () => {
  const edges: GraphEdge[] = [
    {
      id: 'e1',
      source: 'A',
      target: 'B',
      distanceKm: 10,
      baseTravelTimeMin: 10,
      currentTravelTimeMin: 12,
      predictedTravelTimeMin: 15,
      monetaryCost: 8,
      trafficLevel: 'LOW',
      reliability: 0.9,
      riskScore: 0.1,
      roadType: 'toll_road'
    }
  ];

  // Budget exceeded
  const check1 = validateHardConstraints(
    {
      pathNodeIds: ['A', 'B'],
      edges,
      totalDistanceKm: 10,
      totalCost: 8,
      predictedDurationMin: 15
    },
    { maxBudget: 5 }
  );
  assert.equal(check1.valid, false);
  assert.ok(check1.violations[0].includes('exceeds maximum budget'));

  // Within budget
  const check2 = validateHardConstraints(
    {
      pathNodeIds: ['A', 'B'],
      edges,
      totalDistanceKm: 10,
      totalCost: 8,
      predictedDurationMin: 15
    },
    { maxBudget: 10 }
  );
  assert.equal(check2.valid, true);

  // Avoid toll road
  const check3 = validateHardConstraints(
    {
      pathNodeIds: ['A', 'B'],
      edges,
      totalDistanceKm: 10,
      totalCost: 8,
      predictedDurationMin: 15
    },
    { avoidRoadTypes: ['toll_road'] }
  );
  assert.equal(check3.valid, false);
  assert.ok(check3.violations[0].includes('avoided road type'));
});

test('calculateRouteConfidence handles reliability and traffic stability', () => {
  const edgesHighRisk: GraphEdge[] = [
    {
      id: 'e1',
      source: 'A',
      target: 'B',
      distanceKm: 50,
      baseTravelTimeMin: 30,
      currentTravelTimeMin: 50,
      predictedTravelTimeMin: 65,
      monetaryCost: 0,
      trafficLevel: 'CONGESTED',
      reliability: 0.6,
      riskScore: 0.8,
      roadType: 'highway'
    }
  ];

  const res = calculateRouteConfidence(edgesHighRisk, 0.7);
  assert.ok(res.confidence >= 0.45 && res.confidence <= 1.0);
  assert.ok(res.confidence < 0.85); // should be medium or low confidence due to congestion and 0.6 reliability
});

test('generateRouteExplanation generates clear reason and prediction impact', () => {
  const explanation = generateRouteExplanation(
    {
      name: 'Route B',
      totalDistanceKm: 11.2,
      currentTravelTimeMin: 25,
      predictedTravelTimeMin: 28,
      estimatedCost: 2.1,
      score: 15,
      profile: 'balanced'
    },
    {
      name: 'Route A',
      totalDistanceKm: 8.5,
      currentTravelTimeMin: 24,
      predictedTravelTimeMin: 41,
      estimatedCost: 2.5,
      score: 22,
      profile: 'balanced'
    }
  );

  assert.ok(explanation.primaryReason.length > 0);
  assert.ok(explanation.predictionImpact.includes('Saves ~13 minutes'));
});

test('evaluateAndRankRoutes ranks candidate routes correctly', () => {
  const rawCandidate1: CandidateRawRoute = {
    profileLabel: 'Fastest',
    pathNodeIds: ['A', 'B', 'D'],
    edges: [
      {
        id: 'e1',
        source: 'A',
        target: 'B',
        distanceKm: 5,
        baseTravelTimeMin: 6,
        currentTravelTimeMin: 8,
        predictedTravelTimeMin: 9,
        monetaryCost: 2,
        trafficLevel: 'LOW',
        reliability: 0.9,
        riskScore: 0.1,
        roadType: 'highway'
      },
      {
        id: 'e2',
        source: 'B',
        target: 'D',
        distanceKm: 5,
        baseTravelTimeMin: 6,
        currentTravelTimeMin: 7,
        predictedTravelTimeMin: 8,
        monetaryCost: 2,
        trafficLevel: 'LOW',
        reliability: 0.9,
        riskScore: 0.1,
        roadType: 'highway'
      }
    ],
    totalCost: 15,
    executionTimeMs: 1.2,
    nodesExplored: 12
  };

  const rawCandidate2: CandidateRawRoute = {
    profileLabel: 'Cheapest',
    pathNodeIds: ['A', 'C', 'D'],
    edges: [
      {
        id: 'e3',
        source: 'A',
        target: 'C',
        distanceKm: 7,
        baseTravelTimeMin: 12,
        currentTravelTimeMin: 14,
        predictedTravelTimeMin: 14,
        monetaryCost: 0,
        trafficLevel: 'LOW',
        reliability: 0.9,
        riskScore: 0.1,
        roadType: 'local'
      },
      {
        id: 'e4',
        source: 'C',
        target: 'D',
        distanceKm: 7,
        baseTravelTimeMin: 12,
        currentTravelTimeMin: 13,
        predictedTravelTimeMin: 13,
        monetaryCost: 0,
        trafficLevel: 'LOW',
        reliability: 0.9,
        riskScore: 0.1,
        roadType: 'local'
      }
    ],
    totalCost: 27,
    executionTimeMs: 1.0,
    nodesExplored: 10
  };

  const result = evaluateAndRankRoutes([rawCandidate1, rawCandidate2], {
    profile: 'fastest',
    weights: PROFILE_PRESETS.fastest
  });

  assert.ok(result.recommendedRoute);
  assert.equal(result.alternativeRoutes.length, 1);
  assert.equal(result.recommendedRoute.name.includes('Fastest'), true);
});
