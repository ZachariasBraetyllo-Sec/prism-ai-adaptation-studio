import { AdaptationRecommendation, DecisionStatus } from '@/types';

interface RecommendationCardProps {
  recommendation: AdaptationRecommendation;
  decision: DecisionStatus;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export default function RecommendationCard({ recommendation, decision, onAccept, onReject }: RecommendationCardProps) {
  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 0.7) return 'text-green-400';
    if (score >= 0.4) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score >= 0.7) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'border-gray-500/50';
    const lower = priority.toLowerCase();
    if (lower === 'critical') return 'border-red-500/50';
    if (lower === 'high') return 'border-orange-500/50';
    if (lower === 'medium') return 'border-yellow-500/50';
    return 'border-blue-500/50';
  };

  const getDecisionStyle = (decision: DecisionStatus) => {
    if (decision === 'accepted') return 'border-green-500/50 bg-green-500/5';
    if (decision === 'rejected') return 'border-red-500/50 bg-red-500/5';
    return '';
  };

  return (
    <div className={`border ${getPriorityColor(recommendation.priority)} ${getDecisionStyle(decision)} rounded-lg p-6 backdrop-blur-sm bg-white/5 transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
              {recommendation.category}
            </span>
            <span className={`text-sm font-medium ${getConfidenceColor(recommendation.confidence?.score)}`}>
              {getConfidenceLabel(recommendation.confidence?.score)} confidence
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {recommendation.proposedChange}
          </h3>
        </div>
        
        {/* Decision Badge */}
        {decision !== 'pending' && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            decision === 'accepted'
              ? 'bg-green-500/20 text-green-300'
              : 'bg-red-500/20 text-red-300'
          }`}>
            {decision === 'accepted' ? '✓ Accepted' : '✗ Rejected'}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 mb-6">
        <div>
          <h4 className="text-sm font-semibold text-purple-300 mb-1">Reasoning</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{recommendation.reasoning}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-green-300 mb-1">Creative Benefit</h4>
            {recommendation.creativeBenefit?.primary && (
              <p className="text-gray-300 text-sm leading-relaxed">{recommendation.creativeBenefit.primary}</p>
            )}
            {recommendation.creativeBenefit?.audienceImpact && (
              <p className="text-gray-400 text-xs mt-1 italic">{recommendation.creativeBenefit.audienceImpact}</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-orange-300 mb-1">Potential Risk</h4>
            {recommendation.potentialRisk?.risks && recommendation.potentialRisk.risks.length > 0 && (
              <ul className="text-gray-300 text-sm leading-relaxed space-y-1">
                {recommendation.potentialRisk.risks.map((risk, i) => (
                  <li key={i}>• {risk}</li>
                ))}
              </ul>
            )}
            {recommendation.potentialRisk?.severity && (
              <p className="text-gray-400 text-xs mt-1">
                Severity: <span className="capitalize">{recommendation.potentialRisk.severity}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {decision === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={() => onAccept(recommendation.recommendationId)}
            className="flex-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg font-medium transition-colors duration-200 border border-green-500/30"
          >
            ✓ Accept
          </button>
          <button
            onClick={() => onReject(recommendation.recommendationId)}
            className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-medium transition-colors duration-200 border border-red-500/30"
          >
            ✗ Reject
          </button>
        </div>
      )}
    </div>
  );
}

// Made with Bob
