export type AnswerValue = -1 | 0 | 1 | null;

export interface Answer {
  thesisKey: string;
  value: AnswerValue;
  weighted?: boolean;
}

export interface Thesis {
  _key: string;
  title: string;
  text: string;
}

export interface PartyAnswer {
  thesisKey: string;
  value: -1 | 0 | 1;
  justification: string;
}

export interface Party {
  name: string;
  abbreviation: string;
  logo?: any; // Sanity image object
  description?: string;
  answers: PartyAnswer[];
}

export interface PartyParticipation {
  party: {
    name: string;
    abbreviation: string;
    logo?: any; // Sanity image object
    logoUrl?: string | null; // Processed image URL
    description?: string;
  };
  answers: PartyAnswer[];
}
