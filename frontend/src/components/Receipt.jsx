import React, { useRef } from 'react';
import { Building2, X, Download, Printer, Mail } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import societylogo from '../../assets/societynestlogo.png';

export default function Receipt({ bill, paymentId, societyName, onClose }) {
  const ref = useRef();
  // console.log('Rendering Receipt with bill:', bill, 'paymentId:', paymentId);

  const handleDownload = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf().set({
        margin: 8,
        filename: `Receipt_${bill.billMonth}_${bill.billYear}_${paymentId.slice(-8).toUpperCase()}.pdf`,
        image: { type:'jpeg', quality:0.98 },
        html2canvas: { scale:2, backgroundColor:'#ffffff', useCORS:true },
        jsPDF: { unit:'mm', format:'a5', orientation:'portrait' },
      }).from(ref.current).save();
      toast.success('Receipt downloaded!');
    } catch (err) { toast.error('Download failed: '+err.message); }
  };

  // const handlePrint = () => {
  //   const w = window.open('','_blank');
  //   w.document.write(`<html><head><style>
  //     *{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:20px;background:#fff;color:#1e293b}
  //     .hd{background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px;text-align:center;border-radius:12px 12px 0 0;color:white;margin-bottom:0}
  //     .hd h2{font-size:20px;margin:0}.hd p{font-size:12px;opacity:0.8;margin-top:4px}
  //     .badge{display:inline-block;background:rgba(255,255,255,0.2);padding:4px 14px;border-radius:20px;font-size:11px;margin-top:10px}
  //     .amt{text-align:center;padding:20px;border-bottom:1px dashed #e2e8f0}
  //     .amt .n{font-size:40px;font-weight:800;color:#6366f1}.amt .l{font-size:12px;color:#94a3b8;margin-top:4px}
  //     .rows{padding:16px 20px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px}
  //     .row .k{color:#94a3b8}.row .v{font-weight:500;color:#1e293b}
  //     .ft{background:#f8fafc;padding:14px 20px;text-align:center;border-radius:0 0 12px 12px}
  //     .ft p{color:#94a3b8;font-size:11px}
  //     .card{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;max-width:400px;margin:0 auto}
  //   </style></head><body>`);
  //   w.document.write(ref.current.innerHTML);
  //   w.document.write('</body></html>');
  //   w.document.close();
  //   w.focus(); w.print(); w.close();
  //   toast.success('Sent to printer!');
  // };

  const rows = [
    ['Receipt No.',  '#' + paymentId.slice(-10).toUpperCase()],
    ['Society',      societyName || 'SocietyNest'],
    ['Resident',     bill.residentId?.name || bill.residentName || '—'],
    ['Flat / Wing',  `${bill.flatNumber||'—'} / Wing ${bill.wing||'—'}`],
    ['Bill',         bill.title],
    ['Period',       `${bill.billMonth} ${bill.billYear}`],
    ['Payment ID',   paymentId],
    ['Date & Time',  new Date(bill.paidAt).toLocaleString('en-IN')],
    ['Mode',         'Online (Razorpay)'],
    ['Status',       '✅ PAID'],
  ];

  return (
    <div className="overlay">
      <div className="modal modal-sm" style={{ maxWidth:'440px' }}>
        <div className="modal-hd">
          <h3>Payment Receipt</h3>
          <button onClick={onClose} className="btn btn-icon btn-ghost"><X size={18}/></button>
        </div>

        {/* Printable area */}
        <div ref={ref} style={{ background:'white',borderRadius:'12px',overflow:'hidden',color:'#1e293b' }}>
          <div style={{ background:'linear-gradient(135deg, #b0b1e9, #6128d1)',padding:'24px',textAlign:'center',color:'white' }}>
            <img src={societylogo} alt="SocietyNest Logo" style={{width:'40%', height:'50%'}}/>
            <h2 style={{ fontSize:'18px',fontFamily:'sans-serif',margin:0 }}>{societyName || 'SocietyNest'}</h2>
            <p style={{ fontSize:'12px',opacity:0.8,margin:'3px 0 0' }}>Official Payment Receipt</p>
            <span style={{ display:'inline-block',background:'rgba(255,255,255,0.2)',padding:'3px 12px',borderRadius:'20px',fontSize:'11px',marginTop:'8px' }}>
              ✅ Payment Successful
            </span>
          </div>
          <div style={{ textAlign:'center',padding:'18px 20px',borderBottom:'1px dashed #e2e8f0' }}>
            <div style={{ fontSize:'38px',fontWeight:800,color:'#6366f1',fontFamily:'sans-serif' }}>₹{bill.totalAmount?.toLocaleString('en-IN')}</div>
            <div style={{ fontSize:'12px',color:'#94a3b8',marginTop:'4px' }}>{bill.title} — {bill.billMonth} {bill.billYear}</div>
          </div>
          <div style={{ padding:'12px 18px' }}>
            {rows.map(([k,v]) => (
              <div key={k} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid #f1f5f9',fontSize:'12px' }}>
                <span style={{ color:'#94a3b8' }}>{k}</span>
                <span style={{ fontWeight:600,color:'#1e293b',textAlign:'right',maxWidth:'220px',wordBreak:'break-all',fontSize:'11px' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background:'#f8fafc',padding:'12px 18px',textAlign:'center' }}>
            <p style={{ color:'#94a3b8',fontSize:'11px' }}>Computer-generated receipt. No signature required.</p>
            <p style={{ color:'#cbd5e1',fontSize:'10px',marginTop:'3px' }}>Generated by SocietyNest · {new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginTop:'18px' }}>
          <button onClick={handleDownload} className="btn btn-primary btn-sm" style={{ justifyContent:'center',flexDirection:'column',gap:'3px',padding:'10px' }}>
            <Download size={15}/><span style={{ fontSize:'11px' }}>Download</span>
          </button>
          {/* <button onClick={handlePrint} className="btn btn-ghost btn-sm" style={{ justifyContent:'center',flexDirection:'column',gap:'3px',padding:'10px' }}>
            <Printer size={15}/><span style={{ fontSize:'11px' }}>Print</span>
          </button> */}
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ justifyContent:'center',flexDirection:'column',gap:'3px',padding:'10px' }}>
            <X size={15}/><span style={{ fontSize:'11px' }}>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}