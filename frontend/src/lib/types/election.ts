import type { PartyParticipation } from './party'

export interface Thesis {
  _key: string
  title: string
  text: string
}

export interface Election {
  id: string
  title: string
  slug: string
  theses: Thesis[]
  partyParticipations: PartyParticipation[]
}
