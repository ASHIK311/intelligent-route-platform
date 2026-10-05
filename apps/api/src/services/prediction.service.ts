import { PredictionService as ClientPredictionService } from '@intelligent-route/prediction-client';
import { PredictionInput, PredictionResult } from '@intelligent-route/shared-types';

export class PredictionService {
  private client: ClientPredictionService;

  constructor() {
    this.client = new ClientPredictionService({
      enableMl: true,
      enableBaselineFallback: true
    });
  }

  public async predict(input: PredictionInput): Promise<PredictionResult> {
    return this.client.predictTravelTime(input);
  }

  public getModelMetadata() {
    return this.client.getActiveModelMetadata();
  }
}

export const predictionService = new PredictionService();
