import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Building2, Hash, CheckCircle, Copy, Plus, Trash2, ArrowRight, CreditCard, MapPin, Home, Search, Shield, User } from 'lucide-react';

const WrapStyle = { minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'80px 20px 60px' };
const CardStyle = { background:'#fffbfb',border:'1px solid rgba(99,102,241,0.18)',borderRadius:'20px',padding:'32px' };

// ── CREATE SOCIETY ────────────────────────────────
export function CreateSociety() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]   = useState(1); // 1=details, 2=bank, 3=done
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [copied, setCopied]   = useState(false);
  const [wings, setWings]     = useState(['A']);
  const [form, setForm] = useState({ name:'',address:'',city:'',state:'',pincode:'',totalFlats:'',description:'',registrationNumber:'',establishedYear:new Date().getFullYear() });
  const [bank, setBank] = useState({ accountHolderName:'',accountNumber:'',ifscCode:'',bankName:'',branchName:'',accountType:'current',upiId:'' });

  const addWing   = () => setWings(w => [...w, String.fromCharCode(65+w.length)]);
  const removeWing = (i) => setWings(w => w.filter((_,idx)=>idx!==i));
  const updateWing = (i,v) => setWings(w=>{ const n=[...w]; n[i]=v; return n; });

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await API.post('/society/create', { ...form, wings, bankDetails: bank.accountNumber ? bank : undefined });
      setCreated(data.society);
      await refresh();
      setStep(3);
      toast.success('Society created!');
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(created?.societyCode); setCopied(true); toast.success('Code copied!'); setTimeout(()=>setCopied(false),2000); };

  return (
    <div style={WrapStyle}>
      <div style={{ width:'100%',maxWidth:'600px' }}>
        <div style={{ textAlign:'center',marginBottom:'28px' }}>
          <div style={{ width:'52px',height:'52px',borderRadius:'14px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}>
            <Building2 size={26} color="#fff"/>
          </div>
          <h2 style={{ fontSize:'26px' }}>
            {step===1?'Create Your Society':step===2?'Bank Details':'Society Created! 🎉'}
          </h2>
          <p style={{ color:'#64748b',fontSize:'13px',marginTop:'5px' }}>
            {step===1?'Set up your society in minutes':step===2?'Residents will pay maintenance to this account':'Share the code with your residents and guards'}
          </p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ display:'flex',gap:'8px',marginBottom:'24px',justifyContent:'center' }}>
            {['Society Details','Bank Details'].map((label,i)=>(
              <div key={label} style={{ display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',
                color:i+1===step?'#6366f1':i+1<step?'#10b981':'#64748b',fontWeight:i+1<=step?600:400 }}>
                <div style={{ width:'22px',height:'22px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,
                  background:i+1===step?'rgba(99,102,241,0.2)':i+1<step?'rgba(16,185,129,0.2)':'rgba(100,116,139,0.1)',
                  color:i+1===step?'#6366f1':i+1<step?'#10b981':'#64748b',border:`1px solid ${i+1===step?'rgba(99,102,241,0.4)':i+1<step?'rgba(16,185,129,0.4)':'rgba(100,116,139,0.2)'}` }}>
                  {i+1<step?'✓':(i+1)}
                </div>
                {label}
                {i<1 && <div style={{ width:'24px',height:'1px',background:'rgba(255,255,255,0.08)' }}/>}
              </div>
            ))}
          </div>
        )}

        {step===1 && (
          <div style={CardStyle}>
            <form onSubmit={e=>{e.preventDefault();setStep(2);}}>
              <div className="form-group"><label>Society Name *</label>
                <input type="text" required placeholder="e.g., Sunrise Residency" className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              </div>
              <div className="form-group"><label>Address *</label>
                <textarea required rows={2} className="form-control" placeholder="Plot no, Street, Area..." value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
              </div>
              <div className="grid-3">
                {[['city','City','Ahmedabad'],['state','State','Gujarat'],['pincode','Pincode','380001']].map(([k,l,p])=>(
                  <div className="form-group" key={k}><label>{l} *</label>
                    <input type="text" required placeholder={p} className="form-control" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>
                  </div>
                ))}
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Total Flats *</label>
                  <input type="number" required min={1} placeholder="200" className="form-control" value={form.totalFlats} onChange={e=>setForm({...form,totalFlats:e.target.value})}/>
                </div>
                <div className="form-group"><label>Established Year</label>
                  <input type="number" placeholder="2020" className="form-control" value={form.establishedYear} onChange={e=>setForm({...form,establishedYear:e.target.value})}/>
                </div>
              </div>
              {/* Wings */}
              <div className="form-group">
                <label style={{ display:'flex',justifyContent:'space-between' }}>
                  Wings / Blocks
                  <button type="button" onClick={addWing} style={{ background:'none',border:'none',color:'#6366f1',cursor:'pointer',fontSize:'12px',fontWeight:600,display:'flex',alignItems:'center',gap:'4px' }}>
                    <Plus size={13}/> Add Wing
                  </button>
                </label>
                <div style={{ display:'flex',flexWrap:'wrap',gap:'8px' }}>
                  {wings.map((w,i)=>(
                    <div key={i} style={{ display:'flex',alignItems:'center',gap:'5px' }}>
                      <input type="text" value={w} onChange={e=>updateWing(i,e.target.value)} className="form-control" style={{ width:'70px',textAlign:'center',fontWeight:700 }}/>
                      {wings.length>1 && (
                        <button type="button" onClick={()=>removeWing(i)} style={{ background:'rgba(239,68,68,0.1)',border:'none',borderRadius:'6px',padding:'6px',cursor:'pointer',color:'#ef4444' }}>
                          <Trash2 size={12}/>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>Description</label>
                <textarea rows={2} className="form-control" placeholder="Brief description..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
              </div>
              <button type="submit" className="btn btn-primary w-full" style={{ justifyContent:'center',padding:'12px' }}>
                Next: Bank Details <ArrowRight size={15}/>
              </button>
            </form>
          </div>
        )}

        {step===2 && (
          <div style={CardStyle}>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px',padding:'14px',background:'rgba(99,102,241,0.07)',borderRadius:'10px',border:'1px solid rgba(99,102,241,0.15)' }}>
              <CreditCard size={20} color="#6366f1"/>
              <div>
                <div style={{ fontSize:'13px',fontWeight:600 }}>Society Bank Account</div>
                <div style={{ fontSize:'12px',color:'#64748b' }}>Residents' maintenance payments will go directly to this account via Razorpay</div>
              </div>
            </div>
            <form onSubmit={handleCreate}>
              <div className="grid-2">
                <div className="form-group"><label>Account Holder Name *</label>
                  <input type="text" required className="form-control" placeholder="Sunrise Residency RWA" value={bank.accountHolderName} onChange={e=>setBank({...bank,accountHolderName:e.target.value})}/>
                </div>
                <div className="form-group"><label>Bank Name *</label>
                  <input type="text" required className="form-control" placeholder="SBI / HDFC / ICICI..." value={bank.bankName} onChange={e=>setBank({...bank,bankName:e.target.value})}/>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Account Number *</label>
                  <input type="text" required className="form-control" placeholder="1234567890" value={bank.accountNumber} onChange={e=>setBank({...bank,accountNumber:e.target.value})}/>
                </div>
                <div className="form-group"><label>IFSC Code *</label>
                  <input type="text" required className="form-control" placeholder="SBIN0001234" value={bank.ifscCode} onChange={e=>setBank({...bank,ifscCode:e.target.value.toUpperCase()})}/>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Branch Name</label>
                  <input type="text" className="form-control" placeholder="Navrangpura Branch" value={bank.branchName} onChange={e=>setBank({...bank,branchName:e.target.value})}/>
                </div>
                <div className="form-group"><label>Account Type</label>
                  <select className="form-control" value={bank.accountType} onChange={e=>setBank({...bank,accountType:e.target.value})}>
                    <option value="current">Current</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>UPI ID (optional)</label>
                <input type="text" className="form-control" placeholder="societyname@upi" value={bank.upiId} onChange={e=>setBank({...bank,upiId:e.target.value})}/>
              </div>
              <div style={{ display:'flex',gap:'10px' }}>
                <button type="button" onClick={()=>setStep(1)} className="btn btn-ghost" style={{ flex:1,justifyContent:'center' }}>Back</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex:2,justifyContent:'center',padding:'12px' }}>
                  {loading?'Creating...':<>Create Society <ArrowRight size={15}/></>}
                </button>
              </div>
            </form>
          </div>
        )}

        {step===3 && created && (
          <div style={{ ...CardStyle,textAlign:'center' }}>
            <CheckCircle size={52} color="#10b981" style={{ margin:'0 auto 18px' }}/>
            <h3 style={{ fontSize:'20px',marginBottom:'6px' }}>{created.name}</h3>
            <p style={{ color:'#64748b',fontSize:'13px',marginBottom:'24px' }}>{created.city}, {created.state}</p>
            <div style={{ background:'rgba(99,102,241,0.08)',border:'2px dashed rgba(99,102,241,0.35)',borderRadius:'14px',padding:'22px',marginBottom:'22px' }}>
              <p style={{ color:'#64748b',fontSize:'12px',marginBottom:'10px' }}>Your Society Code — Share with residents & guards</p>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'14px' }}>
                <span style={{ fontFamily:'Syne,sans-serif',fontSize:'34px',fontWeight:800,color:'#6366f1',letterSpacing:'8px' }}>{created.societyCode}</span>
                <button onClick={copy} style={{ background:copied?'rgba(16,185,129,0.2)':'rgba(99,102,241,0.15)',border:'none',borderRadius:'8px',padding:'8px',cursor:'pointer',color:copied?'#10b981':'#6366f1' }}>
                  {copied?<CheckCircle size={17}/>:<Copy size={17}/>}
                </button>
              </div>
            </div>
            <button onClick={()=>navigate('/dashboard')} className="btn btn-primary w-full" style={{ justifyContent:'center',padding:'12px' }}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const StepDot = ({ n, active, done }) => (
  <div style={{
    width:'26px', height:'26px', borderRadius:'50%',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'11px', fontWeight:700, flexShrink:0,
    background: done ? 'rgba(16,185,129,0.2)' : active ? 'rgba(99,102,241,0.25)' : 'rgba(100,116,139,0.1)',
    color:       done ? '#10b981'               : active ? '#6366f1'               : '#64748b',
    border:`1.5px solid ${done?'rgba(16,185,129,0.4)':active?'rgba(99,102,241,0.5)':'rgba(100,116,139,0.2)'}`,
    transition:'all 0.2s',
  }}>{done ? '✓' : n}</div>
);

export function JoinSociety() {
  const { refresh } = useAuth();
  const navigate    = useNavigate();

  const [step, setStep]         = useState(1);
  const [code, setCode]         = useState('');
  const [society, setSociety]   = useState(null);
  const [requestedRole, setRequestedRole] = useState('resident'); // 'resident' | 'guard'
  const [flatNumber, setFlatNumber] = useState('');
  const [wingId, setWingId]     = useState('');
  const [wingName, setWingName] = useState('');
  const [loading, setLoading]   = useState(false);

  const isGuard = requestedRole === 'guard';

  // Step 1 — verify code
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 8) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/society/by-code/${code.trim()}`);
      setSociety(data.society);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid society code');
    } finally { setLoading(false); }
  };

  // Step 2 — submit join
  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!isGuard && !flatNumber.trim()) return toast.error('Please enter your flat number');
    setLoading(true);
    try {
      await API.post('/society/join', {
        societyCode:   code.trim(),
        requestedRole,
        flatNumber:    isGuard ? undefined : flatNumber.trim(),
        wingId:        wingId   || undefined,  // guards also have a wing
        wingName:      wingName || undefined,
      });
      await refresh();
      setStep(3);
      toast.success('Join request sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const stepLabels = ['Enter Code', 'Your Details', 'Done'];

  return (
    <div style={WrapStyle}>
      <div style={{ width:'100%', maxWidth:'440px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          {/* <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <Hash size={26} color="#fff" />
          </div> */}
          <h2 style={{ fontSize:'26px' }}>Join a Society</h2>
          <p style={{ color:'#64748b', fontSize:'13px', marginTop:'5px' }}>
            {step===1 ? 'Enter the code shared by your admin'
             : step===2 ? `Joining ${society?.name}`
             : 'You\'re all set!'}
          </p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginBottom:'24px' }}>
            {stepLabels.map((label, i) => (
              <React.Fragment key={label}>
                <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <StepDot n={i+1} active={step===i+1} done={step>i+1} />
                  <span style={{ fontSize:'12px', color:step===i+1?'#6366f1':step>i+1?'#10b981':'#64748b', fontWeight:step===i+1?600:400 }}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && <div style={{ width:'28px', height:'1px', background:'rgba(255,255,255,0.07)' }} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ── STEP 1: Enter Code ── */}
        {step === 1 && (
          <div style={CardStyle}>
            <form onSubmit={handleCodeSubmit}>
              <div className="form-group">
                <label>Society Code</label>
                <input
                  type="text" required maxLength={8} className="form-control"
                  style={{ textAlign:'center', letterSpacing:'8px', fontSize:'24px', fontFamily:'Syne,sans-serif', fontWeight:700, paddingTop:'14px', paddingBottom:'14px' }}
                  placeholder="XXXXXXXX"
                  value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                />
                <p style={{ fontSize:'11px', color:'#64748b', marginTop:'7px', textAlign:'center' }}>8-character code — ask your society admin</p>
              </div>
              <button type="submit" disabled={loading || code.length !== 8} className="btn btn-primary w-full" style={{ justifyContent:'center', padding:'12px', fontSize:'14px' }}>
                {loading ? 'Verifying...' : <><Search size={15} /> Verify Code</>}
              </button>
            </form>
            <div style={{ textAlign:'center', marginTop:'18px' }}>
              <span style={{ color:'#64748b', fontSize:'13px' }}>Or </span>
              <button onClick={() => navigate('/create-society')} style={{ background:'none', border:'none', color:'#6366f1', cursor:'pointer', fontSize:'13px', fontWeight:500 }}>
                Create a new society
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Role + Details ── */}
        {step === 2 && society && (
          <div style={CardStyle}>
            {/* Society banner */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 14px', background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.18)', borderRadius:'10px', marginBottom:'20px' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'9px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Building2 size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:'14px' }}>{society.name}</div>
                <div style={{ fontSize:'12px', color:'#64748b' }}>{society.city}, {society.state} · {society.totalFlats} Flats</div>
              </div>
            </div>

            <form onSubmit={handleJoinSubmit}>
              {/* Role selector */}
              <div className="form-group">
                <label>I am joining as *</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  {[
                    { val:'resident', label:'Resident',      icon:User,   desc:'I live in a flat',        color:'#10b981' },
                    { val:'guard',    label:'Security Guard', icon:Shield, desc:'I work as guard/security', color:'#f59e0b' },
                  ].map(({ val, label, icon:Icon, desc, color }) => (
                    <button
                      type="button" key={val}
                      onClick={() => { setRequestedRole(val); setFlatNumber(''); setWingId(''); setWingName(''); }}
                      style={{
                        padding:'14px 12px', borderRadius:'10px', cursor:'pointer', textAlign:'left',
                        background: requestedRole===val ? `${color}12` : 'rgba(255,255,255,0.02)',
                        border: `1.5px solid ${requestedRole===val ? color : 'rgba(255,255,255,0.07)'}`,
                        transition:'all 0.15s', display:'flex', flexDirection:'column', gap:'6px',
                      }}
                    >
                      <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                        <div style={{ width:'26px', height:'26px', borderRadius:'7px', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Icon size={14} color={color} />
                        </div>
                        <span style={{ fontSize:'13px', fontWeight:600, color: requestedRole===val ? color : '#181819' }}>{label}</span>
                      </div>
                      <span style={{ fontSize:'11px', color:'#64748b', lineHeight:1.4 }}>{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Flat number — residents only */}
              {!isGuard && (
                <div className="form-group">
                  <label>Your Flat Number *</label>
                  <div style={{ position:'relative' }}>
                    <Home size={15} style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', color:'#64748b' }} />
                    <input type="text" required={!isGuard} className="form-control" style={{ paddingLeft:'38px' }}
                      placeholder="e.g. 101, B-203, GF-04"
                      value={flatNumber} onChange={e => setFlatNumber(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Wing — both residents AND guards */}
              {society.wings?.length > 0 && (
                <div className="form-group">
                  <label>{isGuard ? 'Assigned Wing *' : 'Your Wing / Block'}</label>
                  <div style={{ position:'relative' }}>
                    <MapPin size={15} style={{ position:'absolute', left:'13px', top:'50%', transform:'translateY(-50%)', color:'#64748b' }} />
                    <select className="form-control" style={{ paddingLeft:'38px' }}
                      value={wingId} required={isGuard}
                      onChange={e => {
                        const sel = society.wings.find(w => w._id === e.target.value);
                        setWingId(e.target.value);
                        setWingName(sel?.name || '');
                      }}>
                      <option value="">{isGuard ? 'Select your assigned wing...' : 'Select your wing...'}</option>
                      {society.wings.map(w => <option key={w._id} value={w._id}>Wing {w.name}</option>)}
                    </select>
                  </div>
                  {isGuard && (
                    <p style={{ fontSize:'11px', color:'#64748b', marginTop:'6px' }}>
                      Guards are assigned to a single wing. Select the wing you will be guarding.
                    </p>
                  )}
                </div>
              )}

              {/* Guard info note */}
              {isGuard && (
                <div style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'9px', padding:'12px 14px', marginBottom:'16px', fontSize:'13px', color:'#fcd34d', lineHeight:1.6 }}>
                  <Shield size={13} style={{ marginRight:'6px', verticalAlign:'middle' }} />
                  You don't need a flat number. Just select your assigned wing and send the request — the admin will approve your guard access.
                </div>
              )}

              {/* Resident info note */}
              {!isGuard && (
                <div style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:'9px', padding:'11px 13px', marginBottom:'16px', fontSize:'12px', color:'#6ee7b7', lineHeight:1.6 }}>
                  ✅ Your flat and wing info will be sent with the request — the admin just clicks <strong>Approve</strong>.
                </div>
              )}

              <div style={{ display:'flex', gap:'10px' }}>
                <button type="button" onClick={() => { setStep(1); setSociety(null); setRequestedRole('resident'); }} className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }}>Back</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex:2, justifyContent:'center', padding:'11px' }}>
                  {loading ? 'Sending...' : <>Send Request <ArrowRight size={15} /></>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === 3 && (
          <div style={{ ...CardStyle, textAlign:'center' }}>
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(16,185,129,0.12)', border:'2px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
              <CheckCircle size={36} color="#10b981" />
            </div>
            <h3 style={{ fontSize:'20px', marginBottom:'8px' }}>Request Sent!</h3>
            <div style={{ background:'rgba(99,102,241,0.07)', borderRadius:'10px', padding:'14px', marginBottom:'18px' }}>
              <div style={{ fontSize:'13px', color:'#94a3b8', lineHeight:1.7 }}>
                Your request to join <strong style={{ color:'#0f0f10' }}>{society?.name}</strong> as a{' '}
                <strong style={{ color: isGuard ? '#f59e0b' : '#10b981' }}>
                  {isGuard ? 'Security Guard' : 'Resident'}
                </strong>{' '}
                has been sent. The admin will review and approve your request shortly.
              </div>
            </div>
            {(flatNumber || wingName) && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'9px', marginBottom:'20px', fontSize:'12px' }}>
                {!isGuard && flatNumber && (
                  <div style={{ textAlign:'left' }}>
                    <div style={{ color:'#64748b', marginBottom:'3px' }}>Flat Number</div>
                    <div style={{ fontWeight:600, color:'#0f0f10' }}>{flatNumber}</div>
                  </div>
                )}
                {wingName && (
                  <div style={{ textAlign:'left' }}>
                    <div style={{ color:'#64748b', marginBottom:'3px' }}>{isGuard ? 'Assigned Wing' : 'Wing'}</div>
                    <div style={{ fontWeight:600, color:'#0f0f10' }}>Wing {wingName}</div>
                  </div>
                )}
              </div>
            )}
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary w-full" style={{ justifyContent:'center', padding:'12px' }}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}