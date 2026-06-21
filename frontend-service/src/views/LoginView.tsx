import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { apiFetch } from '../services/api';

type ForgotStep = 'email' | 'otp' | 'reset' | 'done';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  
  // Login & Shared inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration-only inputs
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password flow
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newResetPwd, setNewResetPwd] = useState('');
  const [confirmResetPwd, setConfirmResetPwd] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  useEffect(() => {
    // If already logged in, redirect based on role
    const session = authService.getCurrentSession();
    if (session) {
      if (session.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both Username and Password!');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const session = await authService.login(username, password);
      if (session.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !email.trim() || !fullName.trim()) {
      setError('All fields are required!');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authService.register(username, password, email, fullName);
      alert('Registration successful! You can now log in.');
      setIsRegister(false);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Username or Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true); setForgotError('');
    try {
      await apiFetch('/api/auth/forgot-password', {
        method: 'POST', body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotStep('otp');
    } catch (err: any) {
      setForgotError(err.message || 'Email not found.');
    } finally { setForgotLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true); setForgotError('');
    try {
      const ok = await apiFetch<boolean>('/api/auth/verify-otp', {
        method: 'POST', body: JSON.stringify({ email: forgotEmail, otpCode }),
      });
      if (ok) { setForgotStep('reset'); }
      else { setForgotError('Invalid or expired OTP code.'); }
    } catch (err: any) {
      setForgotError(err.message || 'Invalid OTP.');
    } finally { setForgotLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newResetPwd !== confirmResetPwd) { setForgotError('Passwords do not match.'); return; }
    if (newResetPwd.length < 6) { setForgotError('Password must be at least 6 characters.'); return; }
    setForgotLoading(true); setForgotError('');
    try {
      await apiFetch('/api/auth/reset-password', {
        method: 'POST', body: JSON.stringify({ email: forgotEmail, newPassword: newResetPwd }),
      });
      setForgotStep('done');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally { setForgotLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {isForgot ? (
          <div>
            <div className="login-logo">LUXE FASHION</div>
            <p className="login-subtitle" style={{ marginBottom: '24px' }}>
              Reset password via Email OTP
            </p>

            {/* Step indicators */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', justifyContent: 'center' }}>
              {(['email', 'otp', 'reset', 'done'] as ForgotStep[]).map((s, i) => {
                const steps = ['Email', 'OTP', 'Reset', 'Done'];
                const done = ['email', 'otp', 'reset', 'done'].indexOf(forgotStep) > i;
                const active = forgotStep === s;
                return (
                  <React.Fragment key={s}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 700,
                        background: done || active ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'rgba(0,0,0,0.06)',
                        color: done || active ? '#fff' : 'var(--text-secondary)',
                        transition: 'all 0.3s'
                      }}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: active ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        {steps[i]}
                      </span>
                    </div>
                    {i < 3 && <div style={{ flex: 1, minWidth: '10px', height: '1px', background: done ? 'var(--accent-primary)' : 'var(--border-color)' }} />}
                  </React.Fragment>
                );
              })}
            </div>

            {forgotError && <div className="login-error">{forgotError}</div>}

            {forgotStep === 'email' && (
              <form onSubmit={handleForgotEmail}>
                <div className="form-input-group" style={{ textAlign: 'left' }}>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email..."
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    disabled={forgotLoading}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '45px' }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Sending...' : 'Send OTP Code'}
                </button>
              </form>
            )}

            {forgotStep === 'otp' && (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ padding: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left' }}>
                  A 6-digit OTP code has been sent to <strong>{forgotEmail}</strong>.
                </div>
                <div className="form-input-group" style={{ textAlign: 'left' }}>
                  <label className="form-label">Enter OTP Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="000000"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    disabled={forgotLoading}
                    style={{ letterSpacing: '8px', fontSize: '20px', fontWeight: 700, textAlign: 'center' }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '45px' }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" onClick={() => { setForgotStep('email'); setForgotError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', marginTop: '12px' }}>
                  Resend / Change email
                </button>
              </form>
            )}

            {forgotStep === 'reset' && (
              <form onSubmit={handleResetPassword}>
                <div className="form-input-group" style={{ textAlign: 'left' }}>
                  <label className="form-label">New Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={newResetPwd}
                    onChange={e => setNewResetPwd(e.target.value)}
                    disabled={forgotLoading}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-input-group" style={{ textAlign: 'left' }}>
                  <label className="form-label">Confirm New Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmResetPwd}
                    onChange={e => setConfirmResetPwd(e.target.value)}
                    disabled={forgotLoading}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '45px' }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            {forgotStep === 'done' && (
              <div style={{ textAlign: 'center', padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ color: 'var(--success)', fontSize: '15px', fontWeight: 600 }}>
                  ✓ Password Reset Successfully!
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  You can now log in with your new password.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '8px 24px' }}
                  onClick={() => {
                    setIsForgot(false);
                    setForgotStep('email');
                    setForgotEmail('');
                    setOtpCode('');
                    setNewResetPwd('');
                    setConfirmResetPwd('');
                    setForgotError('');
                  }}
                >
                  Go to Login
                </button>
              </div>
            )}

            {forgotStep !== 'done' && (
              <div style={{ marginTop: '20px', fontSize: '14px' }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => {
                    setIsForgot(false);
                    setForgotStep('email');
                    setForgotError('');
                  }}
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="login-logo">LUXE FASHION</div>
            <p className="login-subtitle">
              {isRegister ? 'Register customer account' : 'System login for customers and administration'}
            </p>

            {error && <div className="login-error">{error}</div>}

            <form onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit}>
              <div className="form-input-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter username..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-input-group" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password *</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgot(true);
                        setError('');
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: 0 }}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {isRegister && (
                <>
                  <div className="form-input-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter full name..."
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="form-input-group" style={{ textAlign: 'left' }}>
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter email address..."
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px', height: '45px' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
              </button>
            </form>

            <div style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              {isRegister ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => {
                      setIsRegister(false);
                      setError('');
                    }}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => {
                      setIsRegister(true);
                      setError('');
                    }}
                  >
                    Register here
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

