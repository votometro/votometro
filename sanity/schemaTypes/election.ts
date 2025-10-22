import { defineField, defineType } from 'sanity'
import { PartyAnswerInput } from '../components/PartyAnswerInput'

export const electionType = defineType({
  name: 'election',
  title: 'Election',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'theses',
      type: 'array',
      title: 'Theses',
      of: [
        {
          type: 'object',
          title: 'Thesis',
          fields: [
            {
              name: 'title',
              type: 'string',
              title: 'Title',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'text',
              type: 'text',
              title: 'Text',
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'partyParticipations',
      type: 'array',
      title: 'Party Participations',
      of: [
        {
          type: 'object',
          title: 'Party Answers',
          fields: [
            {
              name: 'party',
              type: 'reference',
              title: 'Party',
              to: [{ type: 'party' }],
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'answers',
              type: 'array',
              title: 'Answers',
              description: 'Answer each thesis. Each answer is linked to a specific thesis by its key.',
              of: [
                {
                  type: 'object',
                  title: 'Answer',
                  fields: [
                    {
                      name: 'thesisKey',
                      type: 'string',
                      title: 'Thesis Key',
                      description: 'References the thesis _key',
                      validation: (Rule) => Rule.required(),
                      readOnly: true,
                      hidden: true,
                    },
                    {
                      name: 'value',
                      type: 'number',
                      title: 'Position',
                      options: {
                        list: [
                          { title: '👍 For (1)', value: 1 },
                          { title: '🤷 Neutral (0)', value: 0 },
                          { title: '👎 Against (-1)', value: -1 },
                        ],
                      },
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'justification',
                      type: 'text',
                      title: 'Justification',
                      validation: (Rule) => Rule.required(),
                    },
                  ],
                  components: {
                    input: PartyAnswerInput,
                  },
                  preview: {
                    select: {
                      value: 'value',
                      justification: 'justification',
                    },
                    prepare({ value, justification }) {
                      const position = value === 1 ? '👍 For' : value === 0 ? '🤷 Neutral' : '👎 Against'

                      return {
                        title: position,
                        subtitle: justification ? justification.substring(0, 80) + '...' : '',
                      }
                    },
                  },
                },
              ],
              validation: (Rule) =>
                Rule.custom((answers, context) => {
                  // Get the parent document (election)
                  const election = context.document as any
                  const theses = election?.theses || []
                  const thesesCount = theses.length

                  if (!answers || answers.length === 0) {
                    return 'At least one answer is required'
                  }

                  if (answers.length !== thesesCount) {
                    return `Must have exactly ${thesesCount} answers (one for each thesis). Currently has ${answers.length}.`
                  }

                  // Check that each thesis has exactly one answer
                  const thesisKeys = theses.map((t: any) => t._key)
                  const answerKeys = answers.map((a: any) => a.thesisKey)

                  for (const thesisKey of thesisKeys) {
                    const count = answerKeys.filter((k: string) => k === thesisKey).length
                    if (count === 0) {
                      const thesis = theses.find((t: any) => t._key === thesisKey)
                      return `Missing answer for thesis: "${thesis?.title || thesisKey}"`
                    }
                    if (count > 1) {
                      const thesis = theses.find((t: any) => t._key === thesisKey)
                      return `Duplicate answer for thesis: "${thesis?.title || thesisKey}"`
                    }
                  }

                  // Check for orphaned answers (thesis was deleted)
                  for (const answer of answers) {
                    if (!thesisKeys.includes(answer.thesisKey)) {
                      return `Answer references a deleted thesis (key: ${answer.thesisKey}). Please remove it.`
                    }
                  }

                  return true
                }),
            },
          ],
          preview: {
            select: {
              partyName: 'party.name',
              answers: 'answers',
            },
            prepare({ partyName, answers }) {
              const answerCount = Array.isArray(answers) ? answers.length : 0
              return {
                title: partyName || 'Unknown Party',
                subtitle: `${answerCount} answer${answerCount !== 1 ? 's' : ''}`,
              }
            },
          },
        },
      ],
    }),
  ],
})
