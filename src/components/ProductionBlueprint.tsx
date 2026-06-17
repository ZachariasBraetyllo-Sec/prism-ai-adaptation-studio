import { ProductionBlueprint } from '@/types';
import { useState } from 'react';

interface ProductionBlueprintProps {
  blueprint: ProductionBlueprint;
}

type TabType = 'overview' | 'story' | 'creative' | 'production';

export default function ProductionBlueprintDisplay({ blueprint }: ProductionBlueprintProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set([1]));
  const [expandedRisks, setExpandedRisks] = useState<Set<number>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [expandedRejected, setExpandedRejected] = useState<Set<number>>(new Set());

  const totalSceneSeconds = blueprint.sceneRoadmap.reduce((sum, scene) => sum + scene.estimatedDurationSeconds, 0);
  const totalSceneMinutes = (totalSceneSeconds / 60).toFixed(1);

  const toggleScene = (sceneNumber: number) => {
    setExpandedScenes(prev => {
      const next = new Set(prev);
      if (next.has(sceneNumber)) {
        next.delete(sceneNumber);
      } else {
        next.add(sceneNumber);
      }
      return next;
    });
  };

  const expandAllScenes = () => {
    setExpandedScenes(new Set(blueprint.sceneRoadmap.map(s => s.sceneNumber)));
  };

  const collapseAllScenes = () => {
    setExpandedScenes(new Set());
  };

  const toggleRisk = (index: number) => {
    setExpandedRisks(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleRejected = (index: number) => {
    setExpandedRejected(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const tabs = [
    { id: 'overview' as TabType, label: '📋 Overview', icon: '📋' },
    { id: 'story' as TabType, label: '🎞️ Story Plan', icon: '🎞️' },
    { id: 'creative' as TabType, label: '🎨 Creative Direction', icon: '🎨' },
    { id: 'production' as TabType, label: '🎬 Production Review', icon: '🎬' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-8 border border-indigo-400/30 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-white">🎬 Production Blueprint</h2>
          <span className="px-4 py-2 bg-indigo-500/30 text-indigo-200 rounded-lg text-sm font-medium">
            {blueprint.targetMedium.format} • {blueprint.targetMedium.platform}
          </span>
        </div>
        <p className="text-xl text-white font-semibold mb-2">{blueprint.sourceTitle}</p>
        <p className="text-indigo-200">
          Target: {blueprint.targetDuration.minimumMinutes}-{blueprint.targetDuration.maximumMinutes} minutes
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
        <div className="flex border-b border-white/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset ${
                activeTab === tab.id
                  ? 'bg-purple-500/30 text-white border-b-2 border-purple-400'
                  : 'text-purple-200 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Decision Summary */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">📊 Decision Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-300 text-sm font-medium mb-1">Accepted</p>
                    <p className="text-3xl font-bold text-green-400">{blueprint.decisionSummary.acceptedCount}</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-300 text-sm font-medium mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-red-400">{blueprint.decisionSummary.rejectedCount}</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-300 text-sm font-medium mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-400">{blueprint.decisionSummary.pendingCount}</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-300 text-sm font-medium mb-1">Total</p>
                    <p className="text-3xl font-bold text-blue-400">{blueprint.decisionSummary.totalRecommendationsReviewed}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-purple-200 mb-2">Intended Audience:</p>
                  <p className="text-white">{blueprint.decisionSummary.intendedAudience}</p>
                </div>
              </div>

              {/* Adaptation Direction */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">🎯 Adaptation Direction</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-purple-200 font-medium mb-1">Approach</p>
                    <p className="text-white capitalize">{blueprint.adaptationDirection.approach}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-200 font-medium mb-1">Central Emotional Promise</p>
                    <p className="text-white">{blueprint.adaptationDirection.centralEmotionalPromise}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-200 font-medium mb-1">Core Premise to Preserve</p>
                    <p className="text-white">{blueprint.adaptationDirection.corePremiseToPreserve}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-200 font-medium mb-2">Primary Themes to Protect</p>
                    <div className="flex flex-wrap gap-2">
                      {blueprint.adaptationDirection.primaryThemesToProtect.map((theme, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-sm">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Creative Handoff */}
              <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-xl p-6 border border-green-400/30">
                <h3 className="text-2xl font-semibold text-white mb-6">🎯 Final Creative Handoff</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-green-200 font-medium mb-2">Central Direction</p>
                    <p className="text-white text-lg">{blueprint.finalCreativeHandoff.adaptationCentralDirection}</p>
                  </div>
                  <div>
                    <p className="text-green-200 font-medium mb-2">Most Important Preserved Elements</p>
                    <ul className="list-disc list-inside space-y-1">
                      {blueprint.finalCreativeHandoff.mostImportantPreservedElements.map((element, i) => (
                        <li key={i} className="text-white">{element}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-green-200 font-medium mb-2">Largest Remaining Challenge</p>
                    <p className="text-white">{blueprint.finalCreativeHandoff.largestRemainingChallenge}</p>
                  </div>
                  <div>
                    <p className="text-green-200 font-medium mb-2">Next Recommended Action</p>
                    <p className="text-white capitalize">{blueprint.finalCreativeHandoff.nextRecommendedAction.replace(/-/g, ' ')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Story Plan Tab */}
          {activeTab === 'story' && (
            <div className="space-y-6">
              {/* Scene Roadmap */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white">🎞️ Scene Roadmap</h3>
                    <p className="text-sm text-purple-200 mt-1">
                      {blueprint.sceneRoadmap.length} scenes • ~{totalSceneMinutes} min total
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={expandAllScenes}
                      className="px-3 py-1 text-sm bg-purple-500/30 hover:bg-purple-500/50 text-purple-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      Expand All
                    </button>
                    <button
                      onClick={collapseAllScenes}
                      className="px-3 py-1 text-sm bg-purple-500/30 hover:bg-purple-500/50 text-purple-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {blueprint.sceneRoadmap.map((scene) => {
                    const isExpanded = expandedScenes.has(scene.sceneNumber);
                    return (
                      <div key={scene.sceneNumber} className="bg-slate-800/50 border border-purple-500/20 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleScene(scene.sceneNumber)}
                          className="w-full p-4 text-left hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="flex items-center justify-center w-8 h-8 bg-purple-500/30 text-purple-200 rounded-full text-sm font-bold flex-shrink-0">
                                {scene.sceneNumber}
                              </span>
                              <div className="flex-1">
                                <h4 className="text-white font-semibold">{scene.workingTitle}</h4>
                                <p className="text-sm text-purple-300 capitalize">{scene.narrativePurpose.replace(/-/g, ' ')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded text-sm">
                                {Math.floor(scene.estimatedDurationSeconds / 60)}:{(scene.estimatedDurationSeconds % 60).toString().padStart(2, '0')}
                              </span>
                              <svg
                                className={`w-5 h-5 text-purple-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-purple-200 font-medium mb-1">Setting</p>
                                <p className="text-white">{scene.setting.primaryLocation}</p>
                                <p className="text-purple-300 text-xs">{scene.setting.timeContext}</p>
                              </div>
                              <div>
                                <p className="text-purple-200 font-medium mb-1">Characters</p>
                                <p className="text-white">{scene.keyCharacters.join(', ')}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-purple-200 font-medium text-sm mb-1">Emotional Beat</p>
                              <p className="text-white text-sm">{scene.majorEmotionalBeat}</p>
                            </div>

                            <div>
                              <p className="text-purple-200 font-medium text-sm mb-1">Essential Story Information</p>
                              <ul className="list-disc list-inside space-y-1">
                                {scene.essentialStoryInformation.map((info, i) => (
                                  <li key={i} className="text-white text-sm">{info}</li>
                                ))}
                              </ul>
                            </div>

                            {scene.acceptedRecommendationIds.length > 0 && (
                              <div className="pt-3 border-t border-purple-500/20">
                                <p className="text-xs text-purple-300">
                                  Based on {scene.acceptedRecommendationIds.length} accepted recommendation{scene.acceptedRecommendationIds.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Character Priorities */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">👥 Character Priorities</h3>
                <div className="space-y-4">
                  {blueprint.characterPriorities.map((char, i) => (
                    <div key={i} className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
                      <h4 className="text-white font-semibold text-lg mb-2">{char.characterName}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-purple-200 font-medium mb-1">Dramatic Function</p>
                          <p className="text-white">{char.dramaticFunction}</p>
                        </div>
                        <div>
                          <p className="text-purple-200 font-medium mb-1">Key Relationship</p>
                          <p className="text-white">{char.keyRelationship}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-purple-200 font-medium text-sm mb-1">What Must Not Be Lost</p>
                        <p className="text-white text-sm">{char.whatMustNotBeLost}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-purple-200 font-medium text-sm mb-1">Essential Traits</p>
                        <div className="flex flex-wrap gap-2">
                          {char.essentialTraits.map((trait, j) => (
                            <span key={j} className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded text-xs">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pacing Plan */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">⏱️ Pacing Plan</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-purple-200 text-xs font-medium mb-1">Opening</p>
                    <p className="text-white text-sm">{blueprint.pacingPlan.runtimeAllocation.openingMinutes} min</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-purple-200 text-xs font-medium mb-1">Development</p>
                    <p className="text-white text-sm">{blueprint.pacingPlan.runtimeAllocation.developmentMinutes} min</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-purple-200 text-xs font-medium mb-1">Midpoint</p>
                    <p className="text-white text-sm">{blueprint.pacingPlan.runtimeAllocation.midpointMinutes} min</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-purple-200 text-xs font-medium mb-1">Escalation</p>
                    <p className="text-white text-sm">{blueprint.pacingPlan.runtimeAllocation.escalationMinutes} min</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-purple-200 text-xs font-medium mb-1">Climax</p>
                    <p className="text-white text-sm">{blueprint.pacingPlan.runtimeAllocation.climaxMinutes} min</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-purple-200 text-xs font-medium mb-1">Resolution</p>
                    <p className="text-white text-sm">{blueprint.pacingPlan.runtimeAllocation.resolutionMinutes} min</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-purple-200 font-medium">Opening Pace</p>
                    <p className="text-white">{blueprint.pacingPlan.openingPace}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Creative Direction Tab */}
          {activeTab === 'creative' && (
            <div className="space-y-6">
              {/* Visual Language */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">🎨 Visual Language</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-purple-200 font-medium mb-1">Overall Approach</p>
                    <p className="text-white">{blueprint.visualLanguage.overallApproach}</p>
                  </div>
                  {blueprint.visualLanguage.colorPalette && (
                    <div>
                      <p className="text-purple-200 font-medium mb-1">Color Palette</p>
                      <p className="text-white">{blueprint.visualLanguage.colorPalette.description}</p>
                    </div>
                  )}
                  {blueprint.visualLanguage.visualMotifs.length > 0 && (
                    <div>
                      <p className="text-purple-200 font-medium mb-2">Visual Motifs</p>
                      <div className="space-y-2">
                        {blueprint.visualLanguage.visualMotifs.map((motif, i) => (
                          <div key={i} className="bg-slate-800/50 rounded p-2">
                            <p className="text-white text-xs font-medium">{motif.motif}</p>
                            <p className="text-purple-300 text-xs">{motif.creativeDNAConnection}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {blueprint.visualLanguage.lightingDirection && (
                    <div>
                      <p className="text-purple-200 font-medium mb-1">Lighting Direction</p>
                      <p className="text-white">{blueprint.visualLanguage.lightingDirection}</p>
                    </div>
                  )}
                  {blueprint.visualLanguage.framingAndComposition && (
                    <div>
                      <p className="text-purple-200 font-medium mb-1">Framing & Composition</p>
                      <p className="text-white">{blueprint.visualLanguage.framingAndComposition}</p>
                    </div>
                  )}
                  {blueprint.visualLanguage.cameraMovement && (
                    <div>
                      <p className="text-purple-200 font-medium mb-1">Camera Movement</p>
                      <p className="text-white">{blueprint.visualLanguage.cameraMovement}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sonic Language */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">🎵 Sonic Language</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-purple-200 font-medium mb-1">Overall Approach</p>
                    <p className="text-white">{blueprint.sonicLanguage.overallApproach}</p>
                  </div>
                  <div>
                    <p className="text-purple-200 font-medium mb-1">Music Direction</p>
                    <p className="text-white">{blueprint.sonicLanguage.musicDirection}</p>
                  </div>
                  <div>
                    <p className="text-purple-200 font-medium mb-1">Dialogue Density</p>
                    <p className="text-white capitalize">{blueprint.sonicLanguage.dialogueDensity.replace(/-/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-purple-200 font-medium mb-1">Ambient Sound Strategy</p>
                    <p className="text-white">{blueprint.sonicLanguage.ambientSoundStrategy}</p>
                  </div>
                  {blueprint.sonicLanguage.silenceAndRestraint && (
                    <div>
                      <p className="text-purple-200 font-medium mb-1">Silence & Restraint</p>
                      <p className="text-white">{blueprint.sonicLanguage.silenceAndRestraint}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Production Review Tab */}
          {activeTab === 'production' && (
            <div className="space-y-6">
              {/* Production Considerations */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">🎬 Production Considerations</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-purple-200 font-medium text-sm mb-1">Summary</p>
                    <p className="text-white text-sm">{blueprint.productionConsiderations.summary}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-purple-200 font-medium text-sm mb-2">Cast Complexity</p>
                      <p className="text-white text-sm">
                        {blueprint.productionConsiderations.castComplexity.speakingRoles} speaking roles
                      </p>
                      <p className="text-purple-300 text-xs">{blueprint.productionConsiderations.castComplexity.backgroundCastNeeds}</p>
                    </div>
                    <div>
                      <p className="text-purple-200 font-medium text-sm mb-2">Location Requirements</p>
                      <p className="text-white text-sm">{blueprint.productionConsiderations.locationRequirements.length} locations</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feasibility Notes */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">✅ Feasibility Assessment</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-purple-200 font-medium mb-1">Overall Assessment</p>
                    <p className="text-white">{blueprint.feasibilityNotes.overallAssessment}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-purple-200 font-medium mb-1">Runtime Feasibility</p>
                      <p className="text-white">{blueprint.feasibilityNotes.runtimeFeasibility}</p>
                    </div>
                    <div>
                      <p className="text-purple-200 font-medium mb-1">Production Complexity</p>
                      <p className="text-white">{blueprint.feasibilityNotes.productionComplexity}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creative Risks */}
              {blueprint.creativeRisksAndSafeguards && blueprint.creativeRisksAndSafeguards.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">⚠️ Creative Risks & Safeguards</h3>
                  <div className="space-y-2">
                    {blueprint.creativeRisksAndSafeguards.map((risk, i) => {
                      const isExpanded = expandedRisks.has(i);
                      return (
                        <div key={i} className="bg-slate-800/50 border border-yellow-500/20 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleRisk(i)}
                            className="w-full p-4 text-left hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-inset"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold text-sm">{risk.riskDescription}</h4>
                                {!isExpanded && (
                                  <p className="text-purple-300 text-xs mt-1">Likelihood: {risk.likelihood}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  risk.likelihood === 'high' ? 'bg-red-500/20 text-red-300' :
                                  risk.likelihood === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-green-500/20 text-green-300'
                                }`}>
                                  {risk.likelihood}
                                </span>
                                <svg
                                  className={`w-5 h-5 text-purple-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-2">
                              <div>
                                <p className="text-purple-200 text-xs font-medium mb-1">Why It Matters</p>
                                <p className="text-white text-sm">{risk.whyItMatters}</p>
                              </div>
                              <div>
                                <p className="text-purple-200 text-xs font-medium mb-1">Mitigation Strategy</p>
                                <p className="text-white text-sm">{risk.mitigationStrategy}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Open Creative Questions */}
              {blueprint.openCreativeQuestions && blueprint.openCreativeQuestions.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">❓ Open Creative Questions</h3>
                  <div className="space-y-2">
                    {blueprint.openCreativeQuestions.map((question, i) => {
                      const isExpanded = expandedQuestions.has(i);
                      return (
                        <div key={i} className="bg-slate-800/50 border border-blue-500/20 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleQuestion(i)}
                            className="w-full p-4 text-left hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold text-sm">{question.unresolvedChoice}</h4>
                                {!isExpanded && (
                                  <p className="text-purple-300 text-xs mt-1">Resolution: {question.resolutionTiming.replace(/-/g, ' ')}</p>
                                )}
                              </div>
                              <svg
                                className={`w-5 h-5 text-purple-300 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-2">
                              <div>
                                <p className="text-purple-200 text-xs font-medium mb-1">Why It Matters</p>
                                <p className="text-white text-sm">{question.whyItMatters}</p>
                              </div>
                              <div>
                                <p className="text-purple-200 text-xs font-medium mb-1">Options</p>
                                <div className="flex flex-wrap gap-2">
                                  {question.availableOptions.map((option, j) => (
                                    <span key={j} className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded text-xs">
                                      {option}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-purple-200 text-xs font-medium">Resolution: {question.resolutionTiming.replace(/-/g, ' ')}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rejected Recommendations */}
              {blueprint.rejectedRecommendationRecord && blueprint.rejectedRecommendationRecord.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">🚫 Rejected Recommendations</h3>
                  <div className="space-y-2">
                    {blueprint.rejectedRecommendationRecord.map((rejected, i) => {
                      const isExpanded = expandedRejected.has(i);
                      return (
                        <div key={i} className="bg-slate-800/50 border border-red-500/20 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleRejected(i)}
                            className="w-full p-4 text-left hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold text-sm">{rejected.recommendationIdOrTitle}</h4>
                                {!isExpanded && (
                                  <p className="text-purple-300 text-xs mt-1 line-clamp-1">{rejected.proposedChange}</p>
                                )}
                              </div>
                              <svg
                                className={`w-5 h-5 text-purple-300 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-2">
                              <div>
                                <p className="text-purple-200 text-xs font-medium mb-1">Proposed Change</p>
                                <p className="text-white text-sm">{rejected.proposedChange}</p>
                              </div>
                              <div>
                                <p className="text-purple-200 text-xs font-medium mb-1">Reason Excluded</p>
                                <p className="text-white text-sm">{rejected.reasonExcluded}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">🚫 Rejected Recommendations</h3>
                  <div className="bg-slate-800/50 border border-gray-500/20 rounded-lg p-4">
                    <p className="text-gray-400 text-sm text-center">No rejected recommendations recorded.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob