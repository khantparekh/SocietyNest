import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { ScopeBar } from '../../../components/ScopeBar';
import { Plus, Home, X, MapPin } from 'lucide-react';

export default function RentalManagement() {
  const { user, role } = useAuth();
  const [rentals, setRentals]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [requestModal, setRequestModal] = useState(null);
  const [requestMsg, setRequestMsg]     = useState('');
  const [form, setForm] = useState({ flatNumber:'',wing:'',floor:'',bhkType:'2BHK',rent:'',deposit:'',description:'',furnished:'semi-furnished',availableFrom:'',contactPhone:'' });

  useEffect(()=>{ fetch(); },[]);
  const fetch = async () => {
    setLoading(true);
    try { const { data } = await API.get('/rentals'); setRentals(data.rentals); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try { await API.post('/rentals',form); toast.success('Flat listed!'); setShowModal(false); fetch(); }
    catch { toast.error('Failed'); }
  };

  const handleRequest = async () => {
    try { await API.post(`/rentals/${requestModal._id}/request`,{ message:requestMsg }); toast.success('Request sent!'); setRequestModal(null); setRequestMsg(''); }
    catch { toast.error('Failed'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await API.put(`/rentals/${id}`,{ status }); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-hd">
        <div><h2>Rental Flats</h2><p>Available rental flats in the society</p></div>
        {role==='resident'&&<button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={15}/>List My Flat</button>}
      </div>
      <div className="grid-3 mb-4">
        {[{ label:'Available',val:rentals.filter(r=>r.status==='available').length,color:'#10b981' },
          { label:'Rented',val:rentals.filter(r=>r.status==='rented').length,color:'#94a3b8' },
          { label:'Total',val:rentals.length,color:'#6366f1' }].map(({ label,val,color })=>(
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:`${color}15` }}><Home size={20} color={color}/></div>
            <div className="stat-info"><h3>{val}</h3><p>{label}</p></div>
          </div>
        ))}
      </div>
      {loading?<div style={{ textAlign:'center',padding:'60px' }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
       :rentals.length===0?<div className="empty card"><Home size={48}/><h3>No rental listings</h3></div>
       :(
        <div className="grid-auto">
          {rentals.map(r=>(
            <div key={r._id} className="card" style={{ padding:'20px' }}>
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'10px' }}>
                <h4 style={{ fontSize:'15px' }}>{r.bhkType}</h4>
                <span className={`badge ${r.status==='available'?'badge-success':r.status==='rented'?'badge-gray':'badge-warning'}`}>{r.status}</span>
              </div>
              <div style={{ fontSize:'28px',fontWeight:800,color:'#6366f1',fontFamily:'Syne,sans-serif',marginBottom:'8px' }}>
                ₹{r.rent.toLocaleString('en-IN')}<span style={{ fontSize:'13px',color:'#64748b',fontWeight:400 }}>/mo</span>
              </div>
              <div style={{ display:'flex',alignItems:'center',gap:'4px',fontSize:'12px',color:'#64748b',marginBottom:'8px' }}>
                <MapPin size={11}/>Flat {r.flatNumber}{r.wing&&` · Wing ${r.wing}`}{r.floor&&` · Floor ${r.floor}`}
              </div>
              <div style={{ display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'10px' }}>
                <span className="badge badge-purple">{r.furnished}</span>
                {r.deposit>0&&<span className="badge badge-info">Dep ₹{r.deposit.toLocaleString('en-IN')}</span>}
              </div>
              {r.description&&<p style={{ fontSize:'12px',color:'#94a3b8',marginBottom:'10px',lineHeight:1.5 }}>{r.description}</p>}
              <div style={{ fontSize:'11px',color:'#64748b',marginBottom:'12px' }}>{r.ownerId?.name} · {r.contactPhone}</div>
              {role==='resident'&&r.status==='available'&&r.ownerId?._id!==user?._id&&(
                <button onClick={()=>setRequestModal(r)} className="btn btn-primary btn-sm w-full" style={{ justifyContent:'center' }}>Request Flat</button>
              )}
              {(r.ownerId?._id===user?._id||['superadmin','wing_admin'].includes(role))&&(
                <select className="form-control" style={{ fontSize:'12px',marginTop:'8px' }} value={r.status} onChange={e=>handleStatusChange(r._id,e.target.value)}>
                  {['available','rented','under_review'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              )}
              {role==='guard'&&r.status==='available'&&(
                <div style={{ marginTop:'8px',padding:'8px',background:'rgba(16,185,129,0.1)',borderRadius:'7px',fontSize:'12px',color:'#10b981',textAlign:'center' }}>
                  ✓ Available · {r.contactPhone}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showModal&&(
        <div className="overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hd"><h3>List Flat for Rent</h3><button onClick={()=>setShowModal(false)} className="btn btn-icon btn-ghost"><X size={18}/></button></div>
            <form onSubmit={handleAdd}>
              <div className="grid-3">
                {[['flatNumber','Flat No *','101'],['wing','Wing','A'],['floor','Floor','3']].map(([k,l,p])=>(
                  <div className="form-group" key={k}><label>{l}</label><input type="text" className="form-control" placeholder={p} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
                ))}
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Type *</label><select className="form-control" value={form.bhkType} onChange={e=>setForm({...form,bhkType:e.target.value})}>{['1BHK','2BHK','3BHK','4BHK','Studio'].map(t=><option key={t}>{t}</option>)}</select></div>
                <div className="form-group"><label>Furnished</label><select className="form-control" value={form.furnished} onChange={e=>setForm({...form,furnished:e.target.value})}>{['unfurnished','semi-furnished','fully-furnished'].map(f=><option key={f} value={f}>{f}</option>)}</select></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Rent (₹/mo) *</label><input type="number" required className="form-control" value={form.rent} onChange={e=>setForm({...form,rent:e.target.value})}/></div>
                <div className="form-group"><label>Deposit (₹)</label><input type="number" className="form-control" value={form.deposit} onChange={e=>setForm({...form,deposit:e.target.value})}/></div>
              </div>
              <div className="form-group"><label>Available From</label><input type="date" className="form-control" value={form.availableFrom} onChange={e=>setForm({...form,availableFrom:e.target.value})}/></div>
              <div className="form-group"><label>Contact Phone</label><input type="tel" className="form-control" value={form.contactPhone} onChange={e=>setForm({...form,contactPhone:e.target.value})}/></div>
              <div className="form-group"><label>Description</label><textarea rows={2} className="form-control" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
              <div style={{ display:'flex',gap:'10px',justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setShowModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary">List Flat</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {requestModal&&(
        <div className="overlay" onClick={()=>setRequestModal(null)}>
          <div className="modal modal-sm" onClick={e=>e.stopPropagation()}>
            <div className="modal-hd"><h3>Request Flat</h3><button onClick={()=>setRequestModal(null)} className="btn btn-icon btn-ghost"><X size={18}/></button></div>
            <p style={{ fontSize:'13px',color:'#94a3b8',marginBottom:'14px' }}>{requestModal.bhkType} · Flat {requestModal.flatNumber} · ₹{requestModal.rent.toLocaleString('en-IN')}/mo</p>
            <div className="form-group"><label>Message to Owner</label><textarea rows={3} className="form-control" placeholder="Introduce yourself..." value={requestMsg} onChange={e=>setRequestMsg(e.target.value)}/></div>
            <div style={{ display:'flex',gap:'10px' }}>
              <button onClick={()=>setRequestModal(null)} className="btn btn-ghost" style={{ flex:1,justifyContent:'center' }}>Cancel</button>
              <button onClick={handleRequest} className="btn btn-primary" style={{ flex:1,justifyContent:'center' }}>Send Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}