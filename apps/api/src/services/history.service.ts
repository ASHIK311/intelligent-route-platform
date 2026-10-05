import { db } from '../repositories/database.js';
import { JourneyRecord, JourneyStatus } from '@intelligent-route/shared-types';
import { personalBrainService } from './personal-brain.service.js';

export class HistoryService {
  public startJourney(params: {
    userId: string;
    routeId: string;
    originId: string;
    destinationId: string;
    pathNodeIds: string[];
    predictedDurationMin: number;
    estimatedCost: number;
  }): JourneyRecord {
    const id = `jny_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const journey: JourneyRecord = {
      id,
      userId: params.userId,
      routeId: params.routeId,
      originId: params.originId,
      destinationId: params.destinationId,
      pathNodeIds: params.pathNodeIds,
      status: 'ACTIVE',
      startedAt: new Date().toISOString(),
      predictedDurationMin: params.predictedDurationMin,
      actualCost: params.estimatedCost
    };

    db.journeys.set(id, journey);
    return journey;
  }

  public completeJourney(
    journeyId: string,
    actualDurationMin: number,
    actualCost?: number
  ): JourneyRecord | null {
    const journey = db.journeys.get(journeyId);
    if (!journey) return null;

    journey.status = 'COMPLETED';
    journey.completedAt = new Date().toISOString();
    journey.actualDurationMin = Math.round(actualDurationMin * 10) / 10;
    journey.predictionErrorMin = Math.round((actualDurationMin - journey.predictedDurationMin) * 10) / 10;
    if (actualCost !== undefined) {
      journey.actualCost = actualCost;
    }

    db.journeys.set(journeyId, journey);

    // Continuous learning: trigger personal brain pattern analysis
    try {
      personalBrainService.analyzeAndLearnPatterns(journey.userId);
    } catch (err) {
      console.warn('[HistoryService] Could not auto-analyze patterns:', err);
    }

    return journey;
  }

  public submitFeedback(
    journeyId: string,
    rating: number,
    notes?: string
  ): JourneyRecord | null {
    const journey = db.journeys.get(journeyId);
    if (!journey) return null;

    journey.userRating = Math.max(1, Math.min(5, rating));
    if (notes) {
      journey.feedbackNotes = notes;
    }

    db.journeys.set(journeyId, journey);
    return journey;
  }

  public getUserHistory(userId: string): JourneyRecord[] {
    return Array.from(db.journeys.values())
      .filter(j => j.userId === userId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  public getJourneyById(journeyId: string): JourneyRecord | undefined {
    return db.journeys.get(journeyId);
  }
}

export const historyService = new HistoryService();
