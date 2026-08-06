/**
 * Typed environment reader. Throws a clear message the first time a value is
 * actually needed (not at import time), so `next build` type generation and
 * lint don't crash when secrets aren't present.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value.trim();
}

export function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}
