const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const societyMembershipSchema = new mongoose.Schema({
  societyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  role:        { type: String, enum: ['superadmin', 'wing_admin', 'resident', 'guard'], default: 'resident' },
  wingId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Wing', default: null },
  wingName:    { type: String, default: null },
  flatNumber:  { type: String, default: null },
  isApproved:  { type: Boolean, default: false },
  joinedAt:    { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true },
  password:         { type: String, required: true, minlength: 6 },
  phone:            { type: String, required: true },
  profileImage:     { type: String, default: null },
  societies:        [societyMembershipSchema],
  activeSocietyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Society', default: null },
  createdAt:        { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (pwd) {
  return await bcrypt.compare(pwd, this.password);
};

userSchema.methods.getMembership = function (societyId) {
  return this.societies.find(s => s.societyId.toString() === societyId.toString());
};

module.exports = mongoose.model('User', userSchema);
