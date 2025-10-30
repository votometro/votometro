import { defineField, defineType } from 'sanity'

export const thesisType = defineType({
  name: 'thesis',
  title: 'Thesis',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'Short statement or question',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      type: 'text',
      title: 'Full Text',
      description: 'Detailed explanation of the thesis',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'election',
      type: 'reference',
      title: 'Election',
      description: 'Which election this thesis belongs to',
      to: [{ type: 'election' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'selected',
      type: 'boolean',
      title: 'Selected for Final Election',
      description: 'Mark as true if this thesis is part of the final selection (e.g., 38 of 80)',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Display Order',
      description: 'Order in which this thesis appears (for selected theses)',
      validation: (Rule) => Rule.integer().min(1),
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      description: 'Optional category/theme (e.g., Economy, Environment, Education)',
      options: {
        list: [
          { title: 'Economy', value: 'economy' },
          { title: 'Environment', value: 'environment' },
          { title: 'Education', value: 'education' },
          { title: 'Healthcare', value: 'healthcare' },
          { title: 'Security', value: 'security' },
          { title: 'Social Policy', value: 'social' },
          { title: 'Foreign Policy', value: 'foreign' },
          { title: 'Justice', value: 'justice' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'selectionRationale',
      type: 'text',
      title: 'Selection Rationale',
      description: 'Why was this thesis selected (or rejected)? Notes from editorial workshop.',
    }),
    defineField({
      name: 'createdAt',
      type: 'datetime',
      title: 'Created At',
      description: 'When this thesis was created',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Created Date, Newest First',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      selected: 'selected',
      order: 'order',
      category: 'category',
      electionTitle: 'election.title',
    },
    prepare({ title, selected, order, category, electionTitle }) {
      const statusIcon = selected ? '✅' : '⚪'
      const orderText = order ? ` #${order}` : ''
      const categoryTag = category ? ` [${category}]` : ''

      return {
        title: `${statusIcon}${orderText} ${title}`,
        subtitle: `${electionTitle || 'No election'}${categoryTag}`,
      }
    },
  },
})
