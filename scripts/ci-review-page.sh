#!/usr/bin/env bash
# Builds a PR's review page into <outdir>: the folder the agent published to the review-pages branch
# (`node scripts/review.mjs --publish`), plus the script sheet of every group of spoken lines the checkout changes
# (HEAD^1 is the base: run it on the PR's merge commit). Used by preview.yml and review-page.yml.
#
#   scripts/ci-review-page.sh <branch> <outdir> <pr>
#
# Only that branch's folder is downloaded. The whole review-pages tip once passed 1 GB and a 60 s fetch of it timed
# out, so previews went out with no review page. Never fails the job: it sets the outputs
#   status=ready|none|failed   reason=<why it failed>   stamp=<what <outdir>/built.txt holds, to see it's live>
set -uo pipefail
# Runs against the checkout it's called from (review-page.yml runs main's copy of this script on a PR's checkout).
. "$(dirname "$0")/ci-lib.sh"
cd "$(git rev-parse --show-toplevel)"

branch=$1 out=$2 pr=$3
slug=$(slug_of "$branch")
tmp="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/review-pages-$pr"
stamp="${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-1}-$(date -u +%H%M%S)"

fail() {
  echo "::warning title=Review page::$1"
  output status failed
  output reason "$1"
  exit 0
}

mkdir -p "$out"
if sparse_clone review-pages "$tmp" "$slug"; then
  if [ -d "$tmp/$slug" ]; then
    cp -R "$tmp/$slug/." "$out/"
    echo "Copied review-pages:$slug ($(du -sh "$out" | cut -f1))."
  else
    echo "Nothing published to review-pages:$slug yet."
  fi
else
  fail "couldn't download review-pages:$slug from GitHub"
fi
rm -rf "$tmp"

# No ffmpeg here (installing it took over 12 minutes on the runner), so a table read CI adds for changed lines is the
# script sheet without audio; the agent records and publishes the audio (table-read skill).
with_timeout 120 node scripts/review.mjs --out="$out" --changed=HEAD^1 --keep --pr="$pr" < /dev/null \
  || fail "scripts/review.mjs failed (see the job's log)"

if [ -f "$out/index.html" ]; then
  echo "$stamp" > "$out/built.txt"
  output status ready
  output stamp "$stamp"
else
  rm -rf "$out"
  output status none
fi
