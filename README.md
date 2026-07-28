# CoachApp ⚡

Full-stack app with JWT auth, todo list, social feed, and profile management.

- **Backend**: Node.js + Express + SQLite (port 5000)
- **Frontend**: React (port 3000)

## Setup

### Backend
```bash
cd backend
npm install
npm approve-scripts better-sqlite3   # approve native SQLite build
npm start                             # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm start                             # starts on http://localhost:3000
```

### Exact install commands (run once)
```bash
# Backend
cd backend && npm install && npm approve-scripts better-sqlite3

# Frontend
cd frontend && npm install
```

## Features

- **Auth** — Register / login with JWT, 7-day sessions stored in localStorage
- **Todos** — Add, complete, and delete tasks with loading states
- **Social Feed** — Post updates, like posts, comment on posts
- **Profile** — Edit name, bio, avatar colour; change password; view stats

## Project structure

```
coachapp/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express app entry point
│   │   ├── db.js             # SQLite schema + connection
│   │   ├── auth.js           # JWT middleware
│   │   └── routes/
│   │       ├── auth.js       # POST /api/auth/register|login, GET /me
│   │       ├── todos.js      # CRUD /api/todos
│   │       ├── feed.js       # Posts, likes, comments /api/feed
│   │       └── profile.js    # GET/PUT /api/profile, PUT /password
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── context/AuthContext.js
    │   ├── hooks/useForm.js       # Generic form validation hook
    │   ├── components/
    │   │   ├── UI.js              # Button, Input, Textarea, Alert, Avatar, Spinner
    │   │   └── Navbar.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Todos.js
    │   │   ├── Feed.js
    │   │   └── Profile.js
    │   ├── utils/api.js           # Fetch wrapper with auth headers
    │   └── index.css              # Full design system + animations
    └── package.json
```
