import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { SystemHealth, MLModelMetadata, AlgorithmBenchmark, User } from '@intelligent-route/shared-types';
import {
  Shield,
  Activity,
  Cpu,
  Layers,
  Database,
  Play,
  ArrowUpRight,
  CheckCircle,
  Users
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [models, setModels] = useState<MLModelMetadata[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [benchmarks, setBenchmarks] = useState<AlgorithmBenchmark[]>([]);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [promoteSuccess, setPromoteSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [h, m, u] = await Promise.all([
        api.getSystemHealth(),
        api.getAdminModels(),
        api.getAdminUsers()
      ]);
      setHealth(h);
      setModels(m);
      setUsers(u);
    } catch (err) {
      console.error('Failed to load admin data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const results = await api.runAlgorithmBenchmark('node_1', 'node_71');
      setBenchmarks(results);
    } catch (err) {
      console.error('Benchmark failed', err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handlePromote = async (versionId: string) => {
    try {
      await api.promoteModel(versionId);
      setPromoteSuccess(versionId);
      setTimeout(() => setPromoteSuccess(null), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to promote model', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Admin Console & Monitoring</h2>
          <p className="text-xs text-slate-400">
            System health, model promotion registry, and real-time empirical algorithm verification.
          </p>
        </div>
      </div>

      {/* System Overview Cards (SRS Section 25) */}
      {health && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <span className="text-slate-400 text-xs flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>System Health</span>
            </span>
            <div className="text-xl font-bold text-emerald-400 mt-2 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{health.status}</span>
            </div>
            <span className="text-[10px] text-slate-500">Uptime: {health.uptimeSeconds}s</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <span className="text-slate-400 text-xs flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Heap Memory</span>
            </span>
            <div className="text-xl font-bold text-white font-mono mt-2">
              {health.memoryUsageMb} MB
            </div>
            <span className="text-[10px] text-slate-500">Node runtime heap</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <span className="text-slate-400 text-xs flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Total Searches</span>
            </span>
            <div className="text-xl font-bold text-purple-400 font-mono mt-2">
              {health.totalSearchesCount}
            </div>
            <span className="text-[10px] text-slate-500">Cached queries ready</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <span className="text-slate-400 text-xs flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Active Users</span>
            </span>
            <div className="text-xl font-bold text-amber-400 font-mono mt-2">
              {users.length}
            </div>
            <span className="text-[10px] text-slate-500">Registered profiles</span>
          </div>
        </div>
      )}

      {/* Algorithm Benchmark Runner (SRS Section 40) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Empirical Algorithm Verification & Live Benchmark</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Benchmarks Dijkstra baseline vs A* vs Bidirectional Search on current 100-node 530-edge graph.
            </p>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isBenchmarking}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isBenchmarking ? 'animate-spin' : ''}`} />
            <span>{isBenchmarking ? 'Running Benchmarks...' : 'Run Live Benchmark'}</span>
          </button>
        </div>

        {benchmarks.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">Execution Time</th>
                  <th className="py-2.5 px-3">Nodes Explored</th>
                  <th className="py-2.5 px-3">Path Cost</th>
                  <th className="py-2.5 px-3">Path Nodes</th>
                  <th className="py-2.5 px-3">Distance (km)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {benchmarks.map(b => (
                  <tr key={b.algorithm} className="hover:bg-slate-850/50 transition-colors font-mono">
                    <td className="py-2.5 px-3 font-semibold text-white font-sans">{b.algorithm}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{b.executionTimeMs} ms</td>
                    <td className="py-2.5 px-3 text-slate-300">{b.nodesExplored}</td>
                    <td className="py-2.5 px-3 text-cyan-400">{b.pathCost.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-300">{b.pathLengthNodes}</td>
                    <td className="py-2.5 px-3 text-slate-300">{b.totalDistanceKm} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Model Registry (SRS Section 42) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>ML Model Registry & Version Control (Section 42)</span>
          </h3>
          {promoteSuccess && (
            <span className="text-xs text-emerald-400 flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Model promoted to ACTIVE!</span>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Model Name & Algorithm</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">MAE</th>
                <th className="py-2.5 px-3">RMSE</th>
                <th className="py-2.5 px-3">Dataset Size</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {models.map(m => (
                <tr key={m.version} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-white">{m.version}</td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{m.name}</div>
                    <div className="text-[10px] text-slate-400">{m.algorithm}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : m.status === 'CANDIDATE'
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-400 font-semibold">{m.mae} min</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{m.rmse} min</td>
                  <td className="py-3 px-3 text-slate-400">{m.datasetSize.toLocaleString()} samples</td>
                  <td className="py-3 px-3 text-right">
                    {m.status !== 'ACTIVE' && (
                      <button
                        onClick={() => handlePromote(m.version)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        Promote to Active
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
