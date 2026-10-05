import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { recommendationService } from '../services/recommendation.service.js';
import { db } from '../repositories/database.js';
import { AppError } from '../middleware/error-handler.js';
import { ApiResponse, RouteRequest } from '@intelligent-route/shared-types';

export class RoutesController {
  public search = async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const {
        originId,
        destinationId,
        waypoints,
        profile = 'balanced',
        customWeights,
        constraints,
        departureTime,
        algorithm
      } = req.body;

      if (!originId || !destinationId) {
        throw new AppError('Origin and destination IDs are required', 400, 'INVALID_INPUT');
      }

      if (originId === destinationId) {
        throw new AppError('Origin and destination cannot be identical', 400, 'SAME_ORIGIN_DESTINATION');
      }

      const userId = req.user?.userId;

      const routeRequest: RouteRequest = {
        originId,
        destinationId,
        waypoints,
        profile,
        customWeights,
        constraints,
        departureTime,
        algorithm,
        userId
      };

      const result = await recommendationService.searchAndRecommend(routeRequest);

      res.json({
        success: true,
        data: result
      });
    } catch (err: any) {
      if (err.message === 'NO_ROUTE_FOUND') {
        next(new AppError('No reachable path found between origin and destination with the given constraints.', 404, 'ROUTE_NOT_FOUND'));
      } else {
        next(err);
      }
    }
  };

  public getRouteById = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const route = db.calculatedRoutes.get(id);
      if (!route) {
        throw new AppError('Route not found', 404, 'ROUTE_NOT_FOUND');
      }
      res.json({ success: true, data: route });
    } catch (err) {
      next(err);
    }
  };
}

export const routesController = new RoutesController();
