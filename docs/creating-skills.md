# 创建新技能

## 基本要求

| 要求              | 说明                                             |
| ----------------- | ------------------------------------------------ |
| **前缀**          | 所有技能必须使用 `panda-` 前缀                   |
| **name 字段**     | 最多 64 字符，仅限小写字母、数字、连字符         |
| **description**   | 最多 1024 字符，第三人称，包含功能说明和触发时机 |
| **SKILL.md 正文** | 控制在 500 行以内；超出部分放入 `references/`    |
| **References**    | 从 SKILL.md 引用，仅一级深度                     |

## SKILL.md Frontmatter 模板

```yaml
---
name: panda-<name>
description: <第三人称描述。做什么 + 何时触发。>
---
```

新技能以 `name` 和 `description` 作为可移植的基础元数据，不添加顶层 `version`。集合版本由 `.claude-plugin/marketplace.json` 中的 `metadata.version` 管理，并同步到 `panda-skills` 插件条目的 `version`；新增技能时更新集合版本，不连带修改其他技能的版本。

平台专用元数据仅在实际需要且目标格式支持时添加。不要为纯指令技能声明 Bun / npx 运行依赖。现有技能的历史字段暂时保留；现有 ClawHub 发布脚本读取顶层 `version`，因此发布采用新格式的技能前需先适配独立发布版本来源，不能用集合版号替代所有旧技能的独立版本。

## 步骤

1. 创建 `skills/panda-<name>/SKILL.md`（含 YAML 前置元数据）
2. 在 `skills/panda-<name>/scripts/` 中添加 TypeScript 脚本（如需要）
3. 在 `skills/panda-<name>/prompts/` 中添加 prompt 模板（如需要）
4. 在 `skills/panda-<name>/references/` 中添加参考文档（如需要）
5. 在 `.claude-plugin/marketplace.json` 中注册技能
6. 按需在 `assets/` 中添加供项目复用的模板，在 `agents/` 中添加平台支持的界面元数据
7. 更新 README.md、集合版本和相关使用说明

纯指令技能可以只有 `SKILL.md`，或配合参考文档与模板，不需要创建 `scripts/`。例如 `panda-product-evolution` 提供双环改进方法和实验模板，由 Agent 使用项目已有工具执行。

## Script Directory 模板

每个包含脚本的 SKILL.md 必须包含：

```markdown
## Script Directory

脚本位于本 SKILL.md 所在目录的 `scripts/` 子目录中。

**Agent 执行指引**：

1. 确定本 SKILL.md 文件所在目录路径为 `{baseDir}`
2. 脚本路径 = `{baseDir}/scripts/<script-name>.ts`
3. 解析 `${BUN_X}` 运行时：如果 `bun` 已安装 → `bun`；如果 `npx` 可用 → `npx -y bun`；否则提示安装 bun
4. 将本文档中所有 `{baseDir}` 和 `${BUN_X}` 替换为实际值
```

## EXTEND.md 支持

每个 SKILL.md 必须包含 EXTEND.md 加载逻辑：

```markdown
## Preferences (EXTEND.md)

检查 EXTEND.md 是否存在（按优先级顺序）：

| 路径                                                   | 位置       |
| ------------------------------------------------------ | ---------- |
| `.panda-skills/<skill-name>/EXTEND.md`                 | 项目目录   |
| `$XDG_CONFIG_HOME/panda-skills/<skill-name>/EXTEND.md` | XDG 配置   |
| `$HOME/.panda-skills/<skill-name>/EXTEND.md`           | 用户主目录 |
```

## 目录结构

```text
skills/panda-example/
├── SKILL.md              # 主指令文档（<500 行）
├── references/           # 可选：按需读取的参考资料
│   ├── styles.md         # 按需加载
│   └── examples.md       # 按需加载
├── assets/               # 可选：项目配置、实验记录等模板
│   └── project.template.md
├── prompts/              # 可选
│   └── template.md       # Prompt 模板
└── scripts/              # 可选：纯指令技能无需此目录
    └── main.ts           # CLI 入口
```
