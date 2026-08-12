import { timingSafeEqual } from "node:crypto";

export function readConfiguredSecret(...names: string[]): string | null {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return null;
}

export function secretMatches(
  supplied: unknown,
  ...expectedNames: string[]
): boolean {
  const expected = readConfiguredSecret(...expectedNames);
  if (!expected || typeof supplied !== "string" || !supplied) return false;

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length
    && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export function pipelineCallbackSecretMatches(supplied: unknown): boolean {
  return secretMatches(supplied, "PIPELINE_CALLBACK_SECRET", "MODAL_WEBHOOK_SECRET");
}
