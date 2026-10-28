
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { readFile } from "node:fs/promises";
import path from "node:path";

// GitHub 커밋 날짜 데이터
const dateFile = path.resolve("src/generated/update-dates.json");

async function getUpdateDates(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(dateFile, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// 기존 스키마 유지
const baseSchema = ({ image }: any) =>
  z.object({
    title: z.string(),
    description: z.string(),

    updatedDate: z.coerce.date().optional(),

    heroImage: image().optional(),
    order: z.number().optional(),
  });

// glob 로더에 자동 날짜 주입
function datedGlob(collection: string) {
  const original = glob({
    base: `./src/content/${collection}`,
    pattern: "**/*.{md,mdx}",
  });

  return {
    name: `dated-glob-${collection}`,

    async load(context: any) {
      const dates = await getUpdateDates();

      // 기존 glob 로더 실행
      await original.load(context);

      // 로드된 문서에 날짜 반영
      for (const entry of context.store.values()) {
        const relativePath =
         `src/content/${collection}/${entry.id}`;

        const date =
          dates[relativePath + ".md"] ??
          dates[relativePath + ".mdx"];

          console.log("컬렉션:", collection);
          console.log("문서 ID:", entry.id);
          console.log("조회 경로:", relativePath);
          console.log("조회 날짜:", date);

        if (date) {
          const updatedEntry = {
          ...entry,
          data: {
            ...entry.data,
            updatedDate: new Date(date),
            },
          };

          context.store.delete(entry.id);
          context.store.set(updatedEntry);  

          if (
            collection === "main" &&
            entry.id === "warframe-메인-퀘스트"
            ) {
            console.log("적용하려는 날짜:", updatedEntry.data.updatedDate);
            console.log(
            "저장 후 날짜:",
            context.store.get(entry.id)?.data?.updatedDate
            );
          }
        }
      }
    },
  };
}

const main = defineCollection({
  loader: datedGlob("main"),
  schema: baseSchema,
});

const guide = defineCollection({
  loader: datedGlob("guide"),
  schema: baseSchema,
});

const moding = defineCollection({
  loader: datedGlob("moding"),
  schema: baseSchema,
});

export const collections = { main, guide, moding };
