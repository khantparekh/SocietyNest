import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { Users, CheckCircle, XCircle, Home, MapPin, Phone, Mail, Shield, User, Crown, ArrowRightLeft, X, UserPlus } from 'lucide-react';

const roleColor = { superadmin:'var(--primary)', wing_admin:'#7c3aed', resident:'var(--success)', guard:'var(--warning)' };

export default function MemberManagement({ society }) {
  const { user, role } = useAuth();
  const [members,  setMembers]  = useState([]);
  const [pending,  setPending]  = useState([]);
  const [wings,    setWings]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [override, setOverride] = useState({});
  const [transferModal, setTransferModal] = useState(false);
  const [transferTo, setTransferTo]       = useState('');
  const [wingAdminModal, setWingAdminModal] = useState(null); // member to make wing admin
  const [selectedWing, setSelectedWing]     = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [m, p, w] = await Promise.all([API.get('/society/members'), API.get('/society/pending-members'), API.get('/wings')]);
      setMembers(m.data.members.filter(x => x.membership?.isApproved));
      setPending(p.data.members);
      setWings(w.data.wings);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleApprove = async userId => {
    const ov = override[userId] || {};
    try {
      const body = {};
      if (ov.role)   body.role   = ov.role;
      if (ov.wingId) body.wingId = ov.wingId;
      await API.put(`/auth/approve/${userId}`, body);
      toast.success('Member approved!');
      setOverride(prev => { const n = {...prev}; delete n[userId]; return n; });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async userId => {
    if (!window.confirm('Reject this request?')) return;
    try { await API.put(`/auth/reject/${userId}`); toast.success('Rejected'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const handleTransfer = async () => {
    if (!transferTo) return toast.error('Select a member');
    try {
      await API.put('/auth/transfer-admin', { newAdminId: transferTo });
      toast.success('Super admin transferred!');
      setTransferModal(false); setTransferTo(''); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // Make an approved member a wing admin
  const handleMakeWingAdmin = async () => {
    if (!selectedWing) return toast.error('Select a wing');
    try {
      await API.put(`/wings/${selectedWing}/add-admin`, { userId: wingAdminModal._id });
      // Also update their role in membership
      await API.put(`/auth/approve/${wingAdminModal._id}`, { role:'wing_admin', wingId: selectedWing });
      toast.success(`${wingAdminModal.name} is now a Wing Admin`);
      setWingAdminModal(null); setSelectedWing(''); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const setOv = (userId, key, val) =>
    setOverride(prev => ({ ...prev, [userId]: { ...(prev[userId] || {}), [key]: val } }));

  const transferEligible = members.filter(m => m.membership?.role !== 'superadmin' && m.membership?.role !== 'guard' && m._id !== user?._id);

  return (
    <div>
      <div className="page-hd">
        <div><h2>Member Management</h2><p>Approvals, wing admin assignment, and member roles</p></div>
        {role === 'superadmin' && (
          <button onClick={() => setTransferModal(true)} className="btn btn-ghost btn-sm" style={{ borderColor:'var(--warning-border)', color:'var(--warning)' }}>
            <ArrowRightLeft size={13}/> Transfer Super Admin
          </button>
        )}
      </div>

      {/* Pending approvals */}
      {loading ? <div style={{ textAlign:'center', padding:'40px' }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
       : pending.length > 0 ? (
        <div style={{ marginBottom:'22px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'var(--warning)' }}/>
            <h3 style={{ fontSize:'11.5px', color:'var(--warning)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>
              Pending Approvals ({pending.length})
            </h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
            {pending.map(m => {
              const ms = m.membership; const ov = override[m._id] || {}; const isGuard = ms?.role === 'guard';
              return (
                <div key={m._id} className="card" style={{ padding:'14px 16px', borderLeft:`3px solid ${isGuard?'var(--warning)':'var(--success)'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px', marginBottom:'12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'38px', height:'38px', borderRadius:'50%', flexShrink:0, background:isGuard?'var(--warning-bg)':'var(--success-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:isGuard?'var(--warning)':'var(--success)' }}>
                        {m.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'3px' }}>
                          <span style={{ fontWeight:600, fontSize:'14px' }}>{m.name}</span>
                          <span className={`badge ${isGuard?'badge-warning':'badge-success'}`} style={{ display:'inline-flex', alignItems:'center', gap:'3px' }}>
                            {isGuard?<Shield size={9}/>:<User size={9}/>} {isGuard?'Guard':'Resident'}
                          </span>
                        </div>
                        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                          <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11.5px', color:'var(--text-3)' }}><Mail size={10}/>{m.email}</span>
                          <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11.5px', color:'var(--text-3)' }}><Phone size={10}/>{m.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => handleReject(m._id)} className="btn btn-danger btn-sm" style={{ gap:'4px' }}><XCircle size={12}/>Reject</button>
                      <button onClick={() => handleApprove(m._id)} className="btn btn-success btn-sm" style={{ gap:'4px' }}><CheckCircle size={12}/>Approve</button>
                    </div>
                  </div>
                  {/* Info tiles */}
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'10px' }}>
                    {!isGuard && (
                      <div style={{ padding:'8px 12px', background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'6px' }}>
                        <div style={{ fontSize:'10px', color:'var(--text-3)', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.4px', fontWeight:600 }}>Flat No.</div>
                        <div style={{ display:'flex', alignItems:'center', gap:'5px', fontWeight:700, fontSize:'14px', color:'var(--success)' }}>
                          <Home size={12} color="var(--success)"/>
                          {ms?.flatNumber || <span style={{ color:'var(--text-3)', fontWeight:400, fontSize:'12px' }}>Not specified</span>}
                        </div>
                      </div>
                    )}
                    <div style={{ padding:'8px 12px', background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'6px' }}>
                      <div style={{ fontSize:'10px', color:'var(--text-3)', marginBottom:'3px', textTransform:'uppercase', letterSpacing:'0.4px', fontWeight:600 }}>{isGuard?'Assigned Wing':'Wing'}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:'5px', fontWeight:700, fontSize:'14px', color:'var(--primary)' }}>
                        <MapPin size={12} color="var(--primary)"/>
                        {ms?.wingName ? `Wing ${ms.wingName}` : <span style={{ color:'var(--text-3)', fontWeight:400, fontSize:'12px' }}>Not specified</span>}
                      </div>
                    </div>
                  </div>
                  {/* Override — wing_admin option only for superadmin */}
                  <details>
                    <summary style={{ fontSize:'11px', color:'var(--text-3)', cursor:'pointer', userSelect:'none', listStyle:'none', display:'flex', alignItems:'center', gap:'5px' }}>
                      ⚙️ Override role / wing (optional)
                    </summary>
                    <div style={{ marginTop:'10px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                      <div className="form-group" style={{ marginBottom:0 }}>
                        <label>Override Role</label>
                        <select className="form-control" value={ov.role || ''} onChange={e => setOv(m._id, 'role', e.target.value)}>
                          <option value="">Keep as {ms?.role}</option>
                          <option value="resident">Resident</option>
                          <option value="guard">Guard</option>
                          {role === 'superadmin' && <option value="wing_admin">Wing Admin</option>}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom:0 }}>
                        <label>Override Wing</label>
                        <select className="form-control" value={ov.wingId || ''} onChange={e => setOv(m._id, 'wingId', e.target.value)}>
                          <option value="">Keep as requested</option>
                          {wings.map(w => <option key={w._id} value={w._id} disabled={(ov.role||ms?.role)==='wing_admin'&&w.admins?.length>=3}>Wing {w.name}{(ov.role||ms?.role)==='wing_admin'?` (${w.admins?.length||0}/3)`:''}</option>)}
                        </select>
                      </div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </div>
      ) : !loading && (
        <div style={{ background:'var(--success-bg)', border:'1px solid var(--success-border)', borderRadius:'7px', padding:'11px 14px', display:'flex', alignItems:'center', gap:'8px', marginBottom:'18px', fontSize:'12.5px', color:'var(--success)' }}>
          <CheckCircle size={14}/> No pending approvals — all caught up!
        </div>
      )}

      {/* Members table */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
          <h3 style={{ fontSize:'11.5px', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            Approved Members ({members.length})
          </h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Member</th><th>Role</th><th>Flat</th><th>Wing</th><th>Phone</th><th>Joined</th>
              {role === 'superadmin' && <th></th>}
            </tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} style={{ textAlign:'center', padding:'36px', color:'var(--text-3)' }}>Loading...</td></tr>
                : members.length === 0
                ? <tr><td colSpan={7}><div className="empty"><Users size={36}/><h3>No approved members yet</h3></div></td></tr>
                : members.map(m => {
                  const ms = m.membership;
                  const isGuard = ms?.role === 'guard';
                  const isSA    = ms?.role === 'superadmin';
                  const isWA    = ms?.role === 'wing_admin';
                  return (
                    <tr key={m._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <div style={{ width:'28px', height:'28px', borderRadius:'50%', flexShrink:0, background:`${roleColor[ms?.role]||'var(--primary)'}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:roleColor[ms?.role]||'var(--primary)' }}>
                            {m.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight:500, fontSize:'13px', display:'flex', alignItems:'center', gap:'5px' }}>
                              {m.name} {isSA && <Crown size={10} color="var(--warning)"/>}
                            </div>
                            <div style={{ fontSize:'11px', color:'var(--text-3)' }}>{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'2px 7px', borderRadius:'4px', fontSize:'11px', fontWeight:600, background:`${roleColor[ms?.role]||'var(--primary)'}14`, color:roleColor[ms?.role]||'var(--primary)' }}>
                          {isGuard?<Shield size={9}/>:isSA||isWA?<Crown size={9}/>:<User size={9}/>} {ms?.role}
                        </span>
                      </td>
                      <td style={{ fontSize:'12.5px', color:'var(--text-2)' }}>{isGuard?<span style={{ color:'var(--text-3)',fontSize:'11px' }}>Guard</span>:ms?.flatNumber||'—'}</td>
                      <td style={{ fontSize:'12.5px', color:'var(--text-2)' }}>{ms?.wingName?`Wing ${ms.wingName}`:'—'}</td>
                      <td style={{ fontSize:'12.5px', color:'var(--text-2)' }}>{m.phone}</td>
                      <td style={{ fontSize:'11.5px', color:'var(--text-3)' }}>{new Date(ms?.joinedAt||m.createdAt).toLocaleDateString('en-IN')}</td>
                      {/* Make Wing Admin button — only superadmin, only for residents */}
                      {role === 'superadmin' && (
                        <td>
                          {ms?.role === 'resident' && (
                            <button onClick={() => { setWingAdminModal(m); setSelectedWing(''); }} className="btn btn-ghost btn-sm" style={{ fontSize:'11px', gap:'4px', whiteSpace:'nowrap' }}>
                              <UserPlus size={11}/> Wing Admin
                            </button>
                          )}
                          {isWA && <span style={{ fontSize:'11px', color:'var(--text-3)' }}>Wing Admin</span>}
                        </td>
                      )}
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer superadmin modal */}
      {transferModal && (
        <div className="overlay" onClick={() => setTransferModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3 style={{ display:'flex', alignItems:'center', gap:'7px' }}><Crown size={15} color="var(--warning)"/> Transfer Super Admin</h3>
              <button onClick={() => setTransferModal(false)} className="btn btn-icon btn-ghost btn-sm"><X size={14}/></button>
            </div>
            <div style={{ background:'var(--warning-bg)', border:'1px solid var(--warning-border)', borderRadius:'6px', padding:'10px 12px', marginBottom:'14px', fontSize:'12.5px', color:'var(--warning)', lineHeight:1.6 }}>
              ⚠️ This permanently transfers your Super Admin role. You will become a regular resident and cannot undo this action.
            </div>
            <div className="form-group">
              <label>Transfer to</label>
              <select className="form-control" value={transferTo} onChange={e => setTransferTo(e.target.value)}>
                <option value="">Select a member...</option>
                {transferEligible.map(m => (
                  <option key={m._id} value={m._id}>{m.name} — {m.membership?.role}{m.membership?.flatNumber?` (Flat ${m.membership.flatNumber})`:''}</option>
                ))}
              </select>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => setTransferModal(false)} className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center' }}>Cancel</button>
              <button onClick={handleTransfer} disabled={!transferTo} className="btn btn-warning btn-sm" style={{ flex:1, justifyContent:'center', gap:'6px' }}>
                <ArrowRightLeft size={12}/> Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Make wing admin modal */}
      {wingAdminModal && (
        <div className="overlay" onClick={() => setWingAdminModal(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-hd">
              <h3 style={{ display:'flex', alignItems:'center', gap:'7px' }}><UserPlus size={15} color="var(--primary)"/> Assign Wing Admin</h3>
              <button onClick={() => setWingAdminModal(null)} className="btn btn-icon btn-ghost btn-sm"><X size={14}/></button>
            </div>
            <div style={{ padding:'10px 12px', background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'6px', marginBottom:'14px' }}>
              <div style={{ fontWeight:600, fontSize:'13.5px' }}>{wingAdminModal.name}</div>
              <div style={{ fontSize:'11.5px', color:'var(--text-3)' }}>{wingAdminModal.email}</div>
            </div>
            <div className="form-group">
              <label>Assign to Wing *</label>
              <select className="form-control" value={selectedWing} onChange={e => setSelectedWing(e.target.value)}>
                <option value="">Select a wing...</option>
                {wings.map(w => (
                  <option key={w._id} value={w._id} disabled={w.admins?.length >= 3}>
                    Wing {w.name} — {w.admins?.length || 0}/3 admins{w.admins?.length >= 3 ? ' (Full)' : ''}
                  </option>
                ))}
              </select>
              <p style={{ fontSize:'11px', color:'var(--text-3)', marginTop:'5px' }}>Each wing can have at most 3 admins.</p>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => setWingAdminModal(null)} className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center' }}>Cancel</button>
              <button onClick={handleMakeWingAdmin} disabled={!selectedWing} className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center', gap:'6px' }}>
                <UserPlus size={12}/> Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}