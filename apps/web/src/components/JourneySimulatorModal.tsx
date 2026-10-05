import React, { useState, useEffect } from 'react';
import { CalculatedRoute, GraphNode, JourneyRecord } from '@intelligent-route/shared-types';
import { api } from '../services/api.js';
import {
  Navigation,
  Clock,
  CheckCircle2,
  Star,
  X,
  Sparkles,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface JourneySimulatorModalProps {
  route: CalculatedRoute;
  nodes: GraphNode[];
  onClose: () => void;
  onFinished: (journey: JourneyRecord) => void;
}

export const JourneySimulatorModal: React.FC<JourneySimulatorModalProps> = ({
  route,
  nodes,
  onClose,
  onFinished
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [actualDuration, setActualDuration] = useState<number>(0);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('Smooth and accurate journey guidance!');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const totalSteps = route.pathNodeIds.length;

  // Initialize journey on mount
  useEffect(() => {
    let isMounted = true;
    const start = async () => {
      try {
        const jny = await api.startJourney({
          routeId: route.id,
          originId: route.pathNodeIds[0],
          destinationId: route.pathNodeIds[route.pathNodeIds.length - 1],
          pathNodeIds: route.pathNodeIds,
          predictedDurationMin: Math.round(route.predictedTravelTimeMin),
          estimatedCost: route.estimatedCost
        });
        if (isMounted) setJourneyId(jny.id);
      } catch (err) {
        console.error('Failed to start journey tracking', err);
      }
    };
    start();
    return () => {
      isMounted = false;
    };
  }, [route]);

  // Step-by-step simulated progress timer
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev + 1 >= totalSteps) {
          clearInterval(timer);
          // Complete journey: actual duration close to predicted with slight realistic noise (-1 to +2)
          const noise = Math.floor(Math.random() * 3) - 1;
          const actual = Math.max(5, Math.round(route.predictedTravelTimeMin + noise));
          setActualDuration(actual);
          setIsCompleted(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [totalSteps, isCompleted, route.predictedTravelTimeMin]);

  const handleFinish = async () => {
    if (!journeyId) {
      onClose();
      return;
    }
    setIsSubmitting(true);
    try {
      const completed = await api.completeJourney(journeyId, actualDuration, route.estimatedCost);
      await api.submitFeedback(journeyId, rating, feedback);
      onFinished(completed);
    } catch (err) {
      console.error('Error submitting completed journey', err);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const currentNode = nodeMap.get(route.pathNodeIds[currentStep]);
  const progressPct = Math.round((currentStep / (totalSteps - 1 || 1)) * 100);
  const remainingMin = Math.max(
    0,
    Math.round(route.predictedTravelTimeMin * (1 - currentStep / (totalSteps - 1 || 1)))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Live Journey Tracker</h3>
            <p className="text-xs text-slate-400">{route.name}</p>
          </div>
        </div>

        {!isCompleted ? (
          /* Live Tracking Simulation State */
          <div className="space-y-5">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>Journey Progress</span>
                <span className="font-mono text-emerald-400">{progressPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>

            {/* Current Waypoint Information */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Currently Traversed Node:</span>
              </div>
              <div className="text-sm font-bold text-white pl-6">
                {currentNode?.name || route.pathNodeIds[currentStep]}
              </div>
              <div className="text-[11px] text-slate-400 pl-6">
                Step {currentStep + 1} of {totalSteps} · {currentNode?.type}
              </div>
            </div>

            {/* Live ETA Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center space-x-3">
                <Clock className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Remaining ETA</div>
                  <div className="text-base font-bold text-white">{remainingMin} min</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-[10px] text-slate-400">Route Reliability</div>
                  <div className="text-base font-bold text-white">{Math.round(route.confidence * 100)}%</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Journey Finished State with Feedback & Brain Learning */
          <div className="space-y-5 animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-3 text-emerald-400">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div>
                <div className="font-bold text-sm text-white">Destination Reached!</div>
                <div className="text-xs text-emerald-300">
                  Journey logged into Personal Route Brain training pipeline.
                </div>
              </div>
            </div>

            {/* Prediction vs Actual Result Matrix (SRS Section 13) */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Predicted ETA</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">
                  {Math.round(route.predictedTravelTimeMin)} min
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Actual Duration</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {actualDuration} min
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Prediction Error</div>
                <div className="text-sm font-bold text-cyan-400 mt-0.5">
                  {actualDuration - Math.round(route.predictedTravelTimeMin) >= 0 ? '+' : ''}
                  {actualDuration - Math.round(route.predictedTravelTimeMin)} min
                </div>
              </div>
            </div>

            {/* Star Rating and User Feedback */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Rate Route Quality</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Optional feedback notes..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating Personal Brain...' : 'Save & Update Personal Route Brain'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
