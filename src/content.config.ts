import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// ✅ 공통 스키마(기본) + updatedDate + order 포함
const baseSchema = ({ image }: any) =>
  z.object({
    title: z.string(),
    description: z.string(),

    // ✅ 작성일
    pubDate: z.coerce.date(),

    // ✅ 최종 수정일(옵션)
    updatedDate: z.coerce.date().optional(),

    // ✅ 대표 이미지(옵션)
    heroImage: image().optional(),

    // ✅ 문서 정렬용(화면엔 안 보임)
    order: z.number().optional(),
  });

const main = defineCollection({
  loader: glob({ base: "./src/content/main", pattern: "**/*.{md,mdx}" }),
  schema: baseSchema,
});

const guide = defineCollection({
  loader: glob({ base: "./src/content/guide", pattern: "**/*.{md,mdx}" }),
  schema: baseSchema,
});

const moding = defineCollection({
  loader: glob({ base: "./src/content/moding", pattern: "**/*.{md,mdx}" }),
  schema: baseSchema,
});

export const collections = { main, guide, moding };
