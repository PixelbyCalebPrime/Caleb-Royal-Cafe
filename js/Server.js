// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 4000;

// In-memory stores (replace with DB in production)
const reservations = [];
const orders = [];

app.use(helmet());
app.use(cors({ origin: true })); // allow all origins for dev. Replace with specific origin in prod.
app.use(express.json());

// Optional: simple menu endpoint
app.get('/api/menu', (req, res) => {
  // you could also import menu from a JSON file
  res.json({ success: true });
});

/**
 * POST /api/reservations
 * Accepts reservation form data:
 * { name, phone, email?, date, time, guests }
 */
app.post('/api/reservations', [
  body('name').isLength({ min: 2 }).trim(),
  body('phone').matches(/^\d{7,15}$/),
  body('email').optional({ checkFalsy: true }).isEmail(),
  body('date').isISO8601().toDate(),
  body('time').matches(/^\d{2}:\d{2}$/),
  body('guests').isInt({ min: 1, max: 100 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, phone, email, date, time, guests } = req.body;
  const id = reservations.length + 1;
  const created = { id, name, phone, email, date, time, guests, createdAt: new Date() };

  reservations.push(created);

  // TODO: send confirmation email using nodemailer (see notes)
  return res.json({ success: true, message: 'Reservation saved', reservation: created });
});

/**
 * POST /api/checkout
 * Accepts cart info and customer details:
 * { customer: { name, phone, email }, items: [{id, title, price, qty}], total }
 */
app.post('/api/checkout', [
  body('customer.name').isLength({ min: 2 }),
  body('customer.phone').matches(/^\d{7,15}$/),
  body('items').isArray({ min: 1 }),
  body('total').isNumeric()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { customer, items, total } = req.body;
  const id = orders.length + 1;
  const order = { id, customer, items, total, status: 'paid_simulated', createdAt: new Date() };
  orders.push(order);

  // In real implementation: create payment session (Stripe/Paystack) and confirm payment
  // Then persist order to DB and send confirmation email

  return res.json({ success: true, message: 'Order received (simulated)', order });
});

// Health
app.get('/api/health', (req, res) => res.json({ success: true, uptime: process.uptime() }));

app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
