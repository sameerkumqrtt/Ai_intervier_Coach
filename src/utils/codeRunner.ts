import { CodeExecutionResult, CodeExecutionDetail } from '../types';

/**
 * Safely evaluates JavaScript/TypeScript code against test cases.
 */
export function executeJavaScript(
  userCode: string,
  testCases: { id: string; input: string; expectedOutput: string }[]
): CodeExecutionResult {
  const startTime = performance.now();
  const consoleLogs: string[] = [];
  const details: CodeExecutionDetail[] = [];
  let passedCount = 0;

  // Custom logger
  const customConsole = {
    log: (...args: any[]) => {
      consoleLogs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    },
    error: (...args: any[]) => {
      consoleLogs.push('[ERROR] ' + args.map(a => String(a)).join(' '));
    }
  };

  try {
    // Extract function name or main function from userCode
    // Usually matching function functionName(...) or const functionName =
    let funcName = '';
    const fnMatch = userCode.match(/function\s+([a-zA-Z0-9_$]+)/);
    if (fnMatch) {
      funcName = fnMatch[1];
    } else {
      const constMatch = userCode.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/);
      if (constMatch) {
        funcName = constMatch[1];
      }
    }

    if (!funcName) {
      return {
        passedAll: false,
        totalTests: testCases.length,
        passedTests: 0,
        details: testCases.map(t => ({
          testId: t.id,
          input: t.input,
          expected: t.expectedOutput,
          actual: 'N/A',
          passed: false,
          error: 'Could not identify function name. Please define a named function e.g. function solve(...)'
        })),
        consoleLogs: ['[Error] Function name missing.'],
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    }

    // Build executable scope with user code and custom console
    // Wrapping user function call safely
    const wrappedCode = `
      ${userCode}
      return ${funcName};
    `;

    const createFn = new Function('console', wrappedCode);
    const fnToTest = createFn(customConsole);

    if (typeof fnToTest !== 'function') {
      throw new Error(`Symbol "${funcName}" is not a function.`);
    }

    // Run test cases
    for (const tc of testCases) {
      let testPassed = false;
      let actualOutputStr = '';
      let testError: string | undefined = undefined;

      try {
        // Parse input argument array from string, e.g. "[[2, 7, 11, 15], 9]" or '"https://..."'
        let args: any[] = [];
        try {
          const parsed = JSON.parse(tc.input);
          args = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          args = [tc.input];
        }

        const rawResult = fnToTest(...args);
        actualOutputStr = typeof rawResult === 'object' ? JSON.stringify(rawResult) : String(rawResult);

        // Standardize normalization for JSON matching (e.g. [0,1] vs [0, 1])
        const normActual = normalizeOutput(actualOutputStr);
        const normExpected = normalizeOutput(tc.expectedOutput);

        testPassed = normActual === normExpected;
      } catch (err: any) {
        testError = err?.message || String(err);
        actualOutputStr = `Runtime Error: ${testError}`;
        testPassed = false;
      }

      if (testPassed) {
        passedCount++;
      }

      details.push({
        testId: tc.id,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: actualOutputStr,
        passed: testPassed,
        error: testError,
      });
    }

  } catch (globalErr: any) {
    const errMsg = globalErr?.message || String(globalErr);
    consoleLogs.push(`Compilation / Execution Error: ${errMsg}`);
    return {
      passedAll: false,
      totalTests: testCases.length,
      passedTests: 0,
      details: testCases.map(t => ({
        testId: t.id,
        input: t.input,
        expected: t.expectedOutput,
        actual: 'Error',
        passed: false,
        error: errMsg
      })),
      consoleLogs,
      executionTimeMs: Math.round(performance.now() - startTime)
    };
  }

  const endTime = performance.now();

  return {
    passedAll: passedCount === testCases.length && testCases.length > 0,
    totalTests: testCases.length,
    passedTests: passedCount,
    details,
    consoleLogs,
    executionTimeMs: Math.round(endTime - startTime)
  };
}

function normalizeOutput(str: string): string {
  if (!str) return '';
  try {
    // If it's valid JSON, stringify without whitespace
    const parsed = JSON.parse(str);
    return JSON.stringify(parsed);
  } catch {
    // Otherwise trim and lowercase whitespace
    return str.replace(/\s+/g, '').trim();
  }
}
