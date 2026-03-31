# panda-skills

日常开发中可复用的 Agent Skills，兼容 Claude Code、Cursor、Codex 等主流 AI 编码平台。

## 前置要求

- 已安装 Node.js 环境
- 能够运行 `npx bun` 命令

## 安装

### 快速安装（推荐）

```bash
npx skills add hash-panda/panda-skills
```

只安装某个技能：

```bash
npx skills add hash-panda/panda-skills --skill panda-git-commit
```

查看可用技能列表：

```bash
npx skills add hash-panda/panda-skills --list
```

### Claude Code Plugin Marketplace

```bash
# 注册 marketplace
/plugin marketplace add hash-panda/panda-skills

# 安装插件
/plugin install panda-skills@panda-skills
```

### ClawHub / OpenClaw

```bash
# 按单个技能安装
clawhub install panda-git-commit

# 或使用 OpenClaw 命令
/skill install @hash-panda/panda-git-commit
```

### 让 Agent 自动安装

直接告诉 AI Agent：

> 请从 github.com/hash-panda/panda-skills 安装 panda-git-commit 技能

### 手动安装

```bash
git clone https://github.com/hash-panda/panda-skills.git

# Cursor
cp -r panda-skills/skills/panda-git-commit ~/.cursor/skills/

# Claude Code
cp -r panda-skills/skills/panda-git-commit ~/.claude/skills/

# Codex
cp -r panda-skills/skills/panda-git-commit ~/.codex/skills/
```

## Available Skills

### Git Skills

#### panda-git-commit

智能 Git Commit Message 生成器，遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

```bash
# 分析 staged 变更，生成 commit message
/panda-git-commit

# 强制拆分为多个 commit
/panda-git-commit --split

# 手动指定 scope
/panda-git-commit --scope auth

# 手动指定 commit type
/panda-git-commit --type feat

# 覆盖语言设置（默认从 git history 自动检测）
/panda-git-commit --lang zh

# 仅预览，不执行 commit
/panda-git-commit --dry-run

# 在 type 前添加 emoji
/panda-git-commit --emoji

# 输出包含原始 diff 内容
/panda-git-commit --with-diff
```

**核心功能**：

| Feature              | Description                                       |
| -------------------- | ------------------------------------------------- |
| Conventional Commits | 遵循标准 `type(scope): description` 格式          |
| Monorepo Support     | 自动检测 workspace packages，读取 `package.json` name 作为 scope |
| Smart Splitting      | 建议将不相关的变更拆分为独立 commit               |
| Language Auto-detect | 分析 git history 自动匹配团队的 commit 语言习惯   |
| Customizable         | 通过 EXTEND.md 自定义 types、scope 映射、模板     |

**Monorepo Scope 检测**：

自动识别 monorepo 工具：npm/yarn/pnpm workspaces、Lerna、Nx、Turborepo。读取每个子包的 `package.json`（Nx 优先读 `project.json`）的 `name` 字段作为 scope：

| Changed File | package.json name | Detected Scope |
| --- | --- | --- |
| `packages/core/src/index.ts` | `@myorg/core` | `@myorg/core` |
| `apps/web/pages/home.tsx` | `web-app` | `web-app` |
| `packages/utils/format.ts` | `shared-utils` | `shared-utils` |

**语言自动检测**：

Commit message 语言从 git history 中自动推断，零配置即可用。优先级：

1. `--lang` 参数 — 本次手动指定
2. EXTEND.md `language` 设置 — 持久化偏好
3. `git log` 自动检测 — 零配置
4. 兜底默认值 — English

## 自定义配置

所有技能支持通过 EXTEND.md 自定义：

| Path                                     | Scope      |
| ---------------------------------------- | ---------- |
| `.panda-skills/<skill-name>/EXTEND.md`   | 项目级配置 |
| `~/.panda-skills/<skill-name>/EXTEND.md` | 用户级配置 |

## 多平台支持

| Platform        | 适配方式                                                       |
| --------------- | -------------------------------------------------------------- |
| **Claude Code** | 通过 `.claude-plugin/marketplace.json` 注册，原生支持 SKILL.md |
| **Cursor**      | 放入 `.cursor/skills/` 或项目级 skills 目录                    |
| **Codex**       | 放入 `.codex/skills/` 目录                                     |
| **其他**        | 通过 TypeScript CLI 直接运行：`bun scripts/main.ts --analyze`  |

所有平台共享同一套 SKILL.md + scripts，无需针对特定平台做额外适配。

## License

MIT
