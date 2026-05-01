import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import Receipt from '../../../components/Receipt';
import { Plus, CreditCard, X, CheckCircle, Users, Trash2 } from 'lucide-react';

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function BillManagement({ society }) {
  const { user, role } = useAuth();

  const [bills,      setBills]      = useState([]);
  const [members,    setMembers]    = useState([]);
  const [wings,      setWings]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [receipt,    setReceipt]    = useState(null);
  const [bulkMode,   setBulkMode]   = useState(true);
  const [submitting,   setSubmitting]   = useState(false);

  const [form, setForm] = useState({
    title:       'Monthly Maintenance',
    billMonth:   months[new Date().getMonth()],
    billYear:    new Date().getFullYear(),
    totalAmount: '',
    dueDate:     '',
    wingId:      '',         // for bulk — filter by wing (optional)
    residentId:  '',         // for single
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [b, m, w] = await Promise.all([
        API.get('/bills'),
        API.get('/society/members'),
        API.get('/wings'),
      ]);
      setBills(b.data.bills);
      setMembers(
        m.data.members.filter(
          mm => mm.membership?.isApproved && mm.membership?.role === 'resident'
        )
      );
      setWings(w.data.wings);
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  // ── Issue bill (bulk or single) ──────────────────────────
  const handleIssueBill = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (bulkMode) {
        // Bulk — send wingId if selected, backend handles fetching all residents
        await API.post('/bills/bulk', {
          title:       form.title,
          billMonth:   form.billMonth,
          billYear:    form.billYear,
          totalAmount: Number(form.totalAmount),
          dueDate:     form.dueDate,
          wingId:      form.wingId || undefined,  // undefined = all wings
        });
        toast.success('Bills issued to all residents!');
      } else {
        // Single resident
        if (!form.residentId) return toast.error('Please select a resident');
        await API.post('/bills', {
          title:       form.title,
          billMonth:   form.billMonth,
          billYear:    form.billYear,
          totalAmount: Number(form.totalAmount),
          dueDate:     form.dueDate,
          residentId:  form.residentId,
        });
        toast.success('Bill issued!');
      }

      setShowModal(false);
      setForm({
        title: 'Monthly Maintenance', billMonth: months[new Date().getMonth()],
        billYear: new Date().getFullYear(), totalAmount: '', dueDate: '',
        wingId: '', residentId: '',
      });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue bill');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cashfree payment — opens SDK popup ───────────────────
  const handlePay = async (bill) => {
    try {
      // Step 1 — create order on backend
      const { data } = await API.post(`/bills/${bill._id}/create-order`);
      if (!data.success) return toast.error('Failed to initiate payment');

      const { paymentSessionId, orderId } = data;

      // Step 2 — load Cashfree SDK and open checkout popup
      const cashfreeEnv = import.meta.env.VITE_CASHFREE_ENV === 'production'
        ? 'production' : 'sandbox';

      const cashfree = await window.Cashfree({ mode: cashfreeEnv });

      const checkoutOptions = {
        paymentSessionId,
        redirectTarget: '_modal', // opens as popup, not redirect
      };

      // Step 3 — open popup
      const result = await cashfree.checkout(checkoutOptions);
      console.log('Cashfree result:', result);

      if (result.error) {
        // User closed popup or payment failed
        console.log('Cashfree error:', result.error);
        toast.error(result.error.message || 'Payment failed or cancelled');
        return;
      }

      if (result.paymentDetails || result.redirect) {
        // Payment completed — verify on backend
        try {
          const v = await API.post(`/bills/${bill._id}/verify-payment`, {
            cashfreeOrderId: orderId,
          });
          if (v.data.success) {
            toast.success('Payment successful! 🎉');
            fetchAll();
            setReceipt({ bill: v.data.bill, paymentId: v.data.bill.cashfreePaymentId || orderId });
          } else {
            toast.error('Payment verification failed. Contact support.');
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Verification failed');
        }
      }

    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  // ── Stats ────────────────────────────────────────────────
  const totalPaid    = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.totalAmount, 0);
  const totalPending = bills.filter(b => b.status === 'pending').reduce((s, b) => s + b.totalAmount, 0);
  const isAdmin      = ['superadmin', 'wing_admin'].includes(role);

  return (
    <div>
      {/* Header */}
      <div className="page-hd">
        <div>
          <h2>Bills & Payments</h2>
          <p>Issue maintenance bills and track payments</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={13}/> Issue Bill
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid-3" style={{ marginBottom: '16px' }}>
        {[
          { label: 'Pending',     val: `₹${totalPending.toLocaleString('en-IN')}`, color: 'var(--warning)', icon: CreditCard },
          { label: 'Collected',   val: `₹${totalPaid.toLocaleString('en-IN')}`,    color: 'var(--success)', icon: CheckCircle },
          { label: 'Total Bills', val: bills.length,                                color: 'var(--primary)', icon: CreditCard },
        ].map(({ label, val, color, icon: Icon }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}14` }}>
              <Icon size={18} color={color}/>
            </div>
            <div className="stat-info"><h3>{val}</h3><p>{label}</p></div>
          </div>
        ))}
      </div>

      {/* Bills table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bill</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Due Date</th>
                {isAdmin && <th>Resident</th>}
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}/>
                </td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty">
                    <CreditCard size={36}/>
                    <h3>No bills yet</h3>
                    <p>{isAdmin ? 'Issue a bill to get started' : 'No bills have been issued yet'}</p>
                  </div>
                </td></tr>
              ) : bills.map(b => {
                const isOverdue = new Date(b.dueDate) < new Date() && b.status === 'pending';
                return (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 500 }}>{b.title}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-3)' }}>{b.billMonth} {b.billYear}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text)' }}>₹{b.totalAmount.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '12px', color: isOverdue ? 'var(--danger)' : 'var(--text-3)', fontWeight: isOverdue ? 600 : 400 }}>
                      {new Date(b.dueDate).toLocaleDateString('en-IN')}
                      {isOverdue && <span style={{ marginLeft: '5px', fontSize: '10px' }}>OVERDUE</span>}
                    </td>
                    {isAdmin && (
                      <td style={{ fontSize: '12.5px' }}>
                        <div style={{ fontWeight: 500 }}>{b.residentId?.name || b.residentName || '—'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' }}>
                          {b.flatNumber ? `Flat ${b.flatNumber}` : ''}
                          {b.wing ? ` · Wing ${b.wing}` : ''}
                        </div>
                      </td>
                    )}
                    <td>
                      <span className={`badge ${
                        b.status === 'paid'    ? 'badge-success' :
                        b.status === 'overdue' ? 'badge-danger'  : 'badge-warning'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'pending' && role === 'resident' ? (
                        <button
                          onClick={() => handlePay(b)}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '5px' }}
                        >
                          <CreditCard size={12}/> Pay ₹{b.totalAmount.toLocaleString('en-IN')}
                        </button>
                      ) : b.status === 'paid' ? (
                        <button
                          onClick={() => setReceipt({
                            bill: b,
                            paymentId: b.payuPaymentId || b.razorpayPaymentId || b.transactionId || '—',
                          })}
                          className="btn btn-ghost btn-sm"
                        >
                          Receipt
                        </button>
                      ) : (
                        isAdmin && (
                          <button onClick={() => {
                            if (window.confirm('Delete this bill?'))
                              API.delete(`/bills/${b._id}`).then(fetchAll).catch(() => toast.error('Failed'));
                          }} className="btn btn-ghost btn-icon btn-sm">
                            <Trash2 size={12} color="var(--danger)"/>
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Issue Bill Modal ── */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Issue Bill</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-icon btn-ghost btn-sm">
                <X size={15}/>
              </button>
            </div>

            {/* Bulk / Single toggle */}
            <div style={{ display: 'flex', gap: '7px', marginBottom: '16px' }}>
              {[
                { v: true,  l: 'Bulk (All / Wing)' },
                { v: false, l: 'Individual Resident' },
              ].map(({ v, l }) => (
                <button
                  key={l}
                  onClick={() => setBulkMode(v)}
                  className={`btn btn-sm ${bulkMode === v ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {l}
                </button>
              ))}
            </div>

            <form onSubmit={handleIssueBill}>
              {/* Title + Amount */}
              <div className="grid-2">
                <div className="form-group">
                  <label>Bill Title *</label>
                  <input type="text" required className="form-control"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label>Total Amount (₹) *</label>
                  <input type="number" required min={1} className="form-control"
                    placeholder="e.g. 2500"
                    value={form.totalAmount}
                    onChange={e => setForm({ ...form, totalAmount: e.target.value })}/>
                </div>
              </div>

              {/* Month + Year + Due Date */}
              <div className="grid-3">
                <div className="form-group">
                  <label>Month</label>
                  <select className="form-control" value={form.billMonth}
                    onChange={e => setForm({ ...form, billMonth: e.target.value })}>
                    {months.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input type="number" className="form-control"
                    value={form.billYear}
                    onChange={e => setForm({ ...form, billYear: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label>Due Date *</label>
                  <input type="date" required className="form-control"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}/>
                </div>
              </div>

              {/* Bulk: wing filter  |  Single: resident picker */}
              {bulkMode ? (
                <div className="form-group">
                  <label>Filter by Wing <span style={{ color: 'var(--text-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(leave empty to bill all wings)</span></label>
                  <select className="form-control" value={form.wingId}
                    onChange={e => setForm({ ...form, wingId: e.target.value })}>
                    <option value="">All Wings — issue to every resident</option>
                    {wings.map(w => (
                      <option key={w._id} value={w._id}>Wing {w.name} only</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '5px' }}>
                    One bill will be created for each approved resident matching the selection.
                  </p>
                </div>
              ) : (
                <div className="form-group">
                  <label>Select Resident *</label>
                  <select required className="form-control" value={form.residentId}
                    onChange={e => setForm({ ...form, residentId: e.target.value })}>
                    <option value="">Choose a resident...</option>
                    {members.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                        {m.membership?.flatNumber ? ` — Flat ${m.membership.flatNumber}` : ''}
                        {m.membership?.wingName   ? ` (Wing ${m.membership.wingName})`   : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
                  {submitting ? 'Issuing...' : bulkMode
                    ? <><Users size={13}/> Issue to All</>
                    : 'Issue Bill'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt modal */}
      {receipt && (
        <Receipt
          bill={receipt.bill}
          paymentId={receipt.paymentId}
          societyName={society?.name}
          onClose={() => setReceipt(null)}
        />
      )}

    </div>
  );
}