#!/usr/bin/env bash
# Keeps one comment on the PR that says whether its review page is up: it waits until GitHub Pages actually serves the
# page just built (its built.txt holds the stamp), so the link in it works when it appears.
#
#   scripts/ci-review-comment.sh <pr> <status> [stamp|reason]     status: ready | failed (none: nothing to say)
#
# Needs GH_TOKEN with pull-requests: write.
set -uo pipefail
. "$(dirname "$0")/ci-lib.sh"

pr=$1 status=$2 detail=${3:-}
owner=${REPO%%/*} name=${REPO#*/}
url="https://$(printf '%s' "$owner" | tr '[:upper:]' '[:lower:]').github.io/$name/pr-preview/pr-$pr/review/"
marker='<!-- review-page-status -->'
now=$(date -u +'%H:%M UTC')

case "$status" in
  ready)
    live=false
    for _ in $(seq 1 30); do # up to ~7.5 minutes
      if [ "$(curl -fsS --max-time 10 "${url}built.txt?$RANDOM" 2>/dev/null)" = "$detail" ]; then live=true; break; fi
      sleep 15
    done
    if $live; then
      body="📋 **[The review page is up]($url)** (updated $now)."
    else
      body="📋 The review page was published at $now, but GitHub Pages hadn't served it after 7 minutes. Try [the review page]($url) again in a minute."
    fi
    ;;
  failed)
    body="⚠️ The review page didn't build ($now): $detail. Publishing the review page again (\`node scripts/review.mjs --publish\`) retries it."
    ;;
  *) exit 0 ;;
esac

body="$marker
$body"
id=$(gh api "repos/$REPO/issues/$pr/comments" --paginate --jq ".[] | select(.body | startswith(\"$marker\")) | .id" | head -1)
if [ -n "$id" ]; then
  gh api -X PATCH "repos/$REPO/issues/comments/$id" -f body="$body" > /dev/null
else
  gh api "repos/$REPO/issues/$pr/comments" -f body="$body" > /dev/null
fi
echo "$body"
