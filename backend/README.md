AI Interview Simulator - Backend

Setup

1. Create a virtual environment (recommended)

   python3 -m venv venv
   source venv/bin/activate

2. Install dependencies

   pip install -r requirements.txt

3. Run the server

   python app.py

API Endpoints

- POST /register {username, password}
- POST /login {username, password}
- GET /questions?role=&difficulty=
- POST /submit (Authorization: Bearer <token>) {role, difficulty, question_id, answer}
- GET /analytics (Authorization: Bearer <token>)

Notes

This backend uses JSON files as storage in the project directory (users.json, interviews.json, questions.json). It's intentionally minimal and easy to extend.
