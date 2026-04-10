import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { ScopeBar } from '../../../components/ScopeBar';
import { Plus, Bell, X } from 'lucide-react';

const priColor = { low:'var(--success)', medium:'var(--warning)', high:'var(--danger)' };
const priBg    = { low:'var(--success-bg)', medium:'var(--warning-bg)', high:'var(--danger-bg)' };

export default function NoticeManagement({ society, scope: parentScope }) {
  const { role, activeMembership } = useAuth();
  const [scope, setScope] = useState(parentScope || 'wing');
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', content:'', type:'general', priority:'medium', targetAudience:'all', expiryDate:'' });

  useEffect(() => { fetchData(); }, [scope]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = role === 'resident' && scope === 'society' ? { params:{ scope:'society' } } : {};
      const { data } = await API.get('/notices', params);
      setNotices(data.notices);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const handleAdd = async e => {
    e.preventDefault();
    try { await API.post('/notices', form); toast.success('Notice issued'); setShowModal(false); fetchData(); setForm({ title:'', content:'', type:'general', priority:'medium', targetAudience:'all', expiryDate:'' }); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async id => {
    try { await API.delete(`/notices/${id}`); fetchData(); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const isAdmin = ['superadmin','wing_admin'].includes(role);

  return (
    <div>
      <div className="page-hd">
        <div><h2>Notice Board</h2><p>Society and wing-level notices</p></div>
        {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={13}/>Issue Notice</button>}
      </div>

      <ScopeBar scope={scope} setScope={setScope} wingName={activeMembership?.wingName} label="Notices for"/>

      {loading ? <div style={{ textAlign:'center', padding:'48px' }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
       : notices.length === 0 ? <div className="empty card"><Bell size={40}/><h3>No notices</h3><p>No notices have been issued yet</p></div>
       : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {notices.map(n => (
            <div key={n._id} className="card" style={{ display:'flex', gap:'13px', alignItems:'flex-start', padding:'14px 16px', borderLeft:`3px solid ${priColor[n.priority]}` }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'8px', flexShrink:0, background:priBg[n.priority], display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Bell size={16} color={priColor[n.priority]}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px', marginBottom:'6px' }}>
                  <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', alignItems:'center' }}>
                    <h4 style={{ fontSize:'13.5px', fontWeight:600 }}>{n.title}</h4>
                    <span className="badge badge-gray">{n.type}</span>
                    <span className={`badge ${n.priority==='high'?'badge-danger':n.priority==='medium'?'badge-warning':'badge-success'}`}>{n.priority}</span>
                    <span className="badge badge-gray">{n.targetAudience}</span>
                  </div>
                  {isAdmin && <button onClick={() => handleDelete(n._id)} className="btn btn-ghost btn-icon btn-sm"><X size={12} color="var(--danger)"/></button>}
                </div>
                <p style={{ fontSize:'13px', color:'var(--text-2)', lineHeight:1.6 }}>{n.content}</p>
                <div style={{ fontSize:'11px', color:'var(--text-3)', marginTop:'7px', display:'flex', gap:'10px' }}>
                  <span>By: {n.issuedBy?.name || 'Admin'}</span>
                  <span>{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                  {n.expiryDate && <span>Expires: {new Date(n.expiryDate).toLocaleDateString('en-IN')}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-hd"><h3>Issue Notice</h3><button onClick={() => setShowModal(false)} className="btn btn-icon btn-ghost btn-sm"><X size={15}/></button></div>
            <form onSubmit={handleAdd}>
              <div className="form-group"><label>Title *</label><input type="text" required className="form-control" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
              <div className="form-group"><label>Content *</label><textarea required rows={4} className="form-control" value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/></div>
              <div className="grid-3">
                {[{label:'Type',key:'type',opts:['general','maintenance','event','emergency','guard']},
                  {label:'Priority',key:'priority',opts:['low','medium','high']},
                  {label:'Audience',key:'targetAudience',opts:['all','residents','guards']}
                ].map(({ label, key, opts }) => (
                  <div className="form-group" key={key}><label>{label}</label>
                    <select className="form-control" value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}>
                      {opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="form-group"><label>Expiry Date</label><input type="date" className="form-control" value={form.expiryDate} onChange={e=>setForm({...form,expiryDate:e.target.value})}/></div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Issue Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}