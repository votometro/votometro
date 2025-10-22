export type AnswerValue = -1 | 0 | 1 | null;

export interface Answer {
  thesisIndex: number;
  value: AnswerValue;
  weighted?: boolean;
}

export interface Thesis {
  text: string;
  subtitle?: string;
}

export interface PartyAnswer {
  thesisIndex: number;
  value: -1 | 0 | 1;
  justification: string;
}

export interface Party {
  name: string;
  answers: PartyAnswer[];
}
