export type ScriptMode = "sc" | "tc";

export const SCRIPT_COOKIE = "moyun-script";
export const SCRIPT_STORAGE_KEY = "moyun-script";
export const DEFAULT_SCRIPT: ScriptMode = "sc";

export function isScriptMode(value: string | undefined | null): value is ScriptMode {
  return value === "sc" || value === "tc";
}

export function parseScriptMode(
  value: string | undefined | null,
  fallback: ScriptMode = DEFAULT_SCRIPT,
): ScriptMode {
  return isScriptMode(value) ? value : fallback;
}

export function scriptLang(mode: ScriptMode): "zh-Hans" | "zh-Hant" {
  return mode === "tc" ? "zh-Hant" : "zh-Hans";
}

export function scriptClass(mode: ScriptMode): "script-sc" | "script-tc" {
  return mode === "tc" ? "script-tc" : "script-sc";
}
