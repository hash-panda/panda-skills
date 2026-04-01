# 预设快捷方式

`--preset X` 展开为类型 + 风格的组合。用户可以覆盖其中任一维度。

## 按分类

### 技术与工程

| 预设 | 类型 | 风格 | 适用场景 |
|------|------|------|----------|
| `tech-explainer`（技术解读） | `infographic` | `blueprint` | API 文档、系统指标、技术深度文章 |
| `system-design`（系统设计） | `framework` | `blueprint` | 架构图、系统设计 |
| `architecture`（架构） | `framework` | `vector-illustration` | 组件关系、模块结构 |
| `science-paper`（科研论文） | `infographic` | `scientific` | 研究成果、实验数据 |

### 知识与教育

| 预设 | 类型 | 风格 | 适用场景 |
|------|------|------|----------|
| `knowledge-base`（知识库） | `infographic` | `vector-illustration` | 概念解释、教程 |
| `saas-guide`（SaaS 指南） | `infographic` | `notion` | 产品指南、工具教程 |
| `tutorial`（教程） | `flowchart` | `vector-illustration` | 步骤教程、安装指南 |
| `process-flow`（流程） | `flowchart` | `notion` | 工作流文档、上手流程 |

### 数据与分析

| 预设 | 类型 | 风格 | 适用场景 |
|------|------|------|----------|
| `data-report`（数据报告） | `infographic` | `editorial` | 数据新闻、指标报告 |
| `versus`（对决） | `comparison` | `vector-illustration` | 技术对比、框架比拼 |
| `business-compare`（商业对比） | `comparison` | `elegant` | 产品评估、战略选择 |

### 叙事与创意

| 预设 | 类型 | 风格 | 适用场景 |
|------|------|------|----------|
| `storytelling`（故事） | `scene` | `warm` | 个人随笔、感悟、成长故事 |
| `lifestyle`（生活方式） | `scene` | `watercolor` | 旅行、健康、生活方式 |
| `history`（历史） | `timeline` | `elegant` | 历史回顾、里程碑 |
| `evolution`（演进） | `timeline` | `warm` | 发展历程、成长旅程 |

### 评论与观点

| 预设 | 类型 | 风格 | 适用场景 |
|------|------|------|----------|
| `opinion-piece`（观点文章） | `scene` | `screen-print` | 评论、评述、批判性文章 |
| `editorial-poster`（社论海报） | `comparison` | `screen-print` | 辩论、对立观点 |
| `cinematic`（电影感） | `scene` | `screen-print` | 戏剧化叙事、文化随笔 |

---

## 内容类型 → 预设推荐

在步骤 2 确认设置时，根据步骤 1 的内容分析推荐预设：

| 内容类型（步骤 1 分析结果） | 主要推荐 | 备选 |
|----------------------------|----------|------|
| 技术 | `tech-explainer` | `system-design`, `architecture` |
| 教程 | `tutorial` | `process-flow`, `knowledge-base` |
| 方法论 / 框架 | `system-design` | `architecture`, `process-flow` |
| 数据 / 指标 | `data-report` | `versus`, `tech-explainer` |
| 对比 / 测评 | `versus` | `business-compare`, `editorial-poster` |
| 叙事 / 个人 | `storytelling` | `lifestyle`, `evolution` |
| 观点 / 评论 | `opinion-piece` | `cinematic`, `editorial-poster` |
| 历史 / 时间线 | `history` | `evolution` |
| 学术 / 研究 | `science-paper` | `tech-explainer`, `data-report` |
| SaaS / 产品 | `saas-guide` | `knowledge-base`, `process-flow` |

## 覆盖示例

- `--preset tech-explainer --style notion` = 信息图类型 + 极简手绘风格
- `--preset storytelling --type timeline` = 时间线类型 + 温暖风格

显式 `--type`/`--style` 参数始终优先于预设值。
