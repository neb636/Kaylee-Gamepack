#!/usr/bin/env bash
# Takes finished PRs' review pages off the review-pages branch, which grew to 1 GB because nothing ever removed them.
# (The PR preview already removes <preview>/ from gh-pages when a PR closes.) Only the branch's tip shrinks: every
# reader fetches depth 1, so old commits cost nothing.
#
#   scripts/ci-review-cleanup.sh <branch> <why>    one branch's folder (a PR was merged or closed)
#   DRY=1 scripts/ci-review-cleanup.sh ...        say what it would remove, change nothing
#   scripts/ci-review-cleanup.sh --sweep           every folder whose branch has no open PR and is either gone from
#                                                  GitHub or had a PR that's now closed (a branch published but not
#                                                  opened as a PR yet stays)
# Folders the oddities eval set reads its pictures from (scripts/oddities/eval-labels.json) always stay.
set -uo pipefail
. "$(dirname "$0")/ci-lib.sh"

labels="$(dirname "$0")/oddities/eval-labels.json"
[ -f "$labels" ] || { echo "::error::$labels is missing: can't tell which folders the eval set needs"; exit 1; }
pinned=$(jq -r '.frames | keys[] | split("/")[0]' "$labels" | sort -u) && [ -n "$pinned" ] \
  || { echo "::error::Couldn't read the eval set's folders from $labels"; exit 1; }

dir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/review-pages-cleanup"
sparse_clone review-pages "$dir" || { echo "::error::Couldn't download review-pages"; exit 1; }
folders=$(git -C "$dir" ls-tree --name-only -d HEAD)

if [ "${1:-}" = --sweep ]; then
  # Both lists must come back whole: an empty one would make every page look abandoned.
  prs=$(gh pr list --repo "$REPO" --state all --limit 2000 --json headRefName,state --jq '.[] | "\(.state) \(.headRefName)"') \
    && [ -n "$prs" ] || { echo "::error::Couldn't list the PRs"; exit 1; }
  open=$(awk '$1 == "OPEN" { print $2 }' <<< "$prs")
  closed=$(awk '$1 != "OPEN" { print $2 }' <<< "$prs")
  branches=$(cigit ls-remote --heads "$REPO_URL") && grep -q 'refs/heads/main$' <<< "$branches" \
    || { echo "::error::Couldn't list the branches"; exit 1; }
  branches=$(sed 's#.*refs/heads/##' <<< "$branches")
  slugs() { while read -r b; do [ -n "$b" ] && slug_of "$b" && echo; done; }
  keep_open=$(slugs <<< "$open")
  was_closed=$(slugs <<< "$closed")
  alive=$(slugs <<< "$branches")
  remove=()
  while read -r f; do
    [ -n "$f" ] || continue
    grep -qxF "$f" <<< "$keep_open" && continue
    grep -qxF "$f" <<< "$pinned" && continue
    if grep -qxF "$f" <<< "$was_closed" || ! grep -qxF "$f" <<< "$alive"; then remove+=("$f"); fi
  done <<< "$folders"
  why="no open PR"
else
  slug=$(slug_of "$1")
  why=$2
  remove=()
  if grep -qxF "$slug" <<< "$pinned"; then echo "Keeping $slug: the oddities eval set uses its pictures."; exit 0; fi
  grep -qxF "$slug" <<< "$folders" && remove=("$slug")
fi

if [ ${#remove[@]} -eq 0 ]; then echo "Nothing to remove."; exit 0; fi
if [ -n "${DRY:-}" ]; then printf 'Would remove %s\n' "${remove[@]}"; echo "${#remove[@]} of $(wc -l <<< "$folders" | tr -d ' ') folders"; exit 0; fi
cigit -C "$dir" rm -r -q --sparse -- "${remove[@]}"
if [ ${#remove[@]} -eq 1 ]; then msg="Remove the review page for ${remove[0]} ($why)"; else msg="Remove ${#remove[@]} review pages ($why)"; fi
cigit -C "$dir" commit -q -m "$msg" -m "$(printf '%s\n' "${remove[@]}")"
push_retry "$dir" review-pages || { echo "::error::Couldn't push review-pages"; exit 1; }
echo "$msg"
printf '  %s\n' "${remove[@]}"
