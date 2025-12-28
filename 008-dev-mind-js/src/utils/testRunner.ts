import type { TestCase } from "../types";
import { runUserFunction } from "./sandbox";

export type TestResult = {
  input: unknown[];
  expected: unknown;
  actual?: unknown;
  pass: boolean;
  error?: string;
};

export type TestSummary = {
  passed: number;
  total: number;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  if (isObject(a) && isObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(a[key], b[key]));
  }
  return false;
}

export function runTests(
  code: string,
  tests: TestCase[],
  functionName = "solve"
): { results: TestResult[]; summary: TestSummary } {
  const results = tests.map((test) => {
    const { result, error } = runUserFunction(code, functionName, test.input);
    if (error) {
      return { input: test.input, expected: test.expected, pass: false, error };
    }

    const pass = deepEqual(result, test.expected);
    return { input: test.input, expected: test.expected, actual: result, pass };
  });

  const passed = results.filter((result) => result.pass).length;
  return {
    results,
    summary: {
      passed,
      total: results.length
    }
  };
}
