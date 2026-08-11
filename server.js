require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const reservationRoutes = require('./routes/reservations');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const setupRoutes = require('./routes/setup');

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET. Copy .env.example to .env and set a value before starting the server.');
  process.exit(1);
}

const app = express();

app.use(cors()); // dev-friendly: allows the frontend (opened via Live Server / file server) to call this API
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/setup', setupRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Basic error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Caleb Royal Cafe API running on http://localhost:${PORT}`));
