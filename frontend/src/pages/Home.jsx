import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, DollarSign, Bell, CreditCard, Megaphone, MessageSquare, Home, Shield, Star, ArrowRight, Users, CheckCircle2, Zap, BarChart3 } from 'lucide-react';
import societylogo from '../../assets/societynestlogo.png';

const services = [
  { icon:DollarSign, title:'Expense Management', desc:'Wing-wise expense tracking with full transparency for every resident.', color:'#10b981' },
  { icon:Bell,        title:'Notice Board',        desc:'Targeted notices for residents, guards, or all — with priority levels.', color:'#6366f1' },
  { icon:CreditCard,  title:'Bill & Payments',     desc:'Cahsfree-powered maintenance payments with instant digital receipts.', color:'#f59e0b' },
  { icon:Megaphone,   title:'Announcements & Polls',desc:'Post events, create polls, and get real-time community responses.', color:'#ec4899' },
  { icon:MessageSquare,title:'Complaint Management',desc:'Raise and track complaints with real-time admin responses.', color:'#3b82f6' },
  { icon:Home,        title:'Rental Flats',        desc:'List, discover, and manage rental flats within your society.', color:'#8b5cf6' },
];

const reviews = [
  { name:'Rajesh Mehta',  role:'Society Admin, Mumbai',    rating:5, text:'Wing-based management changed everything. Each wing admin handles their block independently now.' },
  { name:'Priya Sharma',  role:'Resident, Bangalore',      rating:5, text:'Paid maintenance via UPI in under 30 seconds. Got the receipt on email instantly. Brilliant!' },
  { name:'Arun Kumar',    role:'Security Guard, Pune',     rating:5, text:'Logging visitors is so simple. I check notices directly on my dashboard. Very useful.' },
  { name:'Sneha Patel',   role:'Resident, Ahmedabad',      rating:4, text:'I am part of two societies now. Switching between them with one click is incredibly convenient.' },
  { name:'Vikram Singh',  role:'Wing Admin, Delhi',        rating:5, text:'As a wing admin, I manage only my block. No confusion with other wings. Perfect separation.' },
  { name:'Deepa Nair',    role:'Resident, Chennai',        rating:5, text:'The poll feature is amazing. Our RWA used it to vote on new amenities. 95% participation!' },
];

const stats = [{ n:'500+',label:'Societies'},{n:'50K+',label:'Residents'},{n:'₹2Cr+',label:'Collected'},{n:'99.9%',label:'Uptime'}];

const S = {
  section: { minHeight:'100vh',display:'flex',alignItems:'center',position:'relative',overflow:'hidden',paddingTop:'80px' },
  glow1:   { position:'absolute',width:'600px',height:'600px',borderRadius:'50%',background:'#6366f1',filter:'blur(120px)',opacity:0.07,top:'-10%',right:'-10%',pointerEvents:'none' },
  glow2:   { position:'absolute',width:'500px',height:'500px',borderRadius:'50%',background:'#8b5cf6',filter:'blur(120px)',opacity:0.06,bottom:'-10%',left:'-10%',pointerEvents:'none' },
  grid:    { position:'absolute',inset:0,opacity:0.03,backgroundImage:'linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)',backgroundSize:'52px 52px',pointerEvents:'none' },
  inner:   { position:'relative',zIndex:1,width:'100%' },
  layout:  { display:'grid',gridTemplateColumns:'1fr 1fr',gap:'60px',alignItems:'center' },
  pill:    { display:'inline-flex',alignItems:'center',gap:'7px',padding:'5px 14px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'20px',fontSize:'12px',color:'#818cf8',marginBottom:'18px',fontWeight:600 },
  h1:      { fontSize:'clamp(34px,5vw,58px)',lineHeight:1.08,letterSpacing:'-1.5px',marginBottom:'18px' },
  grad:    { background:'linear-gradient(135deg, #3e2687 0%,#818cf8 60%,#8b5cf6 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text' },
  sub:     { fontSize:'16px',color:'#94a3b8',lineHeight:1.7,maxWidth:'480px',marginBottom:'30px' },
  btns:    { display:'flex',gap:'14px',flexWrap:'wrap',marginBottom:'36px' },
  checks:  { display:'flex',gap:'20px',flexWrap:'wrap' },
  statBar: { display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',marginTop:'72px',background:'rgba(99,102,241,0.1)',borderRadius:'14px',overflow:'hidden',border:'1px solid rgba(99,102,241,0.12)' },
  statCell:{ padding:'22px',textAlign:'center',background:'rgba(10,10,18,0.85)' },
  visual:  { display:'flex',justifyContent:'center',alignItems:'center',position:'relative',height:'420px' },
  ring1:   { position:'absolute',inset:0,borderRadius:'50%',border:'1px solid rgba(99,102,241,0.15)',background:'radial-gradient(circle,rgba(99,102,241,0.04) 0%,transparent 70%)' },
  ring2:   { position:'absolute',inset:'32px',borderRadius:'50%',border:'1px dashed rgba(99,102,241,0.1)' },
  bldg:    { width:'130px',height:'130px',borderRadius:'28px',background:'linear-gradient(135deg,#1a1a2e,#12121e)',border:'1px solid rgba(99,102,241,0.3)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 60px rgba(99,102,241,0.2)' },
};

export default function HomePage() {
  return (
    <div style={{ minHeight:'100vh',background:'var(--bg)' }}>
      <style>{`
        .float-anim{animation:float 6s ease-in-out infinite}
        .chip{position:absolute;display:flex;align-items:center;gap:7px;padding:9px 14px;borderRadius:12px;background:#12121e;border:1px solid rgba(255,255,255,0.07);boxShadow:0 4px 16px rgba(0,0,0,0.4);fontSize:13px;fontWeight:600;color:#f1f5f9}
        .svc-card{transition:all 0.25s;cursor:default}.svc-card:hover{transform:translateY(-5px);border-color:rgba(99,102,241,0.35)!important}
        .rev-card{transition:all 0.22s}.rev-card:hover{transform:translateY(-3px)}
        @media(max-width:768px){.hero-layout{grid-template-columns:1fr!important}.hero-visual{display:none!important}.stat-bar{grid-template-columns:repeat(2,1fr)!important}.svc-grid{grid-template-columns:1fr!important}.rev-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* HERO */}
      <section style={S.section}>
        <div style={S.glow1}/><div style={S.glow2}/><div style={S.grid}/>
        <div className="container" style={S.inner}>
          <div style={S.layout} className="hero-layout">
            <div>
              <div style={S.pill}><Zap size={12}/>Professional Society Management</div>
              <h1 style={S.h1}>
                <span style={S.grad}>Managing Your</span><br/>
                Society Has Never<br/>
                Been <span style={{ color:'#6366f1' }}>This Smart</span>
              </h1>
              <p style={S.sub}>One powerful platform uniting admins, residents, and guards. Wing-based management, Cahfree payments, instant receipts — built for modern communities.</p>
              <div style={S.btns}>
                <Link to="/signup" className="btn btn-primary btn-lg" style={{ fontWeight:600 }}>Get Started Free <ArrowRight size={15}/></Link>
                <Link to="/login"  className="btn btn-ghost  btn-lg">Sign In</Link>
              </div>
              <div style={S.checks}>
                {['No credit card','5 min setup','Wing-based control'].map(t=>(
                  <div key={t} style={{ display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'#64748b' }}>
                    <CheckCircle2 size={13} color="#10b981"/>{t}
                  </div>
                ))}
              </div>
            </div>
            <div style={S.visual} className="hero-visual float-anim">
              <div style={S.ring1}/><div style={S.ring2}/>
              <div style={S.bldg}><Building2 size={56} color="#6366f1" strokeWidth={1.5}/></div>
              {[
                { label:'₹1,200 Paid', color:'#10b981', style:{top:'8%',left:'4%'} },
                { label:'Notice Issued', color:'#6366f1', style:{top:'8%',right:'4%'} },
                { label:'Wing A: 4 Complaints', color:'#f59e0b', style:{bottom:'8%',left:'4%'} },
                { label:'2 Visitors Inside', color:'#ec4899', style:{bottom:'8%',right:'4%'} },
              ].map(({ label, color, style }) => (
                <div key={label} className="chip" style={{ ...style, borderLeft:`2px solid ${color}` }}>
                  <span style={{ width:7,height:7,borderRadius:'50%',background:color,flexShrink:0 }}/>
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div style={S.statBar} className="stat-bar">
            {stats.map(({ n, label }) => (
              <div key={label} style={S.statCell}>
                <div style={{ fontFamily:'Syne,sans-serif',fontSize:'30px',fontWeight:800,color:'#6366f1' }}>{n}</div>
                <div style={{ fontSize:'12px',color:'#64748b',marginTop:'3px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{ padding:'90px 0',borderTop:'1px solid rgba(99,102,241,0.08)' }}>
        <div className="container">
          <div style={{ textAlign:'center',marginBottom:'52px' }}>
            <div style={S.pill} className="inline-flex" style2={{ margin:'0 auto 14px',display:'inline-flex' }}>
              <BarChart3 size={12}/>Our Features
            </div>
            <h2 style={{ fontSize:'clamp(26px,3.5vw,42px)',letterSpacing:'-0.5px',marginBottom:'14px' }}>Everything Your Society Needs</h2>
            <p style={{ fontSize:'15px',color:'#94a3b8',maxWidth:'440px',margin:'0 auto',lineHeight:1.7 }}>
              From wing-level management to Razorpay payments — SocietyNest covers every aspect of modern community administration.
            </p>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px' }} className="svc-grid">
            {services.map(({ icon:Icon, title, desc, color }) => (
              <div key={title} className="svc-card card" style={{ padding:'26px' }}>
                <div style={{ width:'48px',height:'48px',borderRadius:'12px',background:`${color}15`,border:`1px solid ${color}25`,
                  display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'16px' }}>
                  <Icon size={22} color={color}/>
                </div>
                <h3 style={{ fontSize:'15px',marginBottom:'8px' }}>{title}</h3>
                <p style={{ fontSize:'13px',color:'#64748b',lineHeight:1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ padding:'90px 0',borderTop:'1px solid rgba(99,102,241,0.08)' }}>
        <div className="container">
          <div style={{ textAlign:'center',marginBottom:'52px' }}>
            <h2 style={{ fontSize:'clamp(26px,3.5vw,42px)',letterSpacing:'-0.5px',marginBottom:'14px' }}>Loved by Communities</h2>
            <p style={{ fontSize:'15px',color:'#94a3b8',maxWidth:'400px',margin:'0 auto' }}>Real feedback from admins, residents, and guards using SocietyNest.</p>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px' }} className="rev-grid">
            {reviews.map(({ name, role, rating, text }, i) => (
              <div key={name} className="rev-card card" style={{ padding:'22px' }}>
                <div style={{ display:'flex',gap:'3px',marginBottom:'12px' }}>
                  {Array.from({length:5}).map((_,j)=>(
                    <Star key={j} size={13} fill={j<rating?'#f59e0b':'none'} color={j<rating?'#f59e0b':'#374151'}/>
                  ))}
                </div>
                <p style={{ fontSize:'13px',color:'#94a3b8',lineHeight:1.7,marginBottom:'16px',fontStyle:'italic' }}>"{text}"</p>
                <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                  <div style={{ width:'36px',height:'36px',borderRadius:'50%',background:`hsl(${i*55},55%,38%)`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'14px',color:'white',flexShrink:0 }}>
                    {name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize:'13px',fontWeight:600 }}>{name}</div>
                    <div style={{ fontSize:'11px',color:'#64748b' }}>{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 0' }}>
        <div className="container">
          <div style={{ background:'linear-gradient(135deg,rgba(99,102,241,0.14),rgba(139,92,246,0.1))',
            border:'1px solid rgba(99,102,241,0.22)',borderRadius:'22px',padding:'56px 40px',textAlign:'center',position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',inset:0,background:'radial-gradient(circle at 50% 50%,rgba(99,102,241,0.07) 0%,transparent 70%)',pointerEvents:'none' }}/>
            <h2 style={{ fontSize:'clamp(22px,3vw,38px)',marginBottom:'14px',position:'relative' }}>Ready to Transform Your Society?</h2>
            <p style={{ fontSize:'15px',color:'#94a3b8',marginBottom:'28px',maxWidth:'400px',margin:'0 auto 28px',position:'relative' }}>
              Join thousands of communities already using SocietyNest.
            </p>
            <Link to="/signup" className="btn btn-primary btn-lg" style={{ position:'relative',fontWeight:600 }}>
              Create Your Society <ArrowRight size={15}/>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:'1px solid rgba(99,102,241,0.1)',padding:'24px 0' }}>
        <div className="container" style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'10px',textAlign:'center' }}>
          <div style={{ display:'flex',alignItems:'center' }}>
            <div style={{ width:'70px',height:'70px',borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <img src={societylogo} alt="SocietyNest Logo" style={{width:'100%', height:'100%'}}/>
            </div>
            <span style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'18px' }}>Society<span style={{ color:'#6366f1' }}>Nest</span></span>
          </div>
          <p style={{ color:'#475569',fontSize:'12px' }}>© {new Date().getFullYear()} SocietyNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}