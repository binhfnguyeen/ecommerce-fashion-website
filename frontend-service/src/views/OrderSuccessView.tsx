import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/formatters';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import ArrowBack from '@mui/icons-material/ArrowBack';

export const OrderSuccessView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    const capturePayment = async () => {
      if (!orderId || !token) {
        setStatus('error');
        setErrorMsg('Missing order parameters. Cannot process PayPal capture.');
        return;
      }
      try {
        const orderResponse = await orderService.captureOrder(Number(orderId), token);
        setOrderDetails(orderResponse);
        setStatus('success');
      } catch (err: any) {
        console.error('Payment capture error:', err);
        setErrorMsg(err.message || 'PayPal payment capture failed. Please contact support.');
        setStatus('error');
      }
    };
    capturePayment();
  }, [orderId, token]);

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '500px', height: '500px', borderRadius: '50%',
        background: status === 'success'
          ? 'radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 70%)'
          : 'radial-gradient(ellipse, rgba(239,68,68,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Brand top */}
      <div style={{ position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AutoAwesome style={{ fontSize: '15px', color: '#fff' }} />
        </div>
        <span style={{
          fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '16px',
          background: 'linear-gradient(90deg, #c4b5fd, #f0abfc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          LUXE FASHION
        </span>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '28px', padding: '48px 40px', maxWidth: '480px', width: '100%',
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        textAlign: 'center', position: 'relative',
        animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>

        {status === 'loading' && (
          <div style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '56px', height: '56px', border: '3px solid rgba(99,102,241,0.2)',
              borderTop: '3px solid #6366f1', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
                Processing Payment
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                Verifying your transaction with PayPal. Please do not close this page.
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Success icon */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle style={{ fontSize: '44px', color: '#10b981' }} />
              </div>
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 900, color: '#f1f5f9', marginBottom: '6px' }}>
                  Payment Successful!
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                  Thank you! Your order #{orderId} is confirmed and being processed.
                </p>
              </div>
            </div>

            {orderDetails && (
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px', padding: '20px', textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                {[
                  { label: 'Order ID', value: `#${orderDetails.id}` },
                  { label: 'Recipient', value: orderDetails.customerName },
                  { label: 'Email', value: orderDetails.customerEmail },
                  { label: 'Shipping To', value: orderDetails.shippingAddress },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: '13px', color: '#c7d2fe', fontWeight: 700, textAlign: 'right', maxWidth: '65%' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>Total Paid</span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 900, color: '#34d399' }}>
                    {formatCurrency(orderDetails.totalAmount)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff', border: 'none', borderRadius: '14px',
                padding: '14px', fontWeight: 700, fontSize: '14px',
                cursor: 'pointer', boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
              }}
            >
              <ArrowBack style={{ fontSize: '18px' }} />
              Continue Shopping
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ErrorOutlined style={{ fontSize: '44px', color: '#ef4444' }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '26px', fontWeight: 900, color: '#f1f5f9', marginBottom: '8px' }}>
                Payment Failed
              </h2>
              <p style={{ fontSize: '13px', color: '#f87171', lineHeight: 1.6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
                {errorMsg}
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0', borderRadius: '14px', padding: '13px 32px',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer', width: '100%',
              }}
            >
              <ArrowBack style={{ fontSize: '18px' }} />
              Back to Shop
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
      `}</style>
    </div>
  );
};
