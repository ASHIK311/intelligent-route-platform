import React, { useState, useEffect } from 'react';
import { PersonalBrainSummary, LearnedPattern, UserPreferences } from '@intelligent-route/shared-types';
import { api } from '../services/api.js';
import {
  Brain,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Sparkles,
  Compass,
  RefreshCw,
  Sliders,
  Award
} from 'lucide-react';

interface PersonalBrainDashboardProps {
  userId: string;
}

export const PersonalBrainDashboard: React.FC<PersonalBrainDashboardProps> = ({ userId }) => {
  const [summary, setSummary] = useState<PersonalBrainSummary | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchBrainData = async () => {
    try {
      const data = await api.getPersonalBrain();
      const prefs = await api.getPreferences();
      setSummary(data);
      setPreferences(prefs);
    } catch (err) {
      console.error('Failed to load brain summary', err);
    }
  };

  useEffect(() => {
    fetchBrainData();
  }, [userId]);

  const handleTriggerAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await api.analyzeBrainPatterns();
      await fetchBrainData();
    } catch (err) {
      console.error('Error analyzing patterns', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdatePreference = async (field: keyof UserPreferences, value: any) => {
    if (!preferences) return;
    const updated = { ...preferences, [field]: value };
    setPreferences(updated);
    try {
      await api.updatePreferences(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Error updating preferences', err);
    }
  };

  if (!summary) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Loading Personal Route Brain Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-900/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Personal Route Brain</h2>
            <p className="text-xs text-slate-300">
              Autonomous machine learning engine adapting to your frequent corridors and driving behavior.
            </p>
          </div>
        </div>

        <button
          onClick={handleTriggerAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Detecting Habits...' : 'Re-Analyze Journey Patterns'}</span>
        </button>
      </div>

      {/* Metric Cards (SRS Section 23) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Trips Analyzed</span>
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {summary.tripsAnalyzed.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center space-x-1">
            <Award className="w-3 h-3" />
            <span>High confidence corpus</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>Prediction Accuracy</span>
          </div>
          <div className="text-2xl font-black text-cyan-400 mt-2 font-mono">
            {summary.predictionAccuracyPct}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Within ±3 min tolerance</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Avg Time Saved</span>
          </div>
          <div className="text-2xl font-black text-purple-400 mt-2 font-mono">
            {summary.avgTimeSavedPct}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">vs un-optimized routes</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Estimated Savings</span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
            ${summary.estimatedCostSaved.toFixed(0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Toll & fuel optimization</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Learned Habits</span>
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-2 font-mono">
            {summary.learnedPreferencesCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Active corridor affinities</div>
        </div>
      </div>

      {/* Learned Habits & Soft Preference Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Learned Habit Corridors */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Learned Travel Patterns & Recurring Corridors</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Soft preferences (Never overrides hard constraints)
            </span>
          </div>

          <div className="space-y-3">
            {summary.patterns.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No patterns detected yet. Complete 3 or more journeys to train the Personal Route Brain.
              </div>
            ) : (
              summary.patterns.map(pattern => (
                <div
                  key={pattern.id}
                  className="bg-slate-950 border border-purple-900/30 rounded-xl p-4 space-y-2 hover:border-purple-600/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">
                      {pattern.description}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                      Affinity: {Math.round(pattern.affinityScore * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                    <span>Window: <span className="text-slate-200">{pattern.timeWindow || 'All day'}</span></span>
                    <span>Observations: <span className="text-slate-200">{pattern.observationsCount} trips</span></span>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 font-mono">
                    Corridor Nodes: {pattern.preferredNodeIds?.join(' → ')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Personal Preference Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>User Sensitivity Profile</span>
            </h3>
            {savedSuccess && (
              <span className="text-[10px] text-emerald-400 animate-fade">Saved!</span>
            )}
          </div>

          {preferences && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Cost Sensitivity</span>
                  <span className="font-mono text-amber-400">
                    {Math.round(preferences.costSensitivity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences.costSensitivity}
                  onChange={e => handleUpdatePreference('costSensitivity', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Higher = Prefers toll-free bypasses even if slightly slower.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Time Sensitivity</span>
                  <span className="font-mono text-cyan-400">
                    {Math.round(preferences.timeSensitivity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences.timeSensitivity}
                  onChange={e => handleUpdatePreference('timeSensitivity', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Higher = Aggressively avoids predicted traffic delays.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.avoidTolls}
                    onChange={e => handleUpdatePreference('avoidTolls', e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">Always Avoid Toll Roads</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
