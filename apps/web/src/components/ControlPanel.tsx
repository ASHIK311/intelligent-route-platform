import React, { useState } from 'react';
import {
  GraphNode,
  OptimizationProfileType,
  OptimizationWeights,
  HardConstraints,
  RoutingAlgorithmType,
  RouteRequest
} from '@intelligent-route/shared-types';
import {
  MapPin,
  Navigation,
  Sliders,
  DollarSign,
  Clock,
  ShieldAlert,
  Zap,
  TrendingDown,
  Layers,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

interface ControlPanelProps {
  nodes: GraphNode[];
  onSearch: (request: RouteRequest) => void;
  isLoading: boolean;
  selectedOriginId: string;
  selectedDestinationId: string;
  onOriginChange: (id: string) => void;
  onDestinationChange: (id: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  nodes,
  onSearch,
  isLoading,
  selectedOriginId,
  selectedDestinationId,
  onOriginChange,
  onDestinationChange
}) => {
  const [profile, setProfile] = useState<OptimizationProfileType>('balanced');
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Custom weights
  const [customWeights, setCustomWeights] = useState<OptimizationWeights>({
    distance: 0.25,
    travelTime: 0.30,
    monetaryCost: 0.15,
    predictedDelay: 0.20,
    risk: 0.05,
    userPreference: 0.05
  });

  // Hard constraints
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<string>('');
  const [arrivalDeadline, setArrivalDeadline] = useState<string>('');
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [algorithm, setAlgorithm] = useState<RoutingAlgorithmType>('A*');

  const handleAddWaypoint = () => {
    if (waypoints.length < 3) {
      setWaypoints([...waypoints, nodes[10]?.id || 'node_11']);
    }
  };

  const handleRemoveWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const handleWaypointChange = (index: number, id: string) => {
    const updated = [...waypoints];
    updated[index] = id;
    setWaypoints(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOriginId || !selectedDestinationId) return;

    const constraints: HardConstraints = {};
    if (maxBudget) constraints.maxBudget = parseFloat(maxBudget);
    if (maxDistance) constraints.maxDistanceKm = parseFloat(maxDistance);
    if (arrivalDeadline) constraints.arrivalDeadline = arrivalDeadline;

    const avoidedTypes: any[] = [];
    if (avoidTolls) avoidedTypes.push('toll_road');
    if (avoidHighways) avoidedTypes.push('highway');
    if (avoidedTypes.length > 0) constraints.avoidRoadTypes = avoidedTypes;

    onSearch({
      originId: selectedOriginId,
      destinationId: selectedDestinationId,
      waypoints: waypoints.length > 0 ? waypoints : undefined,
      profile,
      customWeights: profile === 'custom' ? customWeights : undefined,
      constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
      algorithm
    });
  };

  const applyPreset = (orig: string, dest: string, prof: OptimizationProfileType) => {
    onOriginChange(orig);
    onDestinationChange(dest);
    setProfile(prof);
    setWaypoints([]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-emerald-400" />
          <span>Route Planner</span>
        </h2>

        {/* Quick Presets */}
        <div className="flex items-center space-x-1.5 text-[11px]">
          <span className="text-slate-400">Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('node_1', 'node_21', 'balanced')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] transition-colors"
          >
            Commute
          </button>
          <button
            type="button"
            onClick={() => applyPreset('node_1', 'node_71', 'cheapest')}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] transition-colors"
          >
            Toll-Free
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origin Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
            <span>Origin Point</span>
          </label>
          <select
            value={selectedOriginId}
            onChange={e => onOriginChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.type})
              </option>
            ))}
          </select>
        </div>

        {/* Waypoints */}
        {waypoints.map((wp, idx) => (
          <div key={idx} className="space-y-1.5 pl-3 border-l-2 border-amber-500/40">
            <div className="flex items-center justify-between text-xs text-amber-400">
              <span>Waypoint {idx + 1}</span>
              <button
                type="button"
                onClick={() => handleRemoveWaypoint(idx)}
                className="text-slate-500 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <select
              value={wp}
              onChange={e => handleWaypointChange(idx, e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {nodes.map(n => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
        ))}

        {waypoints.length < 3 && (
          <button
            type="button"
            onClick={handleAddWaypoint}
            className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center space-x-1 transition-colors pl-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Waypoint</span>
          </button>
        )}

        {/* Destination Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20"></span>
            <span>Destination Point</span>
          </label>
          <select
            value={selectedDestinationId}
            onChange={e => onDestinationChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
          >
            {nodes.map(n => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.type})
              </option>
            ))}
          </select>
        </div>

        {/* Optimization Profiles */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-medium text-slate-300">Optimization Mode</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setProfile('balanced')}
              className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                profile === 'balanced'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <div className="text-left">
                <div className="font-semibold leading-none">Balanced</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Multi-factor</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setProfile('fastest')}
              className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                profile === 'fastest'
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <div className="text-left">
                <div className="font-semibold leading-none">Fastest</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Minimum ETA</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setProfile('cheapest')}
              className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                profile === 'cheapest'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <div className="text-left">
                <div className="font-semibold leading-none">Cheapest</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Avoid tolls</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setProfile('shortest')}
              className={`p-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
                profile === 'shortest'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <div className="text-left">
                <div className="font-semibold leading-none">Shortest</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Direct km</div>
              </div>
            </button>
          </div>
        </div>

        {/* Advanced Options Accordion */}
        <div className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors"
          >
            <span className="flex items-center space-x-2">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Constraints & Routing Engine</span>
            </span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="p-3.5 border-t border-slate-800 space-y-4 text-xs">
              {/* Algorithm Baseline Selection */}
              <div>
                <label className="text-slate-400 text-[11px] block mb-1.5 font-medium">Routing Algorithm</label>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {(['A*', 'Dijkstra', 'Bidirectional'] as RoutingAlgorithmType[]).map(alg => (
                    <button
                      key={alg}
                      type="button"
                      onClick={() => setAlgorithm(alg)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                        algorithm === alg
                          ? 'bg-slate-800 text-emerald-400 border-emerald-500/50'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {alg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hard Constraints */}
              <div className="space-y-2.5 pt-1 border-t border-slate-800/80">
                <div className="text-slate-400 text-[11px] font-medium flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  <span>Hard Constraints (Non-Negotiable)</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Max Budget ($)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="e.g. 3.00"
                      value={maxBudget}
                      onChange={e => setMaxBudget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 mt-0.5"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400">Arrival Deadline</label>
                    <input
                      type="time"
                      value={arrivalDeadline}
                      onChange={e => setArrivalDeadline(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 mt-0.5"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-1">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={avoidTolls}
                      onChange={e => setAvoidTolls(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-300">Avoid Toll Roads</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={avoidHighways}
                      onChange={e => setAvoidHighways(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-emerald-500 focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-300">Avoid Highways</span>
                  </label>
                </div>
              </div>

              {/* Custom Weight Sliders if profile === 'custom' */}
              {profile === 'custom' && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-slate-400 text-[11px] font-medium">Dynamic Cost Weights</div>
                  {(['travelTime', 'monetaryCost', 'distance', 'predictedDelay'] as (keyof OptimizationWeights)[]).map(key => (
                    <div key={key} className="space-y-0.5">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span>{Math.round(customWeights[key] * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={customWeights[key]}
                        onChange={e =>
                          setCustomWeights({
                            ...customWeights,
                            [key]: parseFloat(e.target.value)
                          })
                        }
                        className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Calculate Button */}
        <button
          type="submit"
          disabled={isLoading || selectedOriginId === selectedDestinationId}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Optimizing Graph Paths...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Calculate Optimal Route</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
