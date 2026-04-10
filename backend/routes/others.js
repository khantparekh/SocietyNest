const express = require('express');
const { Expense, Notice, Complaint, Visitor, RentalFlat } = require('../models/others');
const { protect } = require('../middleware/auth');

// ═══════════════════════════════════
// EXPENSE ROUTER
// ═══════════════════════════════════
const expenseRouter = express.Router();

expenseRouter.get('/', protect, async (req, res) => {
  try {
    const filter = { societyId: req.societyId };
    const { scope } = req.query; // 'wing' | 'society'

    if (req.role === 'wing_admin') {
      // Wing admin always sees only their wing
      if (req.membership?.wingId) filter.wingId = req.membership.wingId;
    } else if (req.role === 'resident') {
      // Resident: 'wing' = filter by their wing, 'society' = see all
      if (scope !== 'society' && req.membership?.wingId) {
        filter.wingId = req.membership.wingId;
      }
      // scope === 'society': no wingId filter — see all society expenses
    } else if (req.role === 'guard') {
      if (req.membership?.wingId) filter.wingId = req.membership.wingId;
    }
    // superadmin: no filter — sees everything

    const expenses = await Expense.find(filter).populate('addedBy', 'name').populate('wingId', 'name').sort({ date: -1 });
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    res.json({ success: true, expenses, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

expenseRouter.post('/', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    // Superadmin can specify any wingId from the form; wing_admin is locked to their own wing
    const wingId = req.role === 'superadmin'
      ? (req.body.wingId || null)           // superadmin picks wing in form (or leaves blank = society-wide)
      : (req.membership?.wingId || null);   // wing_admin always uses their own wing
    const expense = await Expense.create({ ...req.body, societyId: req.societyId, wingId, addedBy: req.user._id });
    res.status(201).json({ success: true, expense });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

expenseRouter.delete('/:id', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ═══════════════════════════════════
// NOTICE ROUTER
// ═══════════════════════════════════
const noticeRouter = express.Router();

noticeRouter.get('/', protect, async (req, res) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.role === 'guard') filter.targetAudience = { $in: ['all', 'guards'] };
    else if (req.role === 'resident') filter.targetAudience = { $in: ['all', 'residents'] };
    const notices = await Notice.find(filter).populate('issuedBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

noticeRouter.post('/', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    const notice = await Notice.create({ ...req.body, societyId: req.societyId, wingId: req.membership?.wingId || null, issuedBy: req.user._id });
    res.status(201).json({ success: true, notice });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

noticeRouter.delete('/:id', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ═══════════════════════════════════
// COMPLAINT ROUTER
// ═══════════════════════════════════
const complaintRouter = express.Router();

complaintRouter.get('/', protect, async (req, res) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.role === 'resident') filter.raisedBy = req.user._id;
    if (req.role === 'wing_admin') filter.wingId = req.membership.wingId;
    const complaints = await Complaint.find(filter).populate('raisedBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

complaintRouter.post('/', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin', 'resident'].includes(req.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    const complaint = await Complaint.create({ ...req.body, societyId: req.societyId, wingId: req.membership?.wingId || null, raisedBy: req.user._id });
    res.status(201).json({ success: true, complaint });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

complaintRouter.put('/:id', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    const data = { ...req.body };
    if (req.body.status === 'resolved') data.resolvedAt = new Date();
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, data, { new: true }).populate('raisedBy', 'name');
    res.json({ success: true, complaint });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ═══════════════════════════════════
// VISITOR ROUTER
// ═══════════════════════════════════
const visitorRouter = express.Router();

visitorRouter.get('/', protect, async (req, res) => {
  try {
    // console.log(req);
    const filter = { societyId: req.societyId };
    console.log(filter)
    if(req.role === 'resident') filter.visitingFlat = req.membership.flatNumber;
    if (req.membership?.wingId && req.role === 'guard') filter.wingId = req.membership.wingId;
    if(req.role === 'superadmin') filter.societyId = req.societyId;
    console.log(filter)
    const visitors = await Visitor.find(filter).populate('addedBy', 'name').sort({ entryTime: -1 }).limit(100);
    console.log(visitors);
    res.json({ success: true, visitors });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

visitorRouter.post('/', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin', 'guard'].includes(req.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    const visitor = await Visitor.create({ ...req.body, societyId: req.societyId, wingId: req.membership?.wingId || null, addedBy: req.user._id });
    res.status(201).json({ success: true, visitor });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

visitorRouter.put('/:id/exit', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { exitTime: new Date(), status: 'exited' }, { new: true });
    res.json({ success: true, visitor });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ═══════════════════════════════════
// RENTAL ROUTER
// ═══════════════════════════════════
const rentalRouter = express.Router();

rentalRouter.get('/', protect, async (req, res) => {
  try {
    const rentals = await RentalFlat.find({ societyId: req.societyId }).populate('ownerId', 'name phone').sort({ createdAt: -1 });
    res.json({ success: true, rentals });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

rentalRouter.post('/', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin', 'resident'].includes(req.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    const rental = await RentalFlat.create({ ...req.body, societyId: req.societyId, ownerId: req.user._id });
    res.status(201).json({ success: true, rental });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

rentalRouter.post('/:id/request', protect, async (req, res) => {
  try {
    const rental = await RentalFlat.findById(req.params.id);
    if (!rental) return res.status(404).json({ success: false, message: 'Not found' });
    rental.requests.push({ userId: req.user._id, userName: req.user.name, message: req.body.message });
    await rental.save();
    res.json({ success: true, message: 'Request sent' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

rentalRouter.put('/:id', protect, async (req, res) => {
  try {
    const rental = await RentalFlat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, rental });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

rentalRouter.delete('/:id', protect, async (req, res) => {
  try {
    await RentalFlat.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = { expenseRouter, noticeRouter, complaintRouter, visitorRouter, rentalRouter };
