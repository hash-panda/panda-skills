# CLAUDE.md

Panda Skills — 日常开发中可复用的 Agent 技能集。集合版本：**1.1.0**。

## 架构

技能通过 `.claude-plugin/marketplace.json` 中的 `panda-skills` 插件注册。每个技能位于 `skills/panda-<name>/` 目录，包含 `SKILL.md`（YAML 前置元数据 + 文档），以及按需添加的 `scripts/`、`references/`、`prompts/`、`assets/` 或 `agents/`。

| 分组     | 说明                                              |
| -------- | ------------------------------------------------- |
| Git 技能 | Git 工作流自动化（commit message 生成、变更拆分） |
| 产品与系统改进 | 双环改进、证据与实验、跨轮学习 |

## 运行技能

纯指令技能（如 `panda-product-evolution`）由 Agent 读取执行，本身不依赖 Node.js 或 Bun。它提供改进方法；具体项目工具、权限和调度由运行环境提供。

含 TypeScript 脚本的技能通过 Bun 运行（无需构建）。仅在需要执行这类脚本时，每个会话检测一次运行时：

```bash
if command -v bun &>/dev/null; then BUN_X="bun"
elif command -v npx &>/dev/null; then BUN_X="npx -y bun"
else echo "错误：请安装 bun: brew install oven-sh/bun/bun 或 npm install -g bun"; exit 1; fi
```

执行：`${BUN_X} skills/<skill-name>/scripts/main.ts [options]`

## 安全规范

- **禁止管道安装**：不使用 `curl | bash`，使用 `brew install` 或 `npm install -g`
- **系统命令**：使用数组形式的 `spawn`/`execFile`，禁止将未经过滤的输入传入 shell

## 代码风格

包含 TypeScript 脚本时使用 async/await 和类型安全接口；纯指令技能不必创建脚本。

## 添加新技能

所有技能必须使用 `panda-` 前缀。创建 `skills/panda-<name>/SKILL.md`，以 `name` 和 `description` 声明可移植的前置元数据；按需添加脚本与参考资源，在 `.claude-plugin/marketplace.json` 中注册并更新 README。

新技能不添加顶层 `version`；集合版本由 `.claude-plugin/marketplace.json` 的 `metadata.version` 管理，并同步到其中 `panda-skills` 插件条目的 `version`。现有技能的历史元数据保持不变。详见 `docs/creating-skills.md`。
