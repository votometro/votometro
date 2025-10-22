import { defineField, defineType } from 'sanity'

export const partyType = defineType({
  name: 'party',
  title: 'Party',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Full Name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'abbreviation',
      type: 'string',
      title: 'Abbreviation',
      description: 'Short form of the party name (e.g., SPD, CDU, etc.)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'Logo',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
    }),
  ],
})
