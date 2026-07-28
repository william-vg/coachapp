const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5000;
const JWT_SECRET = 'your-secret-key-change-me';

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./app.db');

// Create tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      email TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);
});

// Helpers
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const userId = uuidv4();

  db.run(
    'INSERT INTO users (id, email, passwordHash) VALUES (?, ?, ?)',
    [userId, email, passwordHash],
    (err) => {
      if (err) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.json({ userId, email });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token, userId: user.id, email: user.email });
  });
});

// Middleware to check JWT
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Dashboard Route
app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({
    greeting: 'Welcome back!',
    stats: { todos: 0, posts: 0, consistency: 0 },
  });
});

// Todo Routes
app.get('/api/todos', authMiddleware, (req, res) => {
  db.all('SELECT * FROM todos WHERE userId = ? ORDER BY createdAt DESC', [req.userId], (err, todos) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(todos);
  });
});

app.post('/api/todos', authMiddleware, (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }
  if (title.trim().length > 200) {
    return res.status(400).json({ error: 'Task title must be 200 characters or less' });
  }

  const todoId = uuidv4();

  db.run(
    'INSERT INTO todos (id, userId, title) VALUES (?, ?, ?)',
    [todoId, req.userId, title],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: todoId, userId: req.userId, title, completed: 0 });
    }
  );
});

app.patch('/api/todos/:id', authMiddleware, (req, res) => {
  const { completed } = req.body;

  db.run(
    'UPDATE todos SET completed = ? WHERE id = ? AND userId = ?',
    [completed ? 1 : 0, req.params.id, req.userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Social Feed Routes
app.get('/api/feed', authMiddleware, (req, res) => {
  db.all('SELECT id, email, content, createdAt FROM posts ORDER BY createdAt DESC LIMIT 20', (err, posts) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(posts);
  });
});

app.post('/api/feed', authMiddleware, (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Post content is required' });
  }
  if (content.trim().length > 500) {
    return res.status(400).json({ error: 'Post must be 500 characters or less' });
  }

  db.get('SELECT email FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) return res.status(500).json({ error: 'User not found' });

    const postId = uuidv4();
    db.run(
      'INSERT INTO posts (id, userId, email, content) VALUES (?, ?, ?, ?)',
      [postId, req.userId, user.email, content],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: postId, userId: req.userId, email: user.email, content, createdAt: new Date() });
      }
    );
  });
});

app.listen(port, () => {
  console.log(`✅ Backend running at http://localhost:${port}`);
});
