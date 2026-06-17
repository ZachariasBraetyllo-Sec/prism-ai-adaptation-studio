// TypeScript interfaces for Prism AI Adaptation Studio

export interface CreativeDNA {
  id: string;
  version: string;
  sourceWork: {
    title: string;
    medium: string;
    genre: string[];
    creator: string;
    synopsis?: string;
  };
  coreElements: {
    premise: string;
    centralConflict: string;
    uniqueHook: string;
    keySymbols?: Array<{ symbol: string; meaning: string }>;
  };
  narrativeStructure: {
    structure: string;
    pacing: string;
    pointOfView: string;
    timelineComplexity?: string;
    plotPoints?: Array<{ name: string; description: string; importance: string }>;
  };
  thematicElements: {
    primaryThemes: string[];
    secondaryThemes?: string[];
    moralQuestions?: string[];
    socialCommentary?: string;
  };
  characterArchetypes: Array<{
    id: string;
    name: string;
    archetype: string;
    role: string;
    traits?: string[];
    arc?: string;
  }>;
  worldBuilding: {
    setting: string;
    timeframe: string;
    worldType?: string;
    atmosphere?: string;
  };
  emotionalTone: {
    overallTone: string;
    emotionalRange: string[];
    intensity?: string;
    humorStyle?: string;
  };
  targetAudience: {
    ageRange: string;
    contentRating: string;
    contentWarnings?: string[];
  };
}

export interface AdaptationRecommendation {
  recommendationId: string;
  category: string;
  proposedChange: string;
  reasoning: string;
  creativeBenefit: {
    primary?: string;
    secondary?: string[];
    audienceImpact?: string;
  };
  potentialRisk: {
    risks?: string[];
    severity?: string;
    mitigation?: string;
    tradeoffs?: string;
  };
  confidence: {
    score?: number;
    factors?: {
      sourceClarity?: string;
      mediumFit?: string;
      precedent?: string;
    };
    uncertainties?: string[];
  };
  priority?: string;
}

export interface AdaptationPlan {
  id: string;
  version: string;
  targetMedium: {
    medium?: string;
    format?: string;
    estimatedLength?: {
      value?: number;
      unit?: string;
    };
    platform?: string;
  };
  overallStrategy: {
    approach?: string;
    corePreservation?: string;
    targetAudienceAdjustments?: string;
  };
  recommendations: AdaptationRecommendation[];
}

export type DecisionStatus = 'pending' | 'accepted' | 'rejected';

// Made with Bob
