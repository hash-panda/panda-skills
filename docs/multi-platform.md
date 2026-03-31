# 多平台适配说明

panda-skills 采用「SKILL.md + TypeScript 脚本」的架构，天然兼容所有支持 SKILL.md 格式的 AI 编码平台。

## 架构原理

```text
SKILL.md（平台无关的指令文档）
    ├── 由 AI agent 读取并理解
    ├── 定义工作流、触发词、参数
    └── 引用 scripts/ 中的 TypeScript 工具

scripts/*.ts（平台无关的 CLI 工具）
    ├── 通过 Bun 运行（无需构建）
    ├── 输出 JSON 结构化数据
    └── AI agent 解析输出并生成 commit message
```

核心逻辑在 TypeScript 脚本中，AI agent 负责理解 SKILL.md 指令、调用脚本、根据输出生成 commit message 并与用户交互。所有平台共享同一套代码。

## 各平台适配方式

### Claude Code

**安装方式**：通过 Plugin Marketplace 注册。

```bash
/plugin marketplace add hash-panda/panda-skills
/plugin install panda-skills@panda-skills
```

**技能发现**：Claude Code 读取 `.claude-plugin/marketplace.json`，自动发现注册的 skills。

**文件位置**：

- 项目级：仓库根目录 `skills/panda-git-commit/`
- 用户级：`~/.claude/skills/panda-git-commit/`

### Cursor

**安装方式**：将 skill 目录复制到 `.cursor/skills/`。

```bash
npx skills add hash-panda/panda-skills --skill panda-git-commit
```

或手动：

```bash
cp -r skills/panda-git-commit ~/.cursor/skills/
```

**技能发现**：Cursor 自动扫描 `.cursor/skills/` 目录中的 SKILL.md 文件。

**文件位置**：

- 用户级：`~/.cursor/skills/panda-git-commit/`
- 项目级：`<project>/.cursor/skills/panda-git-commit/`

### Codex (OpenAI)

**安装方式**：将 skill 目录复制到 `.codex/skills/`。

```bash
npx skills add hash-panda/panda-skills --skill panda-git-commit
```

或手动：

```bash
cp -r skills/panda-git-commit ~/.codex/skills/
```

**文件位置**：

- 用户级：`~/.codex/skills/panda-git-commit/`

### Zhipu / 智谱

**安装方式**：通过 TypeScript CLI 脚本直接使用。

```bash
# 分析 git 变更
bun skills/panda-git-commit/scripts/main.ts

# 指定参数
bun skills/panda-git-commit/scripts/main.ts --split --lang zh
```

脚本输出 JSON 格式的结构化数据，可被任何 AI agent 或工具链消费。

### 其他平台

任何支持以下能力的 AI 编码平台都可以使用：

1. **读取 Markdown 文件** — 理解 SKILL.md 中的工作流指令
2. **执行 Shell 命令** — 运行 `bun scripts/main.ts` 获取分析结果
3. **与用户交互** — 展示 commit message 并等待确认

## npx skills add 一键安装

[Vercel Skills CLI](https://skills.sh/) 提供跨平台的一键安装体验：

```bash
# 安装全部技能（自动检测本地平台）
npx skills add hash-panda/panda-skills

# 只安装指定技能
npx skills add hash-panda/panda-skills --skill panda-git-commit

# 查看可用技能
npx skills add hash-panda/panda-skills --list

# 全局安装
npx skills add hash-panda/panda-skills -g
```

CLI 会自动检测本地安装了哪些 AI agent，并将 SKILL.md 安装到正确的位置。

## ClawHub / OpenClaw

ClawHub 按单个技能独立发布和安装：

```bash
clawhub install panda-git-commit
```

发布通过 `scripts/sync-clawhub.sh` 脚本完成（需维护者操作）：

```bash
# 发布单个技能（--allow-cjk 允许中文内容）
bash scripts/sync-clawhub.sh --skill panda-git-commit --changelog "修复 monorepo scope 检测" --allow-cjk

# 发布所有技能
bash scripts/sync-clawhub.sh --all --bump patch --allow-cjk

# 预览模式（不实际发布）
bash scripts/sync-clawhub.sh --skill panda-git-commit --dry-run --allow-cjk
```

发布前需在项目根目录创建 `.env` 文件（参考 `.env.example`），配置 `CLAWHUB_TOKEN`。
