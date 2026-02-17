"""
app.py — Flask API for AI Interview Simulator
==============================================
Endpoints:
  POST /register          — create account
  POST /login             — authenticate
  GET  /questions          — list (filterable by role & difficulty)
  GET  /roles              — available roles + question counts
  POST /submit             — submit answer → AI evaluation
  GET  /history            — user's interview history
  GET  /history/<id>       — single interview record
  GET  /analytics          — rich performance analytics
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
import uuid
from datetime import timezone

from helpers import (
    get_users, save_users, find_user_by_username,
    get_questions_filtered, get_question_by_id, get_available_roles, get_question_stats,
    save_interview, get_user_interviews, get_user_interview_by_id,
    evaluate_answer, compute_analytics,
)

app = Flask(__name__)

# Allow requests from Vercel frontend + localhost dev + production domains
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://1hrs-full-stack-challange-tkbu.vercel.app",
    "https://raomitesh.me",
    "https://www.raomitesh.me",
]
# Add extra origins from environment
extra_origins = os.environ.get("CORS_ORIGINS", "")
if extra_origins:
    allowed_origins.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

CORS(app, origins=allowed_origins, supports_credentials=True)

app.config["SECRET_KEY"] = os.environ.get("AI_INTERVIEW_SECRET", "dev-secret-key-ai-interview-lab-2025!")

# ── Auth helpers ─────────────────────────────────────────────

def _create_token(user_id, username):
    now = datetime.datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "username": username,
        "iat": now.timestamp(),
        "exp": (now + datetime.timedelta(days=7)).timestamp(),
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")


def _decode_token(token):
    try:
        return jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    except Exception:
        return None


def _get_current_user():
    """Extract and verify JWT from Authorization header. Returns payload or None."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    return _decode_token(auth.split(" ", 1)[1])


# ── Routes ───────────────────────────────────────────────────

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    if len(password) < 4:
        return jsonify({"error": "password must be at least 4 characters"}), 400
    if find_user_by_username(username):
        return jsonify({"error": "username already exists"}), 400

    users = get_users()
    user = {
        "id": str(uuid.uuid4()),
        "username": username,
        "password_hash": generate_password_hash(password),
        "created_at": datetime.datetime.now(timezone.utc).isoformat(),
    }
    users.append(user)
    save_users(users)
    token = _create_token(user["id"], username)
    return jsonify({"token": token, "user": {"id": user["id"], "username": username}})


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    if not username or not password:
        return jsonify({"error": "username and password required"}), 400
    user = find_user_by_username(username)
    if not user or not check_password_hash(user.get("password_hash", ""), password):
        return jsonify({"error": "invalid credentials"}), 401
    token = _create_token(user["id"], username)
    return jsonify({"token": token, "user": {"id": user["id"], "username": username}})


# ── Questions ────────────────────────────────────────────────

@app.route("/questions", methods=["GET"])
def questions():
    role = request.args.get("role")
    difficulty = request.args.get("difficulty")
    qs = get_questions_filtered(role, difficulty)
    return jsonify({"questions": qs, "total": len(qs)})


@app.route("/roles", methods=["GET"])
def roles():
    role_list = get_available_roles()
    stats = get_question_stats()
    return jsonify({"roles": role_list, "stats": stats})


# ── Submit answer ────────────────────────────────────────────

@app.route("/submit", methods=["POST"])
def submit():
    payload = _get_current_user()
    if not payload:
        return jsonify({"error": "unauthorized"}), 401

    data = request.get_json() or {}
    user_id = payload["sub"]
    role = data.get("role")
    difficulty = data.get("difficulty", "medium")
    question_id = data.get("question_id")
    answer = data.get("answer", "")

    question = get_question_by_id(question_id)
    if not question:
        return jsonify({"error": "question not found"}), 400

    result = evaluate_answer(answer, question, difficulty)

    record = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "date": datetime.datetime.now(timezone.utc).isoformat(),
        "role": role or question.get("role"),
        "difficulty": difficulty,
        "category": question.get("category", ""),
        "question_id": question_id,
        "question_text": question.get("text"),
        "answer": answer,
        "score": result["score"],
        "strengths": result["strengths"],
        "weaknesses": result["weaknesses"],
        "feedback": result["feedback"],
        "tips": result.get("tips", []),
    }
    save_interview(record)
    return jsonify({"result": result, "record": record})


# ── History ──────────────────────────────────────────────────

@app.route("/history", methods=["GET"])
def history():
    payload = _get_current_user()
    if not payload:
        return jsonify({"error": "unauthorized"}), 401
    interviews = get_user_interviews(payload["sub"])
    limit = request.args.get("limit", 50, type=int)
    return jsonify({"interviews": interviews[:limit], "total": len(interviews)})


@app.route("/history/<interview_id>", methods=["GET"])
def history_detail(interview_id):
    payload = _get_current_user()
    if not payload:
        return jsonify({"error": "unauthorized"}), 401
    record = get_user_interview_by_id(payload["sub"], interview_id)
    if not record:
        return jsonify({"error": "not found"}), 404
    return jsonify({"record": record})


# ── Analytics ────────────────────────────────────────────────

@app.route("/analytics", methods=["GET"])
def analytics():
    payload = _get_current_user()
    if not payload:
        return jsonify({"error": "unauthorized"}), 401
    data = compute_analytics(payload["sub"])
    return jsonify(data)


# ── Run ──────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=True, host="0.0.0.0", port=port)
