import * as fs from 'node:fs';
import * as path from 'node:path';
import { PredictionInput } from '@intelligent-route/shared-types';

export interface TrainingSample {
  input: PredictionInput;
  actualTravelTimeMin: number;
}

export function generateSyntheticTrafficDataset(count: number = 500): TrainingSample[] {
  const samples: TrainingSample[] = [];
  const roadTypes: PredictionInput['roadType'][] = ['highway', 'arterial', 'local', 'residential', 'toll_road'];
  const trafficLevels: PredictionInput['trafficLevel'][] = ['LOW', 'MEDIUM', 'HIGH', 'CONGESTED'];

  for (let i = 0; i < count; i++) {
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    const dayOfWeek = Math.floor(Math.random() * 7);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const roadType = roadTypes[Math.floor(Math.random() * roadTypes.length)];
    const distanceKm = Math.round((2 + Math.random() * 28) * 10) / 10;

    const baseSpeed = roadType === 'highway' ? 85 : roadType === 'arterial' ? 48 : 32;
    const baseTimeMin = (distanceKm / baseSpeed) * 60;

    const isRushHour = !isWeekend && ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18));
    const trafficLevel: PredictionInput['trafficLevel'] = isRushHour
      ? Math.random() < 0.6 ? 'HIGH' : 'CONGESTED'
      : Math.random() < 0.7 ? 'LOW' : 'MEDIUM';

    const congestionMultiplier =
      trafficLevel === 'CONGESTED' ? 1.7 : trafficLevel === 'HIGH' ? 1.35 : trafficLevel === 'MEDIUM' ? 1.15 : 1.0;

    const currentTravelTimeMin = Math.round(baseTimeMin * congestionMultiplier * 10) / 10;
    const recentTrafficTrendRatio = Math.round((0.85 + Math.random() * 0.5) * 100) / 100;

    // Actual travel time contains future non-linear wave delay if rush hour builds up
    const futureSurge = isRushHour && recentTrafficTrendRatio > 1.05 ? 1.25 : 1.02;
    const actualTravelTimeMin = Math.round(currentTravelTimeMin * futureSurge * 10) / 10;

    samples.push({
      input: {
        distanceKm,
        currentTravelTimeMin,
        hour,
        minute,
        dayOfWeek,
        isWeekend,
        roadType,
        trafficLevel,
        recentTrafficTrendRatio
      },
      actualTravelTimeMin
    });
  }

  return samples;
}

// Generate and write file if run directly
const dataset = generateSyntheticTrafficDataset(1000);
const outDir = path.resolve('ml/data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(path.join(outDir, 'traffic_training_data.json'), JSON.stringify(dataset, null, 2));
console.log(`Generated ${dataset.length} training samples at ml/data/traffic_training_data.json`);
