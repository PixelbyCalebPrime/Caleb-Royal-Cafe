const express = require('express');
const db = require('../db');

const router = express.Router();

// One-time setup route for hosts (like Render's free tier) that don't offer
// shell access to run make-admin.js directly. Protected by a secret key set
// as the SETUP_SECRET environment variable — remove this file and its route
// registration in server.js once you've made your admin account.
router.post('/make-admin', (req, res) => {
  const { email, key } = req.body || {};

  if (!process.env.SETUP_SECRET) {
    return res.status(503).json({ error: 'Setup route is disabled (no SETUP_SECRET configured).' });
  }
  if (!key || key !== process.env.SETUP_SECRET) {
    return res.status(403).json({ error: 'Invalid setup key.' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ error: `No account found for ${email}. Sign up with this email first.` });
  }

  db.prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(user.id);

  res.json({ message: `${user.name} <${user.email}> is now an admin.` });
});

module.exports = router;
