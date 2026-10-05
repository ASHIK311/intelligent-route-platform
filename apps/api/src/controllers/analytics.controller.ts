import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { ApiResponse } from '@intelligent-route/shared-types';

export class AnalyticsController {
  public getOverview = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const data = analyticsService.getOverviewMetrics();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}

export const analyticsController = new AnalyticsController();
