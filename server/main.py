"""
Knowledge Compass - FastAPI Backend
Reads Obsidian markdown files via compass.py logic.
Run: uvicorn main:app --reload
"""

import sys
import json
import re
from pathlib import Path
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add project root to path so we can import compass.py
ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

CONFIG_PATH = ROOT / "config.json"

app = FastAPI(title="Knowledge Compass API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_compass():
    """Return a fresh CompassAssistant instance."""
    try:
        from compass import CompassAssistant
        return CompassAssistant()
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialise compass: {e}")


def load_config():
    if not CONFIG_PATH.exists():
        raise HTTPException(
            status_code=503,
            detail="config.json not found. Copy config.example.json and fill in your paths.",
        )
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Config / User
# ---------------------------------------------------------------------------

@app.get("/api/config/user")
def get_user_config():
    config = load_config()
    user = config.get("user", {})
    assistant = config.get("assistant", {})
    return {
        "name": user.get("name") or assistant.get("name") or "there",
        "version": assistant.get("version", "1.0.0"),
    }


# ---------------------------------------------------------------------------
# Status
# ---------------------------------------------------------------------------

@app.get("/api/status")
def get_status():
    compass = get_compass()
    return compass.get_status()


# ---------------------------------------------------------------------------
# Today
# ---------------------------------------------------------------------------

@app.get("/api/today")
def get_today():
    compass = get_compass()
    context = compass.get_context_info()
    today_cards = compass.get_today_cards()

    sounding_path = compass.charts / f"{compass.today}_sounding.md"
    sounding_content = compass.read_file(sounding_path)

    course = compass.get_latest_course()
    parsed = compass.parse_course(course)

    return {
        "date": compass.today,
        "task": parsed.get("task", "").strip(),
        "focus": parsed.get("focus", "").strip(),
        "note": parsed.get("note", "").strip(),
        "sounding": sounding_content,
        "sounding_exists": context["sounding_exists"],
        "course_exists": context["course_exists"],
        "cards": {
            "insights": [p.name for p in today_cards["insights"]],
            "fleeting": [p.name for p in today_cards["fleeting"]],
        },
    }


# ---------------------------------------------------------------------------
# Cards
# ---------------------------------------------------------------------------

@app.get("/api/cards/dates")
def get_card_dates():
    compass = get_compass()
    dates = []
    if compass.logbook.exists():
        for day_dir in sorted(compass.logbook.iterdir(), reverse=True):
            if day_dir.is_dir() and re.match(r"\d{4}-\d{2}-\d{2}", day_dir.name):
                for ct in ["insights", "fleeting"]:
                    ct_dir = day_dir / ct
                    if ct_dir.exists() and list(ct_dir.glob("*.md")):
                        dates.append(day_dir.name)
                        break
    return {"dates": dates}


@app.get("/api/cards")
def get_cards(date: Optional[str] = None, type: Optional[str] = None):
    compass = get_compass()
    if date is None:
        date = compass.today
    try:
        datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    day_log = compass.logbook / date
    cards = []
    card_types = ["insights", "fleeting"] if type is None else [type]

    for ct in card_types:
        card_dir = day_log / ct
        if card_dir.exists():
            for card_path in sorted(card_dir.glob("*.md"), reverse=True):
                content = compass.read_file(card_path) or ""
                cards.append(
                    {
                        "name": card_path.stem,
                        "filename": card_path.name,
                        "type": ct,
                        "date": date,
                        "content": content,
                        "preview": content[:300],
                    }
                )
    return {"date": date, "cards": cards}


class FleetingCardInput(BaseModel):
    title: str
    content: str
    tags: Optional[list[str]] = None


@app.post("/api/cards/fleeting")
def create_fleeting_card(body: FleetingCardInput):
    compass = get_compass()
    path = compass.create_knowledge_card(
        title=body.title,
        content=body.content,
        card_type="fleeting",
        tags=body.tags,
    )
    return {"path": path, "message": "Fleeting card created."}


# ---------------------------------------------------------------------------
# Charts (soundings)
# ---------------------------------------------------------------------------

@app.get("/api/charts")
def get_charts():
    compass = get_compass()
    charts = []
    for sp in sorted(compass.charts.glob("*_sounding.md"), reverse=True):
        content = compass.read_file(sp) or ""
        date = sp.stem.replace("_sounding", "")
        charts.append(
            {
                "date": date,
                "filename": sp.name,
                "content": content,
                "preview": content[:300],
            }
        )
    return {"charts": charts}


@app.get("/api/charts/{date}")
def get_chart(date: str):
    compass = get_compass()
    sp = compass.charts / f"{date}_sounding.md"
    if not sp.exists():
        raise HTTPException(status_code=404, detail=f"Sounding not found for {date}.")
    return {"date": date, "content": compass.read_file(sp)}


# ---------------------------------------------------------------------------
# Courses
# ---------------------------------------------------------------------------

@app.get("/api/courses")
def get_courses():
    compass = get_compass()
    courses = []
    for cp in sorted(compass.navigation.glob("*_course.md"), reverse=True):
        content = compass.read_file(cp)
        parsed = compass.parse_course(content) if content else {}
        date = cp.stem.replace("_course", "")
        courses.append(
            {
                "date": date,
                "filename": cp.name,
                "task": parsed.get("task", "").strip(),
                "focus": parsed.get("focus", "").strip(),
                "summary": parsed.get("summary", "").strip(),
                "next": parsed.get("next", "").strip(),
            }
        )
    return {"courses": courses}


@app.get("/api/courses/{date}")
def get_course(date: str):
    compass = get_compass()
    cp = compass.navigation / f"{date}_course.md"
    if not cp.exists():
        raise HTTPException(status_code=404, detail=f"Course not found for {date}.")
    content = compass.read_file(cp)
    parsed = compass.parse_course(content) if content else {}
    return {
        "date": date,
        "content": content,
        "task": parsed.get("task", "").strip(),
        "focus": parsed.get("focus", "").strip(),
        "note": parsed.get("note", "").strip(),
        "summary": parsed.get("summary", "").strip(),
        "next": parsed.get("next", "").strip(),
    }


# ---------------------------------------------------------------------------
# Harbor
# ---------------------------------------------------------------------------

HARBOR_CATEGORIES = ["concepts", "frameworks", "companies", "people", "skills"]


@app.get("/api/harbor")
def get_harbor():
    compass = get_compass()
    structure: dict = {}
    for cat in HARBOR_CATEGORIES:
        cat_path = compass.harbor / cat
        files = []
        if cat_path.exists():
            for f in sorted(cat_path.glob("*.md")):
                content = compass.read_file(f) or ""
                first_line = ""
                for line in content.split("\n"):
                    if line.strip():
                        first_line = line.strip().lstrip("#").strip()
                        break
                files.append(
                    {
                        "name": f.stem,
                        "filename": f.name,
                        "category": cat,
                        "description": first_line,
                        "preview": content[:200],
                    }
                )
        structure[cat] = files
    return {"harbor": structure}


@app.get("/api/harbor/{category}/{filename}")
def get_harbor_file(category: str, filename: str):
    compass = get_compass()
    if category not in HARBOR_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    fp = compass.harbor / category / filename
    if not fp.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")
    content = compass.read_file(fp)
    return {
        "category": category,
        "filename": filename,
        "name": fp.stem,
        "content": content,
    }


# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------

@app.get("/api/templates")
def get_templates():
    compass = get_compass()
    templates = []
    if compass.template.exists():
        for f in sorted(compass.template.glob("*.md")):
            content = compass.read_file(f) or ""
            templates.append(
                {
                    "name": f.stem,
                    "filename": f.name,
                    "content": content,
                    "preview": content[:200],
                }
            )
    return {"templates": templates}


# ---------------------------------------------------------------------------
# Map (canvas)
# ---------------------------------------------------------------------------

@app.get("/api/map")
def get_map(date: Optional[str] = None):
    compass = get_compass()
    if date is None:
        date = compass.today
    map_path = compass.logbook / date / "map.canvas"
    content = compass.read_file(map_path)
    if content is None:
        return {"date": date, "exists": False, "content": None, "data": None}
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        data = None
    return {"date": date, "exists": True, "content": content, "data": data}
