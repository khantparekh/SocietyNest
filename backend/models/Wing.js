const mongoose = require('mongoose');

const wingSchema = new mongoose.Schema({
  societyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  name:        { type: String, required: true, trim: true }, // e.g., "A", "B", "Block 1"
  admins:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // max 3
  totalFlats:  { type: Number, default: 0 },
  floors:      { type: Number, default: 1 },
  description: { type: String, default: '' },
  createdAt:   { type: Date, default: Date.now },
});

wingSchema.virtual('adminCount').get(function () { return this.admins.length; });

module.exports = mongoose.model('Wing', wingSchema);
