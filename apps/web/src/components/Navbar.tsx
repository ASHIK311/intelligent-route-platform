import React from 'react';
import { Compass, Brain, BarChart3, Shield, Activity, User, Sparkles } from 'lucide-react';

export type AppTab = 'routing' | 'brain' | 'analytics' | 'admin';

interface NavbarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  currentUser: string;
  onUserChange: (user: string) => void;
  systemStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  activeModelVersion: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onUserChange,
  systemStatus,
  activeModelVersion
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">NeuroRoute</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                INTELLIGENT 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Adaptive Route Optimization & Personal Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2">
          <button
            onClick={() => onTabChange('routing')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'routing'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden md:inline">Route Engine</span>
          </button>

          <button
            onClick={() => onTabChange('brain')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'brain'
                ? 'bg-slate-800 text-purple-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span className="hidden md:inline">Personal Brain</span>
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden md:inline">Analytics</span>
          </button>

          <button
            onClick={() => onTabChange('admin')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'admin'
                ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="hidden md:inline">Admin Monitor</span>
          </button>
        </nav>

        {/* Right Controls: Status & User */}
        <div className="flex items-center space-x-3">
          {/* Status Badge */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">ML Model:</span>
            <span className="text-slate-200 font-mono font-medium">{activeModelVersion}</span>
          </div>

          {/* User Profile Selector */}
          <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5">
            <User className="w-4 h-4 text-slate-400" />
            <select
              value={currentUser}
              onChange={e => onUserChange(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="usr_commuter_2" className="bg-slate-900 text-slate-200">
                Alex (Commuter)
              </option>
              <option value="usr_budget_3" className="bg-slate-900 text-slate-200">
                Taylor (Budget)
              </option>
              <option value="usr_admin_1" className="bg-slate-900 text-slate-200">
                Admin
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
