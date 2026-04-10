import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Building2, LogOut, ChevronDown, Plus, Sun, Moon, Menu, LayoutDashboard } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import societylogo from '../../assets/societynestlogo.png'

export default function Navbar({ onMenuClick }) {
  const { user, logout, switchSociety, role } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [userDrop, setUserDrop]       = useState(false);
  const [societyDrop, setSocietyDrop] = useState(false);
  const [societies, setSocieties]     = useState([]);
  const uRef = useRef(); const sRef = useRef();

  useEffect(() => {
    const fn = e => {
      if (uRef.current && !uRef.current.contains(e.target)) setUserDrop(false);
      if (sRef.current && !sRef.current.contains(e.target)) setSocietyDrop(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (user && societyDrop)
      API.get('/society/list').then(({ data }) => setSocieties(data.societies)).catch(() => {});
  }, [societyDrop, user]);

  const handleSwitch = async id => {
    try { await switchSociety(id); setSocietyDrop(false); navigate('/dashboard'); }
    catch { toast.error('Switch failed'); }
  };

  const activeSoc = user?.societies?.find(s => s.societyId?.toString() === user?.activeSocietyId?.toString());

  const dropStyle = {
    position:'absolute', right:0, top:'calc(100% + 6px)', minWidth:'200px',
    background:'var(--bg-card)', border:'1px solid var(--border)',
    borderRadius:'var(--radius)', boxShadow:'var(--shadow-lg)', zIndex:600, overflow:'hidden',
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:'1px', textDecoration:'none' }}>
        <div style={{ width:'80px', height:'90px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {/* <Building2 size={16} color="#fff" strokeWidth={2}/> */}
          <img src={societylogo} alt="SocietyNest Logo" style={{width:'100%', height:'100%'}}/>
        </div>
        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'18px', color:'var(--text)', letterSpacing:'-0.2px' }}>
          Society<span style={{ color:'var(--primary)' }}>Nest</span>
        </span>
      </Link>

      <div style={{ flex:1 }} />

      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        {/* Theme toggle */}
        {/* <button className="theme-btn" onClick={toggle} title={isDark ? 'Light mode' : 'Dark mode'}>
          {isDark ? <Sun size={14}/> : <Moon size={14}/>}
        </button> */}

        {user ? (
          <>
            {/* Mobile menu */}
            {onMenuClick && (
              <button className="theme-btn" onClick={onMenuClick}><Menu size={15}/></button>
            )}

            {/* Society switcher */}
            {user.activeSocietyId && (
              <div style={{ position:'relative' }} ref={sRef}>
                <button onClick={() => setSocietyDrop(v => !v)} style={{
                  display:'flex', alignItems:'center', gap:'6px', padding:'5px 10px',
                  background:'var(--bg-surface)', border:'1px solid var(--border)',
                  borderRadius:'6px', color:'var(--text-2)', cursor:'pointer',
                  fontSize:'12.5px', fontWeight:500, transition:'all 0.13s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Building2 size={12} color="var(--primary)"/>
                  <span className="hide-mobile" style={{ maxWidth:'110px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {activeSoc?.wingName ? `Wing ${activeSoc.wingName}` : 'My Society'}
                  </span>
                  <ChevronDown size={11}/>
                </button>

                {societyDrop && (
                  <div style={dropStyle}>
                    <div style={{ padding:'8px 12px', fontSize:'10.5px', fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid var(--border)' }}>
                      Your Societies
                    </div>
                    {societies.map(s => {
                      const isActive = s._id === user.activeSocietyId?.toString();
                      return (
                        <button key={s._id} onClick={() => handleSwitch(s._id)} style={{
                          width:'100%', padding:'9px 12px', background: isActive ? 'var(--primary-bg)' : 'none',
                          border:'none', display:'flex', alignItems:'center', justifyContent:'space-between',
                          color:'var(--text)', cursor:'pointer', fontSize:'13px', textAlign:'left',
                        }}
                          onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'var(--bg-hover)')}
                          onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'none')}
                        >
                          <div>
                            <div style={{ fontWeight:500 }}>{s.name}</div>
                            <div style={{ fontSize:'11px', color:'var(--text-3)' }}>{s.city} · {s.membership?.role}</div>
                          </div>
                          {isActive && <span style={{ fontSize:'10px', color:'var(--primary)', fontWeight:700, background:'var(--primary-bg)', padding:'1px 6px', borderRadius:'3px', border:'1px solid var(--primary-border)' }}>Active</span>}
                        </button>
                      );
                    })}
                    <div style={{ borderTop:'1px solid var(--border)' }}>
                      <button onClick={() => { setSocietyDrop(false); navigate('/join-society'); }} style={{ width:'100%', padding:'8px 12px', background:'none', border:'none', display:'flex', alignItems:'center', gap:'7px', color:'var(--primary)', cursor:'pointer', fontSize:'12.5px', fontWeight:500 }}>
                        <Plus size={12}/> Join another society
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User dropdown */}
            <div style={{ position:'relative' }} ref={uRef}>
              <button onClick={() => setUserDrop(v => !v)} style={{
                display:'flex', alignItems:'center', gap:'7px', padding:'5px 10px',
                background:'var(--bg-surface)', border:'1px solid var(--border)',
                borderRadius:'6px', cursor:'pointer', transition:'all 0.13s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="hide-mobile" style={{ fontSize:'13px', fontWeight:500, color:'var(--text)' }}>{user.name?.split(' ')[0]}</span>
                <ChevronDown size={11} color="var(--text-3)"/>
              </button>

              {userDrop && (
                <div style={dropStyle}>
                  <div style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'13px', fontWeight:600, color:'var(--text)' }}>{user.name}</div>
                    <div style={{ fontSize:'11px', color:'var(--primary)', textTransform:'capitalize', marginTop:'1px', fontWeight:500 }}>{role || 'No society'}</div>
                  </div>
                  {[
                    { label:'Dashboard', icon:LayoutDashboard, fn:() => { navigate('/dashboard'); setUserDrop(false); } },
                  ].map(({ label, icon:Icon, fn }) => (
                    <button key={label} onClick={fn} style={{ width:'100%', padding:'8px 12px', background:'none', border:'none', display:'flex', alignItems:'center', gap:'8px', color:'var(--text-2)', cursor:'pointer', fontSize:'13px', transition:'all 0.1s' }}
                      onMouseEnter={e => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--text)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--text-2)'; }}>
                      <Icon size={13}/>{label}
                    </button>
                  ))}
                  <div style={{ borderTop:'1px solid var(--border)' }}>
                    <button onClick={() => { logout(); navigate('/'); }} style={{ width:'100%', padding:'8px 12px', background:'none', border:'none', display:'flex', alignItems:'center', gap:'8px', color:'var(--danger)', cursor:'pointer', fontSize:'13px' }}
                      onMouseEnter={e => e.currentTarget.style.background='var(--danger-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background='none'}>
                      <LogOut size={13}/>Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display:'flex', gap:'7px' }}>
            <Link to="/login"  className="btn btn-ghost  btn-sm">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}