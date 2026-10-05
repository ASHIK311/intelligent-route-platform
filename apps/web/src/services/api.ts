import {
  ApiResponse,
  CityGraphData,
  RouteSearchResult,
  RouteRequest,
  CalculatedRoute,
  PersonalBrainSummary,
  LearnedPattern,
  UserPreferences,
  JourneyRecord,
  SystemHealth,
  AlgorithmBenchmark,
  MLModelMetadata,
  User
} from '@intelligent-route/shared-types';

const API_BASE = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'API request failed');
  }

  return json.data as T;
}

export const api = {
  // Map Data
  getGraph: () => request<CityGraphData>('/map/graph'),

  // Route Search
  searchRoutes: (req: RouteRequest) =>
    request<RouteSearchResult>('/routes/search', {
      method: 'POST',
      body: JSON.stringify(req)
    }),

  getRouteById: (id: string) => request<CalculatedRoute>(`/routes/${id}`),

  // Journey & History Tracking
  getHistory: () => request<JourneyRecord[]>('/history'),

  startJourney: (payload: {
    routeId: string;
    originId: string;
    destinationId: string;
    pathNodeIds: string[];
    predictedDurationMin: number;
    estimatedCost: number;
  }) =>
    request<JourneyRecord>('/history/start', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  completeJourney: (id: string, actualDurationMin: number, actualCost?: number) =>
    request<JourneyRecord>(`/history/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ actualDurationMin, actualCost })
    }),

  submitFeedback: (id: string, rating: number, feedbackNotes?: string) =>
    request<JourneyRecord>(`/history/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedbackNotes })
    }),

  // Personal Route Brain
  getPersonalBrain: () => request<PersonalBrainSummary>('/personal-brain'),

  analyzeBrainPatterns: () =>
    request<LearnedPattern[]>('/personal-brain/analyze', {
      method: 'POST'
    }),

  getPreferences: () => request<UserPreferences>('/preferences'),

  updatePreferences: (prefs: Partial<UserPreferences>) =>
    request<UserPreferences>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs)
    }),

  // Analytics
  getAnalytics: () => request<any>('/analytics/overview'),

  // System & Admin
  getSystemHealth: () => request<SystemHealth>('/system/health'),

  getAdminUsers: () => request<User[]>('/admin/users'),

  getAdminModels: () => request<MLModelMetadata[]>('/admin/models'),

  promoteModel: (versionId: string) =>
    request<MLModelMetadata>(`/admin/models/${versionId}/promote`, {
      method: 'POST'
    }),

  runAlgorithmBenchmark: (originId: string, destinationId: string) =>
    request<AlgorithmBenchmark[]>('/admin/benchmark', {
      method: 'POST',
      body: JSON.stringify({ originId, destinationId })
    })
};
