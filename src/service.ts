export const fetchOptimizationResults = async (
  prompt: string,
  apiKey: string
) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  const result = await response.json();
  return result;
};

export const testFetchWithApiKey = async (apiKey: string) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Hello, I'm a test prompt.",
              },
            ],
          },
        ],
      }),
    }
  );

  const result: any = await response.json();
  return result.candidates[0].content.parts[0].text;
};
