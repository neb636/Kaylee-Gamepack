#!/usr/bin/env bash
# Starts the ElevenLabs MCP server for Claude Code (.claude/mcp/elevenlabs.json) and Codex (.codex/config.toml).
# Both keep it OFF until you switch it on for a session (see .agents/skills/sfx/SKILL.md).
# The key never lives in a config file: it comes from your shell, this checkout's .env, or the main checkout's .env.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ -z "${ELEVENLABS_API_KEY:-}" ]]; then
  for f in "$ROOT/.env" "$HOME/repos/Kaylee-Gamepack/.env"; do
    if [[ -f "$f" ]]; then
      line="$(grep -E '^ELEVENLABS_API_KEY=' "$f" | tail -n1 || true)"
      if [[ -n "$line" ]]; then
        ELEVENLABS_API_KEY="${line#ELEVENLABS_API_KEY=}"
        ELEVENLABS_API_KEY="${ELEVENLABS_API_KEY%\"}"; ELEVENLABS_API_KEY="${ELEVENLABS_API_KEY#\"}"
        break
      fi
    fi
  done
fi
if [[ -z "${ELEVENLABS_API_KEY:-}" ]]; then
  echo "elevenlabs-mcp: no ELEVENLABS_API_KEY (add it to ~/repos/Kaylee-Gamepack/.env)" >&2
  exit 1
fi
export ELEVENLABS_API_KEY

# Generated clips are scratch (gitignored) until one is picked and copied into the game.
export ELEVENLABS_MCP_BASE_PATH="${ELEVENLABS_MCP_BASE_PATH:-$ROOT/art/source/sfx}"
export ELEVENLABS_MCP_OUTPUT_MODE="${ELEVENLABS_MCP_OUTPUT_MODE:-files}"
mkdir -p "$ELEVENLABS_MCP_BASE_PATH"

exec uvx elevenlabs-mcp@0.12.2
