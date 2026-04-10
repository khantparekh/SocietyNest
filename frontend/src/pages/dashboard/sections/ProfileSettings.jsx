import React, { useState, useEffect } from 'react';
import API from '../../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { User, Building2, CreditCard, Lock, Save, Plus, ChevronDown, ChevronUp } from 'lucide-react';

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={{ marginBottom: '14px' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width:'100%', background:'none', border:'none', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', padding:0, marginBottom: open ? '18px' : 0 }}
      >
        <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'7px', background:'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={15} color="var(--primary)"/>
          </div>
          <h3 style={{ fontSize:'14px', fontWeight:600, color:'var(--text)' }}>{title}</h3>
        </div>
        {open ? <ChevronUp size={15} color="var(--text-3)"/> : <ChevronDown size={15} color="var(--text-3)"/>}
      </button>
      {open && children}
    </div>
  );
}

export default function ProfileSettings({ society }) {
  const { user, role, refresh } = useAuth();

  const [profile,      setProfile]      = useState({ name:'', phone:'' });
  const [profileSaving,setProfileSaving]= useState(false);

  const [pwd,    setPwd]    = useState({ current:'', newPwd:'', confirm:'' });
  const [pwdSaving,setPwdSaving] = useState(false);

  const [soc,    setSoc]    = useState({ name:'', address:'', city:'', state:'', pincode:'', totalFlats:'', description:'', registrationNumber:'', establishedYear:'' });
  const [socSaving,setSocSaving] = useState(false);

  const [bank,   setBank]   = useState({ accountHolderName:'', accountNumber:'', ifscCode:'', bankName:'', branchName:'', accountType:'current', upiId:'' });
  const [bankSaving,setBankSaving] = useState(false);

  const [wings,     setWings]     = useState([]);
  const [newWing,   setNewWing]   = useState({ name:'', totalFlats:'', floors:'' });
  const [wingSaving,setWingSaving]= useState(false);

  useEffect(() => {
    if (user) setProfile({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    if (society) {
      setSoc({
        name: society.name || '', address: society.address || '',
        city: society.city || '', state: society.state || '',
        pincode: society.pincode || '', totalFlats: society.totalFlats || '',
        description: society.description || '',
        registrationNumber: society.registrationNumber || '',
        establishedYear: society.establishedYear || '',
      });
      if (society.bankDetails) setBank(b => ({ ...b, ...society.bankDetails }));
    }
  }, [society]);

  useEffect(() => {
    API.get('/wings').then(({ data }) => setWings(data.wings)).catch(() => {});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return toast.error('Name is required');
    setProfileSaving(true);
    try {
      await API.put('/auth/profile', profile);
      await refresh();
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setProfileSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.newPwd.length < 6)        return toast.error('Password must be at least 6 characters');
    if (pwd.newPwd !== pwd.confirm)   return toast.error('Passwords do not match');
    setPwdSaving(true);
    try {
      await API.put('/auth/change-password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
      toast.success('Password changed!');
      setPwd({ current:'', newPwd:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setPwdSaving(false); }
  };

  const saveSociety = async (e) => {
    e.preventDefault();
    setSocSaving(true);
    try {
      await API.put('/society/update', soc);
      toast.success('Society details updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSocSaving(false); }
  };

  const saveBank = async (e) => {
    e.preventDefault();
    if (!bank.accountHolderName || !bank.accountNumber || !bank.ifscCode || !bank.bankName)
      return toast.error('Fill all required bank fields');
    setBankSaving(true);
    try {
      await API.put('/society/bank-details', bank);
      toast.success('Bank details updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setBankSaving(false); }
  };

  const addWing = async (e) => {
    e.preventDefault();
    if (!newWing.name.trim()) return toast.error('Wing name is required');
    setWingSaving(true);
    try {
      const { data } = await API.post('/wings', newWing);
      setWings(prev => [...prev, data.wing]);
      setNewWing({ name:'', totalFlats:'', floors:'' });
      toast.success(`Wing ${data.wing.name} added!`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setWingSaving(false); }
  };

  const activeMembership = user?.societies?.find(s => s.societyId?.toString() === user?.activeSocietyId?.toString());
  const isSA = role === 'superadmin';

  return (
    <div style={{ maxWidth:'700px' }}>
      <div className="page-hd">
        <div><h2>Settings</h2><p>Manage your profile{isSA ? ' and society details' : ''}</p></div>
      </div>

      {/* ── Personal Profile ── */}
      <Section title="Personal Profile" icon={User}>
        <form onSubmit={saveProfile}>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" required className="form-control" placeholder="John Doe"
                value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" className="form-control" placeholder="+91 98765 43210"
                value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}/>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-control" value={user?.email || ''} disabled
                style={{ background:'var(--bg-surface)', color:'var(--text-3)', cursor:'not-allowed' }}/>
              <p style={{ fontSize:'11px', color:'var(--text-3)', marginTop:'4px' }}>Email cannot be changed.</p>
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" className="form-control" value={role || ''} disabled
                style={{ background:'var(--bg-surface)', color:'var(--text-3)', cursor:'not-allowed', textTransform:'capitalize' }}/>
            </div>
          </div>
          {(activeMembership?.flatNumber || activeMembership?.wingName) && (
            <div className="grid-2">
              {activeMembership?.flatNumber && (
                <div className="form-group">
                  <label>Flat Number</label>
                  <input type="text" className="form-control" value={activeMembership.flatNumber} disabled
                    style={{ background:'var(--bg-surface)', color:'var(--text-3)', cursor:'not-allowed' }}/>
                </div>
              )}
              {activeMembership?.wingName && (
                <div className="form-group">
                  <label>Wing</label>
                  <input type="text" className="form-control" value={`Wing ${activeMembership.wingName}`} disabled
                    style={{ background:'var(--bg-surface)', color:'var(--text-3)', cursor:'not-allowed' }}/>
                </div>
              )}
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button type="submit" disabled={profileSaving} className="btn btn-primary btn-sm" style={{ gap:'6px' }}>
              <Save size={13}/>{profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Change Password ── */}
      <Section title="Change Password" icon={Lock} defaultOpen={false}>
        <form onSubmit={changePassword}>
          <div className="form-group">
            <label>Current Password *</label>
            <input type="password" required className="form-control" placeholder="Enter current password"
              value={pwd.current} onChange={e => setPwd({ ...pwd, current: e.target.value })}/>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>New Password *</label>
              <input type="password" required className="form-control" placeholder="Min 6 characters"
                value={pwd.newPwd} onChange={e => setPwd({ ...pwd, newPwd: e.target.value })}/>
            </div>
            <div className="form-group">
              <label>Confirm New Password *</label>
              <input type="password" required className="form-control" placeholder="Repeat new password"
                value={pwd.confirm} onChange={e => setPwd({ ...pwd, confirm: e.target.value })}/>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button type="submit" disabled={pwdSaving} className="btn btn-primary btn-sm" style={{ gap:'6px' }}>
              <Lock size={13}/>{pwdSaving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Society Details — superadmin only ── */}
      {isSA && (
        <>
          <Section title="Society Details" icon={Building2}>
            <form onSubmit={saveSociety}>
              <div className="form-group">
                <label>Society Name *</label>
                <input type="text" required className="form-control"
                  value={soc.name} onChange={e => setSoc({ ...soc, name: e.target.value })}/>
              </div>
              <div className="form-group">
                <label>Address *</label>
                <textarea rows={2} required className="form-control"
                  value={soc.address} onChange={e => setSoc({ ...soc, address: e.target.value })}/>
              </div>
              <div className="grid-3">
                {[['city','City'],['state','State'],['pincode','Pincode']].map(([k, l]) => (
                  <div className="form-group" key={k}>
                    <label>{l} *</label>
                    <input type="text" required className="form-control"
                      value={soc[k]} onChange={e => setSoc({ ...soc, [k]: e.target.value })}/>
                  </div>
                ))}
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label>Total Flats</label>
                  <input type="number" min={1} className="form-control"
                    value={soc.totalFlats} onChange={e => setSoc({ ...soc, totalFlats: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label>Established Year</label>
                  <input type="number" className="form-control" placeholder="2010"
                    value={soc.establishedYear} onChange={e => setSoc({ ...soc, establishedYear: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label>Registration No.</label>
                  <input type="text" className="form-control" placeholder="RWA-2010-001"
                    value={soc.registrationNumber} onChange={e => setSoc({ ...soc, registrationNumber: e.target.value })}/>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} className="form-control"
                  value={soc.description} onChange={e => setSoc({ ...soc, description: e.target.value })}/>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button type="submit" disabled={socSaving} className="btn btn-primary btn-sm" style={{ gap:'6px' }}>
                  <Save size={13}/>{socSaving ? 'Saving...' : 'Save Society Details'}
                </button>
              </div>
            </form>
          </Section>

          {/* ── Bank Details ── */}
          <Section title="Bank Details" icon={CreditCard} defaultOpen={false}>
            <div style={{ background:'var(--primary-bg)', border:'1px solid var(--primary-border)', borderRadius:'7px', padding:'10px 13px', marginBottom:'16px', fontSize:'12.5px', color:'var(--primary)' }}>
                Residents' maintenance payments are collected into this account via Cashfree.
            </div>
            <form onSubmit={saveBank}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Account Holder Name *</label>
                  <input type="text" required className="form-control" placeholder="Sunrise Residency RWA"
                    value={bank.accountHolderName} onChange={e => setBank({ ...bank, accountHolderName: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label>Bank Name *</label>
                  <input type="text" required className="form-control" placeholder="SBI / HDFC / ICICI"
                    value={bank.bankName} onChange={e => setBank({ ...bank, bankName: e.target.value })}/>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Account Number *</label>
                  <input type="text" required className="form-control" placeholder="1234567890"
                    value={bank.accountNumber} onChange={e => setBank({ ...bank, accountNumber: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label>IFSC Code *</label>
                  <input type="text" required className="form-control" placeholder="SBIN0001234"
                    value={bank.ifscCode} onChange={e => setBank({ ...bank, ifscCode: e.target.value.toUpperCase() })}/>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Branch Name</label>
                  <input type="text" className="form-control" placeholder="Navrangpura Branch"
                    value={bank.branchName} onChange={e => setBank({ ...bank, branchName: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label>Account Type</label>
                  <select className="form-control" value={bank.accountType} onChange={e => setBank({ ...bank, accountType: e.target.value })}>
                    <option value="current">Current</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>UPI ID (optional)</label>
                <input type="text" className="form-control" placeholder="societyname@upi"
                  value={bank.upiId} onChange={e => setBank({ ...bank, upiId: e.target.value })}/>
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button type="submit" disabled={bankSaving} className="btn btn-primary btn-sm" style={{ gap:'6px' }}>
                  <Save size={13}/>{bankSaving ? 'Saving...' : 'Save Bank Details'}
                </button>
              </div>
            </form>
          </Section>

          {/* ── Wings ── */}
          { false && <Section style={{ display: 'none'}} title="Wings / Blocks" icon={Building2} defaultOpen={false}>
            {wings.length > 0 && (
              <div style={{ marginBottom:'16px' }}>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Wing</th><th>Flats</th><th>Floors</th><th>Admins</th></tr></thead>
                    <tbody>
                      {wings.map(w => (
                        <tr key={w._id}>
                          <td style={{ fontWeight:600 }}>Wing {w.name}</td>
                          <td style={{ color:'var(--text-2)' }}>{w.totalFlats || '—'}</td>
                          <td style={{ color:'var(--text-2)' }}>{w.floors || '—'}</td>
                          <td>
                            <span style={{ fontSize:'12px', color: w.admins?.length >= 3 ? 'var(--danger)' : 'var(--text-3)' }}>
                              {w.admins?.length || 0}/3 admins
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div style={{ borderTop: wings.length > 0 ? '1px solid var(--border)' : 'none', paddingTop: wings.length > 0 ? '14px' : 0 }}>
              <p style={{ fontSize:'12px', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:'12px' }}>Add New Wing</p>
              <form onSubmit={addWing}>
                <div className="grid-3">
                  <div className="form-group">
                    <label>Wing Name *</label>
                    <input type="text" required className="form-control" placeholder="A"
                      value={newWing.name} onChange={e => setNewWing({ ...newWing, name: e.target.value })}/>
                  </div>
                  <div className="form-group">
                    <label>Total Flats</label>
                    <input type="number" min={1} className="form-control" placeholder="40"
                      value={newWing.totalFlats} onChange={e => setNewWing({ ...newWing, totalFlats: e.target.value })}/>
                  </div>
                  <div className="form-group">
                    <label>Floors</label>
                    <input type="number" min={1} className="form-control" placeholder="10"
                      value={newWing.floors} onChange={e => setNewWing({ ...newWing, floors: e.target.value })}/>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button type="submit" disabled={wingSaving} className="btn btn-primary btn-sm" style={{ gap:'6px' }}>
                    <Plus size={13}/>{wingSaving ? 'Adding...' : 'Add Wing'}
                  </button>
                </div>
              </form>
            </div>
          </Section> }
        </>
      )}
    </div>
  );
}