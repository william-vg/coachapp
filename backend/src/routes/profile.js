const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

router.use(authMiddleware);

// Get profile
router.get('/', (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, bio, avatar_color, created_at FROM users WHERE id = ?')
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const todoCount = db
    .prepare('SELECT COUNT(*) as count FROM todos WHERE user_id = ?')
    .get(req.user.id).count;
  const postCount = db
    .prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?')
    .get(req.user.id).count;

  res.json({ user, stats: { todos: todoCount, posts: postCount } });
});

// Update profile
router.put(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('bio').optional().isLength({ max: 200 }).withMessage('Bio must be 200 characters or less'),
    body('avatar_color')
      .optional()
      .matches(/^#[0-9a-fA-F]{6}$/)
      .withMessage('Invalid color format'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, bio, avatar_color } = req.body;

    db.prepare(
      'UPDATE users SET name = ?, bio = ?, avatar_color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(name, bio || '', avatar_color || '#6366f1', req.user.id);

    const updated = db
      .prepare('SELECT id, name, email, bio, avatar_color, created_at FROM users WHERE id = ?')
      .get(req.user.id);
    res.json({ user: updated });
  }
);

// Change password
router.put(
  '/password',
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { current_password, new_password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (!bcrypt.compareSync(current_password, user.password)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      hash,
      req.user.id
    );

    res.json({ message: 'Password updated successfully' });
  }
);

module.exports = router;
