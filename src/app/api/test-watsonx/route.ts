import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Read environment variables
    const apiKey = process.env.WATSONX_API_KEY;
    const projectId = process.env.WATSONX_PROJECT_ID;
    const watsonxUrl = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';

    // Validate environment variables
    if (!apiKey || !projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required environment variables: WATSONX_API_KEY and/or WATSONX_PROJECT_ID'
        },
        { status: 500 }
      );
    }

    // Step 1: Exchange API key for IAM access token
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
      const errorText = await tokenResponse.text();
      console.error('IAM token error:', tokenResponse.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to obtain IAM token: ${tokenResponse.status}`,
          details: tokenResponse.status === 400 ? 'Invalid API key format' : 'Check server logs for details'
        },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No access token received from IAM'
        },
        { status: 500 }
      );
    }

    // Step 2: Use access token to call watsonx.ai
    // Using IBM Granite 3.0 8B Instruct - available in Dallas region
    const modelId = 'ibm/granite-3-8b-instruct';
    const endpoint = `${watsonxUrl}/ml/v1/text/generation?version=2023-05-29`;

    const requestBody = {
      input: 'Say "Hello from IBM Granite" in exactly 5 words.',
      model_id: modelId,
      project_id: projectId,
      parameters: {
        max_new_tokens: 20,
        temperature: 0.1,
      }
    };

    // Make request to watsonx.ai with IAM access token
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
      
      // Log full error details to server terminal only
      console.error('watsonx.ai API error:');
      console.error('Status:', response.status);
      console.error('Response body:', errorText);
      
      // Return generic error to browser (no sensitive details)
      let errorMessage = 'watsonx.ai API request failed';
      if (response.status === 401) {
        errorMessage = 'Authentication failed';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden - check project permissions';
      } else if (response.status === 404) {
        errorMessage = 'Model or endpoint not found';
      }
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          status: response.status,
          details: 'Check server terminal for full error details'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText = data.results?.[0]?.generated_text?.trim() || 'No response';

    // Return success with model info (no credentials exposed)
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to watsonx.ai',
      model: modelId,
      response: generatedText
    });

  } catch (error) {
    console.error('Error testing watsonx connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to watsonx.ai',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Made with Bob
