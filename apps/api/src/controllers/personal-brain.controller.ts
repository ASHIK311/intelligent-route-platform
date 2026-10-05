import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { personalBrainService } from '../services/personal-brain.service.js';
import { db } from '../repositories/database.js';
import { ApiResponse } from '@intelligent-route/shared-types';

export class PersonalBrainController {
  public getBrainSummary = async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const userId = req.user?.userId || 'usr_commuter_2';
      const summary = personalBrainService.getBrainSummary(userId);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  };

  public triggerAnalysis = async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const userId = req.user?.userId || 'usr_commuter_2';
      const patterns = personalBrainService.analyzeAndLearnPatterns(userId);
      res.json({ success: true, data: patterns });
    } catch (err) {
      next(err);
    }
  };

  public getPreferences = async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const userId = req.user?.userId || 'usr_commuter_2';
      const prefs = db.preferences.get(userId) || {
        defaultProfile: 'balanced',
        costSensitivity: 0.5,
        timeSensitivity: 0.5,
        avoidTolls: false
      };
      res.json({ success: true, data: prefs });
    } catch (err) {
      next(err);
    }
  };

  public updatePreferences = async (req: AuthenticatedRequest, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const userId = req.user?.userId || 'usr_commuter_2';
      const updated = personalBrainService.updateUserPreferences(userId, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };
}

export const personalBrainController = new PersonalBrainController();
