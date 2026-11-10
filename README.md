# panda-skills

日常开发中可复用的 Agent Skills，兼容 Claude Code、Cursor、Codex 等主流 AI 编码平台。

## 前置要求

- 使用能够读取 `SKILL.md` 的 AI Agent，并按具体任务提供文件、测试或其他工具的访问能力。
- 使用下方 `npx skills` 安装方式时，需要 Node.js / npm；手动复制技能不依赖此安装器。
- 运行依赖按技能区分：`panda-git-commit` 的 TypeScript 脚本需要 Bun（或 `npx bun`）；`panda-product-evolution` 是纯指令技能，本身不需要 Node.js 或 Bun。被改进项目的构建、测试依赖仍按项目要求准备。

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

> 请从 https://github.com/hash-panda/panda-skills 安装 panda-git-commit 技能

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

## 更新

技能有新版本时，按你的安装方式重新执行对应命令即可：

| 安装方式 | 更新命令 |
| --- | --- |
| npx skills | `npx skills add hash-panda/panda-skills`（重新运行即覆盖） |
| Claude Code Plugin | `/plugin install panda-skills@panda-skills`（重新安装） |
| ClawHub | `clawhub update panda-git-commit` |
| 手动安装 | 重新拉取并复制（见下方） |

手动更新：

```bash
cd panda-skills && git pull

# Cursor
cp -r skills/panda-git-commit ~/.cursor/skills/

# Claude Code
cp -r skills/panda-git-commit ~/.claude/skills/

# Codex
cp -r skills/panda-git-commit ~/.codex/skills/
```

或直接告诉 AI Agent：

> 请从 github.com/hash-panda/panda-skills 更新 panda-git-commit 技能

## Available Skills

### 产品与系统改进

#### panda-product-evolution

以证据驱动产品、系统与 Agent 的持续改进。每轮从目标和基线出发，选择值得解决的问题，实施最小有效改变，再用可比较的结果判断是否保留。

**核心机制**：

| 机制 | 关注的问题 | 典型动作 |
| --- | --- | --- |
| 执行改进 | 在现有目标和机制下，怎样更可靠、更快或更省？ | 修复缺陷、改善上下文、优化工具调用、减少重复工作 |
| 结构改进 | 产品流程、架构和资源分配的假设是否仍然成立？ | 简化产品路径、替换方案、调整模块边界、删除低价值能力 |
| 跨轮学习 | 本轮经验怎样改善后续诊断、选题和验证？ | 保留失败实验、记录适用条件、在新任务上验证方法变化 |

回路选择依据是否需要改变既有假设或机制，不按改动规模划分。允许补证据、继续观察或保持现状；不要求每轮重构或新增功能。实验先确定基线、验收标准、质量约束、成本和停止条件，再根据实际结果报告成立、未成立、待观察或无需变更。

**安装**：

```bash
npx skills add hash-panda/panda-skills --skill panda-product-evolution
```

也可通过上面的 Claude Code Plugin Marketplace 安装整个集合，或将 `skills/panda-product-evolution/` 完整复制到所用 Agent 的技能目录。

**调用示例**：在已安装技能的 Agent 中直接提出任务。

```text
使用 panda-product-evolution，评审这个产品的目标、基线和最近改动。
比较局部优化与结构改进，给出一个可证伪的最小实验。
```

```text
使用 panda-product-evolution，读取项目配置与上轮实验记录，完成一轮改进。
本轮已授权修改代码并运行本地测试，预算 60 分钟。
在授权范围内实施、验证并保存结果；业务数据不足时标为待观察。
```

**项目配置与模板**：

- 项目配置位置：`.panda-skills/panda-product-evolution/EXTEND.md`。可从[项目配置模板](skills/panda-product-evolution/assets/project-profile.template.md)填写目标、指标、质量约束、预算、已有授权和证据位置。
- 使用[实验记录模板](skills/panda-product-evolution/assets/experiment.template.md)保存假设、版本、结果与下轮动作；已有等价记录可直接复用。
- [评估协议](skills/panda-product-evolution/references/evaluation.md)说明比较条件、质量与成本权衡；[工作流与跨轮学习](skills/panda-product-evolution/references/operation.md)说明如何接入既有任务和恢复历史实验。
- 配置依次采用当前请求与已有明确授权、项目配置、XDG 配置和用户默认配置；低优先级只补齐缺项。缺少配置文件时从上下文提取已知信息，不因缺文件停止工作。

**运行范围**：这是一次改进回合的方法，不是后台调度器。安装后不会自动建立周期任务、获得项目权限或在会话结束后持续执行；周期运行需要接入已有调度或工作流。它不保证 ROI、增长或盈利，也不把自动改代码等同于已实现 RSI。技术验证与真实业务效果分别记录，结论以实际证据为准。

**验证记录**：[2026-11-10 评估报告](evals/panda-product-evolution/report-2026-11-10.md)包含四个决策场景的有无 Skill 对照、实际代码修复、独立行为测试，以及安装后新会话的第二轮接续。两组决策表现接近；报告保留了已验证能力、额外开销与尚未证明的效果。[复查方法与原始材料](evals/panda-product-evolution/README.md)可用于后续回归。

### Git Skills

#### panda-git-commit

智能 Git Commit Message 生成器，遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

```bash
# 首次使用：初始化项目配置（检测语言/规范/monorepo，缓存到 EXTEND.md）
/panda-git-commit --init

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

# 项目配置变更后，刷新缓存
/panda-git-commit --refresh
```

**核心功能**：

| Feature              | Description                                       |
| -------------------- | ------------------------------------------------- |
| Conventional Commits | 遵循标准 `type(scope): description` 格式          |
| Monorepo Support     | 自动检测 workspace packages，读取 `package.json` name 作为 scope |
| Smart Splitting      | 建议将不相关的变更拆分为独立 commit               |
| Language Auto-detect | 分析 git history 自动匹配团队的 commit 语言习惯   |
| Project Cache        | `--init` 缓存项目配置到 EXTEND.md，后续跳过重复检测 |
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
| `$XDG_CONFIG_HOME/panda-skills/<skill-name>/EXTEND.md` | XDG 用户配置（默认目录规则见各技能说明） |
| `~/.panda-skills/<skill-name>/EXTEND.md` | 用户级配置 |

## 多平台支持

| Platform        | 适配方式                                                       |
| --------------- | -------------------------------------------------------------- |
| **Claude Code** | 通过 `.claude-plugin/marketplace.json` 注册，原生支持 SKILL.md |
| **Cursor**      | 放入 `.cursor/skills/` 或项目级 skills 目录                    |
| **Codex**       | 放入 `.codex/skills/` 目录                                     |
| **其他**        | 由 Agent 读取 SKILL.md；含脚本的技能按各自说明调用工具 |

各平台复用同一套 SKILL.md 与配套资源；具体技能发现方式、工具权限和运行依赖以平台及技能说明为准。纯指令技能没有独立的 TypeScript CLI 入口。

## License

MIT
