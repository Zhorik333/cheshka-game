# Подключение игры как Telegram Mini App

Публичная ссылка игры:

https://zhorik333.github.io/cheshka-game/

## Вариант A — через готовый скрипт

Скрипт безопасно спросит bot token скрытым вводом и не сохранит его в файлы.

```bash
cd /home/arts9/cheshka-game
bash scripts/connect-telegram-miniapp.sh
```

По умолчанию он установит кнопку меню бота:

- текст: `Играть в Чешку`
- URL: `https://zhorik333.github.io/cheshka-game/`

Можно переопределить текст/URL:

```bash
MENU_TEXT='Побег Чешки' WEBAPP_URL='https://zhorik333.github.io/cheshka-game/' bash scripts/connect-telegram-miniapp.sh
```

Скрипт делает:

1. `setChatMenuButton` — ставит Mini App кнопку в меню бота.
2. `setMyCommands` — добавляет команду `/start` с описанием игры.
3. `getChatMenuButton` — читает настройки обратно и проверяет URL.

## Вариант B — вручную через BotFather

1. Открой `@BotFather`.
2. Нажми `/mybots`.
3. Выбери нужного бота.
4. `Bot Settings` → `Menu Button` → `Configure menu button`.
5. Отправь URL:

```text
https://zhorik333.github.io/cheshka-game/
```

6. Отправь название кнопки, например:

```text
Играть в Чешку
```

Если BotFather попросит домен для Web App, укажи:

```text
zhorik333.github.io
```

## Проверка

После подключения:

1. Открой своего бота в Telegram.
2. Перезапусти диалог командой `/start` или открой меню рядом с полем ввода.
3. Нажми кнопку `Играть в Чешку`.
4. Игра должна открыться внутри Telegram.
