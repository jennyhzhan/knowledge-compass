# Knowledge Compass: Your Knowledge AI Assistant

卡帕斯是你的日常知识管理助手。聚焦在你的长期目标和短期关注事项，每日根据你的历史研究成果进行新信息搜寻整理，并通过对话深入研究你关注的领域。从而将每日信息和见解沉淀成长期个人知识体系。

Compass is your daily knowledge assistant. Centered on your long term goals and near term priorities, it continuously builds on your past research, curates new information every day, and deepens your understanding through dialogue, turning daily insights into a durable personal knowledge base.

## 系统概述

Compass帮助你管理每日的知识积累，优化知识结构形成长期积累：

- **charts（航海图）**: 每日自动生成的信息扫描和分析
- **logbook（航海日志）**: 每日的知识卡片和思考记录
- **harbor（港口）**: 长期的知识库和深度研究
- **navigation（航线）**: 每日的工作方向和总结

## 文件结构

```
compass/
├── charts/              # 每日航海图sounding
├── logbook/             # 航海日志
│   └── YYYY-MM-DD/
│       ├── insights/    # 深度洞察
│       ├── fleeting/    # 闪念笔记
│       └── map.canvas   # 知识图谱
├── harbor/              # 长期知识库
│   ├── concepts/        # 概念
│   ├── frameworks/      # 方法论
│   ├── companies/       # 公司研究
│   ├── people/          # 人物档案
│   └── skills/          # 技能学习
├── navigation/          # 每日总结文档course
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
3. **生成卡片**: 助手自动询问是否生成知识卡片

### 每日结束

1. **生成图谱**: 执行 `@map` 整理今日知识连接
2. **总结记录**: 执行 `@course` 生成今日course文档

### 定期深度分析

1. **回顾卡片**: 查看logbook中的历史卡片
2. **生成分析**: 执行 `@analysis` 生成公司或行业分析报告

## 使用建议

1. **每天早上先执行 `@navigation`** - 让助手为你准备今日海图
2. **深度探讨用 `@insight`** - 重要的思考和分析记录为insight
3. **临时想法用 `@fleeting`** - 不确定的想法先记录下来
4. **定期生成分析报告** - 基于积累的卡片生成深度研究

## 快速开始

### 安装和配置

#### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/knowledge-compass.git
cd knowledge-compass
```

#### 2. 配置环境

**创建配置文件**（必需）：

```bash
cp config.example.json config.json
```

然后编辑 `config.json`，将 `obsidian_path` 修改为你的Obsidian vault路径：

```json
{
  "obsidian_path": "/your/path/to/obsidian/vault/compass",
  ...
}
```

**重要**：`config.json` 已添加到 `.gitignore`，不会被提交到仓库，保护你的个人路径隐私。

#### 3. 可选配置

以下配置为可选项，根据个人需求调整：

1. **编辑模板文件**（在Obsidian的 `template/` 文件夹中）：

   - `course-template.md`：填写你的长期Task和近期Focus
   - `sounding-template.md`：根据你的关注领域调整结构
   - `card-template.md`：自定义知识卡片格式
2. **创建首个course文档**：在 `navigation/` 文件夹创建一个初始course文档，填写你当前的工作方向

### 基础用法（命令行）

```bash
# 查看状态
python compass_assistant.py

# 生成今日sounding
python compass_assistant.py @navigation
```

### AI增强用法（推荐）

在Claude Code中直接与助手对话：

1. 用简单的方式启动：`hi compass` 或 `卡帕斯你好` 或 `执行 @navigation`
2. 与助手探讨你感兴趣的话题
3. 助手会自动生成知识卡片和分析报告

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

## 模板

系统使用三个核心模板：

- `course-template.md` - 每日工作方向和总结
- `sounding-template.md` - 每日信息扫描和分析
- `card-template.md` - 知识卡片格式

### 知识卡片命名规则

**文件名格式**：`主题_YYYY-MM-DD.md`

**重要**：

- 不使用时间戳，只保留日期
- 如果同一天有相同主题的讨论，助手会自动合并到同一个文件中
- 合并时会保留所有讨论内容，按时间顺序整理

## 配置说明

### course-template.md 示例

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

文件名格式：`YYYY-MM-DD_sounding.md`（例如：`2026-02-06_sounding.md`）

```markdown
## Focus
[从course文档中自动提取]

## News Update
针对focus部分的话题，过去2天发生了哪些客观事实

## Analysis Update
针对这些客观事实，媒体/机构/专家/相关利益方的看法，未来几种可能的情形，是否建议你调整具体具体行动
```

注意：文件名包含日期，正文中无需重复标题

## License

MIT License

## Contributing

欢迎提交Issue和Pull Request！
