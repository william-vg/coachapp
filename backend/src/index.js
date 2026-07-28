const express = require('express');
const cors = require('cors');
const { authLimiter, apiLimiter } = require('./rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/todos', apiLimiter, require('./routes/todos'));
app.use('/api/feed', apiLimiter, require('./routes/feed'));
app.use('/api/profile', apiLimiter, require('./routes/profile'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
