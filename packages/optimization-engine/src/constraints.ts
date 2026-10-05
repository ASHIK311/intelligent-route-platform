import { HardConstraints, GraphEdge } from '@intelligent-route/shared-types';

export interface RouteConstraintValidation {
  valid: boolean;
  violations: string[];
}

export function validateHardConstraints(
  params: {
    pathNodeIds: string[];
    edges: GraphEdge[];
    totalDistanceKm: number;
    totalCost: number;
    predictedDurationMin: number;
    departureTime?: string;
  },
  constraints?: HardConstraints
): RouteConstraintValidation {
  if (!constraints) {
    return { valid: true, violations: [] };
  }

  const violations: string[] = [];

  // 1. Budget Constraint
  if (constraints.maxBudget !== undefined && params.totalCost > constraints.maxBudget) {
    violations.push(
      `Cost $${params.totalCost.toFixed(2)} exceeds maximum budget of $${constraints.maxBudget.toFixed(2)}`
    );
  }

  // 2. Maximum Distance Constraint
  if (constraints.maxDistanceKm !== undefined && params.totalDistanceKm > constraints.maxDistanceKm) {
    violations.push(
      `Distance ${params.totalDistanceKm.toFixed(1)} km exceeds maximum allowed ${constraints.maxDistanceKm} km`
    );
  }

  // 3. Avoided Road Types
  if (constraints.avoidRoadTypes && constraints.avoidRoadTypes.length > 0) {
    const avoidedSet = new Set(constraints.avoidRoadTypes);
    const violatingEdge = params.edges.find(e => avoidedSet.has(e.roadType));
    if (violatingEdge) {
      violations.push(`Route includes avoided road type: ${violatingEdge.roadType}`);
    }
  }

  // 4. Required Waypoints
  if (constraints.requiredWaypoints && constraints.requiredWaypoints.length > 0) {
    const nodeSet = new Set(params.pathNodeIds);
    for (const waypoint of constraints.requiredWaypoints) {
      if (!nodeSet.has(waypoint)) {
        violations.push(`Route misses required waypoint: ${waypoint}`);
      }
    }
  }

  // 5. Arrival Deadline
  if (constraints.arrivalDeadline) {
    const depTime = params.departureTime ? new Date(params.departureTime) : new Date();
    const arrivalTime = new Date(depTime.getTime() + params.predictedDurationMin * 60 * 1000);

    let deadlineDate: Date;
    if (constraints.arrivalDeadline.includes('T') || constraints.arrivalDeadline.includes('-')) {
      deadlineDate = new Date(constraints.arrivalDeadline);
    } else {
      // Format "HH:MM"
      const [hours, minutes] = constraints.arrivalDeadline.split(':').map(Number);
      deadlineDate = new Date(depTime);
      deadlineDate.setHours(hours, minutes, 0, 0);
      if (deadlineDate.getTime() < depTime.getTime()) {
        // rollover to next day if deadline is earlier than departure
        deadlineDate.setDate(deadlineDate.getDate() + 1);
      }
    }

    if (arrivalTime.getTime() > deadlineDate.getTime()) {
      const diffMin = Math.round((arrivalTime.getTime() - deadlineDate.getTime()) / 60000);
      violations.push(
        `Predicted arrival at ${arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} misses deadline ${constraints.arrivalDeadline} by ${diffMin} min`
      );
    }
  }

  return {
    valid: violations.length === 0,
    violations
  };
}
