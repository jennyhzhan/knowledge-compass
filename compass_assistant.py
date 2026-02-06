#!/usr/bin/env python3
"""
Compass Daily Assistant - 日常知识管理助手
帮助管理Obsidian中的航海笔记系统
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
import json
import re


def load_config(config_path=None):
    """加载配置文件"""
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
        return json.load(f)


# 加载配置
CONFIG = load_config()
OBSIDIAN_PATH = Path(CONFIG['obsidian_path'])
CHARTS_PATH = OBSIDIAN_PATH / CONFIG['folders']['charts']
LOGBOOK_PATH = OBSIDIAN_PATH / CONFIG['folders']['logbook']
HARBOR_PATH = OBSIDIAN_PATH / CONFIG['folders']['harbor']
NAVIGATION_PATH = OBSIDIAN_PATH / CONFIG['folders']['navigation']
TEMPLATE_PATH = OBSIDIAN_PATH / CONFIG['folders']['template']


class CompassAssistant:
    """日常助手主类"""

    def __init__(self):
        self.today = datetime.now().strftime("%Y-%m-%d")
        self.yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        self.obsidian_path = OBSIDIAN_PATH

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

    def get_latest_courses(self, n=3):
        """获取最新的n个course文档"""
        courses = sorted(NAVIGATION_PATH.glob("*_course.md"), reverse=True)
        return courses[:n]

    def read_yesterday_course(self):
        """读取昨天的course文档"""
        yesterday_course = NAVIGATION_PATH / f"{self.yesterday}_course.md"
        content = self.read_file(yesterday_course)

        if not content:
            # 如果昨天没有，读取最新的一个
            latest = self.get_latest_courses(1)
            if latest:
                content = self.read_file(latest[0])

        return content

    def parse_course_content(self, content):
        """解析course文档内容"""
        if not content:
            return {}

        sections = {
            'task': '',
            'focus': '',
            'summary': '',
            'next': ''
        }

        current_section = None
        lines = content.split('\n')

        for line in lines:
            if line.strip().startswith('## Task'):
                current_section = 'task'
            elif line.strip().startswith('## Focus'):
                current_section = 'focus'
            elif line.strip().startswith("## Today's Summary"):
                current_section = 'summary'
            elif line.strip().startswith("## What's Next"):
                current_section = 'next'
            elif current_section and line.strip():
                sections[current_section] += line + '\n'

        return sections

    def get_context(self):
        """获取当前工作上下文"""
        print(f"正在读取最近的工作文档...")

        # 读取昨天的course
        yesterday_content = self.read_yesterday_course()
        context = self.parse_course_content(yesterday_content)

        # 读取最新的3个course
        recent_courses = self.get_latest_courses(3)
        context['recent_courses'] = []
        for course_file in recent_courses:
            content = self.read_file(course_file)
            if content:
                context['recent_courses'].append({
                    'date': course_file.stem.replace('_course', ''),
                    'content': content
                })

        return context

    def generate_sounding_template(self, context):
        """生成sounding文档草稿"""
        focus = context.get('focus', '未找到Focus信息')

        template = f"""# {self.today} Daily Sounding

## Focus
{focus}

## News Update
[待补充]

## Analysis Update
[待补充]

---
生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M")}
"""
        return template

    def create_knowledge_card(self, title, content, card_type='insight'):
        """创建知识卡片"""
        today_logbook = LOGBOOK_PATH / self.today

        if card_type == 'insight':
            card_dir = today_logbook / "insights"
        else:
            card_dir = today_logbook / "fleeting"

        card_dir.mkdir(parents=True, exist_ok=True)

        # 生成文件名
        timestamp = datetime.now().strftime("%H%M")
        filename = f"{title}_{self.today}_{timestamp}.md"
        filepath = card_dir / filename

        # 生成卡片内容
        card_content = f"""# {title}

## 时间
{datetime.now().strftime("%Y-%m-%d %H:%M")}

## 类型
{card_type}

## 内容
{content}

## 标签
#待补充

## 相关链接
-
"""
        self.write_file(filepath, card_content)
        return filepath

    def navigation_command(self):
        """执行@navigation命令：生成今日sounding"""
        print("\n执行 @navigation - 生成今日海图...")

        # 获取上下文
        context = self.get_context()

        # 显示Focus信息
        print(f"\n📍 当前Focus:")
        print(context.get('focus', '未找到'))

        # 生成sounding草稿
        sounding_content = self.generate_sounding_template(context)
        sounding_file = CHARTS_PATH / f"{self.today}_sounding.md"

        self.write_file(sounding_file, sounding_content)
        print(f"\n已生成今日sounding草稿: {sounding_file}")
        print("\n接下来我需要：")
        print("   1. 搜索Focus相关的最新信息")
        print("   2. 更新News Update部分")
        print("   3. 完成Analysis Update分析")
        print("\n请告诉我：你想先探讨哪个话题？")

        return context

    def card_command(self, title, content, card_type):
        """执行@card命令：记录知识卡片"""
        print(f"\n📝 创建知识卡片...")
        filepath = self.create_knowledge_card(title, content, card_type)
        print(f"卡片已保存: {filepath}")
        return filepath

    def show_status(self):
        """显示当前状态"""
        print("\n" + "="*60)
        print("Compass Daily Assistant")
        print("="*60)
        print(f"日期: {self.today}")
        print(f"Obsidian路径: {self.obsidian_path}")

        # 检查今日文档
        today_sounding = CHARTS_PATH / f"{self.today}_sounding.md"
        today_course = NAVIGATION_PATH / f"{self.today}_course.md"
        today_logbook = LOGBOOK_PATH / self.today

        print(f"\n今日状态:")
        print(f"   Sounding: {'已创建' if today_sounding.exists() else '未创建'}")
        print(f"   Course: {'已创建' if today_course.exists() else '未创建'}")
        print(f"   Logbook: {'已创建' if today_logbook.exists() else '未创建'}")

        print("\n可用命令:")
        print("   @navigation - 阅读昨日course，生成今日sounding")
        print("   @insight - 探讨重点话题，记录到insights")
        print("   @fleeting - 探讨临时话题，记录到fleeting")
        print("   @card - 记录知识卡片")
        print("   @map - 生成当日知识图谱")
        print("   @harbor - 归档到长期知识库")
        print("   @analysis - 生成分析报告")
        print("="*60 + "\n")


def main():
    """主函数"""
    assistant = CompassAssistant()
    assistant.show_status()

    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == '@navigation':
            assistant.navigation_command()
        else:
            print(f"未知命令: {command}")
    else:
        print("请使用命令行参数执行命令，例如: python compass_assistant.py @navigation")


if __name__ == "__main__":
    main()
