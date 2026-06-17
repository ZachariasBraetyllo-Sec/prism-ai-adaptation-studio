#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.log('='.repeat(80));
console.log('PRISM AI PRODUCTION BLUEPRINT PIPELINE TEST');
console.log('='.repeat(80));
console.log();

// Step 1: Read the demo story
console.log('Step 1: Reading demo story...');
const storyPath = join(__dirname, '..', 'samples', 'prism-demo-story.md');
let sourceText;

try {
  sourceText = readFileSync(storyPath, 'utf-8');
  console.log(`✓ Loaded story (${sourceText.length} characters)`);
  console.log();
} catch (error) {
  console.error('✗ Failed to read demo story:', error.message);
  process.exit(1);
}

// Step 2: Analyze Creative DNA
console.log('Step 2: Analyzing Creative DNA...');
console.log(`POST ${BASE_URL}/api/analyze-creative-dna`);

let creativeDnaData;
try {
  const creativeDnaResponse = await fetch(`${BASE_URL}/api/analyze-creative-dna`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sourceText }),
  });

  console.log(`HTTP Status: ${creativeDnaResponse.status} ${creativeDnaResponse.statusText}`);
  
  if (!creativeDnaResponse.ok) {
    const errorData = await creativeDnaResponse.json();
    console.error('✗ Creative DNA analysis failed:');
    console.error(JSON.stringify(errorData, null, 2));
    process.exit(1);
  }

  const responseData = await creativeDnaResponse.json();
  
  if (!responseData.success) {
    console.error('✗ Creative DNA analysis returned success: false');
    console.error(JSON.stringify(responseData, null, 2));
    process.exit(1);
  }

  creativeDnaData = responseData.data;
  console.log('✓ Creative DNA analysis successful');
  console.log(`  - ID: ${creativeDnaData.id}`);
  console.log(`  - Title: ${creativeDnaData.sourceWork.title}`);
  console.log();

} catch (error) {
  console.error('✗ Unexpected error in Creative DNA analysis:', error.message);
  process.exit(1);
}

// Step 3: Generate Adaptation Recommendations
console.log('Step 3: Generating adaptation recommendations...');
console.log(`POST ${BASE_URL}/api/recommend-adaptation`);

const targetMedium = {
  medium: 'film',
  format: 'short film',
  estimatedLength: {
    value: 15,
    unit: 'minutes'
  },
  platform: 'festival'
};

let adaptationData;
try {
  const adaptationResponse = await fetch(`${BASE_URL}/api/recommend-adaptation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creativeDNA: creativeDnaData,
      targetMedium: targetMedium
    }),
  });

  console.log(`HTTP Status: ${adaptationResponse.status} ${adaptationResponse.statusText}`);

  if (!adaptationResponse.ok) {
    const errorData = await adaptationResponse.json();
    console.error('✗ Adaptation recommendation failed:');
    console.error(JSON.stringify(errorData, null, 2));
    process.exit(1);
  }

  const responseData = await adaptationResponse.json();

  if (!responseData.success) {
    console.error('✗ Adaptation recommendation returned success: false');
    console.error(JSON.stringify(responseData, null, 2));
    process.exit(1);
  }

  adaptationData = responseData.data;
  console.log('✓ Adaptation recommendations generated successfully');
  console.log(`  - Recommendation ID: ${adaptationData.id}`);
  console.log(`  - Total recommendations: ${adaptationData.recommendations.length}`);
  console.log();

} catch (error) {
  console.error('✗ Unexpected error in adaptation recommendations:', error.message);
  process.exit(1);
}

// Step 4: Prepare decisions (first 3 accepted, next 1 rejected, rest pending)
console.log('Step 4: Preparing recommendation decisions...');
const decisions = {};
const recommendations = adaptationData.recommendations;

recommendations.forEach((rec, index) => {
  if (index < 3) {
    decisions[rec.recommendationId] = 'accepted';
  } else if (index === 3) {
    decisions[rec.recommendationId] = 'rejected';
  }
  // All others remain undefined (pending)
});

const acceptedCount = Object.values(decisions).filter(d => d === 'accepted').length;
const rejectedCount = Object.values(decisions).filter(d => d === 'rejected').length;
const pendingCount = recommendations.length - acceptedCount - rejectedCount;

console.log(`✓ Decisions prepared:`);
console.log(`  - Accepted: ${acceptedCount}`);
console.log(`  - Rejected: ${rejectedCount}`);
console.log(`  - Pending: ${pendingCount}`);
console.log();

// Step 5: Generate Production Blueprint
console.log('Step 5: Generating production blueprint...');
console.log(`POST ${BASE_URL}/api/generate-production-blueprint`);

const blueprintTargetMedium = {
  format: 'short-film',
  platform: 'festival',
  duration: {
    minimumSeconds: 540,  // 9 minutes
    maximumSeconds: 900   // 15 minutes
  },
  additionalContext: '15-minute festival short film'
};

try {
  const blueprintResponse = await fetch(`${BASE_URL}/api/generate-production-blueprint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creativeDNA: creativeDnaData,
      adaptationPlan: adaptationData,
      decisions: decisions,
      targetMedium: blueprintTargetMedium
    }),
  });

  console.log(`HTTP Status: ${blueprintResponse.status} ${blueprintResponse.statusText}`);

  if (!blueprintResponse.ok) {
    const errorData = await blueprintResponse.json();
    console.error('✗ Production blueprint generation failed:');
    console.error(JSON.stringify(errorData, null, 2));
    process.exit(1);
  }

  const responseData = await blueprintResponse.json();

  if (!responseData.success) {
    console.error('✗ Production blueprint returned success: false');
    console.error(JSON.stringify(responseData, null, 2));
    process.exit(1);
  }

  const blueprintData = responseData.data;
  console.log('✓ Production blueprint generated successfully');
  console.log();

  // Print safe metadata only
  console.log('='.repeat(80));
  console.log('PRODUCTION BLUEPRINT METADATA');
  console.log('='.repeat(80));
  console.log();
  console.log(`Blueprint ID: ${blueprintData.blueprintId}`);
  console.log(`Source Title: ${blueprintData.sourceTitle}`);
  console.log(`Created At: ${blueprintData.createdAt}`);
  console.log();
  
  console.log('Scene Roadmap:');
  console.log(`  - Scene count: ${blueprintData.sceneRoadmap?.length || 0}`);
  
  if (blueprintData.sceneRoadmap && blueprintData.sceneRoadmap.length > 0) {
    const totalSeconds = blueprintData.sceneRoadmap.reduce((sum, scene) => {
      return sum + (scene.estimatedDurationSeconds || 0);
    }, 0);
    const totalMinutes = (totalSeconds / 60).toFixed(1);
    console.log(`  - Total estimated runtime: ${totalSeconds} seconds (${totalMinutes} minutes)`);
  }
  console.log();

  console.log('Decision Summary:');
  console.log(`  - Total recommendations reviewed: ${blueprintData.decisionSummary?.totalRecommendationsReviewed || 0}`);
  console.log(`  - Accepted: ${blueprintData.decisionSummary?.acceptedCount || 0}`);
  console.log(`  - Rejected: ${blueprintData.decisionSummary?.rejectedCount || 0}`);
  console.log(`  - Pending: ${blueprintData.decisionSummary?.pendingCount || 0}`);
  console.log();

  console.log('Target Medium:');
  console.log(`  - Format: ${blueprintData.targetMedium?.format || 'N/A'}`);
  console.log(`  - Platform: ${blueprintData.targetMedium?.platform || 'N/A'}`);
  console.log(`  - Duration: ${blueprintData.targetDuration?.minimumMinutes || 0}-${blueprintData.targetDuration?.maximumMinutes || 0} minutes`);
  console.log();

  console.log('='.repeat(80));
  console.log('✓ PRODUCTION BLUEPRINT PIPELINE TEST COMPLETED SUCCESSFULLY');
  console.log('='.repeat(80));

} catch (error) {
  console.error('✗ Unexpected error in production blueprint generation:', error.message);
  console.error(error.stack);
  process.exit(1);
}

// Made with Bob