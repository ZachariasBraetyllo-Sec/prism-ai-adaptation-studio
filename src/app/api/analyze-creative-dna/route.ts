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

// Load and compile Creative DNA schema
let validateCreativeDNA: any;
try {
  const schemaPath = join(process.cwd(), 'schemas', 'creative_dna.schema.json');
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  validateCreativeDNA = ajv.compile(schema);
} catch (error) {
  console.error('Failed to load Creative DNA schema:', error);
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

// Helper function to check if demo mode should be used
function shouldUseDemoMode(sourceText: string): boolean {
  const demoMode = process.env.PRISM_DEMO_MODE === 'true';
  const isDemoStory = sourceText.includes('The Last Bloom') ||
                      sourceText.includes('memory orchid') ||
                      sourceText.includes('Maya');
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

    const { sourceText } = body;

    if (!sourceText || typeof sourceText !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid sourceText in request body'
        },
        { status: 400 }
      );
    }

    // Check if demo mode should be used
    if (shouldUseDemoMode(sourceText)) {
      console.log('Using demo mode for Creative DNA analysis');
      const demoData = loadDemoFixture('creative-dna');
      
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

    // Read the Creative DNA system prompt
    const promptPath = join(process.cwd(), 'prompts', 'creative-dna-system-prompt.md');
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
          content: `## Source Text to Analyze

${sourceText}

## Your Response

Return ONLY valid JSON matching the Creative DNA schema. No markdown, no explanations, no additional text.`
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

      // Check for quota exceeded error and fall back to demo if available
      if (response.status === 403 && errorText.includes('token_quota_reached')) {
        console.log('Token quota exceeded, attempting demo fallback');
        const isDemoStory = sourceText.includes('The Last Bloom') ||
                            sourceText.includes('memory orchid') ||
                            sourceText.includes('Maya');
        
        if (isDemoStory) {
          const demoData = loadDemoFixture('creative-dna');
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
      // Log server-side for debugging (safe preview, no credentials)
      console.error('Failed to parse watsonx.ai response:');
      console.error('HTTP Status:', response.status);
      console.error('Parse Error:', error instanceof Error ? error.message : 'Unknown');
      console.error('Response preview (first 300 chars):', responseText.substring(0, 300));
      
      // Return concise error to client
      return NextResponse.json(
        {
          success: false,
          error: 'AI service returned invalid response format'
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
    let creativeDNA: any;
    try {
      creativeDNA = JSON.parse(generatedText);
    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('Generated text:', generatedText.substring(0, 500));
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse AI response as JSON',
          details: error instanceof Error ? error.message : 'Invalid JSON format',
          preview: generatedText.substring(0, 200) + '...'
        },
        { status: 500 }
      );
    }

    // Normalize character roles before validation
    if (creativeDNA.characterArchetypes && Array.isArray(creativeDNA.characterArchetypes)) {
      creativeDNA.characterArchetypes.forEach((char: any) => {
        if (char.role && typeof char.role === 'string') {
          const role = char.role.toLowerCase();
          
          // Map common variations to allowed enum values
          if (['posthumous_supporter', 'mentor', 'ally', 'deuteragonist'].includes(role)) {
            char.role = 'supporting';
          } else if (role === 'villain') {
            char.role = 'antagonist';
          } else if (['lead', 'main_character'].includes(role)) {
            char.role = 'protagonist';
          } else if (['background', 'cameo'].includes(role)) {
            char.role = 'minor';
          }
          // Leave already-valid values unchanged
        }
      });
    }

    // Validate the Creative DNA against schema using Ajv
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

    const isValid = validateCreativeDNA(creativeDNA);
    
    if (!isValid) {
      const errors = validateCreativeDNA.errors?.map((err: any) => {
        const path = err.instancePath || 'root';
        const message = err.message || 'validation failed';
        return `${path}: ${message}`;
      }) || ['Unknown validation error'];

      console.error('Schema validation errors:', errors);
      console.log('Attempting automatic correction...');

      // Attempt automatic correction
      try {
        const correctionPrompt = `The following JSON failed schema validation. Fix ALL errors and return the complete corrected JSON only. No explanations, no markdown.

INVALID JSON:
${JSON.stringify(creativeDNA, null, 2)}

VALIDATION ERRORS:
${errors.join('\n')}

Return the complete corrected JSON that passes validation.`;

        const correctionRequestBody = {
          model_id: modelId,
          project_id: projectId,
          messages: [
            {
              role: 'user',
              content: correctionPrompt
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

        const correctionResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(correctionRequestBody),
        });

        if (correctionResponse.ok) {
          const correctionResponseText = await correctionResponse.text();
          let correctionData: any;
          
          try {
            correctionData = JSON.parse(correctionResponseText);
          } catch (parseError) {
            console.error('Failed to parse correction response');
            throw new Error('Correction response parse failed');
          }

          const correctedText = correctionData.choices?.[0]?.message?.content?.trim();
          
          if (correctedText) {
            let correctedCreativeDNA: any;
            try {
              correctedCreativeDNA = JSON.parse(correctedText);
            } catch (parseError) {
              console.error('Failed to parse corrected JSON');
              throw new Error('Corrected JSON parse failed');
            }

            // Validate corrected result
            const isCorrectedValid = validateCreativeDNA(correctedCreativeDNA);
            
            if (isCorrectedValid) {
              console.log('✓ Automatic correction successful');
              return NextResponse.json({
                success: true,
                data: correctedCreativeDNA,
                corrected: true
              });
            } else {
              const correctedErrors = validateCreativeDNA.errors?.map((err: any) => {
                const path = err.instancePath || 'root';
                const message = err.message || 'validation failed';
                return `${path}: ${message}`;
              }) || ['Unknown validation error'];
              
              console.error('Correction still has validation errors:', correctedErrors);
            }
          }
        }
      } catch (correctionError) {
        console.error('Automatic correction failed:', correctionError);
      }

      // If correction failed or still invalid, return 422
      return NextResponse.json(
        {
          success: false,
          error: 'AI response does not match Creative DNA schema',
          validationErrors: errors
        },
        { status: 422 }
      );
    }

    // Success - return the validated Creative DNA
    return NextResponse.json({
      success: true,
      data: creativeDNA
    });

  } catch (error) {
    console.error('Unexpected error in Creative DNA analysis:', error);
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
