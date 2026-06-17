#!/usr/bin/env node

/**
 * Validate demo fixture files against their JSON schemas
 * Uses Ajv with JSON Schema Draft 2020-12
 */

import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Initialize Ajv with Draft 2020-12
const ajv = new Ajv2020({
  strict: true,
  allErrors: true,
  verbose: true,
  discriminator: true,
});
addFormats(ajv);

// Load schemas
const creativeDnaSchema = JSON.parse(
  readFileSync(join(rootDir, 'schemas/creative_dna.schema.json'), 'utf-8')
);
const adaptationSchema = JSON.parse(
  readFileSync(join(rootDir, 'schemas/adaptation_recommendation.schema.json'), 'utf-8')
);
const blueprintSchema = JSON.parse(
  readFileSync(join(rootDir, 'schemas/production_blueprint.schema.json'), 'utf-8')
);

// Load fixtures
const creativeDnaFixture = JSON.parse(
  readFileSync(join(rootDir, 'src/data/demo/creative-dna.json'), 'utf-8')
);
const adaptationFixture = JSON.parse(
  readFileSync(join(rootDir, 'src/data/demo/adaptation-plan.json'), 'utf-8')
);
const blueprintFixture = JSON.parse(
  readFileSync(join(rootDir, 'src/data/demo/production-blueprint.json'), 'utf-8')
);

// Compile validators
const validateCreativeDna = ajv.compile(creativeDnaSchema);
const validateAdaptation = ajv.compile(adaptationSchema);
const validateBlueprint = ajv.compile(blueprintSchema);

console.log('🔍 Validating Demo Fixtures\n');
console.log('=' .repeat(60));

let allValid = true;

// Validate Creative DNA
console.log('\n📊 Creative DNA Fixture');
console.log('-'.repeat(60));
const creativeDnaValid = validateCreativeDna(creativeDnaFixture);
if (creativeDnaValid) {
  console.log('✅ VALID');
} else {
  console.log('❌ INVALID');
  console.log('\nErrors:');
  validateCreativeDna.errors?.forEach((error, index) => {
    console.log(`\n${index + 1}. ${error.instancePath || '/'}`);
    console.log(`   ${error.message}`);
    if (error.params) {
      console.log(`   Params:`, JSON.stringify(error.params, null, 2));
    }
  });
  allValid = false;
}

// Validate Adaptation Plan
console.log('\n📋 Adaptation Plan Fixture');
console.log('-'.repeat(60));
const adaptationValid = validateAdaptation(adaptationFixture);
if (adaptationValid) {
  console.log('✅ VALID');
  console.log(`   - ${adaptationFixture.recommendations.length} recommendations`);
  console.log(`   - Creative DNA ID: ${adaptationFixture.creativeDnaId}`);
} else {
  console.log('❌ INVALID');
  console.log('\nErrors:');
  validateAdaptation.errors?.forEach((error, index) => {
    console.log(`\n${index + 1}. ${error.instancePath || '/'}`);
    console.log(`   ${error.message}`);
    if (error.params) {
      console.log(`   Params:`, JSON.stringify(error.params, null, 2));
    }
  });
  allValid = false;
}

// Validate Production Blueprint
console.log('\n🎬 Production Blueprint Fixture');
console.log('-'.repeat(60));
const blueprintValid = validateBlueprint(blueprintFixture);
if (blueprintValid) {
  console.log('✅ VALID');
  console.log(`   - ${blueprintFixture.sceneRoadmap.length} scenes`);
  console.log(`   - ${blueprintFixture.decisionSummary.acceptedCount} accepted recommendations`);
  console.log(`   - ${blueprintFixture.decisionSummary.rejectedCount} rejected recommendations`);
  console.log(`   - ${blueprintFixture.decisionSummary.pendingCount} pending recommendations`);
} else {
  console.log('❌ INVALID');
  console.log('\nErrors:');
  validateBlueprint.errors?.forEach((error, index) => {
    console.log(`\n${index + 1}. ${error.instancePath || '/'}`);
    console.log(`   ${error.message}`);
    if (error.params) {
      console.log(`   Params:`, JSON.stringify(error.params, null, 2));
    }
  });
  allValid = false;
}

// Check UUID consistency
console.log('\n🔗 UUID Consistency Check');
console.log('-'.repeat(60));

const creativeDnaId = creativeDnaFixture.id;
const adaptationCreativeDnaId = adaptationFixture.creativeDnaId;

if (creativeDnaId === adaptationCreativeDnaId) {
  console.log('✅ Creative DNA ID matches between fixtures');
  console.log(`   ID: ${creativeDnaId}`);
} else {
  console.log('❌ Creative DNA ID mismatch');
  console.log(`   Creative DNA: ${creativeDnaId}`);
  console.log(`   Adaptation Plan: ${adaptationCreativeDnaId}`);
  allValid = false;
}

// Check recommendation IDs
const recommendationIds = adaptationFixture.recommendations?.map(r => r.recommendationId) || [];
const acceptedIds = blueprintFixture.sceneRoadmap
  .flatMap(scene => scene.acceptedRecommendationIds || []);
const rejectedIds = []; // rejectedRecommendationRecord is optional in schema

console.log(`\n📝 Recommendation ID tracking:`);
console.log(`   Total recommendations: ${recommendationIds.length}`);
console.log(`   Referenced in scenes: ${new Set(acceptedIds).size}`);
console.log(`   Explicitly rejected: ${rejectedIds.length}`);

const allReferencedIds = [...acceptedIds, ...rejectedIds];
const missingIds = recommendationIds.filter(id => !allReferencedIds.includes(id));
const invalidIds = allReferencedIds.filter(id => !recommendationIds.includes(id));

if (missingIds.length > 0) {
  console.log(`\n⚠️  Recommendations not referenced in blueprint:`);
  missingIds.forEach(id => console.log(`   - ${id}`));
}

if (invalidIds.length > 0) {
  console.log(`\n❌ Invalid recommendation IDs in blueprint:`);
  invalidIds.forEach(id => console.log(`   - ${id}`));
  allValid = false;
}

// Summary
console.log('\n' + '='.repeat(60));
if (allValid) {
  console.log('✅ All fixtures are valid and consistent!');
  process.exit(0);
} else {
  console.log('❌ Validation failed. Please fix the errors above.');
  process.exit(1);
}

// Made with Bob
