import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { ScopeBar } from '../../../components/ScopeBar';
import { Plus, MessageSquare, X } from 'lucide-react';

const catColor = { plumbing:'#3b82f6',electrical:'#f59e0b',cleaning:'#10b981',security:'#ef4444',noise:'#8b5cf6',parking:'#6366f1',lift:'#ec4899',other:'#94a3b8' };
const statusBadge = { pending:'badge-warning','in-progress':'badge-info',resolved:'badge-success',rejected:'badge-danger' };

export default function ComplaintManagement() {
  const { role } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [selected, setSelected]     = useState(null);
  const [response, setResponse]     = useState('');
  const [form, setForm] = useState({ title:'',description:'',category:'other',priority:'medium' });

  useEffect(()=>{ fetch(); },[]);
  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/complaints'); setComplaints(data.complaints); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await API.post('/complaints',form); toast.success('Complaint raised'); setShowModal(false); fetch(); setForm({ title:'',description:'',category:'other',priority:'medium' }); }
    catch { toast.error('Failed'); }
  };

  const handleUpdate = async (status) => {
    try { await API.put(`/complaints/${selected._id}`,{ status,adminResponse:response }); toast.success('Updated'); setSelected(null); setResponse(''); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-hd">
        <div><h2>Complaints</h2><p>{['superadmin','wing_admin'].includes(role)?'Manage resident complaints':'Raise and track your complaints'}</p></div>
        {['resident','superadmin','wing_admin'].includes(role)&&<button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={15}/>Raise Complaint</button>}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Complaint</th><th>Category</th><th>Priority</th><th>Status</th>{['superadmin','wing_admin'].includes(role)&&<th>Raised By</th>}<th>Date</th>{['superadmin','wing_admin'].includes(role)&&<th>Action</th>}</tr></thead>
            <tbody>
              {loading?<tr><td colSpan={8} style={{ textAlign:'center',padding:'40px',color:'#64748b' }}>Loading...</td></tr>
               :complaints.length===0?<tr><td colSpan={8}><div className="empty"><MessageSquare size={40}/><h3>No complaints</h3></div></td></tr>
               :complaints.map(c=>(
                <tr key={c._id}>
                  <td><div style={{ fontWeight:500,fontSize:'13px' }}>{c.title}</div>
                    {c.adminResponse&&<div style={{ fontSize:'11px',color:'#10b981',marginTop:'3px' }}>↳ {c.adminResponse}</div>}
                  </td>
                  <td><span className="badge" style={{ background:`${catColor[c.category]}15`,color:catColor[c.category] }}>{c.category}</span></td>
                  <td><span className={`badge ${c.priority==='high'?'badge-danger':c.priority==='medium'?'badge-warning':'badge-success'}`}>{c.priority}</span></td>
                  <td><span className={`badge ${statusBadge[c.status]}`}>{c.status}</span></td>
                  {['superadmin','wing_admin'].includes(role)&&<td style={{ fontSize:'12px' }}>{c.raisedBy?.name}<br/><span style={{ color:'#64748b' }}>Flat {c.raisedBy?.membership?.flatNumber}</span></td>}
                  <td style={{ fontSize:'12px',color:'#94a3b8' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  {['superadmin','wing_admin'].includes(role)&&<td>
                    {c.status!=='resolved'&&c.status!=='rejected'&&(
                      <button onClick={()=>{setSelected(c);setResponse(c.adminResponse||'');}} className="btn btn-ghost btn-sm">Update</button>
                    )}
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal&&(
        <div className="overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hd"><h3>Raise Complaint</h3><button onClick={()=>setShowModal(false)} className="btn btn-icon btn-ghost"><X size={18}/></button></div>
            <form onSubmit={handleAdd}>
              <div className="form-group"><label>Title *</label><input type="text" required className="form-control" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
              <div className="form-group"><label>Description *</label><textarea required rows={3} className="form-control" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
              <div className="grid-2">
                <div className="form-group"><label>Category</label><select className="form-control" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{Object.keys(catColor).map(c=><option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label>Priority</label><select className="form-control" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{['low','medium','high'].map(p=><option key={p}>{p}</option>)}</select></div>
              </div>
              <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selected&&(
        <div className="overlay" onClick={()=>setSelected(null)}>
          <div className="modal modal-sm" onClick={e=>e.stopPropagation()}>
            <div className="modal-hd"><h3>Update Complaint</h3><button onClick={()=>setSelected(null)} className="btn btn-icon btn-ghost"><X size={18}/></button></div>
            <div style={{ padding:'12px',background:'rgba(99,102,241,0.07)',borderRadius:'8px',marginBottom:'14px',fontSize:'13px' }}>{selected.title}</div>
            <div className="form-group"><label>Admin Response</label><textarea rows={3} className="form-control" placeholder="Your response..." value={response} onChange={e=>setResponse(e.target.value)}/></div>
            <div style={{ display:'flex',gap:'8px' }}>
              {['in-progress','resolved','rejected'].map(s=>(
                <button key={s} onClick={()=>handleUpdate(s)} className={`btn btn-sm ${s==='resolved'?'btn-success':s==='rejected'?'btn-danger':'btn-primary'}`} style={{ flex:1,justifyContent:'center' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}