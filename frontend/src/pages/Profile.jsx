import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updateTier } from '../services/api';

const formatAmount = (amount) => `Rs. ${Number(amount).toLocaleString('en-PK')}`;

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    savingsGoal: user?.savingsGoal || '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [apiError, setApiError] = useState('');

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setApiError('');
    setSuccessMsg('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name cannot be empty';
    if (form.savingsGoal && (isNaN(form.savingsGoal) || Number(form.savingsGoal) < 0))
      errs.savingsGoal = 'Enter a valid savings goal';
    if (form.password && form.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    if (form.password && form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handlePlanSelect = async (tier) => {
    if (user?.tier === tier) return;

    if (tier !== 'free') {
      navigate(`/payment?plan=${tier}`);
      return;
    }

    if (!window.confirm('Switch back to the Free plan?')) return;

    try {
      const res = await updateTier(tier);
      const { token, ...userData } = res.data;
      if (token) localStorage.setItem('pft_token', token);
      refreshUser(userData);
      setSuccessMsg('Free plan activated');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to update plan');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        savingsGoal: form.savingsGoal ? Number(form.savingsGoal) : 0,
      };
      if (form.password) payload.password = form.password;

      const res = await updateProfile(payload);
      const { token, ...userData } = res.data;

      // Update token if returned
      if (token) localStorage.setItem('pft_token', token);
      refreshUser(userData);

      setSuccessMsg('Profile updated successfully! 🎉');
      setForm({ ...form, password: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account and savings goals</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--gap-xl)', alignItems: 'start' }}>

        {/* Profile Card */}
        <div className="card" style={{ textAlign: 'center', padding: 'var(--gap-xl)' }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, var(--accent-green-dark), var(--accent-blue))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 800, color: 'white',
            margin: '0 auto var(--gap-md)',
            boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
          }}>
            {getInitials(user?.name)}
          </div>

          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 'var(--gap-xl)' }}>{user?.email}</p>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--gap-lg)', textAlign: 'left' }}>
            <div style={{ marginBottom: 'var(--gap-md)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>
                Monthly Savings Goal
              </p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {user?.savingsGoal > 0 ? formatAmount(user.savingsGoal) : 'Not set'}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>
                Member Since
              </p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 'var(--gap-lg)', paddingTop: 'var(--gap-lg)', textAlign: 'left' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>
              Current Plan
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.03)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <div>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: user?.tier === 'enterprise' ? 'var(--accent-cyan)' : user?.tier === 'premium' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  display: 'block'
                }}>
                  {user?.tier?.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {user?.tier === 'free' ? '20 Tx Limit' : user?.tier === 'premium' ? '200 Tx Limit' : 'Unlimited Tx'}
                </span>
              </div>
              <span style={{ fontSize: '1.25rem' }}>
                {user?.tier === 'enterprise' ? '💎' : user?.tier === 'premium' ? '🏆' : '🌱'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form & Plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-xl)' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--gap-xl)' }}>
              ✏️ Edit Profile
            </h3>

            {successMsg && <div className="alert alert-success"><span>✅</span> {successMsg}</div>}
            {apiError && <div className="alert alert-error"><span>⚠️</span> {apiError}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
              {/* Profile fields... (existing) */}
              {/* Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>

              {/* Email (read-only) */}
              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">Email Address</label>
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Email cannot be changed
                </span>
              </div>

              {/* Savings Goal */}
              <div className="form-group">
                <label className="form-label" htmlFor="profile-savings-goal">Monthly Savings Goal (Rs.)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', pointerEvents: 'none',
                  }}>Rs.</span>
                  <input
                    id="profile-savings-goal"
                    type="number"
                    name="savingsGoal"
                    className="form-input"
                    style={{ paddingLeft: 44 }}
                    placeholder="e.g. 20000"
                    value={form.savingsGoal}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                {errors.savingsGoal && <span className="form-error">{errors.savingsGoal}</span>}
              </div>

              {/* Divider */}
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: 'var(--gap-md)',
                marginTop: 4,
              }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--gap-md)' }}>
                  🔒 Change Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-password">New Password</label>
                    <input
                      id="profile-password"
                      type="password"
                      name="password"
                      className="form-input"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    {errors.password && <span className="form-error">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-confirm-password">Confirm New Password</label>
                    <input
                      id="profile-confirm-password"
                      type="password"
                      name="confirmPassword"
                      className="form-input"
                      placeholder="Repeat new password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                  </div>
                </div>
              </div>

              <button
                id="profile-save"
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: 'var(--gap-sm)', alignSelf: 'flex-start', minWidth: 160 }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                    Saving...
                  </>
                ) : (
                  '💾 Save Changes'
                )}
              </button>
            </form>
          </div>
          {/* Plan Upgrade Section */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--gap-xl)' }}>
              🚀 Upgrade Your Plan
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-md)' }}>
              {[
                { id: 'free', name: 'Free', price: '$0', limit: '20 Tx' },
                { id: 'premium', name: 'Premium', price: '$9', limit: '200 Tx' },
                { id: 'enterprise', name: 'Enterprise', price: '$29', limit: 'Unlimited' },
              ].map((tier) => (
                <div
                  key={tier.id}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: user?.tier === tier.id ? 'var(--accent-blue)' : 'var(--border)',
                    background: user?.tier === tier.id ? 'rgba(61,90,254,0.05)' : 'transparent',
                    textAlign: 'center',
                    cursor: user?.tier === tier.id ? 'default' : 'pointer',
                    transition: 'var(--transition)'
                  }}
                  onClick={async () => {
                    await handlePlanSelect(tier.id);
                  }}
                >
                  <p style={{ fontWeight: 800, fontSize: '0.75rem', marginBottom: 4 }}>{tier.name.toUpperCase()}</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0' }}>{tier.price}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tier.limit}</p>
                  {user?.tier === tier.id ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 700 }}>Current</span>
                  ) : tier.id === 'free' ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 700 }}>Select</span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 700 }}>Pay & Activate</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
