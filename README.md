# 📡 Telegram Broadcast System

A full-stack admin dashboard for broadcasting messages and files to every user of a Telegram bot — with instant sends, scheduled (cron-based) broadcasts, live progress tracking, abort/cancel support, and a searchable send history.

**Live demo:** [telegram-broadcast-system.vercel.app](https://telegram-broadcast-system.vercel.app)

---

## ✨ Features

- **Bot-driven subscriber list** — users opt in by messaging the bot; `/stop` unsubscribes them automatically.
- **Broadcast text and/or files** — send a plain message, a file with a caption, or both, to every subscribed chat.
- **Drag-and-drop file upload** with a 50 MB limit and a filter that blocks executable file types (`.exe`, `.sh`, `.bat`, `.js`, `.php`, etc.).
- **Scheduled broadcasts** — pick a future date/time and a background cron job (checked every minute) fires the broadcast automatically.
- **Live abort/cancel** — stop an in-flight or pending broadcast at any checkpoint (before start, mid-loop, or right after a send).
- **Automatic retry** — a failed send to a user is retried once before being logged as a failure.
- **Auto-cleanup** — users who have blocked the bot (HTTP 403 / "blocked by the user") are automatically removed from the database.
- **Broadcast history** — paginated log of every broadcast with success/fail counts and totals.
- **JWT-protected admin dashboard** — password login issues a 24-hour token; all broadcast endpoints require it.
- **Rate limiting** — the API is protected with a 100 requests / 15 minutes limit per IP.

---

## 🏗️ Tech Stack

**Backend**
- Node.js + Express 5 (TypeScript)
- PostgreSQL (via [`pg`](https://www.npmjs.com/package/pg), configured for hosted Postgres such as Neon)
- [`node-telegram-bot-api`](https://www.npmjs.com/package/node-telegram-bot-api) — bot polling, sending messages/files
- [`node-cron`](https://www.npmjs.com/package/node-cron) — scheduled broadcast execution
- `jsonwebtoken` for admin authentication
- `multer` for file uploads
- `express-rate-limit` for API throttling

**Frontend**
- React 19 + TypeScript
- Vite 8

---

## 📁 Project Structure

```
telegram-broadcast-system/
├── src/                          # Backend (Express + TypeScript)
│   ├── config/
│   │   ├── db.ts                 # PostgreSQL pool (SSL-enabled)
│   │   └── env.ts                # Environment variable loader
│   ├── controllers/
│   │   └── sendController.ts     # Login, send, history, cancel handlers
│   ├── middlewares/
│   │   ├── auth.ts                # JWT verification middleware
│   │   └── errorHandler.ts
│   ├── routes/
│   │   └── sendRoutes.ts         # /api routes
│   ├── services/
│   │   ├── telegramService.ts    # Bot polling, /stop handling, send helpers
│   │   ├── senderService.ts      # Broadcast loop, retries, abort checkpoints
│   │   └── cronService.ts        # Minute-by-minute scheduled broadcast runner
│   ├── utils/
│   │   ├── upload.ts             # Multer config + file-type security filter
│   │   └── delay.ts
│   └── index.ts                  # App entrypoint
├── frontend/                     # Admin dashboard (React + Vite)
│   └── src/
│       ├── App.tsx               # Login, broadcast composer, history view
│       └── main.tsx
├── package.json                  # Backend scripts & dependencies
└── frontend/package.json         # Frontend scripts & dependencies
```

---

## ⚙️ How It Works

1. A user sends `/start` (or any message) to your Telegram bot → they're saved to the `users` table and receive a welcome message. Sending `/stop` removes them.
2. The admin logs into the dashboard with a password, receiving a JWT used to authenticate all further requests.
3. From the dashboard, the admin composes a message and/or uploads a file:
   - **Send now** → the backend loops through every subscribed `chat_id`, sending the message/file with a delay between sends, retrying on failure, and pruning users who've blocked the bot.
   - **Schedule for later** → the broadcast is stored in `scheduled_broadcasts`; a cron job checks every minute for due broadcasts and executes them the same way.
4. Every completed (or aborted) broadcast is logged to `broadcast_history` with success/fail counts, viewable and paginated from the dashboard's **History Log** tab.
5. An in-progress or pending broadcast can be cancelled at any time; the send loop checks for the cancel signal at multiple points and records the run as `[ABORTED]`.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

### 1. Clone the repo

```bash
git clone https://github.com/divypatel31/telegram-broadcast-system.git
cd telegram-broadcast-system
```

### 2. Install dependencies

```bash
npm install              # backend
cd frontend && npm install && cd ..   # frontend
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
DB_URL=postgres://user:password@host:port/dbname
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret
```

> The database tables (`broadcast_history`, `scheduled_broadcasts`) are created automatically on first run. You'll also need a `users` table with at least a `chat_id` column for the bot to write to.

### 4. Run in development

```bash
npm run dev            # runs backend + frontend concurrently
```

Or run them separately:

```bash
npm run dev:backend    # ts-node-dev, backend only
npm run dev:frontend   # Vite dev server, frontend only
```

### 5. Build for production

```bash
npm run build           # compiles backend TypeScript to /dist
npm start                # runs the compiled backend

cd frontend
npm run build            # builds the frontend for deployment
```

---

## 🔌 API Endpoints

All routes are prefixed with `/api` and rate-limited (100 requests / 15 min per IP).

| Method | Endpoint            | Auth | Description                                  |
|--------|----------------------|------|-----------------------------------------------|
| POST   | `/api/login`          | —    | Log in with admin password, returns a JWT     |
| POST   | `/api/send-file`      | JWT  | Send (or schedule) a message/file broadcast   |
| GET    | `/api/users/count`    | JWT  | Get current subscriber count                  |
| GET    | `/api/history`        | JWT  | Paginated broadcast history                   |
| POST   | `/api/cancel`         | JWT  | Cancel an in-progress or pending broadcast    |

Authenticated requests must include:
```
Authorization: Bearer <token>
```

---

## 🛡️ Security Notes

- File uploads are limited to 50 MB and block common executable extensions.
- Admin routes require a valid JWT (24-hour expiry).
- Broadcast files are stored in the OS temp directory during processing.

---

## 📄 License
This project does not currently have an open-source license. Licensing details will be added at a later date.
