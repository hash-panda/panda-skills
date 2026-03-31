# CLAUDE.md

Panda Skills — 日常开发中可复用的 Agent 技能集。版本：**1.0.0**。

## 架构

技能通过 `.claude-plugin/marketplace.json` 中的 `panda-skills` 插件注册。每个技能位于 `skills/panda-<name>/` 目录，包含 `SKILL.md`（YAML 前置元数据 + 文档）、可选的 `scripts/`、`references/`、`prompts/`。

| 分组     | 说明                                              |
| -------- | ------------------------------------------------- |
| Git 技能 | Git 工作流自动化（commit message 生成、变更拆分） |

## 运行技能

TypeScript 通过 Bun 运行（无需构建）。每个会话检测一次运行时：

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

TypeScript，async/await，类型安全接口。

## 添加新技能

所有技能必须使用 `panda-` 前缀。创建 `skills/panda-<name>/SKILL.md`（含 YAML 前置元数据），在 `scripts/` 中添加脚本，在 `.claude-plugin/marketplace.json` 中注册。
