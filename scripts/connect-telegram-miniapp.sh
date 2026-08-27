#!/usr/bin/env bash
set -euo pipefail

WEBAPP_URL="${WEBAPP_URL:-https://zhorik333.github.io/cheshka-game/}"
MENU_TEXT="${MENU_TEXT:-Играть в Чешку}"
COMMAND_DESCRIPTION="${COMMAND_DESCRIPTION:-Открыть игру про Чешку}"

if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required" >&2
  exit 1
fi

printf 'Telegram bot token: ' >&2
stty -echo
read -r BOT_TOKEN
stty echo
printf '\n' >&2

if [[ -z "${BOT_TOKEN}" ]]; then
  echo "Error: token is empty" >&2
  exit 1
fi

API_BASE="https://api.telegram.org/bot${BOT_TOKEN}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

api_post() {
  local method="$1"
  local payload_file="$2"
  local response_file="${TMP_DIR}/${method}.json"

  curl -fsS \
    -H 'Content-Type: application/json' \
    -d "@${payload_file}" \
    "${API_BASE}/${method}" \
    > "${response_file}"

  python3 - "$response_file" "$method" <<'PY'
import json
import sys

response_path, method = sys.argv[1], sys.argv[2]
with open(response_path, encoding='utf-8') as fh:
    data = json.load(fh)

if not data.get('ok'):
    description = data.get('description', 'unknown Telegram API error')
    print(f'{method}: FAILED — {description}', file=sys.stderr)
    raise SystemExit(1)

print(f'{method}: OK')
PY
}

python3 - "${TMP_DIR}/menu.json" "${TMP_DIR}/commands.json" "${WEBAPP_URL}" "${MENU_TEXT}" "${COMMAND_DESCRIPTION}" <<'PY'
import json
import sys

menu_path, commands_path, webapp_url, menu_text, command_description = sys.argv[1:]

with open(menu_path, 'w', encoding='utf-8') as fh:
    json.dump({
        'menu_button': {
            'type': 'web_app',
            'text': menu_text,
            'web_app': {'url': webapp_url},
        },
    }, fh, ensure_ascii=False)

with open(commands_path, 'w', encoding='utf-8') as fh:
    json.dump({
        'commands': [
            {'command': 'start', 'description': command_description},
        ],
    }, fh, ensure_ascii=False)
PY

api_post setChatMenuButton "${TMP_DIR}/menu.json"
api_post setMyCommands "${TMP_DIR}/commands.json"

VERIFY_RESPONSE="${TMP_DIR}/getChatMenuButton.json"
curl -fsS "${API_BASE}/getChatMenuButton" > "${VERIFY_RESPONSE}"

python3 - "$VERIFY_RESPONSE" "$WEBAPP_URL" <<'PY'
import json
import sys

response_path, expected_url = sys.argv[1], sys.argv[2]
with open(response_path, encoding='utf-8') as fh:
    data = json.load(fh)

if not data.get('ok'):
    print('getChatMenuButton: FAILED — Telegram API returned ok=false', file=sys.stderr)
    raise SystemExit(1)

button = data.get('result', {})
actual_url = button.get('web_app', {}).get('url')
if button.get('type') != 'web_app' or actual_url != expected_url:
    print('getChatMenuButton: FAILED — menu button did not match expected URL', file=sys.stderr)
    print(json.dumps(button, ensure_ascii=False, indent=2), file=sys.stderr)
    raise SystemExit(1)

print('getChatMenuButton: OK')
print(f'Mini App URL: {actual_url}')
PY

echo "Done. Open your bot in Telegram and press the menu button: ${MENU_TEXT}"
