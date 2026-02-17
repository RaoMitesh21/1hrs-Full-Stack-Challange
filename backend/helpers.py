"""
helpers.py — Database layer & AI evaluation engine
===================================================
All JSON-file I/O goes through this module.  File writes use
an fcntl advisory lock so concurrent Flask workers don't corrupt data.
"""

import json
import os
import re
from collections import Counter
from datetime import datetime

# Cross-platform file locking
try:
    import fcntl
    def _lock_sh(fh): fcntl.flock(fh, fcntl.LOCK_SH)
    def _lock_ex(fh): fcntl.flock(fh, fcntl.LOCK_EX)
    def _unlock(fh):  fcntl.flock(fh, fcntl.LOCK_UN)
except ImportError:
    # Windows fallback — no-op locks
    def _lock_sh(fh): pass
    def _lock_ex(fh): pass
    def _unlock(fh):  pass

# ── paths ────────────────────────────────────────────────────

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILES = {
    "users":      os.path.join(DATA_DIR, "users.json"),
    "interviews": os.path.join(DATA_DIR, "interviews.json"),
    "questions":  os.path.join(DATA_DIR, "questions.json"),
}

# ── low-level JSON I/O (with file-locking) ───────────────────

def _load(name):
    """Read a JSON list from one of the data files."""
    path = DB_FILES[name]
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as fh:
        _lock_sh(fh)
        try:
            data = json.load(fh)
        except (json.JSONDecodeError, ValueError):
            data = []
        finally:
            _unlock(fh)
    return data

def _save(name, data):
    """Write a JSON list to one of the data files (exclusive lock)."""
    path = DB_FILES[name]
    with open(path, "w", encoding="utf-8") as fh:
        _lock_ex(fh)
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.flush()
        _unlock(fh)

def _append(name, record):
    """Append a single record to a JSON list file (atomic read-modify-write)."""
    path = DB_FILES[name]
    if not os.path.exists(path):
        _save(name, [record])
        return
    with open(path, "r+", encoding="utf-8") as fh:
        _lock_ex(fh)
        try:
            data = json.load(fh)
        except (json.JSONDecodeError, ValueError):
            data = []
        data.append(record)
        fh.seek(0)
        fh.truncate()
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.flush()
        _unlock(fh)


# ═══════════════════════════════════════════════════════════════
# USER DATABASE
# ═══════════════════════════════════════════════════════════════

def get_users():
    return _load("users")

def save_users(users):
    _save("users", users)

def find_user_by_username(username):
    for u in get_users():
        if u.get("username") == username:
            return u
    return None

def find_user_by_id(user_id):
    for u in get_users():
        if u.get("id") == user_id:
            return u
    return None


# ═══════════════════════════════════════════════════════════════
# QUESTIONS DATABASE
# ═══════════════════════════════════════════════════════════════

def get_questions():
    return _load("questions")

def get_questions_filtered(role=None, difficulty=None):
    """Return questions optionally filtered by role and/or difficulty."""
    qs = get_questions()
    if role:
        qs = [q for q in qs if q.get("role") == role]
    if difficulty:
        qs = [q for q in qs if q.get("difficulty") == difficulty]
    return qs

def get_question_by_id(qid):
    for q in get_questions():
        if q.get("id") == qid:
            return q
    return None

def get_available_roles():
    """Return sorted unique roles in the question bank."""
    return sorted({q.get("role") for q in get_questions() if q.get("role")})

def get_question_stats():
    """Return counts by role and difficulty."""
    qs = get_questions()
    by_role = Counter(q.get("role") for q in qs)
    by_diff = Counter(q.get("difficulty") for q in qs)
    return {"by_role": dict(by_role), "by_difficulty": dict(by_diff), "total": len(qs)}


# ═══════════════════════════════════════════════════════════════
# INTERVIEWS DATABASE
# ═══════════════════════════════════════════════════════════════

def get_interviews():
    return _load("interviews")

def save_interview(record):
    _append("interviews", record)

def get_user_interviews(user_id):
    """All interviews for a given user, newest-first."""
    return sorted(
        [i for i in get_interviews() if i.get("user_id") == user_id],
        key=lambda x: x.get("date", ""),
        reverse=True,
    )

def get_user_interview_by_id(user_id, interview_id):
    for i in get_interviews():
        if i.get("id") == interview_id and i.get("user_id") == user_id:
            return i
    return None


# ═══════════════════════════════════════════════════════════════
# ANALYTICS HELPERS
# ═══════════════════════════════════════════════════════════════

def compute_analytics(user_id):
    """Build a rich analytics payload for a user."""
    interviews = get_user_interviews(user_id)  # newest-first
    if not interviews:
        return {
            "total_interviews": 0,
            "avg_score": 0,
            "timeseries": [],
            "role_average": {},
            "difficulty_average": {},
            "strength_frequency": {},
            "weakness_frequency": {},
            "recent_trend": "none",
            "improvement_suggestions": [
                "Complete your first interview to start tracking progress."
            ],
        }

    # -- timeseries (oldest → newest for charting) --
    by_date = sorted(interviews, key=lambda x: x.get("date", ""))
    timeseries = [
        {"date": i.get("date"), "score": i.get("score", 0), "role": i.get("role")}
        for i in by_date
    ]

    # -- averages --
    scores = [i.get("score", 0) for i in interviews]
    avg_score = int(sum(scores) / len(scores))

    # per-role
    roles = {}
    for i in interviews:
        roles.setdefault(i.get("role", "unknown"), []).append(i.get("score", 0))
    role_avg = {r: int(sum(s) / len(s)) for r, s in roles.items()}

    # per-difficulty
    diffs = {}
    for i in interviews:
        diffs.setdefault(i.get("difficulty", "medium"), []).append(i.get("score", 0))
    diff_avg = {d: int(sum(s) / len(s)) for d, s in diffs.items()}

    # -- strength / weakness frequency --
    str_counter = Counter()
    weak_counter = Counter()
    for i in interviews:
        str_counter.update(i.get("strengths", []))
        weak_counter.update(i.get("weaknesses", []))

    # -- recent trend (last 5 vs previous 5) --
    recent = scores[:5]
    previous = scores[5:10]
    if previous:
        trend_delta = (sum(recent) / len(recent)) - (sum(previous) / len(previous))
        if trend_delta > 5:
            recent_trend = "improving"
        elif trend_delta < -5:
            recent_trend = "declining"
        else:
            recent_trend = "stable"
    else:
        recent_trend = "not enough data"

    # -- improvement suggestions --
    suggestions = []
    top_weaknesses = [w for w, _ in weak_counter.most_common(3)]
    if "Missing some domain keywords" in top_weaknesses:
        suggestions.append("Focus on learning and naturally using domain-specific terminology in your answers.")
    if "Answer could be more detailed" in top_weaknesses:
        suggestions.append("Practice the STAR method: Situation → Task → Action → Result. Aim for structured, detailed responses.")
    if "Sentence structure could be improved for clarity" in top_weaknesses:
        suggestions.append("Vary your sentence length. Mix short punchy statements with longer explanatory ones.")
    if "Consider expanding your answer with examples or steps" in top_weaknesses:
        suggestions.append("Always include at least one concrete example or step-by-step walkthrough.")
    if avg_score < 50:
        suggestions.append("Your average score is below 50. Try easier questions first to build confidence.")
    if recent_trend == "declining":
        suggestions.append("Your recent scores are declining. Take a break, review feedback, then retry.")
    if not suggestions:
        suggestions.append("You're doing well! Try harder questions or new roles to keep improving.")

    return {
        "total_interviews": len(interviews),
        "avg_score": avg_score,
        "timeseries": timeseries,
        "role_average": role_avg,
        "difficulty_average": diff_avg,
        "strength_frequency": dict(str_counter.most_common(10)),
        "weakness_frequency": dict(weak_counter.most_common(10)),
        "recent_trend": recent_trend,
        "improvement_suggestions": suggestions,
    }


# ═══════════════════════════════════════════════════════════════
# AI EVALUATION ENGINE
# ═══════════════════════════════════════════════════════════════

def _clean(text):
    """Lowercase, strip punctuation."""
    return re.sub(r"[^\w\s-]", "", (text or "")).lower()

def _match_keywords(cleaned_answer, keywords):
    """
    Match single-word and multi-word keywords / phrases against the answer.
    Returns (matched_list, total_keywords, ratio).
    """
    matched = []
    for kw in keywords:
        kw_lower = kw.lower()
        # multi-word phrase → substring check
        if " " in kw_lower:
            if kw_lower in cleaned_answer:
                matched.append(kw)
        else:
            # single word → word-boundary check
            if re.search(r"\b" + re.escape(kw_lower) + r"\b", cleaned_answer):
                matched.append(kw)
    total = max(1, len(keywords))
    return matched, total, len(matched) / total


def evaluate_answer(answer, question, difficulty="medium"):
    """
    Evaluate a candidate answer against a question.

    Scoring dimensions (weighted):
      • Keyword coverage   — 45 %
      • Answer depth/length — 25 %
      • Sentence structure  — 15 %
      • Vocabulary richness — 15 %

    Returns dict with: score, strengths, weaknesses, feedback, tips.
    """
    answer_text = (answer or "").strip()
    if not answer_text:
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": ["No answer provided."],
            "feedback": "You didn't submit an answer. Try to provide at least a short response.",
            "tips": ["Start by restating the question in your own words, then elaborate."],
        }

    cleaned = _clean(answer_text)
    words = cleaned.split()
    word_count = len(words)

    # ── 1. Keyword matching ──────────────────────────────────
    keywords = question.get("keywords", [])
    matched, total_kw, kw_ratio = _match_keywords(cleaned, keywords)
    keyword_score = kw_ratio

    # ── 2. Depth / length ────────────────────────────────────
    expected_words = {"easy": 40, "medium": 80, "hard": 150}.get(difficulty, 80)
    length_ratio = min(word_count / expected_words, 1.0) if expected_words else 1.0
    depth_score = length_ratio

    # ── 3. Sentence structure ────────────────────────────────
    sentences = [s.strip() for s in re.split(r"[.?!]+", answer_text) if s.strip()]
    n_sentences = max(1, len(sentences))
    avg_wps = word_count / n_sentences

    if 10 <= avg_wps <= 25:
        structure_score = 1.0
    elif 8 <= avg_wps < 10 or 25 < avg_wps <= 30:
        structure_score = 0.8
    elif avg_wps < 8:
        structure_score = 0.55
    else:
        structure_score = 0.6

    # ── 4. Vocabulary richness (unique / total) ──────────────
    unique_ratio = len(set(words)) / max(1, word_count)
    if unique_ratio > 0.65:
        vocab_score = 1.0
    elif unique_ratio > 0.5:
        vocab_score = 0.8
    else:
        vocab_score = 0.6

    # ── Weighted combination ─────────────────────────────────
    raw = (
        keyword_score  * 0.45
      + depth_score    * 0.25
      + structure_score * 0.15
      + vocab_score    * 0.15
    )

    # difficulty multiplier (harder questions can exceed 100 raw → capped)
    diff_mult = {"easy": 0.92, "medium": 1.0, "hard": 1.12}.get(difficulty, 1.0)
    score = int(max(0, min(100, round(raw * diff_mult * 100))))

    # ── Strengths & weaknesses ───────────────────────────────
    strengths = []
    weaknesses = []

    if keyword_score >= 0.7:
        strengths.append("Good use of relevant keywords")
    elif keyword_score >= 0.4:
        weaknesses.append("Missing some domain keywords")
    else:
        weaknesses.append("Very few domain keywords used — review core concepts")

    if depth_score >= 0.85:
        strengths.append("Sufficient depth in answer")
    elif depth_score >= 0.5:
        weaknesses.append("Answer could be more detailed")
    else:
        weaknesses.append("Answer is too short — expand with examples or steps")

    if structure_score >= 0.9:
        strengths.append("Clear sentence structure")
    else:
        weaknesses.append("Sentence structure could be improved for clarity")

    if vocab_score >= 0.9:
        strengths.append("Rich and varied vocabulary")
    elif vocab_score < 0.7:
        weaknesses.append("Consider using more varied vocabulary")

    if word_count < expected_words * 0.4:
        weaknesses.append("Consider expanding your answer with examples or steps")

    if n_sentences >= 3:
        strengths.append("Good answer organization with multiple points")

    # ── Feedback paragraph ───────────────────────────────────
    fb = []
    fb.append(f"Keyword coverage: {len(matched)}/{total_kw} matched.")
    if matched:
        fb.append("  ✓ Found: " + ", ".join(matched))
    missed = [k for k in keywords if k not in matched]
    if missed:
        fb.append("  ✗ Missed: " + ", ".join(missed[:6]))
    fb.append(f"Word count: {word_count} (target ≈ {expected_words} for {difficulty}).")
    fb.append(f"Sentences: {n_sentences} — avg {avg_wps:.0f} words/sentence.")
    fb.append(f"Vocabulary richness: {unique_ratio:.0%}.")

    # ── Actionable tips ──────────────────────────────────────
    tips = []
    tips.append("Start with a clear one-sentence summary, then elaborate.")
    if missed:
        tips.append(f"Try to naturally mention: {', '.join(missed[:4])}.")
    if depth_score < 0.7:
        tips.append("Use the STAR method (Situation, Task, Action, Result) for structured depth.")
    if structure_score < 0.8:
        tips.append("Vary sentence length — mix concise statements with detailed explanations.")
    if vocab_score < 0.8:
        tips.append("Avoid repeating the same words. Use synonyms and domain terms.")
    tips.append("End with a brief conclusion or real-world example to leave a strong impression.")

    feedback = "\n".join(fb)

    return {
        "score": score,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "feedback": feedback,
        "tips": tips,
    }
