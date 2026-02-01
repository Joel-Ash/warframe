import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ✅ 공통 스키마(기존) + order 추가
const baseSchema = ({ image }: any) =>
  z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: image().optional(),

    // ✅ 문서 정렬용 (화면에는 안 보임)
    order: z.number().optional(),
  });

const main = defineCollection({
  loader: glob({ base: './src/content/main', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema,
});

const guide = defineCollection({
  loader: glob({ base: './src/content/guide', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema,
});

const moding = defineCollection({
  loader: glob({ base: './src/content/moding', pattern: '**/*.{md,mdx}' }),
  schema: baseSchema,
});

export const collections = { main, guide, moding };
