import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { ScopeBar } from '../../../components/ScopeBar';
import { Plus, Megaphone, X, Pin, Calendar, Users, BarChart2 } from 'lucide-react';

const catColors = { general:'var(--primary)', maintenance:'var(--warning)', celebration:'#7c3aed', alert:'var(--danger)', meeting:'var(--info)', other:'var(--text-3)' };

export default function AnnouncementManagement({ society, scope: parentScope }) {
  const { role, user, activeMembership } = useAuth();
  const [scope, setScope] = useState(parentScope || 'wing');
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [type, setType]             = useState('announcement');
  const [wings, setWings]           = useState([]);
  const [form, setForm]  = useState({ title:'', content:'', category:'general', eventDate:'', venue:'', wingId:'' });
  const [poll, setPoll]  = useState({ question:'', options:['',''], endDate:'', isAnonymous:false });

  useEffect(() => { fetchAll(); }, [scope]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = role === 'resident' && scope === 'society' ? { params:{ scope:'society' } } : {};
      const [a, w] = await Promise.all([API.get('/announcements', params), API.get('/wings')]);
      setItems(a.data.announcements);
      setWings(w.data.wings);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const handleCreate = async e => {
    e.preventDefault();
    try {
      const payload = type === 'poll'
        ? { type:'poll', title:form.title, wingId:form.wingId||undefined, poll:{ ...poll, options:poll.options.filter(o=>o.trim()).map(o=>({text:o})) } }
        : { type:'announcement', ...form, wingId:form.wingId||undefined };
      await API.post('/announcements', payload);
      toast.success(type === 'poll' ? 'Poll created!' : 'Posted!');
      setShowModal(false); fetchAll();
      setForm({ title:'', content:'', category:'general', eventDate:'', venue:'', wingId:'' });
      setPoll({ question:'', options:['',''], endDate:'', isAnonymous:false });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleVote = async (annId, optId) => {
    try {
      const { data } = await API.post(`/announcements/${annId}/vote`, { optionId: optId });
      setItems(prev => prev.map(i => i._id === annId ? data.announcement : i));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handlePin = async ann => {
    try { await API.put(`/announcements/${ann._id}/pin`, { isPinned: !ann.isPinned }); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async id => {
    try { await API.delete(`/announcements/${id}`); fetchAll(); toast.success('Removed'); }
    catch { toast.error('Failed'); }
  };

  const handleClosePoll = async id => {
    try { await API.put(`/announcements/${id}/close-poll`); fetchAll(); toast.success('Poll closed'); }
    catch { toast.error('Failed'); }
  };

  const totalVotes = opts => opts.reduce((s, o) => s + (o.votes?.length || 0), 0);
  const isAdmin = ['superadmin','wing_admin'].includes(role);

  return (
    <div>
      <div className="page-hd">
        <div><h2>Announcements & Polls</h2><p>Events, notices, and community polls</p></div>
        {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={13}/>New Post</button>}
      </div>

      <ScopeBar scope={scope} setScope={setScope} wingName={activeMembership?.wingName} label="Announcements for"/>

      {loading ? <div style={{ textAlign:'center', padding:'48px' }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
       : items.length === 0 ? <div className="empty card"><Megaphone size={40}/><h3>No announcements yet</h3></div>
       : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {items.map(ann => {
            const catColor = catColors[ann.category] || 'var(--primary)';
            return (
              <div key={ann._id} className="card" style={{ borderLeft:`3px solid ${ann.isPinned ? 'var(--warning)' : catColor}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'8px', marginBottom:'10px' }}>
                  <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', alignItems:'center' }}>
                    {ann.isPinned && <span style={{ fontSize:'11px', color:'var(--warning)', fontWeight:700, display:'flex', alignItems:'center', gap:'3px' }}><Pin size={10}/>PINNED</span>}
                    <span className="badge badge-purple">{ann.type}</span>
                    {ann.category && <span className="badge" style={{ background:`${catColor}14`, color:catColor, borderColor:`${catColor}30`, textTransform:'capitalize' }}>{ann.category}</span>}
                  </div>
                  {isAdmin && (
                    <div style={{ display:'flex', gap:'5px' }}>
                      <button onClick={() => handlePin(ann)} className="btn btn-ghost btn-icon btn-sm"><Pin size={12} color={ann.isPinned ? 'var(--warning)' : 'var(--text-3)'}/></button>
                      {ann.type === 'poll' && !ann.poll?.isClosed && (
                        <button onClick={() => handleClosePoll(ann._id)} className="btn btn-ghost btn-sm" style={{ fontSize:'11px' }}>Close Poll</button>
                      )}
                      <button onClick={() => handleDelete(ann._id)} className="btn btn-ghost btn-icon btn-sm"><X size={12} color="var(--danger)"/></button>
                    </div>
                  )}
                </div>
                <h3 style={{ fontSize:'14px', fontWeight:600, marginBottom:'5px' }}>{ann.title}</h3>
                {ann.content && <p style={{ fontSize:'13px', color:'var(--text-2)', lineHeight:1.65 }}>{ann.content}</p>}
                {ann.eventDate && (
                  <div style={{ display:'flex', gap:'12px', marginTop:'8px', fontSize:'12px', color:'var(--text-3)' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><Calendar size={11}/>{new Date(ann.eventDate).toLocaleDateString('en-IN')}</span>
                    {ann.venue && <span>📍 {ann.venue}</span>}
                  </div>
                )}
                {ann.type === 'poll' && ann.poll && (
                  <div style={{ marginTop:'12px', padding:'14px', background:'var(--bg-surface)', borderRadius:'7px', border:'1px solid var(--border)' }}>
                    <div style={{ fontWeight:600, fontSize:'13.5px', marginBottom:'10px' }}>{ann.poll.question}</div>
                    {ann.poll.isClosed && <div style={{ fontSize:'11px', color:'var(--danger)', marginBottom:'8px', fontWeight:600 }}>● Poll Closed</div>}
                    {ann.poll.options?.map(opt => {
                      const total = totalVotes(ann.poll.options);
                      const pct = total > 0 ? Math.round((opt.votes?.length || 0) / total * 100) : 0;
                      return (
                        <div key={opt._id} style={{ marginBottom:'7px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                            <div style={{ display:'flex', gap:'7px', alignItems:'center' }}>
                              {!ann.poll.isClosed && (
                                <button onClick={() => handleVote(ann._id, opt._id)} style={{ width:'15px', height:'15px', borderRadius:'50%', border:'1.5px solid var(--primary)', background:'transparent', cursor:'pointer', flexShrink:0 }}/>
                              )}
                              <span style={{ fontSize:'13px' }}>{opt.text}</span>
                            </div>
                            <span style={{ fontSize:'11.5px', color:'var(--text-3)', fontWeight:600 }}>{pct}% ({opt.votes?.length || 0})</span>
                          </div>
                          <div style={{ height:'5px', background:'var(--border)', borderRadius:'3px', overflow:'hidden' }}>
                            <div style={{ width:`${pct}%`, height:'100%', background:'var(--primary)', borderRadius:'3px', transition:'width 0.35s' }}/>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ fontSize:'11px', color:'var(--text-3)', marginTop:'8px', display:'flex', gap:'10px' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><Users size={10}/>{totalVotes(ann.poll.options)} votes</span>
                      {ann.poll.endDate && <span>Ends: {new Date(ann.poll.endDate).toLocaleDateString('en-IN')}</span>}
                    </div>
                  </div>
                )}
                <div style={{ fontSize:'11px', color:'var(--text-3)', marginTop:'10px' }}>
                  By {ann.postedBy?.name} · {new Date(ann.createdAt).toLocaleDateString('en-IN')}
                  {ann.wingId && <span> · Wing only</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-hd"><h3>New Post</h3><button onClick={() => setShowModal(false)} className="btn btn-icon btn-ghost btn-sm"><X size={15}/></button></div>
            <div style={{ display:'flex', gap:'7px', marginBottom:'16px' }}>
              {[{v:'announcement',l:'📢 Announcement'},{v:'poll',l:'📊 Poll'}].map(({ v, l }) => (
                <button key={v} onClick={() => setType(v)} className={`btn btn-sm ${type===v?'btn-primary':'btn-ghost'}`}>{l}</button>
              ))}
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>Title *</label><input type="text" required className="form-control" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
              <div className="form-group"><label>Target Wing (empty = all wings)</label>
                <select className="form-control" value={form.wingId} onChange={e=>setForm({...form,wingId:e.target.value})}>
                  <option value="">All Wings</option>
                  {wings.map(w => <option key={w._id} value={w._id}>Wing {w.name}</option>)}
                </select>
              </div>
              {type === 'announcement' ? (
                <>
                  <div className="grid-2">
                    <div className="form-group"><label>Category</label>
                      <select className="form-control" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                        {Object.keys(catColors).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Event Date</label><input type="date" className="form-control" value={form.eventDate} onChange={e=>setForm({...form,eventDate:e.target.value})}/></div>
                  </div>
                  <div className="form-group"><label>Venue</label><input type="text" className="form-control" placeholder="Clubhouse, Hall..." value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})}/></div>
                  <div className="form-group"><label>Content</label><textarea rows={3} className="form-control" value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/></div>
                </>
              ) : (
                <>
                  <div className="form-group"><label>Poll Question *</label><input type="text" required className="form-control" placeholder="What should be our next amenity?" value={poll.question} onChange={e=>setPoll({...poll,question:e.target.value})}/></div>
                  <div className="form-group">
                    <label style={{ display:'flex', justifyContent:'space-between' }}>Options * <button type="button" onClick={() => setPoll({...poll,options:[...poll.options,'']})} style={{ background:'none', border:'none', color:'var(--primary)', cursor:'pointer', fontSize:'12px', fontWeight:600 }}>+ Add</button></label>
                    {poll.options.map((o, i) => (
                      <div key={i} style={{ display:'flex', gap:'7px', marginBottom:'7px' }}>
                        <input type="text" required className="form-control" placeholder={`Option ${i+1}`} value={o} onChange={e => { const n=[...poll.options]; n[i]=e.target.value; setPoll({...poll,options:n}); }}/>
                        {poll.options.length > 2 && <button type="button" onClick={() => setPoll({...poll,options:poll.options.filter((_,idx)=>idx!==i)})} className="btn btn-ghost btn-icon btn-sm"><X size={12}/></button>}
                      </div>
                    ))}
                  </div>
                  <div className="grid-2">
                    <div className="form-group"><label>End Date</label><input type="date" className="form-control" value={poll.endDate} onChange={e=>setPoll({...poll,endDate:e.target.value})}/></div>
                    <div className="form-group" style={{ display:'flex', alignItems:'flex-end', paddingBottom:'2px' }}>
                      <label style={{ display:'flex', alignItems:'center', gap:'7px', cursor:'pointer', textTransform:'none', letterSpacing:0, margin:0 }}>
                        <input type="checkbox" checked={poll.isAnonymous} onChange={e=>setPoll({...poll,isAnonymous:e.target.checked})} style={{ width:'14px', height:'14px', accentColor:'var(--primary)' }}/>
                        <span style={{ fontSize:'13px', color:'var(--text-2)', fontWeight:400 }}>Anonymous voting</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}