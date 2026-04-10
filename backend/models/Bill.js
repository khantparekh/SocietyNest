const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  societyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  wingId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Wing', default: null },
  wingName:     { type: String, default: null },
  residentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  residentName: { type: String },
  flatNumber:   { type: String },
  wing:         { type: String },
  title:        { type: String, required: true },
  billMonth:    { type: String, required: true },
  billYear:     { type: Number, required: true },
  totalAmount:  { type: Number, required: true },
  dueDate:      { type: Date, required: true },
  status:       { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  paidAt:       { type: Date },
  // Cashfree
  cashfreeOrderId:   { type: String },  // CF order_id
  cashfreePaymentId: { type: String },  // cf_payment_id
  paymentMode:       { type: String },  // UPI / CARD / NB etc
  // Generic
  transactionId:     { type: String },  // stores payment ID from whichever gateway
  issuedBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bulkGroupId:       { type: String },
  createdAt:         { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bill', billSchema);