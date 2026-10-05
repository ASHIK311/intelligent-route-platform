import React, { useState, useMemo } from 'react';
import { GraphNode, GraphEdge, CalculatedRoute } from '@intelligent-route/shared-types';
import { ZoomIn, ZoomOut, Maximize2, Layers, Eye, EyeOff, Info } from 'lucide-react';

interface MapViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  recommendedRoute?: CalculatedRoute;
  alternativeRoutes?: CalculatedRoute[];
  selectedRoute?: CalculatedRoute;
  originNodeId?: string;
  destinationNodeId?: string;
  onSelectNodeAsOrigin: (id: string) => void;
  onSelectNodeAsDestination: (id: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  nodes,
  edges,
  recommendedRoute,
  alternativeRoutes = [],
  selectedRoute,
  originNodeId,
  destinationNodeId,
  onSelectNodeAsOrigin,
  onSelectNodeAsDestination
}) => {
  const [zoom, setZoom] = useState(1);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showNodeLabels, setShowNodeLabels] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Compute bounding box for projection
  const bounds = useMemo(() => {
    if (nodes.length === 0) return { minLat: 37.7, maxLat: 37.82, minLng: -122.52, maxLng: -122.38 };
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    for (const n of nodes) {
      if (n.lat < minLat) minLat = n.lat;
      if (n.lat > maxLat) maxLat = n.lat;
      if (n.lng < minLng) minLng = n.lng;
      if (n.lng > maxLng) maxLng = n.lng;
    }
    return { minLat, maxLat, minLng, maxLng };
  }, [nodes]);

  // Project lat/lng to SVG canvas coords [50, 950]
  const project = (lat: number, lng: number) => {
    const width = 1000;
    const height = 750;
    const padding = 60;

    const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 0.01)) * (width - 2 * padding);
    // inverted Y because SVG y goes down while lat goes up
    const y = height - padding - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 0.01)) * (height - 2 * padding);

    return { x, y };
  };

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const n of nodes) map.set(n.id, n);
    return map;
  }, [nodes]);

  const activeDisplayRoute = selectedRoute || recommendedRoute;

  // Set of node IDs in active route
  const activeRouteNodeSet = useMemo(() => {
    return new Set(activeDisplayRoute?.pathNodeIds || []);
  }, [activeDisplayRoute]);

  return (
    <div className="relative w-full h-[580px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* Map Control Bar Top */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300">
        <span className="font-semibold text-white tracking-wide">Metro Network Canvas</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">{nodes.length} Nodes · {edges.length} Edges</span>
        <span className="text-slate-600">|</span>
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
            showTraffic ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Traffic Layer</span>
        </button>

        <button
          onClick={() => setShowNodeLabels(!showNodeLabels)}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
            showNodeLabels ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          {showNodeLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Labels</span>
        </button>
      </div>

      {/* Zoom / View controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 text-slate-300">
        <button
          onClick={() => setZoom(prev => Math.min(2.5, prev + 0.25))}
          className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.75, prev - 0.25))}
          className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* SVG Canvas Map */}
      <div className="w-full h-full overflow-hidden flex items-center justify-center cursor-crosshair">
        <svg
          viewBox="0 0 1000 750"
          className="w-full h-full transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            {/* Glow filters */}
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="750" fill="url(#grid)" />

          {/* 1. Base Graph Edges */}
          <g opacity={activeDisplayRoute ? 0.25 : 0.6}>
            {edges.map(edge => {
              const u = nodeMap.get(edge.source);
              const v = nodeMap.get(edge.target);
              if (!u || !v) return null;

              const p1 = project(u.lat, u.lng);
              const p2 = project(v.lat, v.lng);

              let strokeColor = '#334155';
              let strokeWidth = 1.0;

              if (showTraffic) {
                if (edge.trafficLevel === 'CONGESTED') {
                  strokeColor = '#ef4444';
                  strokeWidth = 1.8;
                } else if (edge.trafficLevel === 'HIGH') {
                  strokeColor = '#f59e0b';
                  strokeWidth = 1.5;
                } else if (edge.roadType === 'highway' || edge.roadType === 'toll_road') {
                  strokeColor = '#06b6d4';
                  strokeWidth = 1.5;
                }
              }

              return (
                <line
                  key={edge.id}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* 2. Alternative Routes (Dashed) */}
          {alternativeRoutes.map((alt, altIdx) => {
            const isSelected = selectedRoute?.id === alt.id;
            if (isSelected) return null; // rendered in active slot

            return (
              <g key={`alt_${alt.id}`}>
                {alt.pathNodeIds.map((nodeId, idx) => {
                  if (idx === alt.pathNodeIds.length - 1) return null;
                  const nextNodeId = alt.pathNodeIds[idx + 1];
                  const u = nodeMap.get(nodeId);
                  const v = nodeMap.get(nextNodeId);
                  if (!u || !v) return null;
                  const p1 = project(u.lat, u.lng);
                  const p2 = project(v.lat, v.lng);

                  return (
                    <line
                      key={`alt_seg_${idx}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#818cf8"
                      strokeWidth="3"
                      strokeDasharray="6 4"
                      strokeOpacity="0.75"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* 3. Recommended / Active Selected Route (Glow + Animated Pulse) */}
          {activeDisplayRoute && (
            <g filter="url(#glow-emerald)">
              {activeDisplayRoute.pathNodeIds.map((nodeId, idx) => {
                if (idx === activeDisplayRoute.pathNodeIds.length - 1) return null;
                const nextNodeId = activeDisplayRoute.pathNodeIds[idx + 1];
                const u = nodeMap.get(nodeId);
                const v = nodeMap.get(nextNodeId);
                if (!u || !v) return null;
                const p1 = project(u.lat, u.lng);
                const p2 = project(v.lat, v.lng);

                return (
                  <g key={`active_seg_${idx}`}>
                    {/* Background glow stroke */}
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#10b981"
                      strokeWidth="6"
                      strokeOpacity="0.3"
                      strokeLinecap="round"
                    />
                    {/* Animated foreground stroke */}
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="#34d399"
                      strokeWidth="3.5"
                      className="route-pulse"
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* 4. Graph Nodes */}
          {nodes.map(node => {
            const p = project(node.lat, node.lng);
            const isOrigin = node.id === originNodeId;
            const isDest = node.id === destinationNodeId;
            const inActiveRoute = activeRouteNodeSet.has(node.id);

            let nodeColor = '#475569';
            let radius = 3.5;

            if (isOrigin) {
              nodeColor = '#22c55e';
              radius = 8;
            } else if (isDest) {
              nodeColor = '#f43f5e';
              radius = 8;
            } else if (inActiveRoute) {
              nodeColor = '#34d399';
              radius = 5;
            } else if (node.type === 'commercial' || node.type === 'transit_hub') {
              nodeColor = '#38bdf8';
              radius = 4.5;
            }

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform duration-150 hover:scale-150"
                onClick={() => {
                  if (!originNodeId) onSelectNodeAsOrigin(node.id);
                  else if (!destinationNodeId) onSelectNodeAsDestination(node.id);
                  else onSelectNodeAsOrigin(node.id);
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Outer beacon pulse for Origin / Destination */}
                {(isOrigin || isDest) && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={radius * 1.8}
                    fill={isOrigin ? '#22c55e' : '#f43f5e'}
                    opacity="0.3"
                    className="animate-ping"
                  />
                )}

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={radius}
                  fill={nodeColor}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />

                {/* Node Label if toggled */}
                {showNodeLabels && (
                  <text
                    x={p.x + 8}
                    y={p.y + 3}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="Inter"
                    fontWeight="500"
                  >
                    {node.name.split('-')[0].trim()}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered Node Details Card */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl text-xs max-w-xs animate-in fade-in duration-150">
          <div className="font-semibold text-white flex items-center justify-between">
            <span>{hoveredNode.name}</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {hoveredNode.type}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Lat: {hoveredNode.lat.toFixed(4)} · Lng: {hoveredNode.lng.toFixed(4)}
          </div>
          <div className="flex space-x-2 mt-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => onSelectNodeAsOrigin(hoveredNode.id)}
              className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded text-[11px] font-medium"
            >
              Set as Origin
            </button>
            <button
              onClick={() => onSelectNodeAsDestination(hoveredNode.id)}
              className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded text-[11px] font-medium"
            >
              Set as Destination
            </button>
          </div>
        </div>
      )}

      {/* Map Legend Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Origin</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Destination</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-1 bg-emerald-400 rounded"></span>
          <span>Recommended</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-1 bg-indigo-400 border-dashed border-t border-indigo-400"></span>
          <span>Alternative</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>Congestion</span>
        </div>
      </div>
    </div>
  );
};
