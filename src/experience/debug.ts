/**
 * `?debug` on the home page: records what's needed to diagnose a device we can't hold
 * (shader errors, JS errors, WebGL context loss). DebugPanel shows it with the GPU's capabilities.
 * Installed before the stage mounts, so first-compile shader errors are captured too.
 */
export const debugLog: string[] = [];

let installed = false;

const describe = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export function installDebugHooks() {
  if (installed) return;
  installed = true;

  const push = (kind: string, text: string) => {
    debugLog.push(`[${kind}] ${text.slice(0, 700)}`);
    if (debugLog.length > 60) debugLog.shift();
  };

  for (const level of ["error", "warn"] as const) {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      push(level, args.map(describe).join(" "));
      original(...args);
    };
  }
  window.addEventListener("error", (e) => push("error", e.message));
  window.addEventListener("unhandledrejection", (e) => push("promise", describe(e.reason)));
  // context events don't bubble, but capture listeners on the document still see them
  document.addEventListener("webglcontextlost", () => push("gl", "context lost"), true);
  document.addEventListener("webglcontextrestored", () => push("gl", "context restored"), true);
}
