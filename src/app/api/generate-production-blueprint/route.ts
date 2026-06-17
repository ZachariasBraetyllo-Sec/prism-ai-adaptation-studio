import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

// Initialize Ajv with JSON Schema Draft 2020-12 support
const ajv = new Ajv2020({
  strict: false,
  allErrors: true,
  verbose: true,
});
addFormats(ajv);

// Load and compile schemas
let validateCreativeDNA: any;
let validateAdaptationRecommendation: any;
let validateProductionBlueprint: any;

try {
  const creativeDnaSchemaPath = join(process.cwd(), 'schemas', 'creative_dna.schema.json');
  const creativeDnaSchema = JSON.parse(readFileSync(creativeDnaSchemaPath, 'utf-8'));
  validateCreativeDNA = ajv.compile(creativeDnaSchema);

  const adaptationSchemaPath = join(process.cwd(), 'schemas', 'adaptation_recommendation.schema.json');
  const adaptationSchema = JSON.parse(readFileSync(adaptationSchemaPath, 'utf-8'));
  validateAdaptationRecommendation = ajv.compile(adaptationSchema);

  const blueprintSchemaPath = join(process.cwd(), 'schemas', 'production_blueprint.schema.json');
  const blueprintSchema = JSON.parse(readFileSync(blueprintSchemaPath, 'utf-8'));
  validateProductionBlueprint = ajv.compile(blueprintSchema);
} catch (error) {
  console.error('Failed to load schemas:', error);
}

// Helper function to get IAM access token
async function getIAMToken(apiKey: string): Promise<string> {
  const iamTokenUrl = 'https://iam.cloud.ibm.com/identity/token';
  const tokenParams = new URLSearchParams({
    grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
    apikey: apiKey,
  });

  const tokenResponse = await fetch(iamTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: tokenParams.toString(),
  });

  if (!tokenResponse.ok) {
    throw new Error(`IAM token request failed: ${tokenResponse.status}`);
  }

  // Read and parse IAM response with error handling
  const tokenText = await tokenResponse.text();
  let tokenData: any;
  try {
    tokenData = JSON.parse(tokenText);
  } catch (error) {
    console.error('Failed to parse IAM token response:');
    console.error('HTTP Status:', tokenResponse.status);
    console.error('Response preview:', tokenText.substring(0, 200));
    throw new Error('Invalid IAM token response format');
  }

  if (!tokenData.access_token) {
    throw new Error('No access token received from IAM');
  }

  return tokenData.access_token;
}

// Helper function to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof str === 'string' && uuidRegex.test(str);
}

// Helper function to check if demo mode should be used
function shouldUseDemoMode(creativeDNA: any): boolean {
  const demoMode = process.env.PRISM_DEMO_MODE === 'true';
  const isDemoStory = creativeDNA?.sourceWork?.title?.includes('The Last Bloom') ||
                      creativeDNA?.coreElements?.premise?.includes('memory orchid') ||
                      creativeDNA?.coreElements?.premise?.includes('Maya');
  return demoMode && isDemoStory;
}

// Helper function to load demo fixture
function loadDemoFixture(fixtureName: string): any {
  try {
    const fixturePath = join(process.cwd(), 'src', 'data', 'demo', `${fixtureName}.json`);
    const fixtureData = readFileSync(fixturePath, 'utf-8');
    return JSON.parse(fixtureData);
  } catch (error) {
    console.error(`Failed to load demo fixture ${fixtureName}:`, error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Read and parse request body with error handling
    const requestText = await request.text();
    let body: any;
    try {
      body = JSON.parse(requestText);
    } catch (error) {
      console.error('Failed to parse request body:');
      console.error('Error:', error instanceof Error ? error.message : 'Unknown');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body format'
        },
        { status: 400 }
      );
    }

    const { creativeDNA, adaptationPlan, decisions, targetMedium } = body;

    // Validate required fields
    if (!creativeDNA || typeof creativeDNA !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid creativeDNA in request body'
        },
        { status: 400 }
      );
    }

    if (!adaptationPlan || typeof adaptationPlan !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid adaptationPlan in request body'
        },
        { status: 400 }
      );
    }

    if (!decisions || typeof decisions !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid decisions in request body'
        },
        { status: 400 }
      );
    }

    if (!targetMedium || typeof targetMedium !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid targetMedium in request body'
        },
        { status: 400 }
      );
    }

    // Validate Creative DNA against schema
    if (!validateCreativeDNA) {
      return NextResponse.json(
        {
          success: false,
          error: 'Schema validation unavailable',
          details: 'Creative DNA schema failed to load'
        },
        { status: 500 }
      );
    }

    const isValidCreativeDNA = validateCreativeDNA(creativeDNA);
    if (!isValidCreativeDNA) {
      const errors = validateCreativeDNA.errors?.map((err: any) => {
        const path = err.instancePath || 'root';
        const message = err.message || 'validation failed';
        return `${path}: ${message}`;
      }) || ['Unknown validation error'];

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Creative DNA format',
          validationErrors: errors
        },
        { status: 400 }
      );
    }

    // Validate Adaptation Plan against schema
    if (!validateAdaptationRecommendation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Schema validation unavailable',
          details: 'Adaptation Recommendation schema failed to load'
        },
        { status: 500 }
      );
    }

    const isValidAdaptationPlan = validateAdaptationRecommendation(adaptationPlan);
    if (!isValidAdaptationPlan) {
      const errors = validateAdaptationRecommendation.errors?.map((err: any) => {
        const path = err.instancePath || 'root';
        const message = err.message || 'validation failed';
        return `${path}: ${message}`;
      }) || ['Unknown validation error'];

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Adaptation Plan format',
          validationErrors: errors
        },
        { status: 400 }
      );
    }

    // Split recommendations by decision status
    const recommendations = adaptationPlan.recommendations || [];
    const accepted: any[] = [];
    const rejected: any[] = [];
    const pending: any[] = [];

    recommendations.forEach((rec: any) => {
      const recId = rec.recommendationId;
      const decision = decisions[recId];

      if (decision === 'accepted') {
        accepted.push(rec);
      } else if (decision === 'rejected') {
        rejected.push(rec);
      } else {
        pending.push(rec);
      }
    });

    // Require at least one accepted recommendation
    if (accepted.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one accepted recommendation is required'
        },
        { status: 400 }
      );
    }

    // Check if demo mode should be used
    if (shouldUseDemoMode(creativeDNA)) {
      console.log('Using demo mode for Production Blueprint generation');
      const demoData = loadDemoFixture('production-blueprint');
      
      if (demoData) {
        return NextResponse.json({
          success: true,
          data: demoData,
          mode: 'demo'
        });
      } else {
        console.warn('Demo fixture not available, falling back to live AI');
      }
    }

    // Read environment variables
    const apiKey = process.env.WATSONX_API_KEY;
    const projectId = process.env.WATSONX_PROJECT_ID;
    const watsonxUrl = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';

    if (!apiKey || !projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: Missing watsonx.ai credentials'
        },
        { status: 500 }
      );
    }

    // Read the Production Blueprint system prompt
    const promptPath = join(process.cwd(), 'prompts', 'production-blueprint-system-prompt.md');
    let systemPrompt: string;
    
    try {
      systemPrompt = readFileSync(promptPath, 'utf-8');
    } catch (error) {
      console.error('Failed to read system prompt:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: System prompt not found'
        },
        { status: 500 }
      );
    }

    // Get IAM access token
    let accessToken: string;
    try {
      accessToken = await getIAMToken(apiKey);
    } catch (error) {
      console.error('IAM token error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 401 }
      );
    }

    // Prepare compact context for the AI
    const userMessage = `## Creative DNA Summary

Source: ${creativeDNA.sourceWork?.title || 'Unknown'}
Premise: ${creativeDNA.coreElements?.premise || 'Not specified'}
Central Conflict: ${creativeDNA.coreElements?.centralConflict || 'Not specified'}
Primary Themes: ${creativeDNA.thematicElements?.primaryThemes?.join(', ') || 'Not specified'}

## Target Medium

${JSON.stringify(targetMedium, null, 2)}

## Accepted Recommendations (${accepted.length})

${accepted.map((rec: any) => `- [${rec.recommendationId}] ${rec.title}: ${rec.proposedChange}`).join('\n')}

## Rejected Recommendations (${rejected.length})

${rejected.map((rec: any) => `- [${rec.recommendationId}] ${rec.title}: ${rec.proposedChange}`).join('\n')}

## Pending Recommendations (${pending.length})

${pending.map((rec: any) => `- [${rec.recommendationId}] ${rec.title}: ${rec.proposedChange}`).join('\n')}

## Your Response

Generate a complete Production Blueprint in valid JSON format matching the Production Blueprint schema. Include exactly 6-10 scenes in sceneRoadmap. Preserve all recommendation UUIDs exactly as provided. No markdown, no explanations, no additional text.`;

    // Prepare request to watsonx.ai using chat API
    const modelId = 'ibm/granite-4-h-small';
    const endpoint = `${watsonxUrl}/ml/v1/text/chat?version=2023-05-29`;

    const requestBody = {
      model_id: modelId,
      project_id: projectId,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 6000,
      temperature: 0.1,
      top_p: 0.95,
      repetition_penalty: 1.1,
      response_format: {
        type: 'json_object'
      }
    };

    // Call watsonx.ai
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('watsonx.ai API error:');
      console.error('Status:', response.status);
      console.error('Response body:', errorText);

      // Check for quota exceeded error and fall back to demo if available
      if (response.status === 403 && errorText.includes('token_quota_reached')) {
        console.log('Token quota exceeded, attempting demo fallback');
        if (shouldUseDemoMode(creativeDNA)) {
          const demoData = loadDemoFixture('production-blueprint');
          if (demoData) {
            console.log('Using demo fixture due to quota limit');
            return NextResponse.json({
              success: true,
              data: demoData,
              mode: 'demo',
              reason: 'quota_exceeded'
            });
          }
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: 'AI analysis failed',
          status: response.status,
          details: 'Check server terminal for full error details'
        },
        { status: response.status }
      );
    }

    // Read response as text first
    const responseText = await response.text();
    
    // Parse watsonx response with error handling
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse watsonx.ai response:');
      console.error('HTTP Status:', response.status);
      console.error('Response preview:', responseText.substring(0, 500));
      
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid response from AI service'
        },
        { status: 502 }
      );
    }

    const generatedText = data.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      return NextResponse.json(
        {
          success: false,
          error: 'No response generated from AI model'
        },
        { status: 500 }
      );
    }

    // Log watsonx result metadata for debugging
    const stopReason = data.choices?.[0]?.finish_reason;
    const generatedTokenCount = data.usage?.completion_tokens;
    const inputTokenCount = data.usage?.prompt_tokens;
    const generatedTextLength = generatedText.length;

    console.log('watsonx.ai result metadata:');
    console.log('- stop_reason:', stopReason);
    console.log('- generated_token_count:', generatedTokenCount);
    console.log('- input_token_count:', inputTokenCount);
    console.log('- generated_text_length:', generatedTextLength);

    // Check if output was truncated due to token limits
    if (stopReason === 'max_tokens' || stopReason === 'length') {
      console.error('Model output truncated due to token limit');
      return NextResponse.json(
        {
          success: false,
          error: 'Model output was incomplete due to token limit'
        },
        { status: 502 }
      );
    }

    // Check if JSON appears visibly truncated (doesn't end with closing brace)
    const trimmedText = generatedText.trim();
    if (!trimmedText.endsWith('}') && !trimmedText.endsWith(']')) {
      console.error('Generated text appears truncated (no closing brace/bracket)');
      return NextResponse.json(
        {
          success: false,
          error: 'Model output was incomplete'
        },
        { status: 502 }
      );
    }

    // Parse the JSON response (with json_object format, should be clean JSON)
    let productionBlueprint: any;
    try {
      productionBlueprint = JSON.parse(generatedText);
    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('Generated text:', generatedText.substring(0, 500));
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse AI response as JSON',
          details: error instanceof Error ? error.message : 'Invalid JSON format'
        },
        { status: 500 }
      );
    }

    // Normalize only missing or invalid blueprintId
    if (!productionBlueprint.blueprintId || !isValidUUID(productionBlueprint.blueprintId)) {
      productionBlueprint.blueprintId = crypto.randomUUID();
      console.log('Generated blueprintId:', productionBlueprint.blueprintId);
    }

    // Normalize productionConsiderations.essentialNeeds[].category
    if (productionBlueprint.productionConsiderations?.essentialNeeds) {
      const allowedCategories = [
        'location', 'cast', 'props', 'wardrobe', 'lighting', 'sound',
        'visual-effects', 'special-effects', 'blocking', 'weather',
        'continuity', 'accessibility', 'other'
      ];

      const categoryMappings: Record<string, string> = {
        'locations': 'location',
        'setting': 'location',
        'venue': 'location',
        'casting': 'cast',
        'actors': 'cast',
        'talent': 'cast',
        'prop': 'props',
        'costume': 'wardrobe',
        'costumes': 'wardrobe',
        'audio': 'sound',
        'vfx': 'visual-effects',
        'visual-effects-requirements': 'visual-effects',
        'sfx': 'special-effects',
        'practical-effects': 'special-effects',
        'choreography': 'blocking',
        'staging': 'blocking',
        'access': 'accessibility'
      };

      productionBlueprint.productionConsiderations.essentialNeeds.forEach((need: any) => {
        if (need.category && typeof need.category === 'string') {
          // Lowercase, trim, convert spaces/underscores to hyphens
          let normalized = need.category.toLowerCase().trim().replace(/[\s_]+/g, '-');
          
          // Check if already valid
          if (allowedCategories.includes(normalized)) {
            need.category = normalized;
          } else if (categoryMappings[normalized]) {
            // Apply mapping
            need.category = categoryMappings[normalized];
          } else {
            // Use "other" as fallback
            need.category = 'other';
          }
        }
      });
    }

    // Validate the Production Blueprint against schema using Ajv
    if (!validateProductionBlueprint) {
      return NextResponse.json(
        {
          success: false,
          error: 'Schema validation unavailable',
          details: 'Production Blueprint schema failed to load'
        },
        { status: 500 }
      );
    }

    let isValid = validateProductionBlueprint(productionBlueprint);
    
    if (!isValid) {
      const errors = validateProductionBlueprint.errors?.map((err: any) => {
        const path = err.instancePath || 'root';
        const message = err.message || 'validation failed';
        const params = err.params ? JSON.stringify(err.params) : '';
        return `${path}: ${message}${params ? ` (${params})` : ''}`;
      }) || ['Unknown validation error'];

      console.error('Initial schema validation errors:', errors);

      // Attempt automatic correction
      console.log('Attempting automatic schema correction...');

      // Build enum guidance from schema
      const enumGuidance = `
CRITICAL ENUM VALUES (use EXACTLY as written):

sceneRoadmap[].narrativePurpose:
- "establish-protagonist" | "introduce-central-conflict" | "reveal-key-relationship" | "create-midpoint-shift" | "intensify-emotional-pressure" | "resolve-central-question" | "establish-setting" | "reveal-stakes" | "create-turning-point" | "escalate-tension" | "establish-theme" | "other"

sceneRoadmap[].creativeDNAElements[].element:
- "premise" | "central-conflict" | "character-arc" | "primary-theme" | "emotional-tone" | "key-symbol" | "narrative-turning-point" | "relationship-dynamic" | "motivation" | "worldview" | "other"

characterPriorities[].creativeDNAProtected[].element:
- "archetype" | "arc" | "relationship" | "theme" | "conflict" | "emotional-function" | "motivation" | "other"

sonicLanguage.dialogueDensity:
- "dialogue-heavy" | "dialogue-moderate" | "dialogue-light" | "mostly-silent" | "varied"

targetMedium.format:
- "short-film" | "short-series" | "web-series" | "social-media" | "experimental" | "interactive" | "other"

targetMedium.platform:
- "theatrical" | "streaming" | "broadcast" | "festival" | "online" | "social-media" | "art-installation" | "other"

CRITICAL PROPERTY NAMES:
- visualLanguage.meaningfulObjects[] MUST use "narrative_significance" (snake_case with underscore)
- Do NOT use "narrativeSignificance" or any other variation
`;

      const correctionPrompt = `The following Production Blueprint JSON failed schema validation. Fix ALL validation errors and return the complete corrected JSON.

VALIDATION ERRORS:
${errors.join('\n')}

${enumGuidance}

INVALID BLUEPRINT:
${JSON.stringify(productionBlueprint, null, 2)}

INSTRUCTIONS:
1. Fix all enum values to match the exact allowed values listed above
2. Fix all property names (especially "narrative_significance")
3. Preserve ALL recommendation UUIDs exactly as provided
4. Do NOT add, remove, or reinterpret any accepted/rejected/pending decisions
5. Return ONLY the complete corrected JSON, no explanations or markdown`;

      try {
        const correctionResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            model_id: modelId,
            project_id: projectId,
            messages: [
              {
                role: 'user',
                content: correctionPrompt
              }
            ],
            max_tokens: 6000,
            temperature: 0.1,
            top_p: 0.95,
            repetition_penalty: 1.1,
            response_format: {
              type: 'json_object'
            }
          }),
        });

        if (!correctionResponse.ok) {
          console.error('Correction request failed:', correctionResponse.status);
          return NextResponse.json(
            {
              success: false,
              error: 'AI response does not match Production Blueprint schema',
              validationErrors: errors
            },
            { status: 422 }
          );
        }

        const correctionText = await correctionResponse.text();
        const correctionData = JSON.parse(correctionText);
        const correctedText = correctionData.choices?.[0]?.message?.content?.trim();

        if (!correctedText) {
          console.error('No correction generated');
          return NextResponse.json(
            {
              success: false,
              error: 'AI response does not match Production Blueprint schema',
              validationErrors: errors
            },
            { status: 422 }
          );
        }

        // Parse corrected blueprint
        let correctedBlueprint: any;
        try {
          correctedBlueprint = JSON.parse(correctedText);
        } catch (error) {
          console.error('Failed to parse corrected blueprint');
          return NextResponse.json(
            {
              success: false,
              error: 'AI response does not match Production Blueprint schema',
              validationErrors: errors
            },
            { status: 422 }
          );
        }

        // Preserve blueprintId if it was valid
        if (productionBlueprint.blueprintId && isValidUUID(productionBlueprint.blueprintId)) {
          correctedBlueprint.blueprintId = productionBlueprint.blueprintId;
        } else if (!correctedBlueprint.blueprintId || !isValidUUID(correctedBlueprint.blueprintId)) {
          correctedBlueprint.blueprintId = crypto.randomUUID();
        }

        // Validate corrected blueprint
        isValid = validateProductionBlueprint(correctedBlueprint);

        if (isValid) {
          console.log('✓ Automatic correction successful');
          productionBlueprint = correctedBlueprint;
        } else {
          const correctionErrors = validateProductionBlueprint.errors?.map((err: any) => {
            const path = err.instancePath || 'root';
            const message = err.message || 'validation failed';
            return `${path}: ${message}`;
          }) || ['Unknown validation error'];

          console.error('Correction still invalid:', correctionErrors);
          
          return NextResponse.json(
            {
              success: false,
              error: 'AI response does not match Production Blueprint schema after correction attempt',
              validationErrors: correctionErrors
            },
            { status: 422 }
          );
        }

      } catch (error) {
        console.error('Correction attempt failed:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'AI response does not match Production Blueprint schema',
            validationErrors: errors
          },
          { status: 422 }
        );
      }
    }

    // Success - return the validated Production Blueprint
    return NextResponse.json({
      success: true,
      data: productionBlueprint
    });

  } catch (error) {
    console.error('Unexpected error in Production Blueprint generation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Made with Bob