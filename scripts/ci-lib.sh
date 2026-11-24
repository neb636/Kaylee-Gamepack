# Shared by the review-page CI scripts (sourced, not run). Small clones of the big branches (review-pages, gh-pages):
# only the trees come down, and only the files of the folders a script asks for.

REPO="${GITHUB_REPOSITORY:-$(git remote get-url origin 2>/dev/null | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')}"
REPO_URL="https://github.com/$REPO.git"

# git with the workflow's token, for clones outside the checkout (they don't get its credentials).
cigit() {
  if [ -n "${GH_TOKEN:-}" ]; then
    git -c "http.https://github.com/.extraheader=AUTHORIZATION: basic $(printf 'x-access-token:%s' "$GH_TOKEN" | base64 | tr -d '\n')" \
      -c user.name='github-actions[bot]' -c user.email='41898099+github-actions[bot]@users.noreply.github.com' "$@"
  else
    git "$@"
  fi
}

export -f cigit

# with_timeout <seconds> <cmd...>: also for cigit (a function, so through bash). Without `timeout` it just runs.
with_timeout() {
  local s=$1; shift
  if command -v timeout >/dev/null; then timeout "$s" bash -c '"$@"' _ "$@"; else "$@"; fi
}

# sparse_clone <branch> <dir> [folder...]: depth 1, no file contents until a folder is asked for.
sparse_clone() {
  local branch=$1 dir=$2; shift 2
  rm -rf "$dir"
  with_timeout 120 cigit clone -q --depth=1 --filter=blob:none --sparse --branch "$branch" "$REPO_URL" "$dir" || return 1
  if [ $# -gt 0 ]; then with_timeout 120 cigit -C "$dir" sparse-checkout set "$@" || return 1; fi
}

# push_retry <dir> <branch>: someone may have pushed meanwhile; put this commit on top of theirs.
push_retry() {
  local dir=$1 branch=$2
  for _ in 1 2 3 4; do
    cigit -C "$dir" push -q origin "HEAD:$branch" && return 0
    cigit -C "$dir" pull -q --rebase origin "$branch" || return 1
  done
  return 1
}

slug_of() { printf '%s' "${1//\//--}"; }

# Writes key=value to the step's outputs (and prints it, so a local run shows it too).
output() {
  echo "$1=$2"
  if [ -n "${GITHUB_OUTPUT:-}" ]; then echo "$1=$2" >> "$GITHUB_OUTPUT"; fi
}
