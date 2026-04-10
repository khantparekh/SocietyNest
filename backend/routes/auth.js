const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Society = require('../models/Society');
const Wing = require('../models/Wing');
const { generateToken, protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);
    res.status(201).json({ success: true, message: 'Account created successfully', token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = generateToken(user._id);
    res.json({ success: true, token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user: sanitize(user) });
});

// PUT /api/auth/switch-society
router.put('/switch-society', protect, async (req, res) => {
  try {
    const { societyId } = req.body;
    const membership = req.user.getMembership(societyId);
    if (!membership)
      return res.status(404).json({ success: false, message: 'Not a member of this society' });
    if (!membership.isApproved)
      return res.status(403).json({ success: false, message: 'Not approved in this society yet' });
    await User.findByIdAndUpdate(req.user._id, { activeSocietyId: societyId });
    res.json({ success: true, message: 'Society switched' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/approve/:userId
// Uses $set with positional $ operator — ONLY updates isApproved (and optionally role/wing).
// flatNumber, wingId, wingName stored at join time are PRESERVED untouched.
router.put('/approve/:userId', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role))
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const { role: overrideRole, wingId: overrideWingId } = req.body;

    // Fetch target user to read existing membership data
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser)
      return res.status(404).json({ success: false, message: 'User not found' });

    const membership = targetUser.getMembership(req.societyId);
    if (!membership)
      return res.status(404).json({ success: false, message: 'Membership not found' });

    // Build $set — start with just flipping isApproved
    const setFields = { 'societies.$.isApproved': true };

    // Override role only if admin explicitly provides one
    if (overrideRole) {
      setFields['societies.$.role'] = overrideRole;
    }

    // Override wing only if admin explicitly provides one
    if (overrideWingId) {
      const wing = await Wing.findById(overrideWingId);
      if (!wing)
        return res.status(404).json({ success: false, message: 'Wing not found' });

      // Check wing admin cap
      const finalRole = overrideRole || membership.role;
      if (finalRole === 'wing_admin') {
        if (wing.admins.length >= 3)
          return res.status(400).json({ success: false, message: 'Wing already has 3 admins (maximum)' });
        await Wing.findByIdAndUpdate(overrideWingId, { $addToSet: { admins: targetUser._id } });
      }

      setFields['societies.$.wingId']   = wing._id;
      setFields['societies.$.wingName'] = wing.name;
    } else {
      // No override — if role is wing_admin (set during join or by overrideRole),
      // add to the wing that was requested at join time
      const finalRole = overrideRole || membership.role;
      if (finalRole === 'wing_admin' && membership.wingId) {
        const wing = await Wing.findById(membership.wingId);
        if (wing) {
          if (wing.admins.length >= 3)
            return res.status(400).json({ success: false, message: 'Wing already has 3 admins (maximum)' });
          await Wing.findByIdAndUpdate(membership.wingId, { $addToSet: { admins: targetUser._id } });
        }
      }
    }

    // Use positional $ operator — ONLY the matched array element is updated,
    // all other fields (flatNumber, wingId, wingName, role) remain exactly as stored
    await User.updateOne(
      { _id: req.params.userId, 'societies.societyId': req.societyId },
      { $set: setFields }
    );

    // Set activeSocietyId if user doesn't have one yet
    if (!targetUser.activeSocietyId) {
      await User.findByIdAndUpdate(req.params.userId, { activeSocietyId: req.societyId });
    }

    res.json({ success: true, message: 'Member approved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/reject/:userId
router.put('/reject/:userId', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role))
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await User.updateOne(
      { _id: req.params.userId },
      { $pull: { societies: { societyId: req.societyId } } }
    );
    res.json({ success: true, message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/auth/transfer-admin
router.put('/transfer-admin', protect, async (req, res) => {
  try {
    if (req.role !== 'superadmin')
      return res.status(403).json({ success: false, message: 'Only superadmin can transfer' });

    const { newAdminId } = req.body;
    const newAdmin = await User.findById(newAdminId);
    if (!newAdmin) return res.status(404).json({ success: false, message: 'User not found' });

    const newMembership = newAdmin.getMembership(req.societyId);
    if (!newMembership) return res.status(400).json({ success: false, message: 'User not in society' });

    await User.updateOne(
      { _id: req.user._id, 'societies.societyId': req.societyId },
      { $set: { 'societies.$.role': 'resident' } }
    );
    await User.updateOne(
      { _id: newAdminId, 'societies.societyId': req.societyId },
      { $set: { 'societies.$.role': 'superadmin' } }
    );
    await Society.findByIdAndUpdate(req.societyId, { superAdmin: newAdminId });

    res.json({ success: true, message: 'Super admin transferred' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const sanitize = (u) => ({
  _id: u._id, name: u.name, email: u.email, phone: u.phone,
  profileImage: u.profileImage, societies: u.societies, activeSocietyId: u.activeSocietyId,
});


// PUT /api/auth/profile — update name and phone
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), phone: phone?.trim() || req.user.phone },
      { new: true }
    ).select('-password');
    res.json({ success: true, user: sanitize(user) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/auth/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both fields required' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const user = await User.findById(req.user._id);
    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;