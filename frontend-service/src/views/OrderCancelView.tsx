import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ErrorOutlined from '@mui/icons-material/ErrorOutlined';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ShoppingCart from '@mui/icons-material/ShoppingCart';

export const OrderCancelView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Brand top */}
      <div
        style={{ position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
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
        borderRadius: '28px', padding: '48px 40px', maxWidth: '460px', width: '100%',
        boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
        textAlign: 'center', position: 'relative',
        animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px',
      }}>

        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ErrorOutlined style={{ fontSize: '44px', color: '#f59e0b' }} />
        </div>

        <div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 900, color: '#f1f5f9', marginBottom: '10px' }}>
            Order Cancelled
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7 }}>
            Your PayPal payment was cancelled.
            {orderId && (
              <span> Order <strong style={{ color: '#c7d2fe' }}>#{orderId}</strong> is currently pending. You can retry checkout at any time from your cart.</span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
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
            <ShoppingCart style={{ fontSize: '18px' }} />
            Return to Shop
          </button>
          <button
            onClick={() => navigate(-1 as any)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', borderRadius: '14px', padding: '12px',
              fontWeight: 600, fontSize: '14px', cursor: 'pointer',
            }}
          >
            <ArrowBack style={{ fontSize: '16px' }} />
            Go Back
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&display=swap');
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: none; opacity: 1; } }
      `}</style>
    </div>
  );
};
