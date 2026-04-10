import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { ScopeBar } from '../../../components/ScopeBar';
import { Plus, Users, X, LogOut as ExitIcon } from 'lucide-react';

export default function VisitorManagement() {
  const { role } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:'',phone:'',purpose:'',visitingFlat:'',visitingWing:'',vehicleNumber:'',idProofType:'aadhar',idProofNumber:'' });

  useEffect(()=>{ fetch(); },[]);
  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/visitors'); setVisitors(data.visitors); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await API.post('/visitors',form); toast.success('Visitor logged'); setShowModal(false); fetch(); setForm({ name:'',phone:'',purpose:'',visitingFlat:'',visitingWing:'',vehicleNumber:'',idProofType:'aadhar',idProofNumber:'' }); }
    catch { toast.error('Failed'); }
  };

  const handleExit = async (id) => {
    try { await API.put(`/visitors/${id}/exit`); toast.success('Exit recorded'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const inside = visitors.filter(v=>v.status==='inside').length;

  return (
    <div>
      <div className="page-hd">
        <div><h2>Visitor Management</h2><p>Log and track all society visitors</p></div>
        {['guard'].includes(role)&&<button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={15}/>Log Visitor</button>}
      </div>
      <div className="grid-3 mb-4">
        {[{ label:'Inside Now',val:inside,color:'#10b981'},{label:'Total Today',val:visitors.length,color:'#6366f1'},{label:'Exited',val:visitors.filter(v=>v.status==='exited').length,color:'#94a3b8'}].map(({ label,val,color })=>(
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:`${color}15` }}><Users size={20} color={color}/></div>
            <div className="stat-info"><h3>{val}</h3><p>{label}</p></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Visitor</th><th>Purpose</th><th>Visiting</th><th>Entry</th><th>Status</th><th>Vehicle</th>{['superadmin','wing_admin','guard'].includes(role)&&<th>Action</th>}</tr></thead>
            <tbody>
              {loading?<tr><td colSpan={7} style={{ textAlign:'center',padding:'40px',color:'#64748b' }}>Loading...</td></tr>
               :visitors.length===0?<tr><td colSpan={7}><div className="empty"><Users size={40}/><h3>No visitors today</h3></div></td></tr>
               :visitors.map(v=>(
                <tr key={v._id}>
                  <td><div style={{ fontWeight:500 }}>{v.name}</div><div style={{ fontSize:'12px',color:'#64748b' }}>{v.phone}</div></td>
                  <td style={{ fontSize:'13px',color:'#94a3b8' }}>{v.purpose}</td>
                  <td style={{ fontSize:'13px' }}>Flat {v.visitingFlat}{v.visitingWing&&` (${v.visitingWing})`}</td>
                  <td style={{ fontSize:'12px',color:'#94a3b8' }}>{new Date(v.entryTime).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</td>
                  <td><span className={`badge ${v.status==='inside'?'badge-success':'badge-gray'}`}>{v.status}</span></td>
                  <td style={{ fontSize:'12px',color:'#94a3b8' }}>{v.vehicleNumber||'—'}</td>
                  {['superadmin','wing_admin','guard'].includes(role)&&<td>
                    {v.status==='inside'
                      ?<button onClick={()=>handleExit(v._id)} className="btn btn-ghost btn-sm"><ExitIcon size={13}/>Exit</button>
                      :<span style={{ fontSize:'12px',color:'#64748b' }}>{v.exitTime&&new Date(v.exitTime).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>}
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
            <div className="modal-hd"><h3>Log Visitor</h3><button onClick={()=>setShowModal(false)} className="btn btn-icon btn-ghost"><X size={18}/></button></div>
            <form onSubmit={handleAdd}>
              <div className="grid-2">
                <div className="form-group"><label>Name *</label><input type="text" required className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                <div className="form-group"><label>Phone *</label><input type="tel" required className="form-control" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
              </div>
              <div className="form-group"><label>Purpose *</label><input type="text" required className="form-control" placeholder="Delivery / Guest / Plumber..." value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})}/></div>
              <div className="grid-2">
                <div className="form-group"><label>Flat *</label><input type="text" required className="form-control" placeholder="101" value={form.visitingFlat} onChange={e=>setForm({...form,visitingFlat:e.target.value})}/></div>
                <div className="form-group"><label>Wing</label><input type="text" className="form-control" placeholder="A" value={form.visitingWing} onChange={e=>setForm({...form,visitingWing:e.target.value})}/></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>ID Type</label><select className="form-control" value={form.idProofType} onChange={e=>setForm({...form,idProofType:e.target.value})}>{['aadhar','pan','driving_license','passport','other'].map(t=><option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label>ID Number</label><input type="text" className="form-control" value={form.idProofNumber} onChange={e=>setForm({...form,idProofNumber:e.target.value})}/></div>
              </div>
              <div className="form-group"><label>Vehicle Number</label><input type="text" className="form-control" placeholder="GJ01AB1234" value={form.vehicleNumber} onChange={e=>setForm({...form,vehicleNumber:e.target.value})}/></div>
              <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">Log Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}