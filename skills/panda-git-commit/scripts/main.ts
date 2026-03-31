import { analyzeDiff, detectLanguage, inferCommitType } from "./analyzer.ts";
import { detectMonorepo, inferScopesFromFiles } from "./scope-detector.ts";
import { splitByFunction, formatSplitSuggestion } from "./splitter.ts";
import { detectConvention } from "./convention-detector.ts";

interface CliArgs {
  split: boolean;
  scope: string | null;
  type: string | null;
  lang: string | null;
  dryRun: boolean;
  emoji: boolean;
  withDiff: boolean;
}

function isValue(v: string | undefined): v is string {
  return v !== undefined && !v.startsWith("--");
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    split: false,
    scope: null,
    type: null,
    lang: null,
    dryRun: false,
    emoji: false,
    withDiff: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--split") args.split = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--emoji") args.emoji = true;
    else if (arg === "--with-diff") args.withDiff = true;
    else if (arg === "--scope" && isValue(argv[i + 1])) args.scope = argv[++i];
    else if (arg === "--type" && isValue(argv[i + 1])) args.type = argv[++i];
    else if (arg === "--lang" && isValue(argv[i + 1])) args.lang = argv[++i];
  }

  return args;
}

const EMOJI_MAP: Record<string, string> = {
  feat: "✨",
  fix: "🐛",
  docs: "📝",
  style: "💄",
  refactor: "♻️",
  perf: "⚡",
  test: "✅",
  chore: "🔧",
  ci: "👷",
  build: "📦",
};

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const [lang, diff, monorepo, convention] = await Promise.all([
    args.lang ? Promise.resolve(args.lang) : detectLanguage(),
    analyzeDiff(),
    detectMonorepo(),
    detectConvention(),
  ]);

  if (!diff.hasStagedChanges) {
    const unstaged = await analyzeDiff(false);
    if (unstaged.files.length === 0) {
      console.log(
        JSON.stringify({
          error: "no_changes",
          message: "没有检测到任何变更。请先修改文件后再运行。",
        })
      );
      process.exit(1);
    }

    console.log(
      JSON.stringify({
        warning: "no_staged_changes",
        message:
          "没有 staged 变更。请先运行 git add 将变更加入暂存区。",
        unstaged: {
          fileCount: unstaged.files.length,
          files: unstaged.files.map((f) => ({
            path: f.path,
            status: f.status,
          })),
        },
      })
    );
    process.exit(1);
  }

  const scopeResult = inferScopesFromFiles(
    diff.files.map((f) => f.path),
    monorepo
  );

  const shouldSplit = args.split || scopeResult.shouldSplit;

  if (shouldSplit) {
    const groups = splitByFunction(diff.files, monorepo);

    const allowedTypes = convention.rules.types;
    for (const g of groups) {
      if (args.type && groups.length === 1) {
        g.type = args.type;
      } else if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(g.type)) {
        g.type = allowedTypes.includes("fix") ? "fix" : allowedTypes[0];
      }
    }

    const splitOutput: Record<string, unknown> = {
      mode: "split",
      language: lang,
      convention,
      monorepo: {
        isMonorepo: monorepo.isMonorepo,
        tool: monorepo.tool,
      },
      groups: groups.map((g) => {
        const emoji = args.emoji ? EMOJI_MAP[g.type] ?? "" : "";
        return {
          type: g.type,
          scope: args.scope ?? g.scope,
          emoji,
          files: g.files.map((f) => ({
            path: f.path,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
          })),
        };
      }),
      suggestion: formatSplitSuggestion(groups, lang),
      dryRun: args.dryRun,
    };
    if (args.withDiff) splitOutput.rawDiff = diff.rawDiff;
    console.log(JSON.stringify(splitOutput, null, 2));
  } else {
    let type = args.type ?? inferCommitType(diff.files);
    const allowedTypes = convention.rules.types;
    if (allowedTypes && allowedTypes.length > 0 && !allowedTypes.includes(type)) {
      type = allowedTypes.includes("fix") ? "fix" : allowedTypes[0];
    }
    const scope = args.scope ?? scopeResult.scope;
    const emoji = args.emoji ? EMOJI_MAP[type] ?? "" : "";

    const singleOutput: Record<string, unknown> = {
      mode: "single",
      language: lang,
      convention,
      monorepo: {
        isMonorepo: monorepo.isMonorepo,
        tool: monorepo.tool,
      },
      type,
      scope,
      emoji,
      files: diff.files.map((f) => ({
        path: f.path,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
      })),
      totalAdditions: diff.totalAdditions,
      totalDeletions: diff.totalDeletions,
      dryRun: args.dryRun,
    };
    if (args.withDiff) singleOutput.rawDiff = diff.rawDiff;
    console.log(JSON.stringify(singleOutput, null, 2));
  }
}

main().catch((e) => {
  console.error(JSON.stringify({ error: "unexpected", message: String(e) }));
  process.exit(1);
});
