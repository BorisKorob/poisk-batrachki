# Как выложить «Поиск батрачки» в интернет и включить вход по почте

Сайт статический и живёт на **GitHub Pages**: https://boriskorob.github.io/poisk-batrachki/

Аккаунты и прогресс хранятся в **Appwrite Cloud** (бесплатный тариф). Firebase не подходит: Google блокирует его серверы входа и базы для российских IP (ответ 403).

## 1. GitHub Pages
Репозиторий: https://github.com/BorisKorob/poisk-batrachki. Pages включён: Settings → Pages → Deploy from a branch → `main` / `(root)`. Любой `git push` обновляет сайт за 1–2 минуты.

## 2. Appwrite — аккаунты и прогресс

1. Зарегистрируйтесь на https://cloud.appwrite.io (удобно через GitHub).
2. **Create project** → имя `poisk-batrachki` → регион **Frankfurt** → Create. Скопируйте **Project ID** (виден в Settings проекта или под названием).
3. **Добавить платформу (обязательно, иначе браузер не пустит запросы):** Overview → **Add platform → Web** → Hostname: `boriskorob.github.io` → дальше можно пропустить шаги с кодом.
4. **Auth → Settings:** метод **Email/Password** должен быть включён (по умолчанию включён).
5. **Databases → Create database:** Name `main`, **Database ID** = `main` (задайте вручную).
6. В базе **Create table:** Name `progress`, **Table ID** = `progress`.
7. В таблице **Columns → Create column**, три штуки:
   | Key | Type | Параметры |
   |---|---|---|
   | `name` | Varchar / String | size 64 |
   | `count` | Integer | — |
   | `solved` | Text / Longtext (или String size 100000) | — |
8. В таблице **Settings**:
   - **Permissions → Add role → All users** (Users) → отметить **Create** → Update.
   - **Row security** — включить → Update.

   Так любой вошедший может создать свою строку; читать строки могут все вошедшие (для рейтинга), менять — только владелец (права ставит сам сайт при сохранении).
9. Впишите Project ID в `config.js` (поле `projectId`), при другом регионе поправьте `endpoint`, и сделайте `git push`.

## Частые проблемы
| Сообщение | Что сделать |
|---|---|
| «Сервер аккаунтов не настроен для этого сайта» | добавьте Web-платформу с hostname `boriskorob.github.io` (шаг 3) |
| «Нет доступа к таблице прогресса» | проверьте шаг 8: роль Users с правом Create и включённый Row security |
| «Пароль не подходит» | минимум 8 символов, не слишком простой |
| Изменения не видны | подождите 1–2 минуты после push и обновите страницу (Ctrl+F5) |

## Локальный запуск
Двойной клик по `index.html` или сервер `.claude\serve.ps1` и http://localhost:8765/.
