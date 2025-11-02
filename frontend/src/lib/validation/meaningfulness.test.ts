import { describe, it, expect } from "vitest";
import { validateMeaningfulness } from "./meaningfulness";
import type { Answer } from "../types/answer";

describe("validateMeaningfulness", () => {
  it("should pass with varied answers", () => {
    const answers: Answer[] = Array.from({ length: 30 }, (_, i) => ({
      thesisKey: `thesis_${i}`,
      value: i % 3 === 0 ? -1 : i % 3 === 1 ? 0 : 1,
    }));

    expect(validateMeaningfulness(answers).isValid).toBe(true);
  });

  it("should fail with 24+ skips", () => {
    const answers: Answer[] = Array.from({ length: 38 }, (_, i) => ({
      thesisKey: `thesis_${i}`,
      value: i < 24 ? null : 1,
    }));

    const result = validateMeaningfulness(answers);
    expect(result.isValid).toBe(false);
    expect(result.failureReason).toBe("excessive_skipping");
  });

  it("should fail with 24+ same answers", () => {
    const answers: Answer[] = Array.from({ length: 38 }, (_, i) => ({
      thesisKey: `thesis_${i}`,
      value: i < 24 ? 1 : -1,
    }));

    const result = validateMeaningfulness(answers);
    expect(result.isValid).toBe(false);
    expect(result.failureReason).toBe("monotonous_answering");
  });
});
