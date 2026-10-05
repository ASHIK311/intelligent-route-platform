import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import {
  BarChart3,
  Cpu,
  Zap,
  Activity,
  Layers,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAnalytics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      }
    };
    load();
  }, []);

  if (!metrics) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading Platform Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">System Analytics & ML Performance</h2>
          <p className="text-xs text-slate-400">
            Real-time routing engine benchmarks and continuous travel-time evaluation metrics.
          </p>
        </div>
      </div>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Routing Engine Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Routing Engine Performance (Section 24)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px]">Avg Calculation Time</span>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                {metrics.routing.averageCalculationTimeMs} ms
              </div>
              <span className="text-[10px] text-slate-500">Target &lt; 500 ms</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px]">Nodes Explored</span>
              <div className="text-xl font-mono font-bold text-white mt-1">
                {metrics.routing.averageNodesExplored}
              </div>
              <span className="text-[10px] text-slate-500">Heuristic pruning</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px]">Cache Hit Rate</span>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                {metrics.routing.cacheHitRatePct}%
              </div>
              <span className="text-[10px] text-slate-500">Spatial segments</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px]">Route Success Rate</span>
              <div className="text-xl font-mono font-bold text-purple-400 mt-1">
                {metrics.routing.routeSuccessRatePct}%
              </div>
              <span className="text-[10px] text-slate-500">Constraint satisfaction</span>
            </div>
          </div>
        </div>

        {/* Machine Learning Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>ML Prediction Accuracy & Error Metrics (Section 41)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px]">MAE (Mean Absolute Error)</span>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                {metrics.ml.maeMinutes} min
              </div>
              <span className="text-[10px] text-emerald-400">Beats baseline (3.14 min)</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px]">RMSE</span>
              <div className="text-xl font-mono font-bold text-white mt-1">
                {metrics.ml.rmseMinutes} min
              </div>
              <span className="text-[10px] text-slate-500">Low variance</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px]">MAPE</span>
              <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                {metrics.ml.mapePercentage}%
              </div>
              <span className="text-[10px] text-slate-500">Relative error</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px]">Prediction Confidence</span>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                {metrics.ml.predictionConfidenceAvgPct}%
              </div>
              <span className="text-[10px] text-slate-500">Calibrated certainty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
