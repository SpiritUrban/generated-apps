export function runUserFunction(
  code: string,
  functionName: string,
  args: unknown[]
): { result?: unknown; error?: string } {
  try {
    const wrapped = `"use strict";
const window = undefined;
const document = undefined;
const globalThis = undefined;
const self = undefined;
const global = undefined;
const Function = undefined;
${code}
if (typeof ${functionName} !== "function") {
  throw new Error("Expected function ${functionName} to be defined");
}
return ${functionName}.apply(null, args);
`;
    const runner = new Function("args", wrapped);
    const result = runner(args);
    return { result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
