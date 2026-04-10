import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import API from '../../api/axios';
import {
  LayoutDashboard, DollarSign, Bell, CreditCard, Megaphone,
  MessageSquare, Home, Shield, Users, LogOut, Menu, X,
  Building2, Clock, CheckCircle, Sun, Moon, Settings
} from 'lucide-react';

import ExpenseManagement      from './sections/ExpenseManagement';
import NoticeManagement       from './sections/NoticeManagement';
import ComplaintManagement    from './sections/ComplaintManagement';
import BillManagement         from './sections/BillManagement';
import VisitorManagement      from './sections/VisitorManagement';
import RentalManagement       from './sections/RentalManagement';
import ProfileSettings       from './sections/ProfileSettings';
import MemberManagement       from './sections/MemberManagement';
import AnnouncementManagement from './sections/AnnouncementManagement';

const NAV = [
  { key:'overview',      label:'Overview',        icon:LayoutDashboard, roles:['superadmin','wing_admin','resident','guard'] },
  { key:'expenses',      label:'Expenses',         icon:DollarSign,     roles:['superadmin','wing_admin','resident'] },
  { key:'notices',       label:'Notices',          icon:Bell,           roles:['superadmin','wing_admin','resident','guard'] },
  { key:'announcements', label:'Announcements',    icon:Megaphone,      roles:['superadmin','wing_admin','resident','guard'] },
  { key:'complaints',    label:'Complaints',       icon:MessageSquare,  roles:['superadmin','wing_admin','resident'] },
  { key:'bills',         label:'Bills & Payments', icon:CreditCard,     roles:['superadmin','wing_admin','resident'] },
  { key:'visitors',      label:'Visitors',         icon:Shield,         roles:['superadmin','wing_admin','guard', 'resident'] },
  { key:'rentals',       label:'Rental Flats',     icon:Home,           roles:['superadmin','wing_admin','resident','guard'] },
  { key:'members',       label:'Members',          icon:Users,          roles:['superadmin','wing_admin'] },
  { key:'settings',      label:'Settings',         icon:Settings,       roles:['superadmin','wing_admin','resident','guard'] },
];

// Wing scope tabs for residents
export default function Dashboard() {
  const { user, role, logout, activeMembership } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [tab,     setTab]     = useState('overview');
  const [mobile,  setMobile]  = useState(false);
  const [society, setSociety] = useState(null);
  const [stats,   setStats]   = useState({});
  // Wing scope — for residents: 'wing' shows their wing data, 'society' shows all


  useEffect(() => {
    if (user?.activeSocietyId && activeMembership?.isApproved) {
      API.get('/society/my').then(({ data }) => setSociety(data.society)).catch(() => {});
      loadStats();
    }
  }, [user, activeMembership]);

  const loadStats = async () => {
    try {
      const [e, c, v, b] = await Promise.allSettled([
        API.get('/expenses'), API.get('/complaints'),
        API.get('/visitors'), API.get('/bills'),
      ]);
      setStats({
        expenses:       e.value?.data?.total || 0,
        openComplaints: c.value?.data?.complaints?.filter(x => x.status === 'pending')?.length || 0,
        visitorsInside: v.value?.data?.visitors?.filter(x => x.status === 'inside')?.length || 0,
        pendingBills:   b.value?.data?.bills?.filter(x => x.status === 'pending')?.length || 0,
      });
    } catch {}
  };

  const navItems = NAV.filter(n => n.roles.includes(role));

  // Pass scope context to sections so they can filter accordingly
  const sectionProps = { society };

  const renderContent = () => {
    if (!activeMembership?.isApproved) return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
        <div style={{ textAlign:'center', maxWidth:'340px' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'16px', background:'var(--warning-bg)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Clock size={28} color="var(--warning)"/>
          </div>
          <h2 style={{ fontSize:'18px', marginBottom:'8px' }}>Awaiting Approval</h2>
          <p style={{ color:'var(--text-3)', fontSize:'13px', lineHeight:1.7 }}>Your account is pending admin approval. You will get full access once approved.</p>
        </div>
      </div>
    );
    if (!user?.activeSocietyId) return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
        <div style={{ textAlign:'center', maxWidth:'320px' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'16px', background:'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Building2 size={28} color="var(--primary)"/>
          </div>
          <h2 style={{ fontSize:'18px', marginBottom:'8px' }}>No Society Linked</h2>
          <p style={{ color:'var(--text-3)', fontSize:'13px', marginBottom:'20px', lineHeight:1.7 }}>Create a society or join one using a society code.</p>
          <div style={{ display:'flex', gap:'9px', justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={() => navigate('/create-society')} className="btn btn-primary">Create Society</button>
            <button onClick={() => navigate('/join-society')}   className="btn btn-ghost">Join Society</button>
          </div>
        </div>
      </div>
    );

    switch (tab) {
      case 'expenses':      return <ExpenseManagement      {...sectionProps}/>;
      case 'notices':       return <NoticeManagement       {...sectionProps}/>;
      case 'announcements': return <AnnouncementManagement {...sectionProps}/>;
      case 'complaints':    return <ComplaintManagement    {...sectionProps}/>;
      case 'bills':         return <BillManagement         {...sectionProps}/>;
      case 'visitors':      return <VisitorManagement      {...sectionProps}/>;
      case 'rentals':       return <RentalManagement       {...sectionProps}/>;
      case 'members':       return <MemberManagement       {...sectionProps}/>;
      case 'settings':      return <ProfileSettings {...sectionProps}/>;
      default:              return <Overview user={user} role={role} society={society} stats={stats} setTab={setTab} activeMembership={activeMembership}/>;
    }
  };

  const rc = { superadmin:'var(--primary)', wing_admin:'#7c3aed', resident:'var(--success)', guard:'var(--warning)' };

  return (
    <div className="app-shell">
      {mobile && <div className="sidebar-overlay" onClick={() => setMobile(false)}/>}

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar${mobile ? ' open' : ''}`}>
        <div style={{ padding:'14px 12px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'30px', height:'30px', borderRadius:'7px', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Building2 size={15} color="#fff"/>
            </div>
            <div style={{ minWidth:0 }}>
              <div className="truncate" style={{ fontSize:'13px', fontWeight:700, color:'var(--text)' }}>{society?.name || 'SocietyNest'}</div>
              {society?.societyCode && <div style={{ fontSize:'10px', color:'var(--primary)', fontWeight:700, letterSpacing:'1.5px' }}>{society.societyCode}</div>}
            </div>
          </div>
        </div>

        <div style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)', marginBottom:'4px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:`${rc[role] || 'var(--primary)'}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:rc[role] || 'var(--primary)', flexShrink:0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <div className="truncate" style={{ fontSize:'12.5px', fontWeight:600, color:'var(--text)' }}>{user?.name}</div>
              <div style={{ fontSize:'10.5px', color:rc[role] || 'var(--primary)', textTransform:'capitalize', fontWeight:600 }}>
                {role}{activeMembership?.flatNumber ? ` · ${activeMembership.flatNumber}` : ''}
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex:1, overflowY:'auto', padding:'4px 7px' }}>
          {navItems.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setTab(key); setMobile(false); }}
              className={`nav-item${tab === key ? ' active' : ''}`}>
              <Icon size={15}/>{label}
            </button>
          ))}
        </nav>

        <div style={{ padding:'6px 7px', borderTop:'1px solid var(--border)' }}>
          {/* Theme toggle in sidebar */}
          <button onClick={toggle} className="nav-item" style={{ justifyContent:'space-between' }}>
            <span style={{ display:'flex', alignItems:'center', gap:'9px' }}>
              {isDark ? <Sun size={15}/> : <Moon size={15}/>}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
            <div style={{ width:'30px', height:'16px', borderRadius:'8px', background: isDark ? 'var(--primary)' : 'var(--border)', position:'relative', transition:'background 0.2s' }}>
              <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#fff', position:'absolute', top:'2px', left: isDark ? '16px' : '2px', transition:'left 0.2s' }}/>
            </div>
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="nav-item" style={{ color:'var(--danger)' }}>
            <LogOut size={15}/>Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-area">
        <div className="topbar">
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <button onClick={() => setMobile(v => !v)} className="btn btn-icon btn-ghost btn-sm" style={{ display:'none' }} id="mobile-menu-btn">
              <Menu size={17}/>
            </button>
            <h1 style={{ fontSize:'14.5px', fontWeight:600, color:'var(--text)' }}>
              {NAV.find(n => n.key === tab)?.label || 'Dashboard'}
            </h1>
          </div>
          {society && (
            <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'12px', color:'var(--text-3)' }} className="hide-mobile">
              <Building2 size={12} color="var(--primary)"/>
              <span>{society.name}</span>
              {activeMembership?.wingName && <><span>·</span><span style={{ color:'var(--primary)', fontWeight:500 }}>Wing {activeMembership.wingName}</span></>}
            </div>
          )}
        </div>

        <div className="content-area">
          {renderContent()}
        </div>
      </div>
      <style>{`#mobile-menu-btn{display:flex}@media(min-width:769px){#mobile-menu-btn{display:none!important}}`}</style>
    </div>
  );
}

function Overview({ user, role, society, stats, setTab, activeMembership }) {
  const rc = { superadmin:'var(--primary)', wing_admin:'#7c3aed', resident:'var(--success)', guard:'var(--warning)' };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const allCards = {
    superadmin: [
      { label:'Total Expenses',   val:`₹${(stats.expenses||0).toLocaleString('en-IN')}`, color:'var(--primary)',  icon:DollarSign,    tab:'expenses' },
      { label:'Open Complaints',  val:stats.openComplaints||0,                           color:'var(--danger)',   icon:MessageSquare, tab:'complaints' },
      { label:'Visitors Inside',  val:stats.visitorsInside||0,                           color:'var(--success)',  icon:Shield,        tab:'visitors' },
      { label:'Pending Bills',    val:stats.pendingBills||0,                             color:'var(--warning)',  icon:CreditCard,    tab:'bills' },
    ],
    wing_admin: [
      { label:'Open Complaints',  val:stats.openComplaints||0, color:'var(--danger)',  icon:MessageSquare, tab:'complaints' },
      { label:'Pending Bills',    val:stats.pendingBills||0,   color:'var(--warning)', icon:CreditCard,    tab:'bills' },
      { label:'Visitors Inside',  val:stats.visitorsInside||0, color:'var(--success)', icon:Shield,        tab:'visitors' },
    ],
    resident: [
      { label:'Pending Bills',    val:stats.pendingBills||0,   color:'var(--warning)', icon:CreditCard,    tab:'bills' },
      { label:'My Complaints',    val:stats.openComplaints||0, color:'var(--danger)',  icon:MessageSquare, tab:'complaints' },
    ],
    guard: [
      { label:'Visitors Inside',  val:stats.visitorsInside||0, color:'var(--success)', icon:Shield, tab:'visitors' },
    ],
  };

  const quickActions = {
    superadmin: [
      { label:'Add Expense',     color:'var(--primary)', tab:'expenses',      emoji:'💰' },
      { label:'Issue Notice',    color:'var(--warning)', tab:'notices',       emoji:'🔔' },
      { label:'Issue Bill',      color:'var(--success)', tab:'bills',         emoji:'💳' },
      { label:'Complaints',      color:'var(--danger)',  tab:'complaints',    emoji:'📋' },
      { label:'Approve Members', color:'#7c3aed',        tab:'members',       emoji:'👥' },
      { label:'Announcements',   color:'var(--info)',    tab:'announcements', emoji:'📢' },
    ],
    wing_admin: [
      { label:'Add Expense',  color:'var(--primary)', tab:'expenses',   emoji:'💰' },
      { label:'Issue Bill',   color:'var(--success)', tab:'bills',      emoji:'💳' },
      { label:'Complaints',   color:'var(--danger)',  tab:'complaints', emoji:'📋' },
      { label:'Members',      color:'#7c3aed',        tab:'members',    emoji:'👥' },
    ],
    resident: [
      { label:'Pay Bills',       color:'var(--success)', tab:'bills',         emoji:'💳' },
      { label:'Raise Complaint', color:'var(--danger)',  tab:'complaints',    emoji:'📋' },
      { label:'Notices',         color:'var(--primary)', tab:'notices',       emoji:'🔔' },
      { label:'Rental Flats',    color:'#7c3aed',        tab:'rentals',       emoji:'🏠' },
    ],
    guard: [
      { label:'Log Visitor',  color:'var(--success)', tab:'visitors', emoji:'🚶' },
      { label:'View Notices', color:'var(--primary)', tab:'notices',  emoji:'🔔' },
      { label:'Rental Flats', color:'var(--warning)', tab:'rentals',  emoji:'🏠' },
    ],
  };

  const cards   = allCards[role]   || [];
  const actions = quickActions[role] || [];

  return (
    <div>
      {/* Welcome */}
      <div style={{ padding:'20px 22px', borderRadius:'10px', marginBottom:'18px', background:'var(--bg-card)', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)' }}>
        <h2 style={{ fontSize:'16px', marginBottom:'4px' }}>{greeting}, {user?.name?.split(' ')[0]}! 👋</h2>
        <p style={{ color:'var(--text-3)', fontSize:'12.5px', display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
          <span style={{ color:rc[role], fontWeight:600, textTransform:'capitalize', background:`${rc[role]}18`, padding:'2px 9px', borderRadius:'20px', fontSize:'11.5px' }}>{role}</span>
          {activeMembership?.flatNumber && <span>Flat {activeMembership.flatNumber}</span>}
          {activeMembership?.wingName   && <span>· Wing {activeMembership.wingName}</span>}
          {society && <span>· {society.name}</span>}
        </p>
      </div>

      {/* Stats */}
      {cards.length > 0 && (
        <div className={`grid-${Math.min(cards.length, 4)} mb-4`}>
          {cards.map(({ label, val, color, icon: Icon, tab }) => (
            <div key={label} className="stat-card card-hover" onClick={() => setTab(tab)}>
              <div className="stat-icon" style={{ background:`${color}15` }}><Icon size={18} color={color}/></div>
              <div className="stat-info"><h3>{val}</h3><p>{label}</p></div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {actions.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize:'11px', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'13px', fontWeight:700 }}>Quick Actions</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:'9px' }}>
            {actions.map(({ label, color, tab, emoji }) => (
              <button key={label} onClick={() => setTab(tab)} style={{
                padding:'13px 10px', borderRadius:'9px',
                background:'var(--bg-surface)', border:'1px solid var(--border)',
                cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'7px',
                color:'var(--text-2)', fontSize:'12px', fontWeight:500, transition:'all 0.16s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = `${color}10`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'var(--bg-surface)'; }}>
                <span style={{ fontSize:'18px' }}>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}