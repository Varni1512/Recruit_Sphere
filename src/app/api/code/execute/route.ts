import { NextRequest, NextResponse } from "next/server";

const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python: 100, // Python 3.12.5
  cpp: 105,    // C++ (GCC 14.1.0)
  c: 103,      // C (GCC 14.1.0)
  java: 91,    // Java (JDK 17.0.6)
  javascript: 102, // JavaScript (Node.js 22.08.0)
  go: 106,     // Go 1.22.0
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, testCases } = body;

    if (!language || !code || !testCases || !Array.isArray(testCases)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const languageId = JUDGE0_LANGUAGE_IDS[language];
    
    if (!languageId) {
      return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
    }

    const results = [];

    // Evaluate each test case
    for (const testCase of testCases) {
      const payload = {
        language_id: languageId,
        source_code: code,
        stdin: testCase.input,
      };

      const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Execution API Error: ${response.statusText}`);
      }

      const result = await response.json();
      
      const output = result.stdout || result.stderr || result.compile_output || "";
      const actualOutput = output.trim();
      const expectedOutput = testCase.expectedOutput.trim();

      results.push({
        input: testCase.input,
        expectedOutput,
        actualOutput,
        passed: actualOutput === expectedOutput && result.status?.id === 3,
        error: result.stderr || result.compile_output || null,
        isHidden: testCase.isHidden
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Code execution error:", error);
    return NextResponse.json({ error: error.message || "Failed to execute code" }, { status: 500 });
  }
}
