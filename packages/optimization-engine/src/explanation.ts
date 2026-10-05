import { RouteExplanation, OptimizationProfileType } from '@intelligent-route/shared-types';

export interface RouteComparisonInput {
  name: string;
  totalDistanceKm: number;
  currentTravelTimeMin: number;
  predictedTravelTimeMin: number;
  estimatedCost: number;
  score: number;
  profile: OptimizationProfileType;
  personalizationBonusApplied?: boolean;
}

/**
 * Generates transparent, human-readable route explanations and tradeoffs.
 */
export function generateRouteExplanation(
  current: RouteComparisonInput,
  competitor?: RouteComparisonInput
): RouteExplanation {
  const secondaryReasons: string[] = [];
  const tradeoffs: string[] = [];
  let primaryReason = '';
  let predictionImpact = '';
  let personalizationImpact: string | undefined = undefined;

  const predictedSavedMin = competitor
    ? Math.round(competitor.predictedTravelTimeMin - current.predictedTravelTimeMin)
    : 0;

  const costDifference = competitor
    ? Math.round((current.estimatedCost - competitor.estimatedCost) * 100) / 100
    : 0;

  const distanceDiffKm = competitor
    ? Math.round((current.totalDistanceKm - competitor.totalDistanceKm) * 10) / 10
    : 0;

  // 1. Analyze Prediction Impact
  const delayAvoided = Math.round(
    current.currentTravelTimeMin - current.predictedTravelTimeMin
  );
  if (predictedSavedMin > 2) {
    predictionImpact = `Saves ~${predictedSavedMin} minutes compared to alternative paths by circumventing upcoming bottleneck congestion.`;
  } else if (current.predictedTravelTimeMin <= current.currentTravelTimeMin + 2) {
    predictionImpact = 'Traffic conditions ahead are predicted to remain stable with low delay risk.';
  } else {
    predictionImpact = `Predicted future delay of +${Math.round(current.predictedTravelTimeMin - current.currentTravelTimeMin)} min due to peak period buildup.`;
  }

  // 2. Determine Primary Reason based on Optimization Profile
  switch (current.profile) {
    case 'fastest':
      if (predictedSavedMin > 0) {
        primaryReason = `Fastest route available: delivers shortest total transit duration (${Math.round(current.predictedTravelTimeMin)} min).`;
      } else {
        primaryReason = `Optimized for speed with an estimated transit time of ${Math.round(current.predictedTravelTimeMin)} min.`;
      }
      break;

    case 'cheapest':
      primaryReason = `Most economical route: minimizes out-of-pocket toll and transit cost ($${current.estimatedCost.toFixed(2)}).`;
      break;

    case 'shortest':
      primaryReason = `Direct geographic path minimizing odometer travel distance (${current.totalDistanceKm.toFixed(1)} km).`;
      break;

    case 'balanced':
    default:
      if (competitor && predictedSavedMin >= 3 && costDifference <= 1.0) {
        primaryReason = `Recommended as the optimal balance: ~${predictedSavedMin} min faster than alternatives with minimal toll impact.`;
      } else if (competitor && costDifference < -1.0) {
        primaryReason = `Recommended as the optimal balance: saves $${Math.abs(costDifference).toFixed(2)} with negligible travel time penalty.`;
      } else {
        primaryReason = `Provides the highest multi-objective score balancing distance (${current.totalDistanceKm.toFixed(1)} km), ETA (${Math.round(current.predictedTravelTimeMin)} min), and cost ($${current.estimatedCost.toFixed(2)}).`;
      }
      break;
  }

  // 3. Secondary Reasons
  if (current.estimatedCost === 0) {
    secondaryReasons.push('100% toll-free corridor.');
  } else {
    secondaryReasons.push(`Estimated toll cost: $${current.estimatedCost.toFixed(2)}.`);
  }

  if (distanceDiffKm < 0) {
    secondaryReasons.push(`${Math.abs(distanceDiffKm)} km shorter than alternative corridors.`);
  }

  // 4. Tradeoffs against competitor
  if (competitor) {
    if (costDifference > 0.5) {
      tradeoffs.push(`Costs $${costDifference.toFixed(2)} more than alternative ${competitor.name}.`);
    } else if (costDifference < -0.5) {
      tradeoffs.push(`Costs $${Math.abs(costDifference).toFixed(2)} less than alternative ${competitor.name}.`);
    }

    if (distanceDiffKm > 1.5) {
      tradeoffs.push(`Requires traveling ${distanceDiffKm} km additional distance to bypass urban delay.`);
    }

    if (predictedSavedMin < -2) {
      tradeoffs.push(`Takes ~${Math.abs(predictedSavedMin)} min longer than the theoretical fastest express path.`);
    }
  }

  if (tradeoffs.length === 0) {
    tradeoffs.push('No significant performance compromises identified.');
  }

  // 5. Personalization Impact
  if (current.personalizationBonusApplied) {
    personalizationImpact = 'Personal Route Brain identified high familiarity and historical preference for this corridor.';
  }

  return {
    primaryReason,
    secondaryReasons,
    tradeoffs,
    predictionImpact,
    personalizationImpact
  };
}
