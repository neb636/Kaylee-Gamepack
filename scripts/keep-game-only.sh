#!/usr/bin/env bash
# Safety net for the AI workflows: undo any change outside the game folders
# (src/games/<id>/ and art/source/games/<id>/). Changes to the tea party game are also undone.
# Writes a note to .lesson-input/reverted.md so the PR can mention it.
set -euo pipefail
mkdir -p .lesson-input
reverted=()
while IFS= read -r line; do
  status="${line:0:2}"
  path="${line:3}"
  path="${path#\"}"; path="${path%\"}"
  if [[ "$path" =~ ^(src/games/|art/source/games/) ]] && [[ ! "$path" =~ ^(src/games|art/source/games)/unicorn-tea-party/ ]]; then
    continue
  fi
  reverted+=("$path")
  if [[ "$status" == "??" ]]; then rm -rf -- "$path"; else git checkout HEAD -- "$path" 2>/dev/null || rm -rf -- "$path"; fi
done < <(git status --porcelain --untracked-files=all)

if (( ${#reverted[@]} )); then
  { echo; echo "⚠️ Undid changes outside the game folder:"; printf -- '- `%s`\n' "${reverted[@]}"; } >> .lesson-input/reverted.md
  printf '::warning::Reverted %s\n' "${reverted[@]}"
fi
