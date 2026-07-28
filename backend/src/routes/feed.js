const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

router.use(authMiddleware);

function enrichPost(post, userId) {
  const likeCount = db
    .prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?')
    .get(post.id).count;
  const liked = !!db
    .prepare('SELECT id FROM likes WHERE user_id = ? AND post_id = ?')
    .get(userId, post.id);
  const comments = db
    .prepare(
      `SELECT c.*, u.name as author_name, u.avatar_color
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ? ORDER BY c.created_at ASC`
    )
    .all(post.id);
  return { ...post, like_count: likeCount, liked, comments };
}

// Get feed
router.get('/', (req, res) => {
  const posts = db
    .prepare(
      `SELECT p.*, u.name as author_name, u.avatar_color
       FROM posts p JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC LIMIT 50`
    )
    .all();
  const enriched = posts.map((p) => enrichPost(p, req.user.id));
  res.json({ posts: enriched });
});

// Create post
router.post(
  '/',
  [body('content').trim().notEmpty().withMessage('Post content is required')
    .isLength({ max: 500 }).withMessage('Post must be 500 characters or less')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { content } = req.body;
    const result = db
      .prepare('INSERT INTO posts (user_id, content) VALUES (?, ?)')
      .run(req.user.id, content);
    const post = db
      .prepare(
        `SELECT p.*, u.name as author_name, u.avatar_color
         FROM posts p JOIN users u ON p.user_id = u.id
         WHERE p.id = ?`
      )
      .get(result.lastInsertRowid);
    res.status(201).json({ post: enrichPost(post, req.user.id) });
  }
);

// Delete post
router.delete('/:id', (req, res) => {
  const post = db
    .prepare('SELECT id FROM posts WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  db.prepare('DELETE FROM posts WHERE id = ?').run(post.id);
  res.json({ message: 'Deleted' });
});

// Toggle like
router.post('/:id/like', (req, res) => {
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const existing = db
    .prepare('SELECT id FROM likes WHERE user_id = ? AND post_id = ?')
    .get(req.user.id, post.id);

  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO likes (user_id, post_id) VALUES (?, ?)').run(req.user.id, post.id);
  }

  const likeCount = db
    .prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?')
    .get(post.id).count;
  res.json({ liked: !existing, like_count: likeCount });
});

// Add comment
router.post(
  '/:id/comments',
  [body('content').trim().notEmpty().withMessage('Comment cannot be empty')
    .isLength({ max: 300 }).withMessage('Comment must be 300 characters or less')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const result = db
      .prepare('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)')
      .run(req.user.id, post.id, req.body.content);

    const comment = db
      .prepare(
        `SELECT c.*, u.name as author_name, u.avatar_color
         FROM comments c JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`
      )
      .get(result.lastInsertRowid);

    res.status(201).json({ comment });
  }
);

module.exports = router;
