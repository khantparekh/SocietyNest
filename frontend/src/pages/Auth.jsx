import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../assets/societynestlogo.png';

const WrapStyle = { minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 20px 40px',position:'relative',overflow:'hidden' };
const CardStyle = { background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'20px',padding:'32px',width:'100%' };
const Glow = ({ pos }) => (
  <div style={{ position:'absolute',width:'400px',height:'400px',borderRadius:'50%',background:'#6366f1',filter:'blur(120px)',opacity:0.06,...pos,pointerEvents:'none' }}/>
);

export function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ email:'',password:'' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (!user.activeSocietyId) navigate('/join-society');
      else navigate('/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={WrapStyle}>
      <Glow pos={{ top:'-5%',right:'-10%' }}/><Glow pos={{ bottom:'-5%',left:'-10%' }}/>
      <div style={{ width:'100%',maxWidth:'420px',position:'relative',zIndex:1 }}>
        <div style={{ textAlign:'center',marginBottom:'32px' }}>
          <Link to="/" style={{ display:'inline-flex',alignItems:'center',gap:'9px',marginBottom:'22px' }}>
            <div style={{ width:'40px',height:'40px',borderRadius:'11px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Building2 size={20} color="#fff"/>
            </div>
            <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'20px' }}>Society<span style={{ color:'var(--primary)' }}>Nest</span></span>
          </Link>
          <h2 style={{ fontSize:'24px',marginBottom:'6px' }}>Welcome back</h2>
          <p style={{ color:'var(--text-3)',fontSize:'13px' }}>Sign in to your account</p>
        </div>
        <div style={CardStyle}>
          <form onSubmit={submit}>
            {[
              { label:'Email', type:'email', key:'email', icon:Mail, placeholder:'you@example.com' },
            ].map(({ label, type, key, icon:Icon, placeholder }) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <div style={{ position:'relative' }}>
                  <Icon size={15} style={{ position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'var(--text-3)' }}/>
                  <input type={type} required placeholder={placeholder} className="form-control" style={{ paddingLeft:'38px' }}
                    value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})}/>
                </div>
              </div>
            ))}
            <div className="form-group">
              <label>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={15} style={{ position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'var(--text-3)' }}/>
                <input type={show?'text':'password'} required placeholder="••••••••" className="form-control" style={{ paddingLeft:'38px',paddingRight:'42px' }}
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
                <button type="button" onClick={()=>setShow(v=>!v)} style={{ position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',padding:0 }}>
                  {show?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ justifyContent:'center',padding:'12px',fontSize:'14px',marginTop:'4px' }}>
              {loading?'Signing in...':<>Sign In <ArrowRight size={15}/></>}
            </button>
          </form>
          <p style={{ textAlign:'center',marginTop:'18px',fontSize:'13px',color:'var(--text-3)' }}>
            No account? <Link to="/signup" style={{ color:'var(--primary)',fontWeight:500 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Signup() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({ name:'',email:'',password:'',phone:'' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created!');
      navigate('/join-society');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={WrapStyle}>
      <Glow pos={{ top:'-5%',left:'-10%' }}/><Glow pos={{ bottom:'-5%',right:'-10%' }}/>
      <div style={{ width:'100%',maxWidth:'440px',position:'relative',zIndex:1 }}>
        <div style={{ textAlign:'center',marginBottom:'30px' }}>
          <Link to="/" style={{ display:'inline-flex',alignItems:'center',gap:'9px',marginBottom:'20px' }}>
            <div style={{ width:'40px',height:'40px',borderRadius:'11px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Building2 size={20} color="#fff"/>
            </div>
            <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'20px' }}>Society<span style={{ color:'var(--primary)' }}>Nest</span></span>
          </Link>
          <h2 style={{ fontSize:'24px',marginBottom:'6px' }}>Create Account</h2>
          <p style={{ color:'var(--text-3)',fontSize:'13px' }}>Join your society management platform</p>
        </div>
        <div style={CardStyle}>
          <form onSubmit={submit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Full Name</label>
                <div style={{ position:'relative' }}>
                  <User size={15} style={{ position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'var(--text-3)' }}/>
                  <input type="text" required placeholder="John Doe" className="form-control" style={{ paddingLeft:'38px' }}
                    value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <div style={{ position:'relative' }}>
                  <Phone size={15} style={{ position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'var(--text-3)' }}/>
                  <input type="tel" required placeholder="+91 98765 43210" className="form-control" style={{ paddingLeft:'38px' }}
                    value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} style={{ position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'var(--text-3)' }}/>
                <input type="email" required placeholder="you@example.com" className="form-control" style={{ paddingLeft:'38px' }}
                  value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={15} style={{ position:'absolute',left:'13px',top:'50%',transform:'translateY(-50%)',color:'var(--text-3)' }}/>
                <input type={show?'text':'password'} required placeholder="Min 6 characters" className="form-control" style={{ paddingLeft:'38px',paddingRight:'42px' }}
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
                <button type="button" onClick={()=>setShow(v=>!v)} style={{ position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'var(--text-3)',cursor:'pointer',padding:0 }}>
                  {show?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
            </div>
            <div style={{ background:'var(--primary-bg)',border:'1px solid var(--border)',borderRadius:'8px',padding:'11px 13px',marginBottom:'14px',fontSize:'12px',color:'var(--primary-light)' }}>
              💡 After registering, create a society or join one using a society code.
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ justifyContent:'center',padding:'12px',fontSize:'14px' }}>
              {loading?'Creating...':<>Create Account <ArrowRight size={15}/></>}
            </button>
          </form>
          <p style={{ textAlign:'center',marginTop:'18px',fontSize:'13px',color:'var(--text-3)' }}>
            Already have an account? <Link to="/login" style={{ color:'var(--primary)',fontWeight:500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}