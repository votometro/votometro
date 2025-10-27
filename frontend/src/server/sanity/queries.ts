export const ELECTION_BY_SLUG_QUERY = `
  *[_type == "election" && slug == $slug][0] {
    _id,
    title,
    slug,
    theses[] {
      _key,
      title,
      text
    },
    "partyParticipations": *[_type == "partyParticipation" && references(^._id)] {
      party-> {
        _id,
        name,
        abbreviation,
        logo,
        description
      },
      answers[] {
        thesisKey,
        value,
        justification
      }
    }
  }
`

export const PARTY_PARTICIPATION_BY_TOKEN_QUERY = `
  *[_type == "partyParticipation" && accessToken == $token][0] {
    _id,
    status,
    submissionDeadline,
    tokenExpiresAt,
    party-> {
      _id,
      name,
      abbreviation,
      logo,
      description
    },
    election-> {
      _id,
      title,
      slug,
      theses[] {
        _key,
        title,
        text
      }
    },
    answers[] {
      thesisKey,
      value,
      justification
    }
  }
`
