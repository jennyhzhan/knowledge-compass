# Knowledge Compass

Compass is your daily knowledge assistant. Centered on your long-term goals and near-term priorities, it curates new information each day, builds on past research, and deepens understanding through dialogue -- turning daily insights into a lasting personal knowledge base.

## Why Use an AI Assistant for Knowledge Management

1. **Stay focused on what matters** -- Spend more time on long-term goals; capture fleeting ideas quickly without losing momentum
2. **Structure information as you learn** -- Discuss key questions with the assistant; it generates knowledge cards and maps automatically
3. **Produce output every day** -- Write while you think, then review the day's auto-generated sounding and add your own reflections
4. **Summarize by topic regularly** -- Turn scattered notes into a structured personal knowledge system
5. **Build a long-term knowledge base** -- Let accumulated knowledge guide your next focus areas

## Daily Workflow

### Morning

1. **Start the assistant**: Run `@navigation`
2. **Read the sounding**: Review today's sounding for new information on your focus topics
3. **Pick a topic**: Tell the assistant what you want to explore

### During the Day

1. **Explore topics**: Use `@insight` for deep discussion on key topics
2. **Capture ideas**: Use `@fleeting` to record quick thoughts
3. **Save knowledge cards**: The assistant will ask if you want to create a card, or use `@card` to save one manually

### End of Day

1. **Generate the map**: Run `@map` to organize today's knowledge connections
2. **Write the course**: Run `@course` to generate today's course document, then add your own notes and reflections

### Periodic Deep Work

1. **Review cards**: Browse past cards in the logbook; use `@harbor` to archive important ones
2. **Generate analysis**: Run `@analysis` to produce company or industry reports for the long-term knowledge base

---

## System Overview

Compass organizes your knowledge across five areas:

- **charts**: Auto-generated daily information scan and analysis
- **logbook**: Daily knowledge cards and notes
- **harbor**: Long-term knowledge base and deep research
- **navigation**: Daily direction and summary
- **template**: Output document templates

## File Structure

```
compass/
├── charts/              # Daily sounding files
│   └── YYYY-MM-DD_sounding.md
├── logbook/             # Daily knowledge cards
│   └── YYYY-MM-DD/
│       ├── insights/    # Key topics; conclusions added as cards during discussion
│       ├── fleeting/    # Quick notes; useful ones become cards
│       └── map.canvas   # Auto-generated knowledge map
├── harbor/              # Long-term knowledge base
│   ├── concepts/
│   ├── frameworks/
│   ├── companies/
│   ├── people/
│   └── skills/
├── navigation/          # Daily course documents (add personal notes here)
│   └── YYYY-MM-DD_course.md
└── template/            # Template files
```

---

# Quick Start

## Option A: Claude Code (Recommended)

### Setup

1. Copy the config file: `config.example.json` → `config.json`
2. Set `obsidian_path` to your Obsidian vault path (a local folder)

### First Run

In Claude Code, navigate to the project directory and run:

```bash
python compass.py --status
```

The system will automatically:

- Create the folder structure (charts, logbook, harbor, navigation, template)
- Create template files
- Generate a `navigation/YYYY-MM-DD_course.md` for yesterday's date

### Initial Configuration

Open the generated `navigation/YYYY-MM-DD_course.md` (e.g. `2026-02-05_course.md`) and fill in:

- **Task**: Your long-term goals
- **Focus**: Topics and areas you are focused on in the next 1-2 weeks

> **Why yesterday's date?** The `@navigation` command reads yesterday's course to get your Focus, then generates today's sounding. Once you fill in Task and Focus, you are ready to run `@navigation`.

### Start Using

```
@navigation              # Generate today's sounding
@insight [topic]         # Deep discussion on a topic
@fleeting                # Record a quick idea
```

---

## Option B: Python Direct (API Mode)

### Dependencies

```bash
pip install openai      # For OpenAI, DeepSeek
# or
pip install anthropic   # For Anthropic Claude
```

### API Configuration (`config.json`)

Keep your `api_key` in environment variables, not in `config.json`.

#### Claude (Anthropic)

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

Set your API key:

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

Get a key: [https://console.anthropic.com](https://console.anthropic.com)

---

#### OpenAI

```json
{
  "api": {
    "enabled": true,
    "provider": "openai",
    "base_url": "https://api.openai.com/v1",
    "model": "gpt-4-turbo"
  }
}
```

Set your API key:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

Get a key: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

#### DeepSeek

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

Set your API key (DeepSeek uses the OpenAI library and `OPENAI_API_KEY`):

```bash
export OPENAI_API_KEY="your-deepseek-api-key-here"
```

Get a key: [https://platform.deepseek.com](https://platform.deepseek.com)

---

### Setup Steps

1. Copy config: `config.example.json` → `config.json`
2. Set `obsidian_path`
3. Set `api.enabled=true`, `api.provider`, `api.model`, and `base_url`
4. Install dependencies
5. Set the API key environment variable

### First Run

```bash
python compass.py --status
```

### Start Using

```bash
python compass.py --status      # Check status
python compass.py @navigation   # Generate today's sounding
```

---

## Commands

Use natural language or `@` commands:

| Command | Function | Description |
| --- | --- | --- |
| `@navigation` | Generate today's sounding | Reads yesterday's course, finds new information, writes today's sounding |
| `@insight` | Deep topic discussion | Explore a focus topic in depth; save conclusions as insight cards |
| `@fleeting` | Quick idea capture | Record a fleeting thought or piece of information |
| `@card` | Save a knowledge card | Save discussion conclusions as a knowledge card |
| `@map` | Generate knowledge map | Map the connections between today's cards |
| `@harbor` | Archive to long-term base | Archive important content to harbor |
| `@analysis` | Generate analysis report | Produce a deep analysis from accumulated cards |
| `@course` | Generate today's course | Summarize the day's work; generate the course document |

> Use `@` instead of `/` to avoid conflicts with Claude slash commands.

---

## Templates

Three default templates are included. All templates can be edited freely in the `template/` folder:

- `course-template.md` -- Daily direction and summary
- `sounding-template.md` -- Daily information scan
- `card-template.md` -- Knowledge card format

Custom analysis templates for `@analysis` can be added to `harbor/frameworks/`.

### course-template.md

File format: `YYYY-MM-DD_course.md`

```markdown
## Goal
[Your long-term goals]

## Focus
[Topics and areas you are focused on in the next 1-2 weeks]

## Note
[Your personal reflections and preferences from today's discussions]

## Reference
[Files, URLs, or text you want the assistant to reference]

## Today's Summary
[Auto-filled by the system]

## What's Next
[Auto-filled by the system]
```

### sounding-template.md

File format: `YYYY-MM-DD_sounding.md`

```markdown
## Focus
[Auto-extracted from the course document]

## News Update
What happened in the past 2 days related to your focus topics

## Analysis Update
How media, institutions, and experts are reacting; possible scenarios; whether you should adjust your actions
```

### card-template.md

File format: `[topic]_YYYY-MM-DD.md`

Notes:
- No timestamps, only dates
- If multiple discussions on the same topic occur in one day, the assistant merges them into one file in chronological order

---

## Tech Stack

- Python 3.x
- Obsidian (knowledge vault)
- Claude API (AI analysis and search)

## License

MIT License

## Contributing

Issues and pull requests are welcome.
