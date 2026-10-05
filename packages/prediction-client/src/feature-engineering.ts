import { PredictionInput, RoadType, TrafficLevel } from '@intelligent-route/shared-types';

export interface EngineeredFeatures {
  hourSin: number;
  hourCos: number;
  isRushHour: number;
  isWeekend: number;
  distanceKm: number;
  currentTravelTimeMin: number;
  trafficLevelOrdinal: number; // 0=LOW, 1=MED, 2=HIGH, 3=CONGESTED
  roadTypeHighway: number;
  roadTypeArterial: number;
  roadTypeLocal: number;
  recentTrafficTrendRatio: number;
}

const ROAD_TYPE_MAP: Record<RoadType, { highway: number; arterial: number; local: number }> = {
  highway: { highway: 1, arterial: 0, local: 0 },
  toll_road: { highway: 1, arterial: 0, local: 0 },
  arterial: { highway: 0, arterial: 1, local: 0 },
  local: { highway: 0, arterial: 0, local: 1 },
  residential: { highway: 0, arterial: 0, local: 1 }
};

const TRAFFIC_LEVEL_MAP: Record<TrafficLevel, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CONGESTED: 3
};

export function extractFeatures(input: PredictionInput): EngineeredFeatures {
  // Cyclical time encoding
  const totalMinutes = input.hour * 60 + input.minute;
  const rad = (totalMinutes / 1440) * 2 * Math.PI;
  const hourSin = Math.sin(rad);
  const hourCos = Math.cos(rad);

  // Peak rush hour indicator: 7:30-9:30 AM (450-570m) or 4:30-6:45 PM (990-1125m) on weekdays
  const isMorningPeak = totalMinutes >= 450 && totalMinutes <= 570;
  const isEveningPeak = totalMinutes >= 990 && totalMinutes <= 1125;
  const isRushHour = !input.isWeekend && (isMorningPeak || isEveningPeak) ? 1.0 : 0.0;

  const roadEncoding = ROAD_TYPE_MAP[input.roadType] || ROAD_TYPE_MAP.local;
  const trafficLevelOrdinal = TRAFFIC_LEVEL_MAP[input.trafficLevel] ?? 1;

  return {
    hourSin,
    hourCos,
    isRushHour,
    isWeekend: input.isWeekend ? 1 : 0,
    distanceKm: input.distanceKm,
    currentTravelTimeMin: input.currentTravelTimeMin,
    trafficLevelOrdinal,
    roadTypeHighway: roadEncoding.highway,
    roadTypeArterial: roadEncoding.arterial,
    roadTypeLocal: roadEncoding.local,
    recentTrafficTrendRatio: input.recentTrafficTrendRatio ?? 1.0
  };
}
