export type AnswerValue = -1 | 0 | 1;

export interface Answer {
  thesisIndex: number;
  value: AnswerValue;
}

export interface Thesis {
  text: string;
  subtitle?: string;
}
