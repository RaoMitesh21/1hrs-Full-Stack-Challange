#!/usr/bin/env bash
# build.sh - Render build script for backend
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Ensure data files exist
[ -f users.json ] || echo '[]' > users.json
[ -f interviews.json ] || echo '[]' > interviews.json
