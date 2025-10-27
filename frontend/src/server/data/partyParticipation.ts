import { sanityClient } from '../sanity/client'
import { PARTY_PARTICIPATION_BY_TOKEN_QUERY } from '../sanity/queries'
import { getImageUrl } from '../sanity/imageBuilder'
import type { Thesis } from '../../lib/types/election'
import type { Party, PartyAnswer } from '../../lib/types/party'

export interface PartySubmissionSession {
  id: string
  token: string
  status: string
  submissionDeadline?: string
  tokenExpiresAt?: string
  party: Party
  election: {
    id: string
    title: string
    slug: string
    theses: Thesis[]
  }
  answers: PartyAnswer[]
}

export async function getPartyParticipationByToken(
  token: string
): Promise<PartySubmissionSession | null> {
  const result = await sanityClient.fetch(PARTY_PARTICIPATION_BY_TOKEN_QUERY, { token })

  if (!result) return null

  // Validate token expiration
  if (result.tokenExpiresAt && new Date(result.tokenExpiresAt) < new Date()) {
    return null
  }

  return {
    id: result._id,
    token: token, // Pass through the validated token
    status: result.status,
    submissionDeadline: result.submissionDeadline,
    tokenExpiresAt: result.tokenExpiresAt,
    party: {
      id: result.party._id,
      name: result.party.name,
      abbreviation: result.party.abbreviation,
      logoUrl: getImageUrl(result.party.logo, 120, 120),
      description: result.party.description,
    },
    election: {
      id: result.election._id,
      title: result.election.title,
      slug: result.election.slug,
      theses: (result.election.theses || []).filter(Boolean), // Filter out null references
    },
    answers: result.answers || [],
  }
}

export async function updatePartyAnswer(
  participationId: string,
  thesisKey: string,
  value: -1 | 0 | 1,
  justification: string
): Promise<boolean> {
  try {
    // Fetch current answers
    const participation = await sanityClient.fetch<{ answers: PartyAnswer[] }>(
      `*[_type == "partyParticipation" && _id == $id][0]{ answers }`,
      { id: participationId }
    )

    if (!participation) return false

    const answers = participation.answers || []
    const existingAnswerIndex = answers.findIndex((a) => a.thesisKey === thesisKey)

    let updatedAnswers: PartyAnswer[]
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      updatedAnswers = [...answers]
      updatedAnswers[existingAnswerIndex] = { thesisKey, value, justification }
    } else {
      // Add new answer
      updatedAnswers = [...answers, { thesisKey, value, justification }]
    }

    await sanityClient.patch(participationId).set({ answers: updatedAnswers }).commit()

    return true
  } catch (error) {
    console.error('Failed to update party answer:', error)
    return false
  }
}

export async function updatePartyParticipationStatus(
  participationId: string,
  newStatus: string,
  timestampField?: 'invitedAt' | 'submittedAt' | 'reviewedAt' | 'approvedAt'
): Promise<boolean> {
  try {
    const patch = sanityClient.patch(participationId).set({ status: newStatus })

    if (timestampField) {
      patch.set({ [timestampField]: new Date().toISOString() })
    }

    await patch.commit()
    return true
  } catch (error) {
    console.error('Failed to update participation status:', error)
    return false
  }
}
