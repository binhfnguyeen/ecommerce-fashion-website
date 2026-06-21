import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { User, Address } from '../types/user';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import PersonOutline from '@mui/icons-material/Person2Outlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import DeleteOutline from '@mui/icons-material/DeleteOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

type Tab = 'profile' | 'password' | 'addresses';

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const session = authService.getCurrentSession();

  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<User | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Profile form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Change password form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState('');

  // Address management state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address form inputs
  const [addressName, setAddressName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    setAddressError('');
    try {
      const data = await userService.getMyAddresses();
      setAddresses(data);
    } catch (err: any) {
      setAddressError(err.message || 'Failed to load addresses.');
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (tab === 'addresses') {
      fetchAddresses();
    }
  }, [tab]);

  const handleOpenAddressForm = (addr: Address | null = null) => {
    setFormError('');
    if (addr) {
      setEditingAddress(addr);
      setAddressName(addr.addressName);
      setAddressLine(addr.addressLine);
      setPhone(addr.phone);
      setIsDefault(addr.isDefault);
    } else {
      setEditingAddress(null);
      setAddressName('');
      setAddressLine('');
      setPhone('');
      setIsDefault(addresses.length === 0);
    }
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    try {
      if (editingAddress) {
        await userService.updateAddress(editingAddress.id, { addressName, addressLine, phone, isDefault });
      } else {
        await userService.createAddress({ addressName, addressLine, phone, isDefault });
      }
      setShowAddressForm(false);
      fetchAddresses();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save address.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setAddressError('');
      try {
        await userService.deleteAddress(id);
        fetchAddresses();
      } catch (err: any) {
        setAddressError(err.message || 'Failed to delete address.');
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    setAddressError('');
    try {
      await userService.setDefaultAddress(id);
      fetchAddresses();
    } catch (err: any) {
      setAddressError(err.message || 'Failed to set default address.');
    }
  };

  useEffect(() => {
    if (!session) { navigate('/login'); return; }
    const fetch = async () => {
      try {
        const data = await userService.getMyProfile();
        setProfile(data);
        setFullName(data.fullName || '');
        setEmail(data.email || '');
      } catch { /* ignore */ }
      finally { setLoadingProfile(false); }
    };
    fetch();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaveError(''); setSaveSuccess(false);
    try {
      await userService.updateMyProfile({ fullName, email });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setPwdError('New passwords do not match.'); return; }
    if (newPwd.length < 6) { setPwdError('Password must be at least 6 characters.'); return; }
    setPwdSaving(true); setPwdError(''); setPwdSuccess(false);
    try {
      await userService.updateMyProfile({ currentPassword: currentPwd, newPassword: newPwd });
      setPwdSuccess(true);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err: any) {
      setPwdError(err.message || 'Failed to change password. Check current password.');
    } finally { setPwdSaving(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', color: '#e2e8f0', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s', fontFamily: "'Inter', sans-serif",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', color: '#64748b', fontWeight: 700,
    letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: '6px',
  };
  const btnPrimary: React.CSSProperties = {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: '#fff', border: 'none', borderRadius: '12px',
    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(99,102,241,0.35)', transition: 'opacity 0.2s',
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'Profile Info', icon: <PersonOutline style={{ fontSize: '18px' }} /> },
    { key: 'password', label: 'Change Password', icon: <LockOutlined style={{ fontSize: '18px' }} /> },
    { key: 'addresses', label: 'My Addresses', icon: <HomeOutlined style={{ fontSize: '18px' }} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a12', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Top bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,18,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '50px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <ArrowBack style={{ fontSize: '16px' }} /> Back to Shop
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AutoAwesome style={{ fontSize: '14px', color: '#fff' }} />
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '16px', background: 'linear-gradient(90deg, #c4b5fd, #f0abfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LUXE FASHION
          </span>
        </div>
      </header>

      {/* Page content */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonOutline style={{ fontSize: '26px', color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: '28px', color: '#f1f5f9', margin: 0, lineHeight: 1.2 }}>
                My Account
              </h1>
              <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
                {loadingProfile ? 'Loading...' : `@${profile?.username || session?.username}`}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Sidebar tabs */}
          <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                  background: tab === t.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                  border: tab === t.key ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  color: tab === t.key ? '#c4b5fd' : '#64748b',
                  borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  transition: 'all 0.2s', textAlign: 'left', width: '100%',
                }}
              >
                {t.icon}
                <span style={{ flex: 1 }}>{t.label}</span>
                {tab === t.key && <KeyboardArrowRight style={{ fontSize: '16px' }} />}
              </button>
            ))}
          </div>

          {/* Main panel */}
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', minHeight: '360px' }}>

            {/* ── Profile Info Tab ── */}
            {tab === 'profile' && (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '20px', color: '#f1f5f9', margin: '0 0 4px' }}>Profile Information</h2>
                  <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>Update your display name and email address.</p>
                </div>

                <div>
                  <label style={labelStyle}>Username</label>
                  <div style={{ ...inputStyle, color: '#475569', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BadgeOutlined style={{ fontSize: '16px', color: '#334155' }} />
                    {profile?.username || session?.username}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#6366f1')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#6366f1')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>

                {saveError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px' }}>{saveError}</div>}
                {saveSuccess && (
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '10px 14px', color: '#34d399', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle style={{ fontSize: '16px' }} /> Profile updated successfully!
                  </div>
                )}

                <button type="submit" disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* ── Change Password Tab ── */}
            {tab === 'password' && (
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '20px', color: '#f1f5f9', margin: '0 0 4px' }}>Change Password</h2>
                  <p style={{ color: '#475569', fontSize: '13px', margin: 0 }}>Enter your current password to set a new one.</p>
                </div>

                {[
                  { label: 'Current Password', value: currentPwd, set: setCurrentPwd, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
                  { label: 'New Password', value: newPwd, set: setNewPwd, show: showNew, toggle: () => setShowNew(p => !p) },
                  { label: 'Confirm New Password', value: confirmPwd, set: setConfirmPwd, show: showNew, toggle: () => { } },
                ].map((field, i) => (
                  <div key={i}>
                    <label style={labelStyle}>{field.label}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={field.show ? 'text' : 'password'}
                        value={field.value}
                        onChange={e => field.set(e.target.value)}
                        placeholder="••••••••"
                        required
                        style={{ ...inputStyle, paddingRight: '44px' }}
                        onFocus={e => (e.target.style.borderColor = '#6366f1')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                      {i < 2 && (
                        <button type="button" onClick={field.toggle} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          {field.show ? <VisibilityOff style={{ fontSize: '18px' }} /> : <Visibility style={{ fontSize: '18px' }} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {pwdError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px' }}>{pwdError}</div>}
                {pwdSuccess && (
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '10px 14px', color: '#34d399', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle style={{ fontSize: '16px' }} /> Password changed successfully!
                  </div>
                )}

                <button type="submit" disabled={pwdSaving} style={{ ...btnPrimary, opacity: pwdSaving ? 0.6 : 1 }}>
                  {pwdSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            {/* ── Addresses Tab ── */}
            {tab === 'addresses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '20px', color: '#f1f5f9', margin: '0 0 4px' }}>My Addresses</h2>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Add, edit, or set default delivery addresses.</p>
                  </div>
                  {!showAddressForm && (
                    <button
                      onClick={() => handleOpenAddressForm()}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: '#fff', border: 'none', borderRadius: '10px',
                        fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(99,102,241,0.25)',
                        transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      + Add Address
                    </button>
                  )}
                </div>

                {addressError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', color: '#f87171', fontSize: '13px' }}>{addressError}</div>}

                {showAddressForm ? (
                  <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '16px', color: '#f1f5f9', margin: '0 0 8px' }}>
                      {editingAddress ? 'Edit Address' : 'New Address'}
                    </h3>

                    {formError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 12px', color: '#f87171', fontSize: '12px' }}>{formError}</div>}

                    <div>
                      <label style={labelStyle}>Address Label (e.g. Home, Work)</label>
                      <input
                        type="text" value={addressName} onChange={e => setAddressName(e.target.value)}
                        placeholder="Home / Work / Office" required style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = '#6366f1')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Address Line</label>
                      <input
                        type="text" value={addressLine} onChange={e => setAddressLine(e.target.value)}
                        placeholder="123 Fashion Street, Ward 5, District 1" required style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = '#6366f1')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Phone Number</label>
                      <input
                        type="text" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="09XXXXXXXX" required style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = '#6366f1')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <input
                        type="checkbox" id="isDefault" checked={isDefault} onChange={e => setIsDefault(e.target.checked)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <label htmlFor="isDefault" style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                        Set as default shipping address
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                      <button type="submit" disabled={formSubmitting} style={{ ...btnPrimary, flex: 1, padding: '10px' }}>
                        {formSubmitting ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        style={{
                          flex: 1, padding: '10px',
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          color: '#94a3b8', borderRadius: '12px',
                          fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                          transition: 'opacity 0.2s',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {loadingAddresses ? (
                      <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>Loading addresses...</div>
                    ) : addresses.length === 0 ? (
                      <div style={{ color: '#475569', fontSize: '14px', textAlign: 'center', padding: '40px 0', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                        No addresses saved yet. Click "+ Add Address" to create one.
                      </div>
                    ) : (
                      addresses.map(addr => (
                        <div
                          key={addr.id}
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: addr.isDefault ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.06)',
                            boxShadow: addr.isDefault ? '0 0 15px rgba(99,102,241,0.1)' : 'none',
                            borderRadius: '16px', padding: '20px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>
                                {addr.addressName}
                              </span>
                              {addr.isDefault && (
                                <span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '50px', padding: '2px 10px', fontSize: '10px', fontWeight: 700 }}>
                                  Default
                                </span>
                              )}
                            </div>
                            <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                              {addr.addressLine}
                            </span>
                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>
                              Phone: {addr.phone}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefault(addr.id)}
                                style={{
                                  background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                                  color: '#64748b', borderRadius: '8px', padding: '6px 12px',
                                  fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#c4b5fd'; e.currentTarget.style.borderColor = '#6366f1'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                              >
                                Set default
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenAddressForm(addr)}
                              style={{
                                background: 'none', border: 'none', color: '#64748b',
                                cursor: 'pointer', padding: '4px', transition: 'color 0.2s', display: 'flex', alignItems: 'center'
                              }}
                              title="Edit"
                              onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                            >
                              <EditOutlined style={{ fontSize: '18px' }} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              style={{
                                background: 'none', border: 'none', color: '#64748b',
                                cursor: 'pointer', padding: '4px', transition: 'color 0.2s', display: 'flex', alignItems: 'center'
                              }}
                              title="Delete"
                              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
                            >
                              <DeleteOutline style={{ fontSize: '18px' }} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Forgot Password Tab ── */}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};
