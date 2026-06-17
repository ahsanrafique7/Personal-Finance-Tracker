import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPayment, getPayments, submitPaymentReference } from '../services/api';

const PLANS = {
  premium: { name: 'Premium', price: 9, limit: '200 transactions' },
  enterprise: { name: 'Enterprise', price: 29, limit: 'Unlimited transactions' },
};

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  const plan = PLANS[planId];
  const [payment, setPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const loadPayments = async () => {
      if (!plan) return;
      setLoading(true);
      setApiError('');
      try {
        const res = await getPayments();
        setPayments(res.data || []);
        const existingPayment = (res.data || []).find(
          (item) => item.plan === planId && ['pending', 'submitted'].includes(item.status)
        );

        if (existingPayment) {
          setPayment(existingPayment);
          setReference(existingPayment.paymentReference || '');
          return;
        }

        const created = await createPayment(planId);
        setPayment(created.data);
      } catch (err) {
        setApiError(err.response?.data?.message || 'Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [plan, planId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!payment) return;

    setSubmitting(true);
    setApiError('');
    setSuccessMsg('');
    try {
      const res = await submitPaymentReference(payment._id, { paymentReference: reference });
      setPayment(res.data);
      setSuccessMsg('Payment reference submitted. Your plan will update after verification.');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to submit payment reference');
    } finally {
      setSubmitting(false);
    }
  };

  if (!plan) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">Payment</h1>
            <p className="page-subtitle">Invalid payment plan</p>
          </div>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-muted)' }}>The selected plan is not available.</p>
          <Link to="/profile" className="btn btn-primary">Back to Profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment</h1>
          <p className="page-subtitle">Complete payment to activate your plan</p>
        </div>
      </div>

      {apiError && <div className="alert alert-error"><span>⚠️</span> {apiError}</div>}
      {successMsg && <div className="alert alert-success"><span>✅</span> {successMsg}</div>}

      {loading ? (
        <div className="card">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="charts-grid" style={{ alignItems: 'flex-start' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--gap-md)' }}>{plan.name} Plan</h2>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: 4 }}>
              ${plan.price}
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--gap-lg)' }}>{plan.limit}</p>

            <div style={{ display: 'grid', gap: 10, marginBottom: 'var(--gap-lg)' }}>
              <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Status</p>
                <p style={{ fontWeight: 700, textTransform: 'capitalize' }}>{payment?.status || 'pending'}</p>
              </div>
              <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Payment ID</p>
                <p style={{ fontWeight: 700, wordBreak: 'break-all' }}>{payment?._id || '—'}</p>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 'var(--gap-md)' }}>
              Pay ${plan.price} for the {plan.name} plan, then submit your payment reference or transaction ID below.
              Your plan will be activated only after the payment is verified.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="payment-reference">Payment Reference / Transaction ID</label>
                <input
                  id="payment-reference"
                  className="form-input"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter reference from your payment"
                  disabled={payment?.status === 'paid'}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting || payment?.status === 'paid'}>
                  {submitting ? 'Submitting...' : 'Submit Payment Reference'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate('/profile')}>
                  Back to Profile
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--gap-md)' }}>Recent Payments</h2>
            {payments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No payments found.</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {payments.map((item) => (
                  <div key={item._id} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                      <strong style={{ textTransform: 'capitalize' }}>{item.plan}</strong>
                      <span style={{ color: item.status === 'paid' ? 'var(--accent-green)' : 'var(--accent-gold)', textTransform: 'capitalize' }}>
                        {item.status}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      ${item.amount} · {new Date(item.createdAt).toLocaleDateString('en-PK')}
                    </p>
                    {item.paymentReference && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                        Ref: {item.paymentReference}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
