import type { Answer } from "../types/answer";

export type ValidationFailureReason =
  | "excessive_skipping"
  | "monotonous_answering";

export interface ValidationResult {
  isValid: boolean;
  failureReason?: ValidationFailureReason;
}

const THRESHOLD = 24;

/**
 * Validates that a user has engaged meaningfully with the quiz.
 *
 * A quiz is considered invalid if:
 * 1. User skips 24 or more questions (excessive_skipping)
 * 2. User answers 24 or more questions with the same option (monotonous_answering)
 *
 * @param answers - Array of all answers from the quiz
 * @returns ValidationResult with isValid flag and optional failureReason
 */
export function validateMeaningfulness(answers: Answer[]): ValidationResult {
  // Check for excessive skipping
  const skipCount = answers.filter((answer) => answer.value === null).length;
  if (skipCount >= THRESHOLD) {
    return {
      isValid: false,
      failureReason: "excessive_skipping",
    };
  }

  // Check for monotonous answering
  // Count occurrences of each answer value (-1, 0, 1)
  const valueCounts: Record<number, number> = {
    [-1]: 0,
    [0]: 0,
    [1]: 0,
  };

  answers.forEach((answer) => {
    if (answer.value !== null) {
      valueCounts[answer.value] = (valueCounts[answer.value] || 0) + 1;
    }
  });

  // Check if any single value appears 24+ times
  const maxCount = Math.max(...Object.values(valueCounts));
  if (maxCount >= THRESHOLD) {
    return {
      isValid: false,
      failureReason: "monotonous_answering",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Returns a user-friendly error message based on the validation failure reason
 */
export function getValidationErrorMessage(
  failureReason: ValidationFailureReason
): string {
  switch (failureReason) {
    case "excessive_skipping":
      return "Por favor responde más preguntas para obtener resultados significativos. Has omitido demasiadas preguntas para que podamos calcular una coincidencia precisa.";
    case "monotonous_answering":
      return "Por favor varía tus respuestas para reflejar tus opiniones reales. Seleccionar la misma opción para la mayoría de las preguntas no proporciona suficiente información para una coincidencia precisa.";
    default:
      return "Lamentablemente, no podemos proporcionar un resultado significativo basado en tu patrón de respuestas.";
  }
}
