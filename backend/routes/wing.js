const express = require('express');
const router = express.Router();
const Wing = require('../models/Wing');
const User = require('../models/User');
const Society = require('../models/Society');
const { protect } = require('../middleware/auth');

// GET /api/wings
router.get('/', protect, async (req, res) => {
  try {
    const wings = await Wing.find({ societyId: req.societyId }).populate('admins', 'name email');
    res.json({ success: true, wings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/wings  — superadmin creates wing
router.post('/', protect, async (req, res) => {
  try {
    if (req.role !== 'superadmin') return res.status(403).json({ success: false, message: 'Not authorized' });
    const { name, totalFlats, floors, description } = req.body;
    const wing = await Wing.create({ societyId: req.societyId, name, totalFlats, floors, description });
    await Society.findByIdAndUpdate(req.societyId, { $push: { wings: wing._id } });
    res.status(201).json({ success: true, wing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/wings/:id/add-admin  — add admin to wing (max 3)
router.put('/:id/add-admin', protect, async (req, res) => {
  try {
    if (req.role !== 'superadmin') return res.status(403).json({ success: false, message: 'Not authorized' });
    const wing = await Wing.findById(req.params.id);
    if (!wing) return res.status(404).json({ success: false, message: 'Wing not found' });
    if (wing.admins.length >= 3) return res.status(400).json({ success: false, message: 'Wing already has 3 admins (maximum)' });

    const { userId } = req.body;
    if (wing.admins.map(a => a.toString()).includes(userId))
      return res.status(400).json({ success: false, message: 'Already an admin of this wing' });

    wing.admins.push(userId);
    await wing.save();

    // Update user's membership role
    await User.updateOne(
      { _id: userId, 'societies.societyId': req.societyId },
      { $set: { 'societies.$.role': 'wing_admin', 'societies.$.wingId': wing._id, 'societies.$.wingName': wing.name } }
    );

    res.json({ success: true, wing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/wings/:id/remove-admin
router.put('/:id/remove-admin', protect, async (req, res) => {
  try {
    if (req.role !== 'superadmin') return res.status(403).json({ success: false, message: 'Not authorized' });
    const { userId } = req.body;
    await Wing.findByIdAndUpdate(req.params.id, { $pull: { admins: userId } });
    await User.updateOne(
      { _id: userId, 'societies.societyId': req.societyId },
      { $set: { 'societies.$.role': 'resident' } }
    );
    res.json({ success: true, message: 'Admin removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/wings/:id/members
router.get('/:id/members', protect, async (req, res) => {
  try {
    const members = await User.find({
      'societies': { $elemMatch: { societyId: req.societyId, wingId: req.params.id, isApproved: true } }
    }).select('-password');
    res.json({ success: true, members: members.map(u => ({ ...u.toObject(), membership: u.getMembership(req.societyId) })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
