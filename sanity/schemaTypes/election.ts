import { defineField, defineType } from 'sanity'

export const electionType = defineType({
  name: 'election',
  title: 'Election',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'string',
      title: 'Slug',
      description: 'URL-friendly identifier (e.g., elecciones-2026)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      description: 'Brief description of this election',
    }),
    defineField({
      name: 'electionDate',
      type: 'date',
      title: 'Election Date',
      description: 'When the election takes place',
    }),
    defineField({
      name: 'submissionDeadline',
      type: 'datetime',
      title: 'Party Submission Deadline',
      description: 'Global deadline for all parties to submit answers (can be overridden per participation)',
    }),
    defineField({
      name: 'theses',
      type: 'array',
      title: 'Theses',
      description: 'Reference theses for this election (can include all pool theses or only selected ones)',
      of: [
        {
          type: 'reference',
          to: [{ type: 'thesis' }],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      electionDate: 'electionDate',
      thesesCount: 'theses.length',
    },
    prepare({ title, electionDate, thesesCount }) {
      const dateStr = electionDate
        ? ` • ${new Date(electionDate).toLocaleDateString()}`
        : ''
      const thesesStr = thesesCount
        ? ` • ${thesesCount} theses`
        : ''

      return {
        title: title,
        subtitle: `${dateStr}${thesesStr}`,
      }
    },
  },
})
