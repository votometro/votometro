export const ELECTION_BY_SLUG_QUERY = `
  *[_type == "election" && slug == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug,
    theses[]-> {
      _key,
      _id,
      title,
      text,
      selected,
      order
    } [selected == true] | order(order asc),
    "partyParticipations": *[
      _type == "partyParticipation"
      && references(^._id)
      && status == "approved"
      && !(_id in path("drafts.**"))
    ] {
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
      theses[]-> {
        _key,
        _id,
        title,
        text,
        selected,
        order
      } [selected == true] | order(order asc)
    },
    answers[] {
      thesisKey,
      value,
      justification,
      reviewStatus,
      reviewNotes
    }
  }
`
