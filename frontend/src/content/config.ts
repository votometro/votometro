import { defineCollection, z } from 'astro:content';

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['introduccion', 'proceso', 'transparencia', 'referencias']),
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  docs: docsCollection,
};
