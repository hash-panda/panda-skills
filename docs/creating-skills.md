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
version: <语义化版本，与 marketplace.json 一致>
metadata:
  openclaw:
    homepage: https://github.com/hash-panda/panda-skills#panda-<name>
    requires:
      anyBins:
        - bun
        - npx
---
```

## 步骤

1. 创建 `skills/panda-<name>/SKILL.md`（含 YAML 前置元数据）
2. 在 `skills/panda-<name>/scripts/` 中添加 TypeScript 脚本（如需要）
3. 在 `skills/panda-<name>/prompts/` 中添加 prompt 模板（如需要）
4. 在 `skills/panda-<name>/references/` 中添加参考文档（如需要）
5. 在 `.claude-plugin/marketplace.json` 中注册技能
6. 更新 README.md

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
├── references/
│   ├── styles.md         # 按需加载
│   └── examples.md       # 按需加载
├── prompts/
│   └── template.md       # Prompt 模板
└── scripts/
    └── main.ts           # CLI 入口
```
