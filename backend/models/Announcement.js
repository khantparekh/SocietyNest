const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  text:  { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { _id: true });

const announcementSchema = new mongoose.Schema({
  societyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  wingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Wing', default: null }, // null = all wings
  postedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:       { type: String, enum: ['announcement', 'poll', 'event'], default: 'announcement' },
  title:      { type: String, required: true },
  content:    { type: String, default: '' },
  // Announcement/Event fields
  eventDate:  { type: Date },
  venue:      { type: String },
  category:   { type: String, enum: ['general', 'maintenance', 'celebration', 'alert', 'meeting', 'other'], default: 'general' },
  // Poll fields
  poll: {
    question:    { type: String },
    options:     [pollOptionSchema],
    endDate:     { type: Date },
    isAnonymous: { type: Boolean, default: false },
    isClosed:    { type: Boolean, default: false },
  },
  isPinned:   { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('Announcement', announcementSchema);
