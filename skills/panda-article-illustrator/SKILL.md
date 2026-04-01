---
name: panda-article-illustrator
description: >-
  分析文章结构，识别需要配图的位置，生成带有可选卡通角色融合的插图。
  支持 类型(Type) × 风格(Style) × 角色(Character) 三维组合，
  针对社交媒体场景优化。
  触发词："配图"、"文章插图"、"illustrate"、"add images"、
  "为文章配图"、"生成配图"。
version: 1.0.0
metadata:
  openclaw:
    homepage: https://github.com/hash-panda/panda-skills#panda-article-illustrator
---

# 文章智能配图

分析文章内容，识别适合配图的位置，生成风格一致的插图。支持可选的卡通角色融合——有角色图片时自然融入画面，无角色时生成标准配图。

## 三个维度

| 维度 | 控制 | 示例 |
|------|------|------|
| **类型（Type）** | 信息结构 | 信息图、场景图、流程图、对比图、框架图、时间线 |
| **风格（Style）** | 视觉美学 | 矢量插画、极简、蓝图、水彩、丝网印刷 |
| **角色（Character）** | 卡通融合 | 讲解者、参与者、点缀、无角色 |

自由组合：`--type infographic --style blueprint --role narrator`

或使用预设：`--preset tech-explainer` → 类型 + 风格一步到位。详见 [预设快捷方式](references/style-presets.md)。

## 类型（Type）

| 类型 | 适用场景 |
|------|----------|
| `infographic`（信息图） | 数据、指标、技术概念 |
| `scene`（场景图） | 叙事、情感、氛围 |
| `flowchart`（流程图） | 流程、工作流 |
| `comparison`（对比图） | 并排对比、方案选择 |
| `framework`（框架图） | 模型、架构、体系 |
| `timeline`（时间线） | 历史、演进、里程碑 |

## 风格（Style）

详见 [references/styles.md](references/styles.md) 了解核心风格、完整画廊以及类型 × 风格兼容性。

## 角色融合模式

| 模式 | 描述 | 适用类型 |
|------|------|----------|
| `narrator`（讲解者） | 站在旁边讲解，指向关键区域 | 信息图、流程图、框架图 |
| `participant`（参与者） | 角色是场景的一部分，与内容互动 | 场景图、时间线 |
| `decorator`（点缀） | 缩小出现在角落，表情反映内容 | 对比图、信息图 |
| `none`（无角色） | 不使用角色，标准配图 | 所有类型 |

无角色配置时自动使用 `none` 模式，行为与标准配图完全一致。

详见 [references/character-roles.md](references/character-roles.md)。

## 工作流程

```
- [ ] 步骤 0: 预检查（EXTEND.md、参考文件、配置）
- [ ] 步骤 1: 分析文章内容
- [ ] 步骤 2: 确认设置（AskUserQuestion）
- [ ] 步骤 3: 生成大纲
- [ ] 步骤 4: 生成提示词 + 图片
- [ ] 步骤 5: 完成
```

### 步骤 0: 预检查

**0.1 加载偏好设置（EXTEND.md）⛔ 阻塞**

```bash
# macOS, Linux, WSL, Git Bash
test -f .panda-skills/panda-article-illustrator/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/panda-skills/panda-article-illustrator/EXTEND.md" && echo "xdg"
test -f "$HOME/.panda-skills/panda-article-illustrator/EXTEND.md" && echo "user"
```

| 结果 | 操作 |
|------|------|
| 找到 | 读取、解析、显示摘要 |
| 未找到 | ⛔ 运行 [首次配置](references/config/first-time-setup.md) |

**0.2 加载角色配置**

从 EXTEND.md 的"角色"区块读取角色图片路径、名称、风格、默认融合模式。如果角色图片路径存在，验证文件是否可访问。无角色配置时跳过此步。

完整流程详见 [references/workflow.md](references/workflow.md#步骤-0-预检查)

### 步骤 1: 分析内容

| 分析项 | 输出 |
|--------|------|
| 内容类型 | 技术 / 教程 / 方法论 / 叙事 / 观点 |
| 配图目的 | 信息传达 / 可视化 / 想象力激发 |
| 核心论点 | 2-5 个主要观点 |
| 配图位置 | 哪些段落适合插图 |
| 目标平台 | 小红书 / 微信 / 微博 / 通用 |

**关键**：隐喻 → 可视化底层概念，而非字面意思。

完整流程详见 [references/workflow.md](references/workflow.md#步骤-1-分析内容)

### 步骤 2: 确认设置 ⚠️

**使用 AskUserQuestion，最多 4 个问题。**

| 问题 | 选项 |
|------|------|
| **Q1: 预设或类型** | [推荐预设], [备选预设], 或手动选择类型 |
| **Q2: 密度** | 精简(1-2), 均衡(3-5), 按章节(推荐), 丰富(6+) |
| **Q3: 风格** | [推荐], 矢量插画, 极简, 蓝图, 水彩, 丝网印刷, 其他 |
| **Q4: 角色模式** | 自动推荐, 讲解者, 参与者, 点缀, 无角色 — **仅在有角色配置时显示** |

完整流程详见 [references/workflow.md](references/workflow.md#步骤-2-确认设置-)

### 步骤 3: 生成大纲

保存 `outline.md`，包含前置元数据（类型、密度、风格、图片数量）和每张图的条目：

```yaml
## 插图 1
**位置**: [章节/段落]
**目的**: [为什么需要这张图]
**视觉内容**: [画面描述]
**角色动作**: [讲解者 - 指向核心数据] （仅在有角色时）
**文件名**: 01-infographic-concept-name.png
```

完整模板详见 [references/workflow.md](references/workflow.md#步骤-3-生成大纲)

### 步骤 4: 生成提示词 + 图片

⛔ **阻塞：提示词文件必须在图片生成之前保存。**

1. 为每张插图创建提示词文件，遵循 [references/prompt-construction.md](references/prompt-construction.md)
2. 保存到 `prompts/NN-{type}-{slug}.md`，含 YAML 前置元数据
3. 提示词 **必须** 使用类型化模板，包含结构化区块（区域 / 标签 / 颜色 / 风格 / 角色 / 比例）
4. 有角色时注入 **角色区块**，使用 `--ref` 传递角色参考图
5. 调用图片生成技能生成图片

完整流程详见 [references/workflow.md](references/workflow.md#步骤-4-生成提示词--图片)

### 步骤 5: 完成

在文章段落后插入 `![描述]({相对路径}/NN-{type}-{slug}.png)`。

```
文章配图完成！
文章：[路径] | 类型：[type] | 密度：[level] | 风格：[style]
角色：[名称] / [融合模式] 或 无角色
平台：[platform] | 比例：[ratio]
图片：X/N 已生成
```

## 输出目录

输出目录由 EXTEND.md 中的 `默认输出目录` 决定（首次配置时设定）：

| `默认输出目录` | 输出路径 | Markdown 插入路径 |
|----------------|----------|-------------------|
| `imgs-subdir`（默认） | `{article-dir}/imgs/` | `imgs/NN-{type}-{slug}.png` |
| `same-dir` | `{article-dir}/` | `NN-{type}-{slug}.png` |
| `illustrations-subdir` | `{article-dir}/illustrations/` | `illustrations/NN-{type}-{slug}.png` |
| `independent` | `illustrations/{topic-slug}/` | `illustrations/{topic-slug}/NN-{type}-{slug}.png`（相对于 cwd） |

所有辅助文件（大纲、提示词）保存在输出目录内：

```
{output-dir}/
├── outline.md
├── prompts/
│   └── NN-{type}-{slug}.md
└── NN-{type}-{slug}.png
```

当输入为 **粘贴内容**（无文件路径）时，始终使用 `illustrations/{topic-slug}/`，并保存 `source-{slug}.{ext}`。

**Slug 规则**：2-4 个词，kebab-case。**冲突**：追加 `-YYYYMMDD-HHMMSS`。

## 修改已有配图

| 操作 | 步骤 |
|------|------|
| 编辑 | 更新提示词 → 重新生成 → 更新引用 |
| 添加 | 确定位置 → 创建提示词 → 生成 → 更新大纲 → 插入 |
| 删除 | 删除文件 → 移除引用 → 更新大纲 |

## 参考文档

| 文件 | 内容 |
|------|------|
| [references/workflow.md](references/workflow.md) | 完整工作流程 |
| [references/styles.md](references/styles.md) | 风格画廊 |
| [references/style-presets.md](references/style-presets.md) | 预设快捷方式 |
| [references/prompt-construction.md](references/prompt-construction.md) | 提示词构建指南 |
| [references/character-roles.md](references/character-roles.md) | 角色融合模式详解 |
| [references/character-style-compat.md](references/character-style-compat.md) | 角色风格兼容性 |
| [references/platform-presets.md](references/platform-presets.md) | 社交平台预设 |
| [references/config/first-time-setup.md](references/config/first-time-setup.md) | 首次配置流程 |
| [references/config/preferences-schema.md](references/config/preferences-schema.md) | EXTEND.md 完整 schema |
