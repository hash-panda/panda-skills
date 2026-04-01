# EXTEND.md 配置 Schema

## 概述

EXTEND.md 是用户偏好设置文件，采用 Markdown 格式，使用 `## 区块名` 分隔各配置区块，每个区块内使用 `key: value` 格式。

---

## 文件位置

按优先级从高到低：

| 路径 | 范围 |
|------|------|
| `.panda-skills/panda-article-illustrator/EXTEND.md` | 当前项目 |
| `${XDG_CONFIG_HOME:-$HOME/.config}/panda-skills/panda-article-illustrator/EXTEND.md` | XDG 用户目录 |
| `$HOME/.panda-skills/panda-article-illustrator/EXTEND.md` | 用户主目录 |

项目级配置优先于用户级配置。

---

## 完整 Schema

### 设置（Settings）

```markdown
## 设置
默认风格: auto
默认平台: xhs
默认输出目录: imgs-subdir
默认密度: per-section
水印: 关闭
水印内容: @my-account
水印位置: 右下角
语言: auto
```

| 字段 | 类型 | 默认值 | 可选值 |
|------|------|--------|--------|
| `默认风格` | string | `auto` | `auto`, `vector-illustration`, `notion`, `blueprint`, `warm`, `watercolor`, `elegant`, `editorial`, `screen-print`, `scientific`, `minimal`, `chalkboard` 等 |
| `默认平台` | string | `general` | `xhs`, `wechat`, `weibo`, `general` |
| `默认输出目录` | string | `imgs-subdir` | `imgs-subdir`, `same-dir`, `illustrations-subdir`, `independent` |
| `默认密度` | string | `per-section` | `minimal`(1-2), `balanced`(3-5), `per-section`, `rich`(6+) |
| `水印` | string | `关闭` | `关闭`, `开启` |
| `水印内容` | string | — | 水印显示的文字内容 |
| `水印位置` | string | `右下角` | `右下角`, `左下角`, `右上角`, `左上角`, `底部居中` |
| `语言` | string | `auto` | `auto`, `zh`, `en`, `ja` 等语言代码 |

### 角色（Character）

```markdown
## 角色
角色图片: ~/.panda-skills/characters/my-avatar.png
角色名称: 小熊猫
角色风格: 可爱卡通
默认融合模式: 讲解者
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `角色图片` | string | — | 角色参考图的文件路径（绝对路径或相对于用户主目录的 `~` 路径） |
| `角色名称` | string | — | 角色名称，用于提示词中引用 |
| `角色风格` | string | `可爱卡通` | `可爱卡通`, `Q版`, `简笔画`, `像素风`, `写实卡通` |
| `默认融合模式` | string | `讲解者` | `讲解者`, `参与者`, `点缀`, `无角色`, `auto`（自动根据类型选择） |

**整个角色区块为可选**。不配置时等同于 `默认融合模式: 无角色`。

### 自定义配色（可选）

```markdown
## 自定义配色
主色: #E07A5F
辅色: #81B29A
强调色: #F2CC8F
背景色: #F5F0E6
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `主色` | hex color | 主要颜色 |
| `辅色` | hex color | 辅助颜色 |
| `强调色` | hex color | 强调/高亮颜色 |
| `背景色` | hex color | 背景颜色 |

配置后，提示词中的配色将优先使用自定义配色。

---

## 完整示例

### 基础配置（无角色）

```markdown
## 设置
默认风格: vector-illustration
默认平台: xhs
默认输出目录: imgs-subdir
默认密度: per-section
水印: 关闭
语言: auto
```

### 完整配置（含角色 + 自定义配色）

```markdown
## 设置
默认风格: auto
默认平台: xhs
默认输出目录: imgs-subdir
默认密度: per-section
水印: 开启
水印内容: @hash-panda
水印位置: 右下角
语言: zh

## 角色
角色图片: ~/.panda-skills/characters/panda-avatar.png
角色名称: 小熊猫
角色风格: 可爱卡通
默认融合模式: auto

## 自定义配色
主色: #E07A5F
辅色: #81B29A
强调色: #F2CC8F
背景色: #F5F0E6
```

---

## 解析规则

1. 以 `## ` 开头的行标识区块名称
2. 区块内每行格式为 `key: value`
3. 空行和非 `key: value` 格式的行被忽略
4. value 的前后空格会被自动去除
5. `~` 开头的路径展开为用户主目录
6. 项目级 EXTEND.md 的配置优先于用户级
