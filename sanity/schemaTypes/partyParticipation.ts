import { defineField, defineType } from 'sanity'
import { PartyAnswerInput } from '../components/PartyAnswerInput'

export const partyParticipationType = defineType({
  name: 'partyParticipation',
  title: 'Party Participation',
  type: 'document',
  groups: [
    { name: 'basic', title: 'Basic Info', default: true },
    { name: 'workflow', title: 'Workflow' },
    { name: 'contact', title: 'Contact & Access' },
    { name: 'answers', title: 'Answers' },
  ],
  fields: [
    defineField({
      name: 'election',
      type: 'reference',
      title: 'Election',
      to: [{ type: 'election' }],
      validation: (Rule) => Rule.required(),
      group: 'basic',
    }),
    defineField({
      name: 'party',
      type: 'reference',
      title: 'Party',
      to: [{ type: 'party' }],
      validation: (Rule) => Rule.required(),
      group: 'basic',
    }),
    // Workflow fields
    defineField({
      name: 'status',
      type: 'string',
      title: 'Status',
      options: {
        list: [
          { title: '📝 Draft', value: 'draft' },
          { title: '📧 Invited', value: 'invited' },
          { title: '✏️ In Progress', value: 'in_progress' },
          { title: '✅ Submitted', value: 'submitted' },
          { title: '👀 Under Review', value: 'under_review' },
          { title: '🔄 Revision Requested', value: 'revision_requested' },
          { title: '✨ Approved', value: 'approved' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
      group: 'workflow',
    }),
    defineField({
      name: 'submissionDeadline',
      type: 'datetime',
      title: 'Submission Deadline',
      description: 'When the party must submit their answers by',
      group: 'workflow',
    }),
    defineField({
      name: 'invitedAt',
      type: 'datetime',
      title: 'Invited At',
      description: 'When the invitation was sent',
      readOnly: true,
      group: 'workflow',
    }),
    defineField({
      name: 'submittedAt',
      type: 'datetime',
      title: 'Submitted At',
      description: 'When the party submitted their answers',
      readOnly: true,
      group: 'workflow',
    }),
    defineField({
      name: 'reviewedAt',
      type: 'datetime',
      title: 'Reviewed At',
      description: 'When the editorial team reviewed the submission',
      readOnly: true,
      group: 'workflow',
    }),
    defineField({
      name: 'approvedAt',
      type: 'datetime',
      title: 'Approved At',
      description: 'When the submission was approved',
      readOnly: true,
      group: 'workflow',
    }),
    // Contact & Access fields
    defineField({
      name: 'contactName',
      type: 'string',
      title: 'Contact Name',
      description: 'Name of the person responsible for this submission',
      group: 'contact',
    }),
    defineField({
      name: 'contactEmail',
      type: 'string',
      title: 'Contact Email',
      description: 'Email address for sending invitation and reminders',
      validation: (Rule) => Rule.email(),
      group: 'contact',
    }),
    defineField({
      name: 'accessToken',
      type: 'string',
      title: 'Access Token',
      description: 'Unique token for magic link authentication',
      readOnly: true,
      group: 'contact',
    }),
    defineField({
      name: 'tokenExpiresAt',
      type: 'datetime',
      title: 'Token Expires At',
      description: 'When the access token expires (optional)',
      group: 'contact',
    }),
    // Answers
    defineField({
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
        Rule.custom(async (answers, context) => {
          // Get the referenced election to validate against its theses
          const electionRef = (context.document as any)?.election?._ref
          if (!electionRef) {
            return 'Election reference is required'
          }

          // Fetch the election document to get theses
          const election = await context.getClient({ apiVersion: '2024-01-01' }).fetch(
            `*[_type == "election" && _id == $electionId][0]{ theses }`,
            { electionId: electionRef }
          )

          if (!election) {
            return 'Referenced election not found'
          }

          const theses = election.theses || []
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
      group: 'answers',
    }),
  ],
  preview: {
    select: {
      partyName: 'party.name',
      electionTitle: 'election.title',
      answers: 'answers',
      status: 'status',
    },
    prepare({ partyName, electionTitle, answers, status }) {
      const answerCount = Array.isArray(answers) ? answers.length : 0
      const statusIcons: Record<string, string> = {
        draft: '📝',
        invited: '📧',
        in_progress: '✏️',
        submitted: '✅',
        under_review: '👀',
        revision_requested: '🔄',
        approved: '✨',
      }
      const statusIcon = statusIcons[status] || '❓'

      return {
        title: `${statusIcon} ${partyName || 'Unknown Party'}`,
        subtitle: `${electionTitle || 'Unknown Election'} - ${answerCount} answer${answerCount !== 1 ? 's' : ''}`,
      }
    },
  },
})
