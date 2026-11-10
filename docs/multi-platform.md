# 多平台适配说明

panda-skills 采用「SKILL.md + 按需添加的资源」结构，供支持技能指令的 AI Agent 使用。技能可包含工具脚本，也可以完全由指令、参考文档和模板组成；具体工具与权限由运行平台提供。

## 架构原理

| 组成 | 用途 | 是否必需 |
| --- | --- | --- |
| `SKILL.md` | 声明名称与触发场景，提供执行方法 | 必需 |
| `references/`、`assets/` | 按需读取的参考内容与可复用模板 | 可选 |
| `scripts/` | 需要确定性执行的工具逻辑；现有 TypeScript 工具通过 Bun 运行 | 可选 |
| `agents/` | 平台支持的技能界面元数据 | 可选 |

例如，`panda-git-commit` 使用 TypeScript 脚本分析变更，Agent 根据输出生成 commit message；`panda-product-evolution` 由 Agent 读取指令与模板，调用项目已有工具完成改进回合，本身无需 Node.js 或 Bun。使用 `npx skills` 安装器仍需要 Node.js / npm，这与技能运行依赖分开计算。

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

**含脚本技能的使用方式**：通过 TypeScript CLI 脚本调用其工具能力。

```bash
# 分析 git 变更
bun skills/panda-git-commit/scripts/main.ts

# 指定参数
bun skills/panda-git-commit/scripts/main.ts --split --lang zh
```

上述 Git 技能脚本输出 JSON 格式的结构化数据，可供 AI Agent 或工具链读取。纯指令技能应由 Agent 加载 `SKILL.md` 及其引用资源；`panda-product-evolution` 没有 CLI 脚本入口。

### 其他平台

接入其他平台时，按技能的实际任务确认能力：

1. **读取 Markdown 与配套资源** — 加载 `SKILL.md` 的工作流和所需参考资料。
2. **提供任务工具** — 按需要开放文件、仓库、测试或其他工具；只有含脚本的技能才需要相应脚本运行时。
3. **提供授权与结果交付机制** — 在用户已有授权内执行，展示真实结果和证据；平台未提供的能力不能由 Skill 自动补齐。

`panda-product-evolution` 可按以下方式调用：

```text
使用 panda-product-evolution，读取项目目标、最新基线与上轮记录，
在本轮预算及已有授权内实施并验证一个改进，保存可恢复的实验记录。
```

持久记录和周期触发需要平台或项目已有工作流支持。安装技能本身不创建后台调度任务，也不证明跨会话记忆或业务收益已生效。

## npx skills add 一键安装

[Vercel Skills CLI](https://skills.sh/) 提供跨平台的一键安装体验：

```bash
# 安装全部技能（自动检测本地平台）
npx skills add hash-panda/panda-skills

# 只安装指定技能
npx skills add hash-panda/panda-skills --skill panda-git-commit

# 安装纯指令的产品与系统改进技能
npx skills add hash-panda/panda-skills --skill panda-product-evolution

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

`panda-product-evolution` 本次通过 Git 仓库与 Plugin Marketplace 集成，不能据此推定它已发布到 ClawHub。当前发布脚本从旧技能的顶层 `version` 读取独立版本；新技能采用 `name` / `description` 的可移植元数据，集合版本在 Marketplace 清单中管理。在适配独立发布版本来源前，不使用下面的脚本发布此新技能，也不使用 `--all` 将其纳入批量发布。

发布通过 `scripts/sync-clawhub.sh` 脚本完成（需维护者操作）：

```bash
# 发布单个技能（--allow-cjk 允许中文内容）
bash scripts/sync-clawhub.sh --skill panda-git-commit --changelog "修复 monorepo scope 检测" --allow-cjk

# 预览模式（不实际发布）
bash scripts/sync-clawhub.sh --skill panda-git-commit --dry-run --allow-cjk
```

发布前需在项目根目录创建 `.env` 文件（参考 `.env.example`），配置 `CLAWHUB_TOKEN`。
