import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { historyService } from '../services/history.service.js';
import { AppError } from '../middleware/error-handler.js';
import { ApiResponse } from '@intelligent-route/shared-types';

export class HistoryController {
  public getHistory = async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const userId = req.user?.userId || 'usr_commuter_2'; // fallback to commuter user for easy demo
      const history = historyService.getUserHistory(userId);
      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  };

  public startJourney = async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const userId = req.user?.userId || 'usr_commuter_2';
      const { routeId, originId, destinationId, pathNodeIds, predictedDurationMin, estimatedCost } = req.body;

      if (!originId || !destinationId || !pathNodeIds) {
        throw new AppError('originId, destinationId, and pathNodeIds are required', 400, 'INVALID_INPUT');
      }

      const journey = historyService.startJourney({
        userId,
        routeId: routeId || `route_${Date.now()}`,
        originId,
        destinationId,
        pathNodeIds,
        predictedDurationMin: predictedDurationMin || 25,
        estimatedCost: estimatedCost || 2.0
      });

      res.status(201).json({ success: true, data: journey });
    } catch (err) {
      next(err);
    }
  };

  public completeJourney = async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { actualDurationMin, actualCost } = req.body;

      if (actualDurationMin === undefined) {
        throw new AppError('actualDurationMin is required', 400, 'INVALID_INPUT');
      }

      const journey = historyService.completeJourney(id, actualDurationMin, actualCost);
      if (!journey) {
        throw new AppError('Journey record not found', 404, 'JOURNEY_NOT_FOUND');
      }

      res.json({ success: true, data: journey });
    } catch (err) {
      next(err);
    }
  };

  public submitFeedback = async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { rating, feedbackNotes } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        throw new AppError('Rating between 1 and 5 is required', 400, 'INVALID_RATING');
      }

      const journey = historyService.submitFeedback(id, rating, feedbackNotes);
      if (!journey) {
        throw new AppError('Journey not found', 404, 'JOURNEY_NOT_FOUND');
      }

      res.json({ success: true, data: journey });
    } catch (err) {
      next(err);
    }
  };
}

export const historyController = new HistoryController();
