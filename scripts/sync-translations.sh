#!/usr/bin/env bash
# 누락되었거나 원문이 바뀐 번역을 서버에서 백그라운드로 생성한다.
# 서버는 시작할 때와 6시간마다 자동으로 같은 작업을 하므로 보통은 실행할 필요가 없다.
#
# 사용법:
#   INTERNAL_API_TOKEN=... ./scripts/sync-translations.sh            # 동기화 시작
#   INTERNAL_API_TOKEN=... ./scripts/sync-translations.sh status     # 상태만 확인
#   SITE_URL=http://127.0.0.1:3000 ./scripts/sync-translations.sh    # 서버 주소 지정
set -euo pipefail

cd "$(dirname "$0")/.."
if [[ -z "${INTERNAL_API_TOKEN:-}" && -f .env ]]; then
    INTERNAL_API_TOKEN="$(grep -E '^INTERNAL_API_TOKEN=' .env | cut -d= -f2- | tr -d '"'"'"'"')"
fi
: "${INTERNAL_API_TOKEN:?INTERNAL_API_TOKEN이 필요합니다}"
SITE_URL="${SITE_URL:-http://127.0.0.1:3000}"

if [[ "${1:-}" == "status" ]]; then
    curl -fsS -H "Authorization: Bearer ${INTERNAL_API_TOKEN}" "${SITE_URL}/api/internal/translations/sync"
else
    curl -fsS -X POST -H "Authorization: Bearer ${INTERNAL_API_TOKEN}" "${SITE_URL}/api/internal/translations/sync"
fi
echo
