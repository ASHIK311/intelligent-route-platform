import React, { useState, useEffect } from 'react';
import { Navbar, AppTab } from './components/Navbar.js';
import { ControlPanel } from './components/ControlPanel.js';
import { MapView } from './components/MapView.js';
import { RouteComparisonDrawer } from './components/RouteComparisonDrawer.js';
import { JourneySimulatorModal } from './components/JourneySimulatorModal.js';
import { PersonalBrainDashboard } from './components/PersonalBrainDashboard.js';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { api } from './services/api.js';
import {
  GraphNode,
  GraphEdge,
  RouteSearchResult,
  CalculatedRoute,
  RouteRequest,
  JourneyRecord
} from '@intelligent-route/shared-types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('routing');
  const [currentUser, setCurrentUser] = useState<string>('usr_commuter_2');
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);

  const [originId, setOriginId] = useState<string>('node_1');
  const [destinationId, setDestinationId] = useState<string>('node_21');

  const [searchResult, setSearchResult] = useState<RouteSearchResult | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<CalculatedRoute | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeSimulationRoute, setActiveSimulationRoute] = useState<CalculatedRoute | null>(null);

  // Load graph and run initial search on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const graph = await api.getGraph();
        setNodes(graph.nodes);
        setEdges(graph.edges);

        // Initial default route calculation
        const initialResult = await api.searchRoutes({
          originId: 'node_1',
          destinationId: 'node_21',
          profile: 'balanced',
          userId: currentUser
        });
        setSearchResult(initialResult);
        setSelectedRoute(initialResult.recommendedRoute);
      } catch (err: any) {
        console.error('Initialization error', err);
        setErrorMsg(err.message || 'Failed to initialize platform data');
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const handleSearch = async (req: RouteRequest) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await api.searchRoutes({
        ...req,
        userId: currentUser
      });
      setSearchResult(result);
      setSelectedRoute(result.recommendedRoute);
    } catch (err: any) {
      console.error('Search error', err);
      setErrorMsg(err.message || 'Failed to calculate optimal route');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJourneyFinished = (journey: JourneyRecord) => {
    setActiveSimulationRoute(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        systemStatus="HEALTHY"
        activeModelVersion="v1.4.2"
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {errorMsg && (
          <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-300 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Route Optimization Engine */}
        {activeTab === 'routing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Control Panel (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <ControlPanel
                nodes={nodes}
                onSearch={handleSearch}
                isLoading={isLoading}
                selectedOriginId={originId}
                selectedDestinationId={destinationId}
                onOriginChange={setOriginId}
                onDestinationChange={setDestinationId}
              />
            </div>

            {/* Right Column: Interactive Map & Route Results (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <MapView
                nodes={nodes}
                edges={edges}
                recommendedRoute={searchResult?.recommendedRoute}
                alternativeRoutes={searchResult?.alternativeRoutes}
                selectedRoute={selectedRoute || undefined}
                originNodeId={originId}
                destinationNodeId={destinationId}
                onSelectNodeAsOrigin={setOriginId}
                onSelectNodeAsDestination={setDestinationId}
              />

              {searchResult && (
                <RouteComparisonDrawer
                  searchResult={searchResult}
                  selectedRouteId={selectedRoute?.id}
                  onSelectRoute={setSelectedRoute}
                  onStartJourney={route => setActiveSimulationRoute(route)}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Personal Route Brain */}
        {activeTab === 'brain' && <PersonalBrainDashboard userId={currentUser} />}

        {/* Tab 3: System Analytics */}
        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {/* Tab 4: Admin Monitor */}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Journey Simulator Modal */}
      {activeSimulationRoute && (
        <JourneySimulatorModal
          route={activeSimulationRoute}
          nodes={nodes}
          onClose={() => setActiveSimulationRoute(null)}
          onFinished={handleJourneyFinished}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        Intelligent Adaptive Route Optimization Platform &copy; 2026 · Multi-Objective Graph Intelligence
      </footer>
    </div>
  );
};
