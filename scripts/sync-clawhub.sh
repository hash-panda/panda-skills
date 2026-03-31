#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILLS_DIR="$PROJECT_ROOT/skills"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
err()   { echo -e "${RED}[✗]${NC} $*" >&2; }
info()  { echo -e "${CYAN}[·]${NC} $*"; }

usage() {
  cat <<EOF
用法: $(basename "$0") [选项]

将 panda-skills 技能发布到 ClawHub。

选项:
  --skill <name>     只发布指定技能（如 panda-git-commit）
  --all              发布 skills/ 下的所有技能
  --bump <level>     版本号递增策略: patch | minor | major（默认 patch）
  --changelog <msg>  本次发布说明
  --tags <tags>      发布标签（默认 latest）
  --dry-run          仅预览命令，不实际发布
  --allow-cjk        允许包含中文/CJK 内容
  -h, --help         显示帮助

示例:
  $(basename "$0") --skill panda-git-commit --changelog "修复 monorepo scope 检测"
  $(basename "$0") --all --bump minor --dry-run
  $(basename "$0") --skill panda-git-commit --dry-run

环境变量:
  CLAWHUB_TOKEN      ClawHub API Token（必填，也可通过 .env 文件提供）
  CLAWHUB_OWNER      发布者名称（可选）
EOF
}

load_env() {
  local env_file="$PROJECT_ROOT/.env"
  if [[ -f "$env_file" ]]; then
    while IFS='=' read -r key value; do
      [[ -z "$key" || "$key" == \#* ]] && continue
      key="$(echo "$key" | xargs)"
      value="$(echo "$value" | xargs)"
      if [[ -z "${!key:-}" && -n "$value" ]]; then
        export "$key=$value"
      fi
    done < "$env_file"
  fi
}

check_prerequisites() {
  if ! command -v clawhub &>/dev/null; then
    err "未找到 clawhub CLI"
    echo "  安装方式: npm install -g clawhub"
    echo "  文档: https://clawhub.ai/docs/cli"
    exit 1
  fi

  if [[ -z "${CLAWHUB_TOKEN:-}" ]]; then
    err "未设置 CLAWHUB_TOKEN"
    echo "  请在 .env 文件或环境变量中设置 CLAWHUB_TOKEN"
    echo "  获取 Token: https://clawhub.ai/settings/tokens"
    exit 1
  fi
}

has_cjk() {
  # POSIX-compatible CJK detection via LC_ALL=C + awk byte ranges
  LC_ALL=C awk '/[\xe4-\xe9][\x80-\xbf][\x80-\xbf]/ || /[\xe3][\x80-\xbf][\x80-\xbf]/ || /[\xea-\xed][\x80-\xbf][\x80-\xbf]/' "$1" | head -1 | grep -q .
}

has_secrets() {
  grep -Eiq '(PRIVATE.KEY|password[[:space:]]*=[[:space:]]*["'"'"'].+|api[_-]?key[[:space:]]*=[[:space:]]*["'"'"'].+|secret[[:space:]]*=[[:space:]]*["'"'"'].+)' "$@" 2>/dev/null
}

preflight_check() {
  local skill_dir="$1"
  local skill_name="$2"
  local allow_cjk="$3"

  if [[ ! -f "$skill_dir/SKILL.md" ]]; then
    err "技能 $skill_name 缺少 SKILL.md"
    return 1
  fi

  if [[ "$allow_cjk" != "true" ]]; then
    if has_cjk "$skill_dir/SKILL.md"; then
      warn "技能 $skill_name 的 SKILL.md 包含 CJK 字符"
      warn "如果 ClawHub 允许，请使用 --allow-cjk 参数"
      return 1
    fi
  fi

  if has_secrets "$skill_dir"/*.md; then
    err "技能 $skill_name 可能包含敏感信息，请检查后重试"
    return 1
  fi

  log "预检通过: $skill_name"
  return 0
}

extract_version() {
  local skill_dir="$1"
  sed -n 's/^version:[[:space:]]*\([0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\).*/\1/p' "$skill_dir/SKILL.md" 2>/dev/null | head -1
}

extract_slug() {
  local skill_dir="$1"
  sed -n 's/^name:[[:space:]]*\([a-z0-9-][a-z0-9-]*\).*/\1/p' "$skill_dir/SKILL.md" 2>/dev/null | head -1
}

bump_version() {
  local version="$1"
  local level="$2"
  local major minor patch
  IFS='.' read -r major minor patch <<< "$version"
  case "$level" in
    major) echo "$((major + 1)).0.0" ;;
    minor) echo "${major}.$((minor + 1)).0" ;;
    patch) echo "${major}.${minor}.$((patch + 1))" ;;
    *) echo "$version" ;;
  esac
}

publish_skill() {
  local skill_dir="$1"
  local skill_name="$2"
  local bump="$3"
  local changelog="$4"
  local tags="$5"
  local dry_run="$6"
  local allow_cjk="$7"

  info "处理技能: $skill_name"

  if ! preflight_check "$skill_dir" "$skill_name" "$allow_cjk"; then
    return 1
  fi

  local slug
  slug="$(extract_slug "$skill_dir")"
  slug="${slug:-$skill_name}"

  local base_version
  base_version="$(extract_version "$skill_dir")"
  base_version="${base_version:-1.0.0}"
  local version
  version="$(bump_version "$base_version" "$bump")"

  local cmd=(clawhub publish
    --slug "$slug"
    --name "$skill_name"
    --version "$version"
  )

  [[ -n "$changelog" ]] && cmd+=(--changelog "$changelog")
  [[ -n "$tags" ]] && cmd+=(--tags "$tags")
  cmd+=("$skill_dir")

  if [[ "$dry_run" == "true" ]]; then
    info "[dry-run] 将执行:"
    echo "  ${cmd[*]}"
    return 0
  fi

  log "发布 $skill_name@$version (base: $base_version, bump: $bump)"
  CLAWHUB_TOKEN="$CLAWHUB_TOKEN" "${cmd[@]}"
  log "发布成功: $skill_name@$version"
}

sync_all() {
  local bump="$1"
  local changelog="$2"
  local tags="$3"
  local dry_run="$4"
  local allow_cjk="$5"

  local count=0
  local failed=0

  for skill_dir in "$SKILLS_DIR"/*/; do
    [[ ! -f "$skill_dir/SKILL.md" ]] && continue
    local skill_name
    skill_name="$(basename "$skill_dir")"
    if publish_skill "$skill_dir" "$skill_name" "$bump" "$changelog" "$tags" "$dry_run" "$allow_cjk"; then
      ((count++))
    else
      ((failed++))
    fi
  done

  echo ""
  log "同步完成: 成功 $count, 失败 $failed"
}

main() {
  local skill=""
  local all=false
  local bump="patch"
  local changelog=""
  local tags="latest"
  local dry_run=false
  local allow_cjk=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --skill)     skill="$2"; shift 2 ;;
      --all)       all=true; shift ;;
      --bump)      bump="$2"; shift 2 ;;
      --changelog) changelog="$2"; shift 2 ;;
      --tags)      tags="$2"; shift 2 ;;
      --dry-run)   dry_run=true; shift ;;
      --allow-cjk) allow_cjk=true; shift ;;
      -h|--help)   usage; exit 0 ;;
      *) err "未知参数: $1"; usage; exit 1 ;;
    esac
  done

  if [[ -z "$skill" && "$all" != "true" ]]; then
    err "请指定 --skill <name> 或 --all"
    echo ""
    usage
    exit 1
  fi

  load_env
  check_prerequisites

  echo ""
  info "panda-skills → ClawHub 发布工具"
  [[ "$dry_run" == "true" ]] && warn "Dry-run 模式，不会实际发布"
  echo ""

  if [[ "$all" == "true" ]]; then
    sync_all "$bump" "$changelog" "$tags" "$dry_run" "$allow_cjk"
  else
    local target_dir="$SKILLS_DIR/$skill"
    if [[ ! -d "$target_dir" ]]; then
      err "技能目录不存在: $target_dir"
      exit 1
    fi
    publish_skill "$target_dir" "$skill" "$bump" "$changelog" "$tags" "$dry_run" "$allow_cjk"
  fi
}

main "$@"
