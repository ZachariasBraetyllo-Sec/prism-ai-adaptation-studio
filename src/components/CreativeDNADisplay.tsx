'use client';

import { CreativeDNA } from '@/types';
import { useState } from 'react';

interface CreativeDNADisplayProps {
  creativeDNA: CreativeDNA;
}

interface CollapsibleSectionProps {
  title: string;
  summary: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  colorScheme: {
    border: string;
    bg: string;
    text: string;
    icon: string;
  };
}

function CollapsibleSection({ 
  title, 
  summary, 
  isExpanded, 
  onToggle, 
  children, 
  colorScheme 
}: CollapsibleSectionProps) {
  return (
    <div className={`border ${colorScheme.border} rounded-lg backdrop-blur-sm ${colorScheme.bg}`}>
      <button
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-${colorScheme.icon} focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg transition-all`}
        aria-expanded={isExpanded}
        aria-controls={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
            {!isExpanded && (
              <p className={`text-sm ${colorScheme.text} opacity-80 line-clamp-1`}>
                {summary}
              </p>
            )}
          </div>
          <svg
            className={`w-6 h-6 ${colorScheme.text} transition-transform duration-200 flex-shrink-0 ml-4 ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isExpanded && (
        <div 
          id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="px-6 pb-6"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function CreativeDNADisplay({ creativeDNA }: CreativeDNADisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sourceWork: false,
    coreElements: false,
    thematicElements: false,
    characterArchetypes: false,
    narrativeStructure: false,
    worldBuilding: false,
    emotionalTone: false,
    targetAudience: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Generate summaries
  const sourceWorkSummary = `${creativeDNA.sourceWork.title} by ${creativeDNA.sourceWork.creator} • ${creativeDNA.sourceWork.medium} • ${creativeDNA.sourceWork.genre.join(', ')}`;
  
  const coreElementsSummary = creativeDNA.coreElements.premise.substring(0, 100) + (creativeDNA.coreElements.premise.length > 100 ? '...' : '');
  
  const thematicElementsSummary = creativeDNA.thematicElements.primaryThemes.join(', ');
  
  const characterArchetypesSummary = `${creativeDNA.characterArchetypes.length} characters: ${creativeDNA.characterArchetypes.slice(0, 3).map(c => c.name).join(', ')}${creativeDNA.characterArchetypes.length > 3 ? '...' : ''}`;
  
  const narrativeStructureSummary = `${creativeDNA.narrativeStructure.structure} • ${creativeDNA.narrativeStructure.pacing} pacing • ${creativeDNA.narrativeStructure.pointOfView}`;
  
  const worldBuildingSummary = `${creativeDNA.worldBuilding.setting} • ${creativeDNA.worldBuilding.timeframe}`;
  
  const emotionalToneSummary = `${creativeDNA.emotionalTone.overallTone} • ${creativeDNA.emotionalTone.emotionalRange.slice(0, 3).join(', ')}`;
  
  const targetAudienceSummary = `${creativeDNA.targetAudience.ageRange} • ${creativeDNA.targetAudience.contentRating}`;

  return (
    <div className="space-y-6">
      {/* Source Work Info */}
      <CollapsibleSection
        title="Source Work"
        summary={sourceWorkSummary}
        isExpanded={expandedSections.sourceWork}
        onToggle={() => toggleSection('sourceWork')}
        colorScheme={{
          border: 'border-purple-500/30',
          bg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
          text: 'text-purple-300',
          icon: 'purple-500'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-purple-300 text-sm font-semibold">Title:</span>
            <p className="text-white">{creativeDNA.sourceWork.title}</p>
          </div>
          <div>
            <span className="text-purple-300 text-sm font-semibold">Creator:</span>
            <p className="text-white">{creativeDNA.sourceWork.creator}</p>
          </div>
          <div>
            <span className="text-purple-300 text-sm font-semibold">Medium:</span>
            <p className="text-white">{creativeDNA.sourceWork.medium}</p>
          </div>
          <div>
            <span className="text-purple-300 text-sm font-semibold">Genre:</span>
            <p className="text-white">{creativeDNA.sourceWork.genre.join(', ')}</p>
          </div>
        </div>
        {creativeDNA.sourceWork.synopsis && (
          <div className="mt-4">
            <span className="text-purple-300 text-sm font-semibold">Synopsis:</span>
            <p className="text-gray-300 mt-1">{creativeDNA.sourceWork.synopsis}</p>
          </div>
        )}
      </CollapsibleSection>

      {/* Core Elements */}
      <CollapsibleSection
        title="Core Elements"
        summary={coreElementsSummary}
        isExpanded={expandedSections.coreElements}
        onToggle={() => toggleSection('coreElements')}
        colorScheme={{
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/5',
          text: 'text-blue-300',
          icon: 'blue-500'
        }}
      >
        <div className="space-y-4">
          <div>
            <span className="text-blue-300 text-sm font-semibold">Premise:</span>
            <p className="text-gray-300 mt-1">{creativeDNA.coreElements.premise}</p>
          </div>
          <div>
            <span className="text-blue-300 text-sm font-semibold">Central Conflict:</span>
            <p className="text-gray-300 mt-1">{creativeDNA.coreElements.centralConflict}</p>
          </div>
          <div>
            <span className="text-blue-300 text-sm font-semibold">Unique Hook:</span>
            <p className="text-gray-300 mt-1">{creativeDNA.coreElements.uniqueHook}</p>
          </div>
          {creativeDNA.coreElements.keySymbols && creativeDNA.coreElements.keySymbols.length > 0 && (
            <div>
              <span className="text-blue-300 text-sm font-semibold">Key Symbols:</span>
              <div className="mt-2 space-y-2">
                {creativeDNA.coreElements.keySymbols.map((sym, i) => (
                  <div key={i} className="bg-black/20 rounded p-3">
                    <p className="text-white font-medium">{sym.symbol}</p>
                    <p className="text-gray-400 text-sm mt-1">{sym.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Thematic Elements */}
      <CollapsibleSection
        title="Thematic Elements"
        summary={thematicElementsSummary}
        isExpanded={expandedSections.thematicElements}
        onToggle={() => toggleSection('thematicElements')}
        colorScheme={{
          border: 'border-green-500/30',
          bg: 'bg-green-500/5',
          text: 'text-green-300',
          icon: 'green-500'
        }}
      >
        <div className="space-y-4">
          <div>
            <span className="text-green-300 text-sm font-semibold">Primary Themes:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {creativeDNA.thematicElements.primaryThemes.map((theme, i) => (
                <span key={i} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                  {theme}
                </span>
              ))}
            </div>
          </div>
          {creativeDNA.thematicElements.secondaryThemes && creativeDNA.thematicElements.secondaryThemes.length > 0 && (
            <div>
              <span className="text-green-300 text-sm font-semibold">Secondary Themes:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {creativeDNA.thematicElements.secondaryThemes.map((theme, i) => (
                  <span key={i} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
          {creativeDNA.thematicElements.moralQuestions && creativeDNA.thematicElements.moralQuestions.length > 0 && (
            <div>
              <span className="text-green-300 text-sm font-semibold">Moral Questions:</span>
              <ul className="mt-2 space-y-1">
                {creativeDNA.thematicElements.moralQuestions.map((question, i) => (
                  <li key={i} className="text-gray-300 text-sm">• {question}</li>
                ))}
              </ul>
            </div>
          )}
          {creativeDNA.thematicElements.socialCommentary && (
            <div>
              <span className="text-green-300 text-sm font-semibold">Social Commentary:</span>
              <p className="text-gray-300 mt-1">{creativeDNA.thematicElements.socialCommentary}</p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Character Archetypes */}
      <CollapsibleSection
        title="Character Archetypes"
        summary={characterArchetypesSummary}
        isExpanded={expandedSections.characterArchetypes}
        onToggle={() => toggleSection('characterArchetypes')}
        colorScheme={{
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-500/5',
          text: 'text-yellow-300',
          icon: 'yellow-500'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creativeDNA.characterArchetypes.map((char) => (
            <div key={char.id} className="bg-black/20 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">{char.name}</h3>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">
                  {char.role}
                </span>
              </div>
              <p className="text-yellow-300 text-sm mb-2">{char.archetype}</p>
              {char.traits && char.traits.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {char.traits.map((trait, i) => (
                    <span key={i} className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-xs">
                      {trait}
                    </span>
                  ))}
                </div>
              )}
              {char.arc && (
                <p className="text-gray-400 text-sm mt-2">Arc: {char.arc}</p>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Narrative Structure */}
      <CollapsibleSection
        title="Narrative Structure"
        summary={narrativeStructureSummary}
        isExpanded={expandedSections.narrativeStructure}
        onToggle={() => toggleSection('narrativeStructure')}
        colorScheme={{
          border: 'border-orange-500/30',
          bg: 'bg-orange-500/5',
          text: 'text-orange-300',
          icon: 'orange-500'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-orange-300 text-sm font-semibold">Structure:</span>
            <p className="text-white">{creativeDNA.narrativeStructure.structure}</p>
          </div>
          <div>
            <span className="text-orange-300 text-sm font-semibold">Pacing:</span>
            <p className="text-white">{creativeDNA.narrativeStructure.pacing}</p>
          </div>
          <div>
            <span className="text-orange-300 text-sm font-semibold">Point of View:</span>
            <p className="text-white">{creativeDNA.narrativeStructure.pointOfView}</p>
          </div>
          {creativeDNA.narrativeStructure.timelineComplexity && (
            <div>
              <span className="text-orange-300 text-sm font-semibold">Timeline Complexity:</span>
              <p className="text-white">{creativeDNA.narrativeStructure.timelineComplexity}</p>
            </div>
          )}
        </div>
        {creativeDNA.narrativeStructure.plotPoints && creativeDNA.narrativeStructure.plotPoints.length > 0 && (
          <div className="mt-4">
            <span className="text-orange-300 text-sm font-semibold">Key Plot Points:</span>
            <div className="mt-2 space-y-2">
              {creativeDNA.narrativeStructure.plotPoints.map((point, i) => (
                <div key={i} className="bg-black/20 rounded p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-medium">{point.name}</p>
                    <span className="text-orange-400 text-xs">{point.importance}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* World Building */}
      <CollapsibleSection
        title="World Building"
        summary={worldBuildingSummary}
        isExpanded={expandedSections.worldBuilding}
        onToggle={() => toggleSection('worldBuilding')}
        colorScheme={{
          border: 'border-cyan-500/30',
          bg: 'bg-cyan-500/5',
          text: 'text-cyan-300',
          icon: 'cyan-500'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-cyan-300 text-sm font-semibold">Setting:</span>
            <p className="text-white">{creativeDNA.worldBuilding.setting}</p>
          </div>
          <div>
            <span className="text-cyan-300 text-sm font-semibold">Timeframe:</span>
            <p className="text-white">{creativeDNA.worldBuilding.timeframe}</p>
          </div>
          {creativeDNA.worldBuilding.worldType && (
            <div>
              <span className="text-cyan-300 text-sm font-semibold">World Type:</span>
              <p className="text-white">{creativeDNA.worldBuilding.worldType}</p>
            </div>
          )}
          {creativeDNA.worldBuilding.atmosphere && (
            <div>
              <span className="text-cyan-300 text-sm font-semibold">Atmosphere:</span>
              <p className="text-white">{creativeDNA.worldBuilding.atmosphere}</p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Emotional Tone */}
      <CollapsibleSection
        title="Emotional Tone"
        summary={emotionalToneSummary}
        isExpanded={expandedSections.emotionalTone}
        onToggle={() => toggleSection('emotionalTone')}
        colorScheme={{
          border: 'border-pink-500/30',
          bg: 'bg-pink-500/5',
          text: 'text-pink-300',
          icon: 'pink-500'
        }}
      >
        <div className="space-y-4">
          <div>
            <span className="text-pink-300 text-sm font-semibold">Overall Tone:</span>
            <p className="text-white">{creativeDNA.emotionalTone.overallTone}</p>
          </div>
          <div>
            <span className="text-pink-300 text-sm font-semibold">Emotional Range:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {creativeDNA.emotionalTone.emotionalRange.map((emotion, i) => (
                <span key={i} className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">
                  {emotion}
                </span>
              ))}
            </div>
          </div>
          {creativeDNA.emotionalTone.intensity && (
            <div>
              <span className="text-pink-300 text-sm font-semibold">Intensity:</span>
              <p className="text-white">{creativeDNA.emotionalTone.intensity}</p>
            </div>
          )}
          {creativeDNA.emotionalTone.humorStyle && (
            <div>
              <span className="text-pink-300 text-sm font-semibold">Humor Style:</span>
              <p className="text-white">{creativeDNA.emotionalTone.humorStyle}</p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Target Audience */}
      <CollapsibleSection
        title="Target Audience"
        summary={targetAudienceSummary}
        isExpanded={expandedSections.targetAudience}
        onToggle={() => toggleSection('targetAudience')}
        colorScheme={{
          border: 'border-red-500/30',
          bg: 'bg-red-500/5',
          text: 'text-red-300',
          icon: 'red-500'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-red-300 text-sm font-semibold">Age Range:</span>
            <p className="text-white">{creativeDNA.targetAudience.ageRange}</p>
          </div>
          <div>
            <span className="text-red-300 text-sm font-semibold">Content Rating:</span>
            <p className="text-white">{creativeDNA.targetAudience.contentRating}</p>
          </div>
        </div>
        {creativeDNA.targetAudience.contentWarnings && creativeDNA.targetAudience.contentWarnings.length > 0 && (
          <div className="mt-4">
            <span className="text-red-300 text-sm font-semibold">Content Warnings:</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {creativeDNA.targetAudience.contentWarnings.map((warning, i) => (
                <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                  {warning}
                </span>
              ))}
            </div>
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}

// Made with Bob
