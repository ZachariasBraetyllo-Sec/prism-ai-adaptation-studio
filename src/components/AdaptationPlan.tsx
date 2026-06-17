import { AdaptationPlan, AdaptationRecommendation, DecisionStatus } from '@/types';
import RecommendationCard from './RecommendationCard';

interface AdaptationPlanProps {
  plan: AdaptationPlan;
  recommendations: AdaptationRecommendation[];
  decisions: Record<string, DecisionStatus>;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export default function AdaptationPlanDisplay({ plan, recommendations, decisions, onAccept, onReject }: AdaptationPlanProps) {
  const acceptedCount = Object.values(decisions).filter(d => d === 'accepted').length;
  const rejectedCount = Object.values(decisions).filter(d => d === 'rejected').length;
  const pendingCount = Object.values(decisions).filter(d => d === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Overall Strategy */}
      <div className="border border-purple-500/30 rounded-lg p-6 backdrop-blur-sm bg-gradient-to-br from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <span className="text-2xl">🎬</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Adaptation Strategy</h2>
            <div className="text-purple-300 text-sm space-x-2">
              {plan.targetMedium?.format && (
                <span className="capitalize">{plan.targetMedium.format}</span>
              )}
              {plan.targetMedium?.estimatedLength?.value && plan.targetMedium?.estimatedLength?.unit && (
                <span>• {plan.targetMedium.estimatedLength.value} {plan.targetMedium.estimatedLength.unit}</span>
              )}
              {plan.targetMedium?.platform && (
                <span>• {plan.targetMedium.platform}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-black/20 rounded-lg p-4 mb-4 space-y-3">
          {plan.overallStrategy?.approach && (
            <div>
              <p className="text-purple-300 text-sm font-semibold mb-1">Approach</p>
              <p className="text-gray-200 leading-relaxed">{plan.overallStrategy.approach}</p>
            </div>
          )}
          {plan.overallStrategy?.corePreservation && (
            <div>
              <p className="text-purple-300 text-sm font-semibold mb-1">Core Preservation</p>
              <p className="text-gray-200 leading-relaxed">{plan.overallStrategy.corePreservation}</p>
            </div>
          )}
          {plan.overallStrategy?.targetAudienceAdjustments && (
            <div>
              <p className="text-purple-300 text-sm font-semibold mb-1">Target Audience Adjustments</p>
              <p className="text-gray-200 leading-relaxed">{plan.overallStrategy.targetAudienceAdjustments}</p>
            </div>
          )}
        </div>

        {/* Decision Summary */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-300">{acceptedCount} Accepted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="text-gray-300">{rejectedCount} Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500"></span>
            <span className="text-gray-300">{pendingCount} Pending</span>
          </div>
        </div>
      </div>

      {/* Recommendations Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          Recommendations ({recommendations.length})
        </h3>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.recommendationId}
            recommendation={rec}
            decision={decisions[rec.recommendationId] || 'pending'}
            onAccept={onAccept}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  );
}

// Made with Bob
