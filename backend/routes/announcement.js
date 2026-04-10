const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');

// GET /api/announcements
router.get('/', protect, async (req, res) => {
  try {
    const filter = { societyId: req.societyId, isActive: true };
    const { wingId } = req.query;
    if (wingId) filter.$or = [{ wingId }, { wingId: null }];
    const items = await Announcement.find(filter)
      .populate('postedBy', 'name')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, announcements: items });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/announcements
router.post('/', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role))
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const item = await Announcement.create({ ...req.body, societyId: req.societyId, postedBy: req.user._id });
    const populated = await item.populate('postedBy', 'name');
    res.status(201).json({ success: true, announcement: populated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/announcements/:id/vote  — vote on poll option
router.post('/:id/vote', protect, async (req, res) => {
  try {
    const { optionId } = req.body;
    const ann = await Announcement.findById(req.params.id);
    if (!ann || ann.type !== 'poll') return res.status(404).json({ success: false, message: 'Poll not found' });
    if (ann.poll.isClosed) return res.status(400).json({ success: false, message: 'Poll is closed' });
    if (ann.poll.endDate && new Date() > ann.poll.endDate) return res.status(400).json({ success: false, message: 'Poll has ended' });

    const userId = req.user._id;
    // Remove existing vote
    ann.poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== userId.toString());
    });
    // Add new vote
    const option = ann.poll.options.id(optionId);
    if (!option) return res.status(404).json({ success: false, message: 'Option not found' });
    option.votes.push(userId);
    await ann.save();
    res.json({ success: true, announcement: ann });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/announcements/:id/close-poll
router.put('/:id/close-poll', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    await Announcement.findByIdAndUpdate(req.params.id, { 'poll.isClosed': true });
    res.json({ success: true, message: 'Poll closed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/announcements/:id/pin
router.put('/:id/pin', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    const ann = await Announcement.findByIdAndUpdate(req.params.id, { isPinned: req.body.isPinned }, { new: true });
    res.json({ success: true, announcement: ann });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/announcements/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role)) return res.status(403).json({ success: false, message: 'Not authorized' });
    await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Removed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
