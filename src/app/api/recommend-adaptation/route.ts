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

try {
  const creativeDnaSchemaPath = join(process.cwd(), 'schemas', 'creative_dna.schema.json');
  const creativeDnaSchema = JSON.parse(readFileSync(creativeDnaSchemaPath, 'utf-8'));
  validateCreativeDNA = ajv.compile(creativeDnaSchema);

  const adaptationSchemaPath = join(process.cwd(), 'schemas', 'adaptation_recommendation.schema.json');
  const adaptationSchema = JSON.parse(readFileSync(adaptationSchemaPath, 'utf-8'));
  validateAdaptationRecommendation = ajv.compile(adaptationSchema);
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

    const { creativeDNA, targetMedium } = body;

    // Validate Creative DNA input
    if (!creativeDNA || typeof creativeDNA !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid creativeDNA in request body'
        },
        { status: 400 }
      );
    }

    // Validate target medium
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

    // Read the Adaptation Recommendation system prompt
    const promptPath = join(process.cwd(), 'prompts', 'adaptation-recommendation-system-prompt.md');
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

    // Prepare request to watsonx.ai using chat API
    const modelId = 'ibm/granite-4-h-small';
    const endpoint = `${watsonxUrl}/ml/v1/text/chat?version=2023-05-29`;

    const userMessage = `## Creative DNA Profile

${JSON.stringify(creativeDNA, null, 2)}

## Target Medium

${JSON.stringify(targetMedium, null, 2)}

## Your Response

Generate adaptation recommendations in valid JSON format matching the Adaptation Recommendations schema. No markdown, no explanations, no additional text.`;

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
      max_tokens: 4000,
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
    let adaptationRecommendation: any;
    try {
      adaptationRecommendation = JSON.parse(generatedText);
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

    // Normalize UUIDs before validation
    // Ensure top-level id is a valid UUID
    if (!adaptationRecommendation.id || !isValidUUID(adaptationRecommendation.id)) {
      adaptationRecommendation.id = crypto.randomUUID();
      console.log('Generated top-level id:', adaptationRecommendation.id);
    }

    // Ensure each recommendation has a valid UUID for recommendationId
    if (adaptationRecommendation.recommendations && Array.isArray(adaptationRecommendation.recommendations)) {
      adaptationRecommendation.recommendations.forEach((rec: any, index: number) => {
        if (!rec.recommendationId || !isValidUUID(rec.recommendationId)) {
          rec.recommendationId = crypto.randomUUID();
          console.log(`Generated recommendationId for recommendation ${index}:`, rec.recommendationId);
        }
      });
    }

    // Validate the Adaptation Recommendation against schema using Ajv
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

    const isValid = validateAdaptationRecommendation(adaptationRecommendation);
    
    if (!isValid) {
      const errors = validateAdaptationRecommendation.errors?.map((err: any) => {
        const path = err.instancePath || 'root';
        const message = err.message || 'validation failed';
        return `${path}: ${message}`;
      }) || ['Unknown validation error'];

      console.error('Schema validation errors:', errors);
      
      return NextResponse.json(
        {
          success: false,
          error: 'AI response does not match Adaptation Recommendation schema',
          validationErrors: errors
        },
        { status: 422 }
      );
    }

    // Success - return the validated Adaptation Recommendation
    return NextResponse.json({
      success: true,
      data: adaptationRecommendation
    });

  } catch (error) {
    console.error('Unexpected error in Adaptation Recommendation:', error);
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