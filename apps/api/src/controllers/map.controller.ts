import { Request, Response, NextFunction } from 'express';
import { mapDataService } from '../services/map-data.service.js';
import { ApiResponse } from '@intelligent-route/shared-types';
import { AppError } from '../middleware/error-handler.js';

export class MapController {
  public getNodes = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const nodes = mapDataService.getAllNodes();
      res.json({ success: true, data: nodes });
    } catch (err) {
      next(err);
    }
  };

  public getEdges = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const edges = mapDataService.getAllEdges();
      res.json({ success: true, data: edges });
    } catch (err) {
      next(err);
    }
  };

  public getGraph = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const nodes = mapDataService.getAllNodes();
      const edges = mapDataService.getAllEdges();
      res.json({
        success: true,
        data: {
          id: 'graph_metro_1',
          name: 'Metropolitan Urban Road Network',
          nodeCount: nodes.length,
          edgeCount: edges.length,
          nodes,
          edges
        }
      });
    } catch (err) {
      next(err);
    }
  };

  public updateTraffic = async (req: Request, res: Response<ApiResponse>, next: NextFunction) => {
    try {
      const edgeId = req.params.edgeId as string;
      const { trafficLevel, delayMultiplier = 1.0 } = req.body;

      if (!trafficLevel) {
        throw new AppError('trafficLevel is required (LOW, MEDIUM, HIGH, CONGESTED)', 400, 'INVALID_INPUT');
      }

      const updated = mapDataService.updateEdgeTraffic(edgeId, trafficLevel, delayMultiplier);
      if (!updated) {
        throw new AppError('Edge not found', 404, 'EDGE_NOT_FOUND');
      }

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  };
}

export const mapController = new MapController();
