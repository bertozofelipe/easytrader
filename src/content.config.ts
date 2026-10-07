import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const escola = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/escola' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    trilha: z.enum(['fundamentos', 'analise-tecnica', 'gestao-de-risco', 'psicologia', 'operacional']),
    ordem: z.number(),
    draft: z.boolean().default(false),
  }),
});

const glossario = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/glossario' }),
  schema: z.object({
    termo: z.string(),
    resumo: z.string(),
    relacionados: z.array(z.string()).default([]),
  }),
});

export const collections = { escola, glossario };
