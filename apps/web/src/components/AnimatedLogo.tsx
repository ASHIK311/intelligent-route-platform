import React, { useState } from 'react';

export const AnimatedLogo: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex items-center space-x-3.5 group cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Icon Container */}
      <div className="relative w-11 h-11 flex items-center justify-center">
        {/* Ambient Breathing Glow Aura */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 blur-md opacity-50 group-hover:opacity-90 transition-all duration-500 animate-pulse-halo ${
            isHovered ? 'scale-125 blur-lg opacity-80' : ''
          }`}
        />

        {/* Orbiting Satellite Particle Ring */}
        <div className="absolute -inset-1 rounded-2xl pointer-events-none animate-orbit">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8] -top-0.5 left-1/2 -translate-x-1/2 absolute" />
        </div>

        {/* Second Orbiting Particle (Counter-rotation) */}
        <div className="absolute -inset-1 rounded-2xl pointer-events-none animate-orbit-reverse opacity-70">
          <div className="w-1 h-1 rounded-full bg-emerald-300 shadow-[0_0_6px_#34d399] -bottom-0.5 left-1/2 -translate-x-1/2 absolute" />
        </div>

        {/* Main Badge Box */}
        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-[1.5px] shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-400/50 transition-all duration-300 transform group-hover:scale-105">
          <div className="w-full h-full rounded-[14px] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center overflow-hidden relative">
            {/* Radar Sweep Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-400/15 to-transparent animate-radar-sweep pointer-events-none" />

            {/* Neural Network Nodes & Mesh Background */}
            <svg
              className="absolute inset-0 w-full h-full opacity-30 text-emerald-400 pointer-events-none"
              viewBox="0 0 44 44"
              fill="none"
            >
              <line x1="8" y1="12" x2="22" y2="22" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
              <line x1="36" y1="12" x2="22" y2="22" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
              <line x1="12" y1="34" x2="22" y2="22" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
              <line x1="32" y1="34" x2="22" y2="22" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
              <circle cx="8" cy="12" r="1.5" fill="currentColor" />
              <circle cx="36" cy="12" r="1.5" fill="currentColor" />
              <circle cx="12" cy="34" r="1.5" fill="currentColor" />
              <circle cx="32" cy="34" r="1.5" fill="currentColor" />
            </svg>

            {/* Compass / Navigation Gyroscope SVG */}
            <svg
              className={`w-6 h-6 text-white relative z-10 transition-transform duration-500 ${
                isHovered ? 'scale-110' : ''
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer Dial Circle with tick marks */}
              <circle cx="12" cy="12" r="9.5" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.8" />
              <circle cx="12" cy="12" r="7.5" stroke="#10b981" strokeWidth="0.8" strokeDasharray="2 3" className="animate-spin-slow" />

              {/* Dynamic Oscillating Gyro Needle */}
              <g className="origin-center animate-compass-needle">
                {/* North Pointer (Emerald / Cyan with glow) */}
                <polygon
                  points="12,4 14.5,12 12,10.5 9.5,12"
                  fill="url(#needle-north-grad)"
                  stroke="#38bdf8"
                  strokeWidth="0.5"
                />
                {/* South Pointer (Dark Slate / Teal) */}
                <polygon
                  points="12,20 14.5,12 12,13.5 9.5,12"
                  fill="url(#needle-south-grad)"
                  stroke="#64748b"
                  strokeWidth="0.5"
                />
                {/* Center Pivot Jewel */}
                <circle cx="12" cy="12" r="1.75" fill="#f8fafc" stroke="#0ea5e9" strokeWidth="1" />
                <circle cx="12" cy="12" r="0.75" fill="#0284c7" />
              </g>

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="needle-north-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="needle-south-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Name & Tagline */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          {/* Shimmering Animated Brand Text */}
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-200 to-emerald-300 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:via-cyan-200 group-hover:to-white transition-all duration-300 font-sans drop-shadow-[0_2px_10px_rgba(16,185,129,0.2)]">
            NeuroRoute
          </span>

          {/* Glowing Animated 2.0 Badge */}
          <div className="relative inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)] group-hover:border-emerald-400 group-hover:shadow-[0_0_16px_rgba(16,185,129,0.4)] transition-all">
            {/* Live radar pulsing dot */}
            <span className="relative flex h-1.5 w-1.5 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>INTELLIGENT 2.0</span>
          </div>
        </div>

        {/* Subtitle with high-tech cyan accent */}
        <p className="text-[11px] text-slate-400 font-medium tracking-tight hidden sm:flex items-center space-x-1.5 group-hover:text-slate-300 transition-colors">
          <span className="text-emerald-400 font-mono text-[10px]">AI-DRIVEN</span>
          <span>Adaptive Route Optimization & Personal Intelligence</span>
        </p>
      </div>
    </div>
  );
};
