import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

export function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const txnid     = params.get('txnid');
  const payid     = params.get('payid');
  const mode      = params.get('mode');

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
      <div className="card" style={{ maxWidth:'400px', width:'100%', textAlign:'center', padding:'36px' }}>
        <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'var(--success-bg)', border:'1px solid var(--success-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
          <CheckCircle size={28} color="var(--success)"/>
        </div>
        <h2 style={{ fontSize:'18px', marginBottom:'8px' }}>Payment Successful!</h2>
        <p style={{ color:'var(--text-3)', fontSize:'13px', lineHeight:1.7, marginBottom:'20px' }}>
          Your maintenance payment has been received. A receipt has been sent to your registered email.
        </p>
        {payid && (
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'7px', padding:'12px 14px', marginBottom:'20px', textAlign:'left' }}>
            {[
              ['Transaction ID', payid],
              ['Reference',      txnid],
              ['Payment Mode',   mode?.toUpperCase()],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:'12.5px', marginBottom:'5px' }}>
                <span style={{ color:'var(--text-3)' }}>{label}</span>
                <span style={{ fontWeight:600, color:'var(--text)', fontFamily:'monospace', fontSize:'12px' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary w-full" style={{ justifyContent:'center' }}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export function PaymentFailure() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const reason    = params.get('reason') || '';
  const txnid     = params.get('txnid');

  const getMessage = () => {
    if (reason === 'hash_mismatch') return 'Payment could not be verified. Please contact support.';
    if (reason === 'bill_not_found') return 'Bill record not found. Please contact support.';
    if (reason === 'payment_failed') return 'Your payment was declined. No amount has been deducted.';
    if (reason) return decodeURIComponent(reason);
    return 'Your payment was not completed. No amount has been deducted.';
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px' }}>
      <div className="card" style={{ maxWidth:'400px', width:'100%', textAlign:'center', padding:'36px' }}>
        <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'var(--danger-bg)', border:'1px solid var(--danger-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
          <XCircle size={28} color="var(--danger)"/>
        </div>
        <h2 style={{ fontSize:'18px', marginBottom:'8px' }}>Payment Failed</h2>
        <p style={{ color:'var(--text-3)', fontSize:'13px', lineHeight:1.7, marginBottom:'20px' }}>
          {getMessage()}
        </p>
        {txnid && (
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'7px', padding:'10px 14px', marginBottom:'18px', fontSize:'12px', color:'var(--text-3)' }}>
            Reference: <strong style={{ color:'var(--text)', fontFamily:'monospace' }}>{txnid}</strong>
          </div>
        )}
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:'center' }}>
            Dashboard
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:'center' }}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}