export async function callGemini(
  prompt: string,
  jsonMode: boolean = false,
  systemInstruction?: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  // Using gemini-3.5-flash-lite as it is fast, highly accurate, and supports structured JSON outputs with active quota.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const payload: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {},
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  if (jsonMode) {
    payload.generationConfig.responseMimeType = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API HTTP Error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('Gemini API returned an empty content payload');
  }

  if (jsonMode) {
    try {
      return JSON.parse(text);
    } catch (parseError: any) {
      console.error('Failed to parse Gemini JSON output:', text);
      throw new Error(`JSON Parse Error: ${parseError.message}`);
    }
  }

  return text;
}
