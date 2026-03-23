# 🧠 Overthinking Backend

REST API for **Overthinker Action Tracker** — a tool to help overthinkers track the time they spend *thinking* vs *executing* on personal challenges across 4 life categories.

Built with **Node.js + Express**, **PostgreSQL**, and **JWT** authentication.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL 16 |
| Auth | JWT (Access + Refresh Token) |
| Password | bcrypt |
| Email | Nodemailer (SMTP) |
| Docs | Swagger UI (OpenAPI 3.0) |
| Container | Docker + Docker Compose |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/         # Register, Login, Logout, Refresh, Forgot Password
│   ├── challenges/   # CRUD challenges
│   ├── sessions/     # Thinking & Executing sessions
│   ├── dashboard/    # Stats & summary
│   ├── admin/        # Admin management
│   └── health/       # Health check
├── configs/          # env, swagger
├── constants/        # Error codes, enums
├── middlewares/      # auth, validate, error handler
├── utils/            # jwt, bcrypt, mailer
└── helpers/          # response, pagination
```

---

## ⚙️ Setup

### 1. Clone & install

```bash
git clone git@github.com:seannguyendfw/Overthinking_Backend.git
cd Overthinking_Backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the required values in `.env`:

```env
# Database
POSTGRES_DB=overthinking_backend
POSTGRES_USER=overthinking_user
POSTGRES_PASSWORD=your_password
DATABASE_URL=postgresql://user:password@localhost:5454/overthinking_backend

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# SMTP (Gmail App Password)
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

### 3. Start PostgreSQL via Docker

```bash
docker compose up -d
```

### 4. Run the server

```bash
npm run dev     # development (nodemon)
npm start       # production
```

---

## 📚 API Docs

Swagger UI available at:

```
http://localhost:4000/api-docs
```

---

## 🔐 Authentication Flow

| Token | Storage | Lifetime | Usage |
|---|---|---|---|
| `access_token` | Response body | 15 minutes | `Authorization: Bearer <token>` |
| `refresh_token` | HTTP-only Cookie | 7 days | Auto-sent on `POST /auth/refresh` |

### Key Endpoints

```
POST   /api/v1/auth/register          Register new user
POST   /api/v1/auth/login             Login → access_token + refresh_token cookie
POST   /api/v1/auth/refresh           Get new access_token via cookie
POST   /api/v1/auth/forgot-password   Send random password to email
POST   /api/v1/auth/logout            Clear refresh_token cookie
GET    /api/v1/auth/me                Get current user profile

GET    /api/v1/challenges             List challenges
POST   /api/v1/challenges             Create challenge
PATCH  /api/v1/challenges/:id         Update challenge
DELETE /api/v1/challenges/:id         Delete challenge

POST   /api/v1/sessions               Log a thinking/executing session

GET    /api/v1/dashboard              Get stats summary
GET    /api/v1/health                 Health check
```

---

## 🐳 Docker

```bash
# Start database
docker compose up -d

# Stop
docker compose down
```

---

## 📝 License

MIT
