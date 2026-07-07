import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    const { resolvedPrompt } = await request.json();

    let apiKey = '';
    
    // Force read directly from .env.local to completely bypass Next.js and system caching issues
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
        if (match && match[1]) {
          apiKey = match[1].trim();
        }
      }
    } catch (e) {
      console.error('Failed to read .env.local manually', e);
    }
    
    // Ultimate fallback if file reading fails
    if (!apiKey || apiKey === 'your_api_key_here') {
       apiKey = process.env.GEMINI_API_KEY;
    }
    
    console.log("SERVER API KEY:", apiKey ? apiKey.substring(0, 10) + "..." : "undefined");
    
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not set in environment variables.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let prompt = resolvedPrompt;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate summary' }, { status: 500 });
  }
}
