#!/usr/bin/env python3
"""
Knowledge Compass - 你的日常知识管理助手
支持命令行和AI增强两种使用方式

使用方式：
1. 在Claude Code中直接对话使用（推荐）
2. 命令行独立运行: python compass.py @navigation
3. 配合Claude API独立运行（需配置API key）
"""

import os
import sys
import json
from datetime import datetime, timedelta
from pathlib import Path


class CompassAssistant:
    """
    统一的知识管理助手

    核心原则（Claude使用指南）：

    1. COURSE文档生成原则：
       - 保持简洁：Today's Summary约500字，聚焦核心洞察
       - What's Next只列最重要的1-2件事
       - 根据Focus筛选内容，不需要面面俱到

    2. 知识图谱（map.canvas）生成原则：
       - 不需要包含所有卡片，只选择与Focus最相关的
       - 节点数控制在5-10个左右
       - 突出核心主题和关键连接

    3. 内容筛选逻辑：
       - 优先级：insights > fleeting
       - 相关性：与Focus关键词匹配的优先
       - 重要性：对核心决策或关键认知有重要影响的优先

    4. Note板块：
       - 位于Focus和Reference之间
       - 记录用户的个人认知和思考
       - 会被读取并影响后续分析
    """

    def __init__(self, config_path=None):
        """初始化助手"""
        # 加载配置文件
        if config_path is None:
            config_path = Path(__file__).parent / "config.json"
        else:
            config_path = Path(config_path)

        if not config_path.exists():
            raise FileNotFoundError(
                f"配置文件未找到: {config_path}\n"
                f"请复制 config.example.json 为 config.json 并填写你的配置"
            )

        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = json.load(f)

        # 设置路径
        self.obsidian_path = Path(self.config['obsidian_path'])
        self.charts = self.obsidian_path / self.config['folders']['charts']
        self.logbook = self.obsidian_path / self.config['folders']['logbook']
        self.harbor = self.obsidian_path / self.config['folders']['harbor']
        self.navigation = self.obsidian_path / self.config['folders']['navigation']
        self.template = self.obsidian_path / self.config['folders']['template']

        # 日期
        self.today = datetime.now().strftime("%Y-%m-%d")
        self.yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

        # 会话状态（保存在项目目录）
        self.state_file = Path(__file__).parent / ".state.json"
        self.state = self.load_state()

        # API配置（可选）
        self.api_config = self.config.get('api', {})
        self.use_api = self.api_config.get('enabled', False)

        # 确保所有必要的文件夹存在
        self._ensure_folders_exist()

    def load_state(self):
        """加载会话状态"""
        if self.state_file.exists():
            with open(self.state_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            'current_date': self.today,
            'current_focus': [],
            'pending_cards': [],
            'discussion_context': {}
        }

    def save_state(self):
        """保存会话状态"""
        with open(self.state_file, 'w', encoding='utf-8') as f:
            json.dump(self.state, f, indent=2, ensure_ascii=False)

    def _ensure_folders_exist(self):
        """确保所有必要的文件夹存在（适配空vault）"""
        # 创建主文件夹
        folders_to_create = [
            self.obsidian_path,
            self.charts,
            self.logbook,
            self.harbor,
            self.navigation,
            self.template,
        ]

        # 创建harbor子文件夹
        harbor_subfolders = [
            self.harbor / 'concepts',
            self.harbor / 'frameworks',
            self.harbor / 'companies',
            self.harbor / 'people',
            self.harbor / 'skills',
        ]

        folders_to_create.extend(harbor_subfolders)

        # 创建所有文件夹
        for folder in folders_to_create:
            folder.mkdir(parents=True, exist_ok=True)

        # 创建初始模板文件（如果不存在）
        self._create_initial_templates()

    def _create_initial_templates(self):
        """创建初始模板文件（如果不存在）"""
        # course模板
        course_template = self.template / 'course-template.md'
        if not course_template.exists():
            template_content = """## Task长期目标
[在这里填写你的长期目标]

## Focus近期关注
[在这里填写你的近期关注话题]

## Note个人思考
[每日根据探讨话题，写下个人观点或偏好]

## Reference参考文档
[在这里放上你希望重点参考的文件/网页/文本等资料]

---
## Today's Summary
[今日总结，由系统自动填充]

## What's Next
[下一步计划，由系统自动填充]
"""
            self.write_file(course_template, template_content)

        # sounding模板
        sounding_template = self.template / 'sounding-template.md'
        if not sounding_template.exists():
            template_content = """## Focus
[从course文档中自动提取]

## News Update
针对focus部分的话题，过去2天发生了哪些客观事实

## Analysis Update
针对这些客观事实，媒体/机构/专家/相关利益方的看法，未来几种可能的情形，是否建议你调整具体行动
"""
            self.write_file(sounding_template, template_content)

        # card模板
        card_template = self.template / 'card-template.md'
        if not card_template.exists():
            template_content = """# 标题

## 时间
YYYY-MM-DD HH:MM

## 类型
insight / fleeting

## 内容
[卡片内容]

## 标签
#标签1 #标签2

## 相关链接
- 链接1
- 链接2

## 来源
通过Compass助手生成
"""
            self.write_file(card_template, template_content)

        # 创建初始course文档（如果不存在任何course）
        courses = list(self.navigation.glob("*_course.md"))
        if not courses:
            initial_course = self.navigation / f"{self.today}_course.md"
            template = self.read_file(course_template)
            if template:
                self.write_file(initial_course, template)

    def read_file(self, filepath):
        """读取文件内容"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            return None

    def write_file(self, filepath, content):
        """写入文件"""
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    def get_latest_course(self):
        """获取最新的course文档"""
        courses = sorted(self.navigation.glob("*_course.md"), reverse=True)
        if courses:
            return self.read_file(courses[0])
        return None

    def get_latest_courses(self, n=3):
        """获取最新的n个course文档"""
        courses = sorted(self.navigation.glob("*_course.md"), reverse=True)
        return courses[:n]

    def parse_course(self, content):
        """解析course内容"""
        if not content:
            return {}

        sections = {
            'task': '',
            'focus': '',
            'note': '',
            'reference': '',
            'summary': '',
            'next': ''
        }
        current = None
        lines = content.split('\n')

        for line in lines:
            if '## Task' in line:
                current = 'task'
            elif '## Focus' in line:
                current = 'focus'
            elif '## Note' in line:
                current = 'note'
            elif '## Reference' in line:
                current = 'reference'
            elif '## Today' in line and 'Summary' in line:
                current = 'summary'
            elif '## What' in line and 'Next' in line:
                current = 'next'
            elif line.strip() == '---':
                current = None
            elif current and line.strip() and not line.startswith('#'):
                sections[current] += line + '\n'

        return sections

    def get_context_info(self):
        """获取当前上下文信息（供Claude使用）"""
        course = self.get_latest_course()
        parsed = self.parse_course(course)

        context = {
            'date': self.today,
            'task': parsed.get('task', '').strip(),
            'focus': parsed.get('focus', '').strip(),
            'note': parsed.get('note', '').strip(),
            'reference': parsed.get('reference', '').strip(),
            'last_summary': parsed.get('summary', '').strip(),
            'next_actions': parsed.get('next', '').strip(),
            'sounding_exists': (self.charts / f"{self.today}_sounding.md").exists(),
            'course_exists': (self.navigation / f"{self.today}_course.md").exists(),
            'logbook_path': str(self.logbook / self.today)
        }

        return context

    def create_sounding_draft(self, focus_text=None):
        """创建sounding草稿"""
        if focus_text is None:
            course = self.get_latest_course()
            parsed = self.parse_course(course)
            focus_text = parsed.get('focus', '未找到Focus信息')

        content = f"""## Focus
{focus_text}

## News Update
[待补充：针对focus部分的话题，过去2天发生了哪些客观事实]

## Analysis Update
[待补充：针对这些客观事实，媒体/机构/专家/相关利益方的看法，未来几种可能的情形]

---
生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M")}
"""
        filepath = self.charts / f"{self.today}_sounding.md"
        self.write_file(filepath, content)
        return str(filepath)

    def create_knowledge_card(self, title, content, card_type='insight', tags=None):
        """创建知识卡片"""
        today_log = self.logbook / self.today

        # 确定卡片目录
        if card_type == 'insight':
            card_dir = today_log / 'insights'
        else:
            card_dir = today_log / 'fleeting'

        card_dir.mkdir(parents=True, exist_ok=True)

        # 生成文件名（使用日期格式，不使用时间戳）
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).strip()
        filename = f"{safe_title}_{self.today}.md"
        filepath = card_dir / filename

        # 如果同名文件已存在，追加内容而不是覆盖
        existing_content = self.read_file(filepath) if filepath.exists() else None

        tags_str = ' '.join([f"#{tag}" for tag in tags]) if tags else '#待补充'

        if existing_content:
            # 追加新内容
            timestamp = datetime.now().strftime("%H:%M")
            card_content = f"""

---
## 更新 {timestamp}

{content}
"""
            with open(filepath, 'a', encoding='utf-8') as f:
                f.write(card_content)
        else:
            # 创建新卡片
            card_content = f"""# {title}

## 时间
{datetime.now().strftime("%Y-%m-%d %H:%M")}

## 类型
{card_type}

## 内容
{content}

## 标签
{tags_str}

## 相关链接
-

## 来源
通过Compass助手生成
"""
            self.write_file(filepath, card_content)

        return str(filepath)

    def get_today_cards(self):
        """获取今日所有卡片路径"""
        cards = {'insights': [], 'fleeting': []}
        today_log = self.logbook / self.today

        if today_log.exists():
            for card_type in ['insights', 'fleeting']:
                card_dir = today_log / card_type
                if card_dir.exists():
                    cards[card_type] = list(card_dir.glob("*.md"))

        return cards

    def create_course_summary(self, summary, next_actions):
        """
        创建今日course文档

        注意：Course应该保持简洁，聚焦核心
        - Today's Summary: 只包含最重要的洞察和决策，约500字
        - What's Next: 只关注未来1-2件最重要的事
        """
        course = self.get_latest_course()
        parsed = self.parse_course(course)

        content = f"""## Task
{parsed.get('task', '').strip()}

## Focus
{parsed.get('focus', '').strip()}

## Note
{parsed.get('note', '').strip()}

## Reference 参考文档

- 今日sounding: charts/{self.today}_sounding.md
- 今日知识图谱: logbook/{self.today}/map.canvas

---
## Today's Summary
{summary}

## What's Next
{next_actions}
"""
        filepath = self.navigation / f"{self.today}_course.md"
        self.write_file(filepath, content)
        return str(filepath)

    def get_status(self):
        """获取当前状态"""
        status = {
            'date': self.today,
            'sounding_exists': (self.charts / f"{self.today}_sounding.md").exists(),
            'course_exists': (self.navigation / f"{self.today}_course.md").exists(),
            'logbook_exists': (self.logbook / self.today).exists(),
            'recent_cards': []
        }

        # 获取今日已创建的卡片
        today_log = self.logbook / self.today
        if today_log.exists():
            for card_type in ['insights', 'fleeting']:
                card_dir = today_log / card_type
                if card_dir.exists():
                    cards = list(card_dir.glob("*.md"))
                    status['recent_cards'].extend([c.name for c in cards])

        return status

    def show_status(self):
        """显示当前状态（命令行界面）"""
        context = self.get_context_info()

        print("\n" + "="*60)
        print("Knowledge Compass - 知识管理助手")
        print("="*60)
        print(f"日期: {self.today}")
        print(f"Obsidian路径: {self.obsidian_path}")
        print(f"运行模式: {'API模式' if self.use_api else 'Claude Code模式'}")

        print(f"\n今日状态:")
        print(f"   Sounding: {'✓ 已创建' if context['sounding_exists'] else '✗ 未创建'}")
        print(f"   Course: {'✓ 已创建' if context['course_exists'] else '✗ 未创建'}")

        print(f"\n当前Focus:")
        print(context['focus'] if context['focus'] else "   未找到")

        print("\n可用命令:")
        print("   @navigation - 生成今日sounding")
        print("   @insight - 探讨重点话题")
        print("   @fleeting - 探讨临时话题")
        print("   @card - 记录知识卡片")
        print("   @map - 生成知识图谱")
        print("   @harbor - 归档到长期知识库")
        print("   @analysis - 生成分析报告")
        print("   @course - 生成今日course文档")
        print("="*60 + "\n")

    def navigation_command(self):
        """执行@navigation命令"""
        print("\n执行 @navigation - 生成今日海图...")

        context = self.get_context_info()

        print(f"\n📍 当前Focus:")
        print(context.get('focus', '未找到'))

        sounding_path = self.create_sounding_draft()
        print(f"\n✓ 已生成今日sounding草稿: {sounding_path}")

        if self.use_api:
            print("\n下一步：需要AI搜索Focus相关的最新信息并更新sounding")
            print("（API模式下需要实现搜索功能）")
        else:
            print("\n接下来建议：")
            print("   1. 在Claude Code中告诉我你想探讨的话题")
            print("   2. 我会帮你搜索相关信息并更新sounding")

        return context


def main():
    """主函数 - 命令行入口"""
    try:
        assistant = CompassAssistant()

        if len(sys.argv) > 1:
            command = sys.argv[1]

            if command == '@navigation':
                assistant.navigation_command()
            elif command == '--status' or command == '-s':
                assistant.show_status()
            elif command == '--help' or command == '-h':
                print("""
Knowledge Compass - 你的日常知识管理助手

使用方式：
1. 在Claude Code中对话使用（推荐）：
   直接说 "hi compass" 或 "@navigation" 等命令

2. 命令行使用：
   python compass.py @navigation  # 生成今日sounding
   python compass.py --status     # 查看状态
   python compass.py --help       # 显示帮助

更多信息请查看 README.md 和 QUICKSTART.md
                """)
            else:
                print(f"未知命令: {command}")
                print("使用 --help 查看可用命令")
        else:
            assistant.show_status()

    except FileNotFoundError as e:
        print(f"\n错误: {e}")
        print("\n请按照以下步骤配置：")
        print("1. 复制 config.example.json 为 config.json")
        print("2. 编辑 config.json，设置你的 obsidian_path")
        print("3. （可选）配置 API 以支持独立运行模式")
        sys.exit(1)
    except Exception as e:
        print(f"\n发生错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
