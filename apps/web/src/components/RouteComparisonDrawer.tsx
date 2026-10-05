import React from 'react';
import { CalculatedRoute, RouteSearchResult } from '@intelligent-route/shared-types';
import {
  Clock,
  Navigation,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';

interface RouteComparisonDrawerProps {
  searchResult: RouteSearchResult;
  selectedRouteId?: string;
  onSelectRoute: (route: CalculatedRoute) => void;
  onStartJourney: (route: CalculatedRoute) => void;
}

export const RouteComparisonDrawer: React.FC<RouteComparisonDrawerProps> = ({
  searchResult,
  selectedRouteId,
  onSelectRoute,
  onStartJourney
}) => {
  const allRoutes = [searchResult.recommendedRoute, ...searchResult.alternativeRoutes];
  const activeRoute = allRoutes.find(r => r.id === selectedRouteId) || searchResult.recommendedRoute;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white tracking-tight">Route Optimization Results</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {searchResult.calculationTimeMs}ms · {searchResult.nodesExplored} nodes explored
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluated under profile: <span className="text-emerald-400 font-medium capitalize">{searchResult.profileUsed}</span>
          </p>
        </div>

        {/* Start Journey Button */}
        <button
          onClick={() => onStartJourney(activeRoute)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Journey Simulator</span>
        </button>
      </div>

      {/* Comparison Grid (SRS Section 22) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {allRoutes.map((route, idx) => {
          const isRecommended = idx === 0;
          const isSelected = route.id === activeRoute.id;

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-slate-850 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-white">{route.name}</span>
                </div>
                {isRecommended ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full text-[10px] font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-2.5 h-2.5" />
                    <span>RECOMMENDED</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full text-[10px] font-medium">
                    ALTERNATIVE
                  </span>
                )}
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Predicted ETA</div>
                    <div className="font-semibold text-white">{Math.round(route.predictedTravelTimeMin)} min</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Distance</div>
                    <div className="font-semibold text-white">{route.totalDistanceKm} km</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-slate-300">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Estimated Toll</div>
                    <div className="font-semibold text-white">${route.estimatedCost.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <div>
                    <div className="text-[10px] text-slate-400">Confidence</div>
                    <div className="font-semibold text-white">{Math.round(route.confidence * 100)}%</div>
                  </div>
                </div>
              </div>

              {/* Delay risk status */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">Delay Risk:</span>
                <span
                  className={`font-semibold capitalize ${
                    route.delayRisk === 'low'
                      ? 'text-emerald-400'
                      : route.delayRisk === 'moderate'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {route.delayRisk} Risk
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Route Explanation Card (SRS Section 15 & 43) */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
        <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Intelligent Route Explanation — {activeRoute.name}</span>
        </div>

        {/* Primary Reason */}
        <p className="text-slate-200 leading-relaxed font-medium">
          {activeRoute.explanation.primaryReason}
        </p>

        {/* Prediction & Personalization Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-lg p-2.5">
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
              ML Prediction Analysis
            </span>
            <p className="text-slate-300 text-[11px]">
              {activeRoute.explanation.predictionImpact}
            </p>
          </div>

          {activeRoute.explanation.personalizationImpact ? (
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-lg p-2.5">
              <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider block mb-1">
                Personal Route Brain
              </span>
              <p className="text-slate-300 text-[11px]">
                {activeRoute.explanation.personalizationImpact}
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Key Tradeoffs
              </span>
              <p className="text-slate-400 text-[11px]">
                {activeRoute.explanation.tradeoffs.join(' ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
