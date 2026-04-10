const mongoose = require('mongoose');

// ─── EXPENSE ────────────────────────────────────────────────
const expenseSchema = new mongoose.Schema({
  societyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  wingId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Wing', default: null },
  title:       { type: String, required: true },
  description: { type: String },
  amount:      { type: Number, required: true },
  category:    { type: String, enum: ['maintenance', 'utilities', 'security', 'cleaning', 'repair', 'salaries', 'other'], default: 'other' },
  date:        { type: Date, default: Date.now },
  addedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receipt:     { type: String },
  createdAt:   { type: Date, default: Date.now },
});

// ─── NOTICE ─────────────────────────────────────────────────
const noticeSchema = new mongoose.Schema({
  societyId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  wingId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Wing', default: null },
  title:          { type: String, required: true },
  content:        { type: String, required: true },
  type:           { type: String, enum: ['general', 'maintenance', 'event', 'emergency', 'guard'], default: 'general' },
  priority:       { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  targetAudience: { type: String, enum: ['all', 'residents', 'guards'], default: 'all' },
  issuedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiryDate:     { type: Date },
  createdAt:      { type: Date, default: Date.now },
});

// ─── COMPLAINT ──────────────────────────────────────────────
const complaintSchema = new mongoose.Schema({
  societyId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  wingId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Wing', default: null },
  raisedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:         { type: String, required: true },
  description:   { type: String, required: true },
  category:      { type: String, enum: ['plumbing', 'electrical', 'cleaning', 'security', 'noise', 'parking', 'lift', 'other'], default: 'other' },
  status:        { type: String, enum: ['pending', 'in-progress', 'resolved', 'rejected'], default: 'pending' },
  priority:      { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  adminResponse: { type: String, default: '' },
  resolvedAt:    { type: Date },
  createdAt:     { type: Date, default: Date.now },
});

// ─── VISITOR ────────────────────────────────────────────────
const visitorSchema = new mongoose.Schema({
  societyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  wingId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Wing', default: null },
  name:         { type: String, required: true },
  phone:        { type: String, required: true },
  purpose:      { type: String, required: true },
  visitingFlat: { type: String, required: true },
  visitingWing: { type: String },
  vehicleNumber:{ type: String },
  idProofType:  { type: String, enum: ['aadhar', 'pan', 'driving_license', 'passport', 'other'] },
  idProofNumber:{ type: String },
  entryTime:    { type: Date, default: Date.now },
  exitTime:     { type: Date },
  status:       { type: String, enum: ['inside', 'exited'], default: 'inside' },
  addedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:    { type: Date, default: Date.now },
});

// ─── RENTAL FLAT ─────────────────────────────────────────────
const rentalFlatSchema = new mongoose.Schema({
  societyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  wingId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Wing', default: null },
  ownerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flatNumber:   { type: String, required: true },
  wing:         { type: String },
  floor:        { type: Number },
  bhkType:      { type: String, enum: ['1BHK', '2BHK', '3BHK', '4BHK', 'Studio'], required: true },
  rent:         { type: Number, required: true },
  deposit:      { type: Number, default: 0 },
  description:  { type: String },
  furnished:    { type: String, enum: ['unfurnished', 'semi-furnished', 'fully-furnished'], default: 'unfurnished' },
  availableFrom:{ type: Date },
  status:       { type: String, enum: ['available', 'rented', 'under_review'], default: 'available' },
  contactPhone: { type: String },
  requests: [{
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName:    { type: String },
    message:     { type: String },
    status:      { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  Expense:    mongoose.model('Expense', expenseSchema),
  Notice:     mongoose.model('Notice', noticeSchema),
  Complaint:  mongoose.model('Complaint', complaintSchema),
  Visitor:    mongoose.model('Visitor', visitorSchema),
  RentalFlat: mongoose.model('RentalFlat', rentalFlatSchema),
};
