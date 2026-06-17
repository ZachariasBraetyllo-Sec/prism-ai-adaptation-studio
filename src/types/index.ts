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

export interface ProductionBlueprint {
  blueprintId: string;
  sourceTitle: string;
  createdAt: string;
  targetMedium: {
    format: string;
    platform: string;
    duration: {
      minimumSeconds: number;
      maximumSeconds: number;
    };
    additionalContext?: string;
  };
  targetDuration: {
    minimumMinutes: number;
    maximumMinutes: number;
  };
  decisionSummary: {
    totalRecommendationsReviewed: number;
    acceptedCount: number;
    rejectedCount: number;
    pendingCount: number;
    unresolvedCreativeDecisions: string[];
    intendedAudience: string;
  };
  adaptationDirection: {
    approach: string;
    centralEmotionalPromise: string;
    corePremiseToPreserve: string;
    primaryThemesToProtect: string[];
    intendedAudienceExperience: string;
    majorAdaptationPriorities: string[];
    majorCreativeBoundaries: string[];
  };
  sceneRoadmap: Array<{
    sceneNumber: number;
    workingTitle: string;
    narrativePurpose: string;
    keyCharacters: string[];
    setting: {
      primaryLocation: string;
      timeContext: string;
    };
    estimatedDurationSeconds: number;
    majorEmotionalBeat: string;
    essentialStoryInformation: string[];
    acceptedRecommendationIds: string[];
    creativeDNAElements: Array<{
      element: string;
      preservation: string;
    }>;
    sourceEvidence: Array<{
      source: string;
      context: string;
    }>;
    adaptationPrinciple: string[];
    visualOrSonicOpportunity?: string;
    productionNote?: string;
  }>;
  characterPriorities: Array<{
    characterName: string;
    dramaticFunction: string;
    essentialArc: string;
    keyRelationship: string;
    essentialTraits: string[];
    adaptationFocus: string;
    whatMustNotBeLost: string;
    acceptedRecommendationIds: string[];
    creativeDNAProtected: Array<{
      element: string;
      function: string;
    }>;
  }>;
  visualLanguage: {
    overallApproach: string;
    visualMotifs: Array<{
      motif: string;
      creativeDNAConnection: string;
    }>;
    symbolicImagery: Array<{
      symbol: string;
      meaning: string;
    }>;
    colorPalette: {
      description: string;
      primaryColors?: string[];
      secondaryColors?: string[];
      mood?: string;
    };
    lightingDirection?: string;
    framingAndComposition?: string;
    cameraMovement?: string;
    environmentalStorytelling?: string;
    meaningfulObjects?: Array<{
      object: string;
      narrative_significance: string;
    }>;
    visualContrasts?: string[];
    transitionsAndEchoes?: string;
  };
  sonicLanguage: {
    overallApproach: string;
    musicDirection: string;
    recurringMusicMotifs?: Array<{
      motif: string;
      purpose: string;
    }>;
    ambientSoundStrategy: string;
    recurringSoundMotifs?: Array<{
      sound: string;
      meaning: string;
    }>;
    silenceAndRestraint?: string;
    dialogueDensity: string;
    offScreenSoundOpportunities?: string[];
    emotionalSoundTransitions?: string;
    symbolicAudioElements?: Array<{
      element: string;
      symbolism: string;
    }>;
  };
  pacingPlan: {
    openingPace: string;
    earlyDevelopment: string;
    midpointShift: string;
    escalation: string;
    climaxTiming: string;
    resolution: string;
    endingRhythm: string;
    runtimeAllocation: {
      openingMinutes: number;
      developmentMinutes: number;
      midpointMinutes: number;
      escalationMinutes: number;
      climaxMinutes: number;
      resolutionMinutes: number;
    };
  };
  productionConsiderations: {
    summary: string;
    essentialNeeds: Array<{
      need: string;
      category: string;
      priority: string;
    }>;
    locationRequirements: string[];
    castComplexity: {
      speakingRoles: number;
      backgroundCastNeeds: string;
    };
    technicalConsiderations: {
      complexBlocking: boolean;
      nightOrExteriorShooting: boolean;
      weatherDependent: boolean;
      continuityConcerns: string[];
    };
    highCostElements: string[];
    simplificationOpportunities: string[];
  };
  feasibilityNotes: {
    overallAssessment: string;
    runtimeFeasibility: string;
    sceneCount: {
      count: number;
      feasibility: string;
    };
    locationComplexity: {
      uniqueLocations: number;
      feasibility: string;
    };
    castComplexity: string;
    productionComplexity: string;
    likelyResourcePressure: string;
    scopeReductionAreas: string[];
    strengthAreas: string[];
  };
  creativeRisksAndSafeguards: Array<{
    riskDescription: string;
    whyItMatters: string;
    affectedCreativeDNAElement?: string;
    likelihood: string;
    potentialImpact: string;
    mitigationStrategy: string;
  }>;
  openCreativeQuestions: Array<{
    unresolvedChoice: string;
    whyItMatters: string;
    affectedElement: string;
    availableOptions: string[];
    likelyTradeoffs: string[];
    fromPendingRecommendation: boolean;
    resolutionTiming: string;
  }>;
  rejectedRecommendationRecord: Array<{
    recommendationIdOrTitle: string;
    proposedChange: string;
    reasonExcluded: string;
    downstreamImpacts: string[];
  }>;
  finalCreativeHandoff: {
    adaptationCentralDirection: string;
    mostImportantPreservedElements: string[];
    strongestAcceptedDecisions: string[];
    largestRemainingChallenge: string;
    nextRecommendedAction: string;
    additionalGuidance: string;
  };
}

// Made with Bob
