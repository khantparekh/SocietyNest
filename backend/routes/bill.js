const express = require('express');
const router  = express.Router();
const Bill    = require('../models/Bill');
const User    = require('../models/User');
const { protect }          = require('../middleware/auth');
const { sendReceiptEmail } = require('../utils/sendEmail');
const cashfree = require('../config/cashfree');


//  GET /api/bills
router.get('/', protect, async (req, res) => {
  try {
    const filter = { societyId: req.societyId };
    if (req.role === 'wing_admin') filter.wingId     = req.membership.wingId;
    if (req.role === 'resident')   filter.residentId = req.user._id;
    const bills = await Bill.find(filter)
      .populate('residentId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, bills });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


//  POST /api/bills/bulk 
router.post('/bulk', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role))
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const { residentIds, wingId, title, billMonth, billYear, totalAmount, dueDate } = req.body;
    const bulkGroupId = `BULK_${Date.now()}`;
    let targetUsers;

    if (residentIds && residentIds.length > 0) {
      targetUsers = await User.find({ _id: { $in: residentIds } }).select('name societies');
    } else {
      const matchStage = {
        societyId: req.societyId, role: 'resident', isApproved: true,
        ...(wingId ? { wingId } : {}),
      };
      targetUsers = await User.find({ societies: { $elemMatch: matchStage } }).select('name societies');
    }

    if (!targetUsers || targetUsers.length === 0)
      return res.status(400).json({ success: false, message: 'No approved residents found' });

    const billData = targetUsers.map(u => {
      const m = u.societies.find(s => s.societyId.toString() === req.societyId.toString());
      return {
        societyId: req.societyId, wingId: m?.wingId || wingId || null,
        wingName: m?.wingName || null, wing: m?.wingName || null,
        residentId: u._id, residentName: u.name, flatNumber: m?.flatNumber || null,
        title, billMonth, billYear: Number(billYear),
        totalAmount: Number(totalAmount), dueDate,
        issuedBy: req.user._id, bulkGroupId,
      };
    });

    const bills = await Bill.insertMany(billData);
    res.status(201).json({ success: true, count: bills.length, bulkGroupId });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


//  POST /api/bills (single)
router.post('/', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role))
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const { residentId, title, billMonth, billYear, totalAmount, dueDate } = req.body;
    if (!residentId)
      return res.status(400).json({ success: false, message: 'residentId is required' });

    const resident = await User.findById(residentId).select('name societies');
    if (!resident)
      return res.status(404).json({ success: false, message: 'Resident not found' });

    const m = resident.societies.find(s => s.societyId.toString() === req.societyId.toString());
    const bill = await Bill.create({
      societyId: req.societyId, wingId: m?.wingId || null,
      wingName: m?.wingName || null, wing: m?.wingName || null,
      residentId: resident._id, residentName: resident.name,
      flatNumber: m?.flatNumber || null,
      title, billMonth, billYear: Number(billYear),
      totalAmount: Number(totalAmount), dueDate, issuedBy: req.user._id,
    });
    res.status(201).json({ success: true, bill });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


//  POST /api/bills/:id/create-order 
// Step 1: Create Cashfree order → returns payment_session_id
// Frontend uses this to open the Cashfree popup (no redirect needed)
router.post('/:id/create-order', protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('residentId', 'name email phone');

    if (!bill)
      return res.status(404).json({ success: false, message: 'Bill not found' });
    if (bill.status === 'paid')
      return res.status(400).json({ success: false, message: 'Bill already paid' });

    // Cashfree order_id — must be unique, max 50 chars, alphanumeric + hyphen/underscore
    const cfOrderId = `SN-${bill._id.toString().slice(-12)}-${Date.now().toString().slice(-8)}`;

    const orderRequest = {
      order_id:       cfOrderId,
      order_amount:   Number(bill.totalAmount),
      order_currency: 'INR',
      order_note:     bill.title,
      customer_details: {
        customer_id:    req.user._id.toString(),
        customer_name:  bill.residentId?.name  || req.user.name,
        customer_email: bill.residentId?.email || req.user.email,
        customer_phone: (bill.residentId?.phone || req.user.phone || '9999999999')
          .replace(/[^0-9]/g, '').substring(0, 10) || '9999999999',
      },
      order_meta: {
        // Cashfree redirects here after payment — {order_id} is auto-filled by Cashfree
        return_url: `${process.env.CLIENT_URL}/payment/complete?order_id={order_id}`,
        notify_url: `${process.env.SERVER_URL}/api/bills/webhook`, // optional webhook
      },
    };

    console.log('\n── Cashfree create-order ──');
    console.log(JSON.stringify(orderRequest, null, 2));

    // Create order via Cashfree SDK
    const response = await cashfree.PGCreateOrder(orderRequest);
    const cfOrder  = response.data;

    console.log('Cashfree order created:', cfOrder.order_id, '| session:', cfOrder.payment_session_id);

    // Save Cashfree order ID on bill
    await Bill.findByIdAndUpdate(bill._id, {
      cashfreeOrderId: cfOrder.order_id,
      transactionId:   cfOrder.order_id,
    });

    res.json({
      success:            true,
      orderId:            cfOrder.order_id,
      paymentSessionId:   cfOrder.payment_session_id,  // used by frontend SDK
      orderAmount:        bill.totalAmount,
      orderCurrency:      'INR',
    });
  } catch (err) {
    console.error('Cashfree create-order error:', err?.response?.data || err.message);
    res.status(500).json({ success: false, message: err?.response?.data?.message || err.message });
  }
});


//  POST /api/bills/:id/verify-payment
// Step 2: After Cashfree popup closes successfully,
// frontend calls this to verify and mark bill as paid
router.post('/:id/verify-payment', protect, async (req, res) => {
  try {
    const { cashfreeOrderId } = req.body;

    if (!cashfreeOrderId)
      return res.status(400).json({ success: false, message: 'cashfreeOrderId is required' });

    // Fetch payment status from Cashfree API
    const response = await cashfree.PGOrderFetchPayments(cashfreeOrderId);
    const payments = response.data;

    console.log('\n── Verify payment ──');
    console.log('cashfreeOrderId:', cashfreeOrderId);
    console.log('payments:', JSON.stringify(payments, null, 2));

    // Check if any payment has SUCCESS status
    const successPayment = payments.find(p => p.payment_status === 'SUCCESS');

    if (!successPayment)
      return res.status(400).json({ success: false, message: 'Payment not successful', payments });

    // Mark bill as paid
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      {
        status:            'paid',
        paidAt:            new Date(),
        cashfreePaymentId: successPayment.cf_payment_id?.toString(),
        transactionId:     successPayment.cf_payment_id?.toString(),
        paymentMode:       successPayment.payment_group,
      },
      { new: true }
    ).populate('residentId', 'name email');

    if (!bill)
      return res.status(404).json({ success: false, message: 'Bill not found' });

    // Send receipt email
    if (bill.residentId?.email) {
      sendReceiptEmail({
        to:          bill.residentId.email,
        name:        bill.residentId.name,
        bill,
        paymentId:   successPayment.cf_payment_id?.toString(),
        societyName: 'SocietyNest',
      }).catch(e => console.error('Email failed:', e.message));
    }

    res.json({ success: true, message: 'Payment verified!', bill });
  } catch (err) {
    console.error('Verify error:', err?.response?.data || err.message);
    res.status(500).json({ success: false, message: err?.response?.data?.message || err.message });
  }
});


//  POST /api/bills/webhook
// Optional: Cashfree calls this on payment events (no auth needed)
router.post('/webhook', async (req, res) => {
  try {
    console.log('\n── Cashfree Webhook ──');
    console.log(JSON.stringify(req.body, null, 2));

    const { data, type } = req.body;
    if (type === 'PAYMENT_SUCCESS_WEBHOOK' && data?.order?.order_id) {
      const cfOrderId = data.order.order_id;
      await Bill.findOneAndUpdate(
        { cashfreeOrderId: cfOrderId },
        { status:'paid', paidAt:new Date(),
          cashfreePaymentId: data.payment?.cf_payment_id?.toString(),
          transactionId: data.payment?.cf_payment_id?.toString() }
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ success: false });
  }
});


//  DELETE /api/bills/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!['superadmin', 'wing_admin'].includes(req.role))
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Bill deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;