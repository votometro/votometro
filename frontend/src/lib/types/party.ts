export interface Party {
  id: string
  name: string
  abbreviation: string
  logoUrl?: string | null
  description?: string
}

export interface PartyAnswer {
  thesisKey: string
  value: -1 | 0 | 1
  justification: string
  reviewStatus?: 'pending' | 'approved' | 'needs_revision'
  reviewNotes?: string
}

export interface PartyParticipation {
  party: Party
  answers: PartyAnswer[]
}
