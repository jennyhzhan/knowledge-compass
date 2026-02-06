#!/usr/bin/env python3
"""
Compass AI Assistant - AI增强的日常知识管理助手
可以在Claude Code中直接使用
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path


class CompassAIAssistant:
    """
    AI增强的日常助手

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
            config = json.load(f)

        self.obsidian_path = Path(config['obsidian_path'])
        self.charts = self.obsidian_path / config['folders']['charts']
        self.logbook = self.obsidian_path / config['folders']['logbook']
        self.harbor = self.obsidian_path / config['folders']['harbor']
        self.navigation = self.obsidian_path / config['folders']['navigation']
        self.template = self.obsidian_path / config['folders']['template']

        self.today = datetime.now().strftime("%Y-%m-%d")
        self.yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

        # 会话状态（保存在项目目录）
        self.state_file = Path(__file__).parent / ".state.json"
        self.state = self.load_state()

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

    def read_file(self, filepath):
        """读取文件"""
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

    def parse_course(self, content):
        """解析course内容"""
        if not content:
            return {}

        sections = {'task': '', 'focus': '', 'note': '', 'reference': '', 'summary': '', 'next': ''}
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
                current = None  # 停止当前section
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

    def create_sounding_draft(self, focus_text):
        """创建sounding草稿"""
        content = f"""# {self.today} Daily Sounding

## Focus
{focus_text}

## News Update
[待补充]

## Analysis Update
[待补充]

---
生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M")}
"""
        filepath = self.charts / f"{self.today}_sounding.md"
        self.write_file(filepath, content)
        return str(filepath)

    def update_sounding(self, section, content):
        """更新sounding的特定部分"""
        filepath = self.charts / f"{self.today}_sounding.md"
        if filepath.exists():
            current = self.read_file(filepath)
            # 这里可以添加更智能的section更新逻辑
            self.write_file(filepath, current)
            return True
        return False

    def create_knowledge_card(self, title, content, card_type='insight', tags=None):
        """创建知识卡片"""
        today_log = self.logbook / self.today
        card_dir = today_log / card_type

        card_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%H%M")
        safe_title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).strip()
        filename = f"{safe_title}_{self.today}_{timestamp}.md"
        filepath = card_dir / filename

        tags_str = ' '.join([f"#{tag}" for tag in tags]) if tags else '#待补充'

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
Claude Code对话生成
"""
        self.write_file(filepath, card_content)
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

    def filter_relevant_cards(self, cards, focus_keywords):
        """
        根据Focus关键词筛选相关卡片

        Args:
            cards: 卡片路径列表
            focus_keywords: Focus中的关键词列表

        Returns:
            筛选后的卡片路径列表
        """
        # 简单的关键词匹配筛选
        relevant = []
        for card_path in cards:
            card_name = card_path.stem.lower()
            if any(keyword.lower() in card_name for keyword in focus_keywords):
                relevant.append(card_path)

        return relevant if relevant else cards  # 如果没有匹配，返回全部

    def create_course_summary(self, summary, next_actions):
        """
        创建今日course文档

        注意：Course应该保持简洁，聚焦核心
        - Today's Summary: 只包含最重要的洞察和决策，约500字
        - What's Next: 只关注未来1-2件最重要的事
        - 根据Focus筛选内容，不需要面面俱到
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


def main():
    """主函数 - 提供命令行接口"""
    assistant = CompassAIAssistant()
    context = assistant.get_context_info()

    print("="*60)
    print("Compass AI Assistant")
    print("="*60)
    print(f"日期: {context['date']}")
    print(f"\n今日状态:")
    print(f"   Sounding: {'已创建' if context['sounding_exists'] else '未创建'}")
    print(f"   Course: {'已创建' if context['course_exists'] else '未创建'}")
    print(f"\n当前Focus:")
    print(context['focus'] if context['focus'] else "未找到")
    print("="*60)

    return assistant, context


if __name__ == "__main__":
    main()
