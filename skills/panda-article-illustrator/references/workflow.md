# 完整工作流程

## 流程总览

```
输入 → [步骤 0: 预检查] ─┬─ 找到 EXTEND.md → 继续
                          │
                          └─ 未找到 → 首次配置 ⛔ 阻塞
                                      │
                                      └─ 完成配置 → 保存 EXTEND.md → 继续
                                                                        │
        ┌─────────────────────────────────────────────────────────────┘
        ↓
分析 → [确认设置] → 大纲 → 提示词 → 图片 → 完成
```

## 进度清单

```
文章配图进度：
- [ ] 步骤 0: 预检查
  - [ ] 0.1 加载偏好设置（EXTEND.md）⛔ 阻塞
    - [ ] 找到 → 加载 → 继续
    - [ ] 未找到 → 首次配置 → 必须完成后才能继续
  - [ ] 0.2 加载角色配置（如有）
- [ ] 步骤 1: 分析文章内容
- [ ] 步骤 2: 确认设置 ⚠️ 必须
- [ ] 步骤 3: 生成大纲
- [ ] 步骤 4: 生成提示词 + 图片
  - [ ] 4.1 保存提示词文件
  - [ ] 4.2 选择图片生成技能
  - [ ] 4.3 逐张生成（有角色时带 --ref）
- [ ] 步骤 5: 完成报告
```

---

## 步骤 0: 预检查

### 0.1 加载偏好设置（EXTEND.md）⛔ 阻塞

检查 EXTEND.md 是否存在（优先级：项目 → XDG → 用户目录）：

```bash
# macOS, Linux, WSL, Git Bash
test -f .panda-skills/panda-article-illustrator/EXTEND.md && echo "project"
test -f "${XDG_CONFIG_HOME:-$HOME/.config}/panda-skills/panda-article-illustrator/EXTEND.md" && echo "xdg"
test -f "$HOME/.panda-skills/panda-article-illustrator/EXTEND.md" && echo "user"
```

```powershell
# PowerShell (Windows)
if (Test-Path .panda-skills/panda-article-illustrator/EXTEND.md) { "project" }
$xdg = if ($env:XDG_CONFIG_HOME) { $env:XDG_CONFIG_HOME } else { "$HOME/.config" }
if (Test-Path "$xdg/panda-skills/panda-article-illustrator/EXTEND.md") { "xdg" }
if (Test-Path "$HOME/.panda-skills/panda-article-illustrator/EXTEND.md") { "user" }
```

| 结果 | 操作 |
|------|------|
| 找到 | 读取、解析、显示摘要 |
| 未找到 | ⛔ 运行 [首次配置](config/first-time-setup.md) → 保存 EXTEND.md → 继续 |

**关键**：未找到时，必须先完成首次配置，不得跳到内容分析或其他步骤。

### 0.2 加载角色配置

从 EXTEND.md 中解析"角色"区块：

```markdown
## 角色
角色图片: /path/to/avatar.png
角色名称: 小熊猫
角色风格: 可爱卡通
默认融合模式: 讲解者
```

| 情况 | 操作 |
|------|------|
| 角色区块存在且图片路径有效 | 加载角色信息，后续步骤启用角色融合 |
| 角色区块存在但图片路径无效 | 警告用户，降级为无角色模式 |
| 无角色区块 | 使用无角色模式，所有角色相关选项跳过 |

### 0.3 读取参考文档

加载以下参考文档以备后续步骤使用：
- [prompt-construction.md](prompt-construction.md)
- [styles.md](styles.md)
- [character-roles.md](character-roles.md)（如有角色）
- [platform-presets.md](platform-presets.md)

---

## 步骤 1: 分析内容

### 1.1 内容分析

| 分析维度 | 输出 |
|----------|------|
| 内容类型 | 技术 / 教程 / 方法论 / 叙事 / 观点 |
| 配图目的 | 信息传达 / 可视化 / 想象力激发 |
| 核心论点 | 2-5 个主要观点 |
| 配图位置 | 哪些段落/章节适合插图 |

### 1.2 提取关键要素

- **论点**：文章的核心观点和支撑论据
- **数据**：具体数字、百分比、指标
- **概念**：需要可视化的抽象概念
- **对比**：并列或对立的要素
- **流程**：步骤化的过程

### 1.3 配图位置判断

适合配图的位置：
- 核心论点（必须配图）
- 抽象概念需要可视化的段落
- 数据密集的段落
- 流程/步骤说明
- 对比/分析段落

不适合配图的位置：
- 字面隐喻（应可视化底层概念，而非字面意思）
- 纯装饰性需求
- 与通用图库无异的场景

### 1.4 平台检测

检查文章目标平台（按以下优先级）：

1. 用户显式指定 `--platform`
2. EXTEND.md 中的 `默认平台` 配置
3. 根据文章格式/路径推断（如 `xhs/` 目录）
4. 默认使用通用设置

---

## 步骤 2: 确认设置 ⚠️

**使用 AskUserQuestion 工具，一次提问，最多 4 个问题。**

### 分析摘要展示

先展示分析结果：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
内容分析
  主题：[topic] | 类型：[content_type]
  要点：[key points summary]
  配图位置：[N] 处
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
推荐方案
  类型：[type]  风格：[style]
  密度：[density]  平台：[platform]
  角色：[角色名称] / [融合模式] 或 "无角色"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 提问内容

| 问题 | 选项 |
|------|------|
| **Q1: 预设或类型** | [推荐预设], [备选预设], 或手动：信息图、场景图、流程图、对比图、框架图、时间线、混合 |
| **Q2: 密度** | 精简(1-2), 均衡(3-5), 按章节(推荐), 丰富(6+) |
| **Q3: 风格** | [推荐], 矢量插画, 极简, 蓝图, 温暖, 水彩, 丝网印刷, 其他 — 如已选预设可跳过 |
| **Q4: 角色模式** | 自动推荐(推荐), 讲解者, 参与者, 点缀, 无角色 — **仅在有角色配置时显示** |

**无角色配置时**：只显示 Q1-Q3，Q4 跳过。

---

## 步骤 3: 生成大纲

保存 `outline.md` 到输出目录。

### 大纲格式

```yaml
---
type: infographic
density: per-section
style: vector-illustration
image_count: 4
platform: xhs
character:
  name: 小熊猫
  role: narrator
---

## 插图 1
**位置**: 第一章"概述"之后
**目的**: 展示核心架构的组成部分
**视觉内容**: 三层架构图，标注各层的具体技术栈
**类型应用**: 框架图 — 层级结构，自上而下
**角色动作**: 讲解者 — 站在右下角，右手指向最上层
**文件名**: 01-framework-architecture-overview.png

## 插图 2
**位置**: 第二章"工作流程"之后
**目的**: 展示数据处理的完整流程
**视觉内容**: 从数据输入到输出的 5 步流程
**类型应用**: 流程图 — 从左到右
**角色动作**: 讲解者 — 站在流程起点旁，指向第一步
**文件名**: 02-flowchart-data-pipeline.png
```

### 大纲要求

- 位置必须与文章内容对应
- 类型保持一致（除非选择了"混合"）
- 风格在所有插图中保持统一
- 数量与密度选择匹配
- 有角色时，每张图都包含"角色动作"字段
- 角色动作根据当前插图的内容语义选择（参考 [character-roles.md](character-roles.md#角色动作与内容语义映射)）

---

## 步骤 4: 生成提示词 + 图片

### 4.1 保存提示词文件 ⛔ 阻塞

**提示词文件必须在图片生成之前保存。**

为每张插图创建提示词文件：

1. 遵循 [prompt-construction.md](prompt-construction.md) 构建提示词
2. 保存到 `{output-dir}/prompts/NN-{type}-{slug}.md`
3. 包含 YAML 前置元数据（illustration_id、type、style、character_role）
4. 使用类型化模板，包含结构化区块
5. 有角色时注入"角色"区块（参考 [prompt-construction.md](prompt-construction.md#角色区块有角色时)）
6. 标签中**必须**包含文章中的具体数据：真实数字、术语、指标、引文
7. **不要**直接传递临时内联提示词给 `--prompt`，必须先保存文件

### 4.2 选择图片生成技能

检查已安装的图片生成技能：
- 如果有 `baoyu-imagine`：优先使用
- 如果有多个技能：询问用户偏好
- 读取所选技能的 SKILL.md，遵循其文档化接口

### 4.3 处理参考图

| 情况 | 操作 |
|------|------|
| 有角色 + 技能支持 `--ref` | 每张图都传递角色图片作为 `--ref` |
| 有角色 + 技能不支持 `--ref` | 在每个提示词文件中嵌入角色的详细文字描述 |
| 有其他参考图（`direct` 用途） | 传递给 `--ref` 参数 |
| 有其他参考图（`style`/`palette` 用途） | 提取特征追加到提示词文本 |

### 4.4 生成图片

为每张插图执行：

1. 如果已存在同名图片：备份为 `NN-{type}-{slug}-backup-YYYYMMDD-HHMMSS.png`
2. 使用所选图片生成技能生成
3. 传递提示词文件（`--promptfiles`）、输出路径（`--image`）、宽高比（`--ar`）
4. 有角色时追加 `--ref` 角色参考图
5. 根据平台选择合适的宽高比（参考 [platform-presets.md](platform-presets.md)）
6. 生成失败时自动重试一次
7. 报告进度："已完成 X/N"

### 4.5 批量生成优化

当多张图片的提示词文件都已保存：
- 优先使用批量模式（`--batchfile`）而非逐张生成
- 生成 batch.json 包含所有任务
- 每个任务包含提示词文件路径、输出路径、宽高比、角色参考图

---

## 步骤 5: 完成

### 5.1 插入文章

在对应段落后插入 Markdown 图片引用：

```markdown
![描述]({相对路径}/NN-{type}-{slug}.png)
```

路径基于输出目录设置计算相对于文章文件的路径。

### 5.2 完成报告

```
文章配图完成！

文章：[文件路径]
类型：[type] | 密度：[level] | 风格：[style]
角色：[名称] / [融合模式] 或 "无角色"
平台：[platform] | 比例：[ratio]
图片：X/N 已生成
位置：[输出目录路径]

文件列表：
✓ outline.md
✓ prompts/01-{type}-{slug}.md
✓ prompts/02-{type}-{slug}.md
✓ 01-{type}-{slug}.png
✓ 02-{type}-{slug}.png
```
