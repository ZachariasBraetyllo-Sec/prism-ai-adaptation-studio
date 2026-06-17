'use client';

import { useState } from 'react';

export default function Home() {
  const [testResult, setTestResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  const testWatsonx = async () => {
    setTesting(true);
    setTestResult('Testing connection...');
    
    try {
      const response = await fetch('/api/test-watsonx');
      const data = await response.json();
      
      if (data.success) {
        setTestResult(`✓ Success! Connected to ${data.model}\nResponse: ${data.response}`);
      } else {
        setTestResult(`✗ Error: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      setTestResult(`✗ Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Prism AI Adaptation Studio
        </h1>
        <p className="text-center text-lg mb-4">
          AI-powered cross-medium adaptation studio built with IBM Bob and IBM Granite.
        </p>
        
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={testWatsonx}
            disabled={testing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? 'Testing...' : 'Test watsonx.ai Connection'}
          </button>
          
          {testResult && (
            <div className={`mt-4 p-4 rounded-lg max-w-2xl w-full ${
              testResult.startsWith('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Configure watsonx.ai credentials in <code className="font-mono font-bold">.env.local</code>
          </p>
        </div>
      </div>
    </main>
  );
}

// Made with Bob
