const express = require('express');
const router = express.Router();
const Society = require('../models/Society');
const Wing = require('../models/Wing');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const genCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  do {
    code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (await Society.findOne({ societyCode: code }));
  return code;
};

// POST /api/society/create
router.post('/create', protect, async (req, res) => {
  try {
    const { name, address, city, state, pincode, totalFlats, wings: wingNames,
            description, registrationNumber, establishedYear, bankDetails } = req.body;

    const societyCode = await genCode();
    const society = await Society.create({
      name, address, city, state, pincode, totalFlats,
      societyCode, superAdmin: req.user._id,
      description, registrationNumber, establishedYear,
      bankDetails: bankDetails || null,
    });

    const wingDocs = [];
    if (Array.isArray(wingNames) && wingNames.length > 0) {
      for (const wName of wingNames) {
        const w = await Wing.create({ societyId: society._id, name: wName, admins: [] });
        wingDocs.push(w._id);
      }
      await Society.findByIdAndUpdate(society._id, { wings: wingDocs });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: { societies: { societyId: society._id, role: 'superadmin', isApproved: true } },
      $set:  { activeSocietyId: society._id },
    });

    const populated = await Society.findById(society._id).populate('wings').populate('superAdmin', 'name email');
    res.status(201).json({ success: true, society: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/society/by-code/:code  — fetch society info (wings) before joining
router.get('/by-code/:code', protect, async (req, res) => {
  try {
    const society = await Society.findOne({ societyCode: req.params.code.toUpperCase() })
      .populate('wings', 'name totalFlats')
      .select('name city state societyCode wings totalFlats');
    if (!society) return res.status(404).json({ success: false, message: 'Invalid society code' });
    res.json({ success: true, society });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/society/join  — resident provides flat + wing at join time
router.post('/join', protect, async (req, res) => {
  try {
    const { societyCode, requestedRole, flatNumber, wingId, wingName } = req.body;

    const society = await Society.findOne({ societyCode: societyCode.toUpperCase() }).populate('wings', 'name');
    if (!society) return res.status(404).json({ success: false, message: 'Invalid society code' });

    const existing = req.user.getMembership(society._id);
    if (existing) return res.status(400).json({ success: false, message: 'Already a member of this society' });

    // Store flat + wing + requestedRole in the pending membership
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        societies: {
          societyId:  society._id,
          role:       requestedRole === 'guard' ? 'guard' : 'resident', // store requested role
          isApproved: false,
          flatNumber: requestedRole === 'guard' ? null : (flatNumber || null),
          wingId:     wingId   || null,   // guards also belong to a wing
          wingName:   wingName || null,
        }
      },
    });

    if (!req.user.activeSocietyId) {
      await User.findByIdAndUpdate(req.user._id, { activeSocietyId: society._id });
    }

    res.json({
      success: true,
      message: 'Join request sent. Awaiting admin approval.',
      society: { _id: society._id, name: society.name },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/society/my
router.get('/my', protect, async (req, res) => {
  try {
    if (!req.societyId) return res.status(404).json({ success: false, message: 'No active society' });
    const society = await Society.findById(req.societyId).populate('wings').populate('superAdmin', 'name email');
    res.json({ success: true, society, membership: req.membership });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/society/list
router.get('/list', protect, async (req, res) => {
  try {
    const ids = req.user.societies.map(s => s.societyId);
    const societies = await Society.find({ _id: { $in: ids } }).select('name city state societyCode wings');
    const result = societies.map(s => ({
      ...s.toObject(),
      membership: req.user.getMembership(s._id),
    }));
    res.json({ success: true, societies: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/society/members
router.get('/members', protect, async (req, res) => {
  try {
    const members = await User.find({ 'societies.societyId': req.societyId }).select('-password');
    const result = members.map(u => ({ ...u.toObject(), membership: u.getMembership(req.societyId) }));
    res.json({ success: true, members: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/society/pending-members
router.get('/pending-members', protect, async (req, res) => {
  try {
    const all = await User.find({ 'societies.societyId': req.societyId }).select('-password');
    const pending = all
      .filter(u => { const m = u.getMembership(req.societyId); return m && !m.isApproved; })
      .map(u => ({ ...u.toObject(), membership: u.getMembership(req.societyId) }));
    res.json({ success: true, members: pending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/society/bank-details
router.put('/bank-details', protect, async (req, res) => {
  try {
    if (req.role !== 'superadmin') return res.status(403).json({ success: false, message: 'Not authorized' });
    const society = await Society.findByIdAndUpdate(req.societyId, { bankDetails: req.body }, { new: true });
    res.json({ success: true, society });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/society/update
router.put('/update', protect, async (req, res) => {
  try {
    if (req.role !== 'superadmin') return res.status(403).json({ success: false, message: 'Not authorized' });
    const society = await Society.findByIdAndUpdate(req.societyId, req.body, { new: true }).populate('wings');
    res.json({ success: true, society });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;