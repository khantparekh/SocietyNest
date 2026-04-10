import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { ScopeBar } from '../../../components/ScopeBar';
import { Plus, DollarSign, Trash2, X } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const CATS = ['maintenance','utilities','security','cleaning','repair','salaries','other'];
const CAT_COLORS = {
  maintenance: '#1d4ed8',
  utilities:   '#0891b2',
  security:    '#7c3aed',
  cleaning:    '#059669',
  repair:      '#d97706',
  salaries:    '#dc2626',
  other:       '#64748b',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '6px', padding: '9px 12px', boxShadow: 'var(--shadow)',
      fontSize: '12px',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>
        {label || payload[0]?.name}
      </div>
      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
        ₹{Number(payload[0]?.value).toLocaleString('en-IN')}
      </div>
    </div>
  );
};

export default function ExpenseManagement({ society }) {
  const { role, activeMembership } = useAuth();
  const isAdmin    = ['superadmin', 'wing_admin'].includes(role);
  const isResident = role === 'resident';

  // scope: 'wing' = show only wing's expenses, 'society' = show all
  const [scope,      setScope]      = useState('wing');
  const [expenses,   setExpenses]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [wings,      setWings]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', amount: '', category: 'maintenance',
    date: new Date().toISOString().split('T')[0], wingId: '',
  });

  // Fetch wings list for the form (admins only)
  useEffect(() => {
    if (isAdmin) {
      API.get('/wings').then(({ data }) => setWings(data.wings)).catch(() => {});
    }
  }, [isAdmin]);

  // Fetch expenses whenever scope changes
  useEffect(() => { fetchData(); }, [scope]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Send scope as query param so backend can filter correctly
      const { data } = await API.get('/expenses', {
        params: isResident ? { scope } : {},
      });
      setExpenses(data.expenses);
      setTotal(data.total);
    } catch { toast.error('Failed to load expenses'); }
    finally { setLoading(false); }
  };

  const handleAdd = async e => {
    e.preventDefault();
    try {
      await API.post('/expenses', {
        title:       form.title,
        description: form.description,
        amount:      Number(form.amount),
        category:    form.category,
        date:        form.date,
        wingId:      form.wingId || undefined, // superadmin picks wing; wing_admin ignored server-side
      });
      toast.success('Expense added successfully');
      setShowModal(false);
      setForm({ title: '', description: '', amount: '', category: 'maintenance', date: new Date().toISOString().split('T')[0], wingId: '' });
      fetchData();
    } catch { toast.error('Failed to add expense'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this expense?')) return;
    try { await API.delete(`/expenses/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  // --- Chart data ---
  const catTotals = CATS
    .map(c => ({ name: c, value: expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0) }))
    .filter(c => c.value > 0);

  const monthlyData = (() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString('en-IN', { month: 'short' });
      const value = expenses
        .filter(e => {
          const ed = new Date(e.date);
          return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
        })
        .reduce((s, e) => s + e.amount, 0);
      return { name: label, value };
    });
  })();

  return (
    <div>
      {/* Header */}
      <div className="page-hd">
        <div>
          <h2>Expense Management</h2>
          <p>Track and manage society expenses by category</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={13}/> Add Expense
          </button>
        )}
      </div>

      {/* Wing / Society scope bar — only for residents with a wing */}
      {isResident && activeMembership?.wingName && (
        <ScopeBar
          scope={scope}
          setScope={setScope}
          wingName={activeMembership.wingName}
          label="Viewing expenses for"
        />
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-bg)' }}>
            <DollarSign size={18} color="var(--primary)"/>
          </div>
          <div className="stat-info">
            <h3>₹{total.toLocaleString('en-IN')}</h3>
            <p>Total Expenses</p>
          </div>
        </div>
        {catTotals.slice(0, 3).map(c => (
          <div key={c.name} className="stat-card">
            <div className="stat-icon" style={{ background: `${CAT_COLORS[c.name]}14` }}>
              <DollarSign size={18} color={CAT_COLORS[c.name]}/>
            </div>
            <div className="stat-info">
              <h3>₹{c.value.toLocaleString('en-IN')}</h3>
              <p style={{ textTransform: 'capitalize' }}>{c.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts — only show when there's data */}
      {!loading && expenses.length > 0 && (
        <div className="grid-2" style={{ marginBottom: '16px' }}>
          {/* Bar chart */}
          <div className="card">
            <h3 style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-3)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Monthly Expenses (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={monthlyData} barSize={26} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="value" fill="var(--primary)" radius={[3, 3, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart */}
          <div className="card">
            <h3 style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-3)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Category Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={catTotals} cx="50%" cy="45%" innerRadius={50} outerRadius={75}
                  paddingAngle={2} dataKey="value" nameKey="name">
                  {catTotals.map((entry, i) => (
                    <Cell key={i} fill={CAT_COLORS[entry.name] || '#94a3b8'}/>
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend
                  iconType="circle" iconSize={7}
                  formatter={v => (
                    <span style={{ fontSize: '11px', color: 'var(--text-2)', textTransform: 'capitalize' }}>{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Expenses table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Wing</th>
                <th>Date</th>
                <th>Added By</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}/>
                </td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty">
                    <DollarSign size={36}/>
                    <h3>No expenses yet</h3>
                    <p>{isResident && scope === 'wing' ? 'No expenses recorded for your wing' : 'No expenses recorded'}</p>
                  </div>
                </td></tr>
              ) : expenses.map(e => (
                <tr key={e._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{e.title}</div>
                    {e.description && <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '1px' }}>{e.description}</div>}
                  </td>
                  <td>
                    <span className="badge" style={{
                      background: `${CAT_COLORS[e.category] || '#64748b'}12`,
                      color: CAT_COLORS[e.category] || '#64748b',
                      borderColor: `${CAT_COLORS[e.category] || '#64748b'}30`,
                      textTransform: 'capitalize',
                    }}>
                      {e.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{e.amount.toLocaleString('en-IN')}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                    {e.wingId ? `Wing ${e.wingId?.name || '—'}` : <span style={{ color: 'var(--text-3)' }}>Society</span>}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                    {new Date(e.date).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-3)' }}>
                    {e.addedBy?.name || 'Admin'}
                  </td>
                  {isAdmin && (
                    <td>
                      <button onClick={() => handleDelete(e._id)} className="btn btn-ghost btn-icon btn-sm">
                        <Trash2 size={12} color="var(--danger)"/>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3>Add Expense</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-icon btn-ghost btn-sm">
                <X size={15}/>
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" required className="form-control" placeholder="e.g. Elevator maintenance"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} className="form-control" placeholder="Optional details..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input type="number" required min={1} className="form-control" placeholder="5000"
                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATS.map(c => (
                      <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="form-control"
                    value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}/>
                </div>
                {/* Wing selector — superadmin picks wing; wing_admin auto-assigned server side */}
                {role === 'superadmin' && wings.length > 0 && (
                  <div className="form-group">
                    <label>Wing (optional)</label>
                    <select className="form-control" value={form.wingId}
                      onChange={e => setForm({ ...form, wingId: e.target.value })}>
                      <option value="">Society-wide (no wing)</option>
                      {wings.map(w => (
                        <option key={w._id} value={w._id}>Wing {w.name}</option>
                      ))}
                    </select>
                    <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>
                      Leave blank to post as a society-wide expense visible to all residents.
                    </p>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
