import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { AppError } from '../middleware/error-handler.js';
import { ApiResponse } from '@intelligent-route/shared-types';

export class AdminController {
  public getHealth = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const health = adminService.getSystemHealth();
      res.json({ success: true, data: health });
    } catch (err) {
      next(err);
    }
  };

  public getUsers = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const users = adminService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  };

  public getModels = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const models = adminService.getModelVersions();
      res.json({ success: true, data: models });
    } catch (err) {
      next(err);
    }
  };

  public promoteModel = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const versionId = req.params.versionId as string;
      const promoted = adminService.promoteModel(versionId);
      if (!promoted) {
        throw new AppError('Model not found', 404, 'MODEL_NOT_FOUND');
      }
      res.json({ success: true, data: promoted });
    } catch (err) {
      next(err);
    }
  };

  public runBenchmark = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const { originId = 'node_1', destinationId = 'node_71' } = req.body;
      const results = adminService.runLiveAlgorithmBenchmark(originId, destinationId);
      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  };
}

export const adminController = new AdminController();
