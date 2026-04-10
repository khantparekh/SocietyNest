require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

// ── CORS ────────────────────────────────────────────────────
// PayU callbacks come from PayU servers (no origin) or browser redirect.
// We must allow all origins for the payment callback routes.
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (server-to-server, curl, PayU POST callbacks)
    if (!origin) return cb(null, true);
    // Allow configured CLIENT_URL
    const allowed = [process.env.CLIENT_URL || 'http://localhost:3000'];
    if (allowed.includes(origin)) return cb(null, true);
    // Allow PayU domains
    if (origin.includes('test.payu.in') || origin.includes('payumoney.com')) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
// app.use(cors());

// ── Body parsers ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true })); // Required for PayU form POST callbacks

// ── Test endpoint — verify localtunnel/ngrok is reachable ───
// Hit GET /api/ping from browser to confirm tunnel works
// PayU must be able to reach this URL before payments will work
app.get('/api/ping', (req, res) => {
  res.json({
    status:    'ok',
    message:   'Server reachable ✅',
    timestamp: new Date().toISOString(),
    serverUrl: process.env.SERVER_URL,
    clientUrl: process.env.CLIENT_URL,
  });
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/society',       require('./routes/society'));
app.use('/api/wings',         require('./routes/wing'));
app.use('/api/bills',         require('./routes/bill'));
app.use('/api/announcements', require('./routes/announcement'));

const { expenseRouter, noticeRouter, complaintRouter, visitorRouter, rentalRouter } = require('./routes/others');
app.use('/api/expenses',   expenseRouter);
app.use('/api/notices',    noticeRouter);
app.use('/api/complaints', complaintRouter);
app.use('/api/visitors',   visitorRouter);
app.use('/api/rentals',    rentalRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok', message: '🏢 SocietyNest API running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));