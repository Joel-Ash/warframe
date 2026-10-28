
import { mkdir, readdir, writeFile, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const contentRoot = path.resolve("src/content");
const outputPath = path.resolve("src/generated/update-dates.json");

const collections = ["main", "guide", "moding"];

// 날짜 관련 frontmatter 필드
const ignoredFields = new Set(["pubDate", "updatedDate"]);

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    windowsHide: true,
  }).trim();
}

// Markdown 파일 목록 가져오기
async function getMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await getMarkdownFiles(fullPath));
    } else if (/\.(md|mdx)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

// 변경된 줄이 날짜 필드인지 확인
function isDateField(line) {
  const match = line.match(
    /^\s*(pubDate|updatedDate)\s*:/
  );

  return match && ignoredFields.has(match[1]);
}

// 해당 커밋에서 문서의 실질적인 변경이 있었는지 확인
function hasMeaningfulChange(commit, file) {
  const diff = git([
    "show",
    "--format=",
    "--no-ext-diff",
    "--unified=0",
    commit,
    "--",
    file,
  ]);

  let inFrontmatter = false;
  let frontmatterStarted = false;
  let changed = false;

  // diff에서 변경된 줄만 검사
  for (const line of diff.split(/\r?\n/)) {
    if (
      line.startsWith("+++") ||
      line.startsWith("---")
    ) {
      continue;
    }

    if (!line.startsWith("+") && !line.startsWith("-")) {
      continue;
    }

    const content = line.slice(1);

    // 날짜 필드의 추가/삭제는 무시
    if (isDateField(content)) {
      continue;
    }

    // 다른 내용이 변경되면 실제 업데이트로 인정
    if (content.trim() !== "") {
      changed = true;
      break;
    }
  }

  return changed;
}

// 날짜 필드만 수정한 커밋은 건너뛰기
function getLastMeaningfulCommitDate(file) {
  const commits = git([
    "log",
    "--format=%H",
    "--",
    file,
  ]).split(/\r?\n/).filter(Boolean);

  for (const commit of commits) {
    if (!hasMeaningfulChange(commit, file)) {
      continue;
    }

    return git([
      "show",
      "-s",
      "--format=%cI",
      commit,
    ]);
  }

  return "";
}

async function main() {
  const dates = {};

  for (const collection of collections) {
    const dir = path.join(contentRoot, collection);
    const files = await getMarkdownFiles(dir);

    for (const file of files) {
      const relativePath = path.relative(
        process.cwd(),
        file
      ).replaceAll("\\", "/");

      const date = getLastMeaningfulCommitDate(relativePath);

      if (date) {
        dates[relativePath] = date;
        console.log(`✓ ${relativePath}: ${date}`);
      } else {
        console.warn(`⚠ 유효한 커밋 없음: ${relativePath}`);
      }
    }
  }

  await mkdir(path.dirname(outputPath), {
    recursive: true,
  });

  await writeFile(
    outputPath,
    JSON.stringify(dates, null, 2) + "\n",
    "utf8"
  );

  console.log("문서별 업데이트 날짜 생성 완료!");
}

await main();
