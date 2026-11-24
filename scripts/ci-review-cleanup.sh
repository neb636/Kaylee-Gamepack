#!/usr/bin/env bash
# Takes finished PRs' review pages off the review-pages branch, which grew to 1 GB because nothing ever removed them.
# (The PR preview already removes <preview>/ from gh-pages when a PR closes.) Only the branch's tip shrinks: every
# reader fetches depth 1, so old commits cost nothing.
#
#   scripts/ci-review-cleanup.sh <branch> <why>    one branch's folder (a PR was merged or closed)
#   scripts/ci-review-cleanup.sh --sweep [--dry]   every folder whose branch has no open PR and is either gone from
#                                                  GitHub or had a PR that's now closed (a branch published but not
#                                                  opened as a PR yet stays)
set -uo pipefail
. "$(dirname "$0")/ci-lib.sh"

dir="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/review-pages-cleanup"
sparse_clone review-pages "$dir" || { echo "::error::Couldn't download review-pages"; exit 1; }
folders=$(git -C "$dir" ls-tree --name-only -d HEAD)

if [ "${1:-}" = --sweep ]; then
  prs=$(gh pr list --repo "$REPO" --state all --limit 2000 --json headRefName,state --jq '.[] | "\(.state) \(.headRefName)"')
  open=$(awk '$1 == "OPEN" { print $2 }' <<< "$prs")
  closed=$(awk '$1 != "OPEN" { print $2 }' <<< "$prs")
  branches=$(cigit ls-remote --heads "$REPO_URL" | sed 's#.*refs/heads/##')
  slugs() { while read -r b; do [ -n "$b" ] && slug_of "$b" && echo; done; }
  keep_open=$(slugs <<< "$open")
  was_closed=$(slugs <<< "$closed")
  alive=$(slugs <<< "$branches")
  remove=()
  while read -r f; do
    [ -n "$f" ] || continue
    grep -qxF "$f" <<< "$keep_open" && continue
    if grep -qxF "$f" <<< "$was_closed" || ! grep -qxF "$f" <<< "$alive"; then remove+=("$f"); fi
  done <<< "$folders"
  why="no open PR"
  [ "${2:-}" = --dry ] && { printf 'Would remove %s\n' "${remove[@]}"; echo "${#remove[@]} of $(wc -l <<< "$folders") folders"; exit 0; }
else
  slug=$(slug_of "$1")
  why=$2
  remove=()
  grep -qxF "$slug" <<< "$folders" && remove=("$slug")
fi

if [ ${#remove[@]} -eq 0 ]; then echo "Nothing to remove."; exit 0; fi
cigit -C "$dir" rm -r -q --sparse -- "${remove[@]}"
if [ ${#remove[@]} -eq 1 ]; then msg="Remove the review page for ${remove[0]} ($why)"; else msg="Remove ${#remove[@]} review pages ($why)"; fi
cigit -C "$dir" commit -q -m "$msg" -m "$(printf '%s\n' "${remove[@]}")"
push_retry "$dir" review-pages || { echo "::error::Couldn't push review-pages"; exit 1; }
echo "$msg"
printf '  %s\n' "${remove[@]}"
