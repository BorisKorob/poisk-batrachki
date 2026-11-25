# Как выложить «Поиск батрачки» в интернет и включить вход по почте

Сайт статический: его можно бесплатно разместить на **GitHub Pages**, а аккаунты и прогресс хранить в **Firebase** (бесплатный тариф Spark — для двоих-десятерых человек его хватит с огромным запасом). Займёт 10–15 минут.

## 1. GitHub Pages — сам сайт

1. Зарегистрируйтесь на https://github.com (если ещё нет аккаунта).
2. Создайте **публичный** репозиторий, например `poisk-batrachki` (кнопка **New repository**). На бесплатном тарифе Pages работает только для публичных репозиториев.
3. Загрузите файлы курса из папки `D:\analyst-course`: на странице репозитория **Add file → Upload files**, перетащите все файлы (`index.html`, `style.css`, `app.js`, `config.js`, `data.js`, `gen.js`, `tracks.js`, все `c-*.js`). Папку `.claude` и `page.html` загружать не нужно. Нажмите **Commit changes**.
   - Или через git (из папки курса):
     ```
     git init
     git add index.html style.css app.js config.js data.js gen.js tracks.js c-*.js README.md SETUP.md
     git commit -m "Поиск батрачки"
     git branch -M main
     git remote add origin https://github.com/<ваш-логин>/poisk-batrachki.git
     git push -u origin main
     ```
4. В репозитории: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, ветка `main`, папка `/ (root)`, **Save**.
5. Через 1–2 минуты сайт будет доступен по адресу `https://<ваш-логин>.github.io/poisk-batrachki/`. Пока без входа — прогресс сохраняется в браузере.

## 2. Firebase — вход по почте и прогресс в облаке

1. Откройте https://console.firebase.google.com, войдите Google-аккаунтом, **Add project** → название `poisk-batrachki` → Google Analytics можно выключить → **Create project**.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.**
3. **Build → Firestore Database → Create database** → выберите регион (например `eur3`) → **Start in production mode** → **Create**.
4. Во вкладке **Rules** Firestore замените правила на эти и нажмите **Publish**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
   Смысл: вошедшие пользователи видят имена и число решённых задач друг друга (для рейтинга), а менять может только свой прогресс. Почта в базу не записывается.
5. **Project settings (шестерёнка) → General → Your apps → значок `</>` (Web)** → имя `site` → **Register app**. Скопируйте объект `firebaseConfig` — он выглядит так:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "poisk-batrachki.firebaseapp.com",
     projectId: "poisk-batrachki",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "1:...:web:..."
   };
   ```
6. Откройте файл `config.js` и замените `window.FIREBASE_CONFIG = null;` на
   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "poisk-batrachki.firebaseapp.com",
     projectId: "poisk-batrachki",
     appId: "1:...:web:..."
   };
   ```
   (значения — ваши из шага 5). Эти ключи не секретные: доступ защищают правила из шага 4.
7. **Authentication → Settings → Authorized domains → Add domain** → `<ваш-логин>.github.io`.
8. Загрузите обновлённый `config.js` в репозиторий (Upload files с заменой или `git commit` + `git push`).

Готово: на сайте появится экран входа с регистрацией по почте и паролю, восстановлением пароля и страницей «Рейтинг». Отправьте другу ссылку — он зарегистрируется своей почтой, и у вас будут разные аккаунты.

## Частые проблемы

| Симптом | Что сделать |
|---|---|
| «auth/unauthorized-domain» | добавьте домен `*.github.io` из адресной строки в Authorized domains (шаг 7) |
| «Missing or insufficient permissions» | проверьте правила Firestore (шаг 4) и что они опубликованы |
| Изменения не видны на сайте | подождите 1–2 минуты после push и обновите страницу с Ctrl+F5 |
| Python долго грузится | первый запуск скачивает интерпретатор и библиотеки (до ~100 МБ для sklearn/statsmodels), потом браузер берёт их из кэша |

## Локальный запуск
Двойной клик по `index.html` работает без входа. Если браузер блокирует что-то при открытии файла напрямую, запустите локальный сервер и откройте http://localhost:8765/ :
```
powershell -NoProfile -ExecutionPolicy Bypass -File .claude\serve.ps1
```
