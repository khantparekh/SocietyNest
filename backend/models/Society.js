const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
  accountHolderName: { type: String, required: true },
  accountNumber:     { type: String, required: true },
  ifscCode:          { type: String, required: true },
  bankName:          { type: String, required: true },
  branchName:        { type: String, default: '' },
  accountType:       { type: String, enum: ['savings', 'current'], default: 'current' },
  upiId:             { type: String, default: '' },
}, { _id: false });

const societySchema = new mongoose.Schema({
  name:               { type: String, required: true, trim: true },
  societyCode:        { type: String, required: true, unique: true, uppercase: true },
  address:            { type: String, required: true },
  city:               { type: String, required: true },
  state:              { type: String, required: true },
  pincode:            { type: String, required: true },
  totalFlats:         { type: Number, required: true },
  superAdmin:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wings:              [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wing' }],
  bankDetails:        { type: bankDetailsSchema, default: null },
  description:        { type: String, default: '' },
  registrationNumber: { type: String, default: '' },
  establishedYear:    { type: Number },
  amenities:          [{ type: String }],
  logo:               { type: String, default: null },
  isActive:           { type: Boolean, default: true },
  createdAt:          { type: Date, default: Date.now },
});

module.exports = mongoose.model('Society', societySchema);
