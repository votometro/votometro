import { sanityClient } from '../sanity/client'
import { ELECTION_BY_SLUG_QUERY } from '../sanity/queries'
import { getImageUrl } from '../sanity/imageBuilder'
import type { Election } from '../../lib/types/election'

export async function getElectionBySlug(slug: string): Promise<Election | null> {
  const result = await sanityClient.fetch(ELECTION_BY_SLUG_QUERY, { slug })

  if (!result) return null

  return {
    id: result._id,
    title: result.title,
    slug: result.slug,
    theses: result.theses || [],
    partyParticipations: (result.partyParticipations || []).map((p: any) => ({
      party: {
        id: p.party._id,
        name: p.party.name,
        abbreviation: p.party.abbreviation,
        logoUrl: getImageUrl(p.party.logo, 80, 80),
        description: p.party.description,
      },
      answers: p.answers || [],
    })),
  }
}

export async function getAllElections(): Promise<Election[]> {
  // TODO: Implement when needed
  return []
}
