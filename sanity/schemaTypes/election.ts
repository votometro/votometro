import { defineField, defineType } from 'sanity'

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
              name: 'text',
              type: 'string',
              title: 'Text',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'subtitle',
              type: 'text',
              title: 'Subtitle',
            },
          ],
        },
      ],
    }),
  ],
})
