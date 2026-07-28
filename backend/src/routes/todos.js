const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

router.use(authMiddleware);

// Get all todos for user
router.get('/', (req, res) => {
  const todos = db
    .prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  res.json({ todos });
});

// Create todo
router.post(
  '/',
  [body('title').trim().notEmpty().withMessage('Title is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title } = req.body;
    const result = db
      .prepare('INSERT INTO todos (user_id, title) VALUES (?, ?)')
      .run(req.user.id, title);
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ todo });
  }
);

// Toggle complete
router.patch('/:id/toggle', (req, res) => {
  const todo = db
    .prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  db.prepare('UPDATE todos SET completed = ? WHERE id = ?').run(
    todo.completed ? 0 : 1,
    todo.id
  );
  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(todo.id);
  res.json({ todo: updated });
});

// Delete todo
router.delete('/:id', (req, res) => {
  const todo = db
    .prepare('SELECT id FROM todos WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  db.prepare('DELETE FROM todos WHERE id = ?').run(todo.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
