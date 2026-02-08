# Knowledge Compass: Your Personal AI Assistant

卡帕斯是你的日常知识管理助手，聚焦在你的长期目标和短期关注事项。每日根据你的近期关注话题，自动生成新信息文档；并通过对话深入研究你关注的领域，从而将每日信息和见解沉淀成长期个人知识体系。

Compass is your daily knowledge assistant. Centered on your long term goals and near term priorities, it continuously builds on your past research, curates new information every day, and deepens your understanding through dialogue, turning daily insights into a durable personal knowledge base.

## 为什么需要AI助手管理知识库

1. **专注长期重要的事** - 用更多时间聚焦长期重要的目标，对突然的灵感和短期不那么重要的信息花少量时间记录
2. **把信息和知识结构化** - 和助手针对核心问题开展讨论，助手将核心结论生成知识卡片，自动生成知识图谱
3. **每日学习有输出** - 在讨论中输出思考，在阅读助手自动生成的当日知识图谱和报告总结之后，可以进一步写下个人思考
4. **定期按主题总结认知** - 让零散的知识变得结构化，形成个人知识体系
5. **长期知识体系化** - 长期知识库指引下一步长短期关注方向

## 使用建议

1. **每天早上先执行 `@navigation`** - 助手通过阅读昨日总结文档YYYY-MM-DD(-1)_couse了解近期关注重点和工作进度，自动生成包含重点话题新信息的今日航海图YYYY-MM-DD_sounding
2. **深度探讨用 `@insight`** **发起讨论** - 重要的思考和分析记录为insight，有用的结论记录成insight知识卡片（助手会询问，也可用@card主动记录)
3. **临时想法用 `@fleeting`** **简单分析** - 不确定的想法和临时遇到的信息先简单讨论，有价值的记录成fleeting知识卡片
4. **总结讨论核心 `@map` `@course`** - 生成当日知识图谱，和当日总结文档，并在总结文档中添加自己的个人思考或偏好
5. **定期生成分析报告 `@analysis`** - 基于积累的卡片生成深度研究，长期知识库归档在harbor

## 系统概述

Compass帮助你管理每日的知识积累，优化知识结构形成长期积累：

- **charts（航海图）**: 每日自动生成的信息扫描和分析
- **logbook（航海日志）**: 每日的知识卡片和思考记录
- **harbor（港口）**: 长期的知识库和深度研究
- **navigation（航线）**: 每日的工作方向和总结
- **template**: 编写输出文档的内容要求

## 文件结构

```
compass/
├── charts/              # 每日自动航海图
│   └── YYYY-MM-DD_sounding  
├── logbook/             # 航海日志
│   └── YYYY-MM-DD/
│       ├── insights/    # 重点问题，在讨论过程中随时将结论加入知识卡片
│       ├── fleeting/    # 零碎信息，在讨论过程中随时将结论加入知识卡片
│       └── map.canvas   # 自动生成知识图谱
├── harbor/              # 长期知识库，定期logbook知识卡片生成或书写
│   ├── concepts/  
│   ├── frameworks/      # 方法论
│   ├── companies/   
│   ├── people/  
│   └── skills/  
├── navigation/          # 每日自动总结文档，可添加个人思考Note
│   └── YYYY-MM-DD_course
└── template/            # 模板文件
```

## 典型工作流

### 每日早晨

1. **启动助手**: 你好卡帕斯，执行 `@navigation`
2. **阅读海图**: 查看今日sounding了解最新动态
3. **选择话题**: 告诉助手你想深入探讨的话题

### 工作过程

1. **探讨话题**: 使用 `@insight` 深度探讨重点话题
2. **记录想法**: 使用 `@fleeting` 记录临时想法
3. **生成卡片**: 助手自动询问是否生成知识卡片，也可通过 `@card`主动记录知识卡片

### 每日结束

1. **生成图谱**: 执行 `@map` 整理今日知识连接
2. **总结记录**: 执行 `@course` 生成今日course文档，然后在course文档进一步记录自己的思考和偏好

### 定期深度分析

1. **回顾卡片**: 查看logbook中的历史卡片，`@harbor`记录进个人长期知识库
2. **生成分析**: 执行 `@analysis` 生成公司或行业分析报告，归入长期知识库

---

# 快速开始

## 方式 A：Claude Code 模式（推荐）

### 配置步骤

1. 复制配置文件：`config.example.json` → `config.json`
2. 设置 `obsidian_path` 为你的 Obsidian vault 路径（一个本地文件夹）

### 第一次启动

在 Claude Code 中，进入项目目录后运行：

```bash
# 方式1：查看状态（推荐）
python compass.py --status

# 方式2：直接对话
hi compass, 帮我初始化
```

系统会自动：

- 创建文件夹结构（charts, logbook, harbor, navigation, template）
- 创建模板文件
- 生成昨天日期的 `navigation/YYYY-MM-DD_course.md`

### 填写初始配置

打开自动生成的 `navigation/昨天日期_course.md`（例如：`2026-02-05_course.md`），填写：

- **Task（长期目标）**：你希望长期关注和实现的目标
- **Focus（近期关注）**：最近1-2周重点关注的话题和方向

> **为什么是昨天日期？**
> 因为 `@navigation` 命令会读取昨天的course来获取Focus，然后生成今天的sounding。填写完成后，即可执行 `@navigation` 开始今天的工作。

### 开始使用

填写完Task和Focus后，在 Claude Code 中触发指令：

```
@navigation              # 生成今日海图
@insight 探讨AI Agent    # 深度探讨话题
记录一个产品设计想法      # 记录临时想法
```

---

## 方式 B：Python 直跑（API 模式）

### 依赖说明

#### 基础依赖

* 使用 Python 标准库时无需额外安装（仅适用于不调用外部模型 API 的路径）。

#### API 模式依赖（必须）

按你的 provider 选择安装：

```bash
pip install openai
# 或
pip install anthropic
```

说明：OpenAI、DeepSeek 使用 `openai` 库；Anthropic Claude 使用 `anthropic` 库。

---

### API 配置（写在 config.json）

建议你把 `api_key` 放环境变量，`config.json` 里只放 provider、model、base_url 等不敏感字段。OpenAI 官方也明确强调不要在客户端或公开代码中暴露 API key。

#### 1. Claude (Anthropic)

```json
{
  "api": {
    "enabled": true,
    "provider": "anthropic",
    "base_url": "https://api.anthropic.com",
    "model": "claude-sonnet-4-5-20250929"
  }
}
```

**说明**：

- Anthropic 官方说明 Claude API 的根地址为 `https://api.anthropic.com`
- Messages API 路径为 `POST /v1/messages`
- 推荐模型：`claude-sonnet-4-5-20250929`、`claude-opus-4` 等

**获取 API Key**：[https://console.anthropic.com](https://console.anthropic.com)

**环境变量设置**：

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

---

#### 2. OpenAI (包括 Codex)

```json
{
  "api": {
    "enabled": true,
    "provider": "openai",
    "base_url": "https://api.openai.com/v1",
    "model": "gpt-5.3-codex"
  }
}
```

**说明**：

- OpenAI 的 v1 API 以 `https://api.openai.com/v1` 为常见根路径
- 支持模型：`gpt-5.3-codex` (推荐)、`gpt-5.2-codex`、`gpt-4-turbo` 等
- Codex 是 OpenAI 的代码优化模型，使用相同的 API 配置，只需修改 model 字段

**获取 API Key**：[https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**环境变量设置**：

```bash
export OPENAI_API_KEY="your-api-key-here"
```

---

#### 3. DeepSeek

```json
{
  "api": {
    "enabled": true,
    "provider": "deepseek",
    "base_url": "https://api.deepseek.com/v1",
    "model": "deepseek-chat"
  }
}
```

**说明**：

- DeepSeek 使用 OpenAI 兼容的 API 接口
- 官方 API 地址：`https://api.deepseek.com/v1`
- 推荐模型：`deepseek-chat`、`deepseek-coder`

**获取 API Key**：[https://platform.deepseek.com](https://platform.deepseek.com)

**环境变量设置**：

```bash
export OPENAI_API_KEY="your-deepseek-api-key-here"
```

注意：DeepSeek 使用 `openai` 库和 `OPENAI_API_KEY` 环境变量名。

---

### 配置步骤

1. 复制配置文件：`config.example.json` → `config.json`
2. 设置 `obsidian_path`
3. 配置 `api.enabled=true`、`api.provider`、`api.model`，按 provider 填 `base_url`
4. 安装依赖：`pip install openai` 或 `pip install anthropic`
5. 设置环境变量注入 API key

### 第一次启动

```bash
# 初始化并查看状态
python compass.py --status
```

系统会自动创建文件夹结构、模板文件和昨天日期的course文档。

### 填写初始配置

打开 `navigation/昨天日期_course.md`，填写 Task（长期目标）和 Focus（近期关注）

### 开始使用

```bash
python compass.py --status      # 查看状态
python compass.py @navigation   # 生成今日海图
# 其他命令需要通过API模式或Claude Code交互
```

---

## 命令系统

你可以用自然语言或 `@` 命令与助手交互：

| 命令            | 功能           | 说明                                       | 自然语言示例         |
| --------------- | -------------- | ------------------------------------------ | -------------------- |
| `@navigation` | 生成今日海图   | 读取昨日course，搜索最新信息，生成sounding | "开始今天的工作"     |
| `@insight`    | 重点话题探讨   | 深度探讨focus相关话题，生成insight卡片     | "探讨某个话题的进展" |
| `@fleeting`   | 临时话题探讨   | 记录碎片化的想法和信息                     | "记录一个想法"       |
| `@card`       | 记录知识卡片   | 将讨论结论记录为知识卡片                   | "保存为卡片"         |
| `@map`        | 生成知识图谱   | 整理当日知识卡片的连接关系                 | "生成知识图谱"       |
| `@harbor`     | 归档长期知识库 | 将重要内容归档到harbor                     | "归档到harbor"       |
| `@analysis`   | 生成分析报告   | 基于历史卡片生成深度分析                   | "生成分析报告"       |
| `@course`     | 生成今日course | 总结当天工作，生成course文档               | "生成今日总结"       |

**注意**：使用 `@` 而非 `/` 避免与Claude skills命令冲突

## 技术栈

- Python 3.x
- Obsidian（知识库）
- Claude API（AI分析和搜索）

## 模板使用

系统使用三个默认模板，所有模版均可在template文件夹中自由定义：

- `course-template.md` - 每日工作方向和总结
- `sounding-template.md` - 每日信息扫描和分析
- `card-template.md` - 知识卡片格式

深度分析 `@analysis` 可以在harbor/frameworks中自定义添加模板

### course-template.md 示例

文件名格式：`YYYY-MM-DD_course.md`

```markdown
## Task长期目标
[在这里填写你的长期目标]

## Focus近期关注
[在这里填写你的近期关注话题]

## Note个人思考
[每日根据探讨话题，写下个人观点或偏好。明天AI助手会通过Note更加明白你的需求，确保你在长期目标正确的轨道上]

## Reference参考文档
[在这里放上你希望agent重点参考的文件/网页/文本等资料]

## Today's Summary
[每日总结，由系统自动填充]

## What's Next
[下一步计划，由系统自动填充]
```

### sounding-template.md 示例

文件名格式：`YYYY-MM-DD_sounding.md`

```markdown
## Focus
[从course文档中自动提取]

## News Update
针对focus部分的话题，过去2天发生了哪些客观事实

## Analysis Update
针对这些客观事实，媒体/机构/专家/相关利益方的看法，未来几种可能的情形，是否建议你调整具体具体行动
```

### card-template.md 示例

**文件名格式**：`主题_YYYY-MM-DD.md`

**重要**：

- 不使用时间戳，只保留日期
- 如果同一天有相同主题的讨论，助手会自动合并到同一个文件中
- 合并时会保留所有讨论内容，按时间顺序整理

## License

MIT License

## Contributing

欢迎提交Issue和Pull Request！
