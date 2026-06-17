#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

console.log('='.repeat(80));
console.log('PRISM AI ADAPTATION PIPELINE TEST');
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

let creativeDnaResponse;
try {
  creativeDnaResponse = await fetch(`${BASE_URL}/api/analyze-creative-dna`, {
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

  const creativeDnaData = await creativeDnaResponse.json();
  
  if (!creativeDnaData.success) {
    console.error('✗ Creative DNA analysis returned success: false');
    console.error(JSON.stringify(creativeDnaData, null, 2));
    process.exit(1);
  }

  console.log('✓ Creative DNA analysis successful');
  console.log(`  - ID: ${creativeDnaData.data.id}`);
  console.log(`  - Title: ${creativeDnaData.data.sourceWork.title}`);
  console.log(`  - Medium: ${creativeDnaData.data.sourceWork.medium}`);
  console.log(`  - Genres: ${creativeDnaData.data.sourceWork.genre.join(', ')}`);
  console.log();

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

  const adaptationResponse = await fetch(`${BASE_URL}/api/recommend-adaptation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creativeDNA: creativeDnaData.data,
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

  const adaptationData = await adaptationResponse.json();

  if (!adaptationData.success) {
    console.error('✗ Adaptation recommendation returned success: false');
    console.error(JSON.stringify(adaptationData, null, 2));
    process.exit(1);
  }

  console.log('✓ Adaptation recommendations generated successfully');
  console.log();
  console.log('='.repeat(80));
  console.log('FINAL RESULT');
  console.log('='.repeat(80));
  console.log();
  console.log(`Recommendation ID: ${adaptationData.data.id}`);
  console.log(`Creative DNA ID: ${adaptationData.data.creativeDnaId}`);
  console.log(`Source: ${adaptationData.data.sourceWork.title} (${adaptationData.data.sourceWork.medium})`);
  console.log(`Target: ${adaptationData.data.targetMedium.format} (${adaptationData.data.targetMedium.estimatedLength.value} ${adaptationData.data.targetMedium.estimatedLength.unit})`);
  console.log(`Strategy: ${adaptationData.data.overallStrategy?.approach || 'N/A'}`);
  console.log(`Recommendations: ${adaptationData.data.recommendations.length}`);
  console.log();

  if (adaptationData.data.recommendations.length > 0) {
    console.log('Sample Recommendations:');
    adaptationData.data.recommendations.slice(0, 3).forEach((rec, idx) => {
      console.log(`  ${idx + 1}. [${rec.category}] ${rec.title}`);
      console.log(`     Confidence: ${rec.confidence.score.toFixed(2)}`);
      console.log(`     Status: ${rec.decisionStatus}`);
    });
    
    if (adaptationData.data.recommendations.length > 3) {
      console.log(`  ... and ${adaptationData.data.recommendations.length - 3} more`);
    }
  }

  console.log();
  console.log('Full response saved to: adaptation-result.json');
  
  // Save full result to file
  const { writeFileSync } = await import('fs');
  writeFileSync(
    join(__dirname, '..', 'adaptation-result.json'),
    JSON.stringify(adaptationData.data, null, 2)
  );

  console.log();
  console.log('='.repeat(80));
  console.log('✓ PIPELINE TEST COMPLETED SUCCESSFULLY');
  console.log('='.repeat(80));

} catch (error) {
  console.error('✗ Unexpected error:', error.message);
  console.error(error.stack);
  process.exit(1);
}

// Made with Bob
