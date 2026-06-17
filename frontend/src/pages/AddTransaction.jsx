import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addTransaction, emitTransactionChange } from '../services/api';

const INCOME_CATEGORIES = ['Salary', 'Freelancing', 'Business', 'Investments', 'Rental Income', 'Gift', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Health', 'Rent', 'Entertainment', 'Other'];

const AddTransaction = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'expense',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [apiError, setApiError] = useState('');

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'type') {
      setForm({ ...form, type: value, category: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
    setErrors({ ...errors, [name]: '' });
    setApiError('');
    setSuccess('');
  };

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = 'Please select a category';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      errs.amount = 'Please enter a valid amount';
    if (!form.date) errs.date = 'Please select a date';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      await addTransaction({ ...form, amount: Number(form.amount) });
      emitTransactionChange();
      setSuccess('Transaction added successfully! 🎉');
      setForm({
        type: 'expense',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      setTimeout(() => navigate('/transactions'), 1500);
    } catch (err) {
      if (err.response?.data?.limitReached) {
        setApiError(
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span>{err.response.data.message}</span>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'fit-content' }}
              onClick={() => navigate('/profile')}
            >
              🚀 Upgrade Plan Now
            </button>
          </div>
        );
      } else {
        setApiError(err.response?.data?.message || 'Failed to add transaction');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Transaction</h1>
          <p className="page-subtitle">Record a new income or expense entry</p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="card">
          {success && <div className="alert alert-success"><span>✅</span> {success}</div>}
          {apiError && <div className="alert alert-error"><span>⚠️</span> {apiError}</div>}

          {/* Type Toggle */}
          <div className="type-toggle" style={{ marginBottom: 'var(--gap-lg)' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 'var(--radius-md)',
              padding: 4, border: '1px solid var(--border)',
            }}>
              <button
                type="button"
                id="type-expense"
                onClick={() => handleChange({ target: { name: 'type', value: 'expense' } })}
                style={{
                  padding: '10px',
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  border: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  background: form.type === 'expense'
                    ? 'linear-gradient(135deg, var(--accent-red), var(--accent-red-dark))'
                    : 'transparent',
                  color: form.type === 'expense' ? 'white' : 'var(--text-muted)',
                  boxShadow: form.type === 'expense' ? '0 4px 12px rgba(244,63,94,0.3)' : 'none',
                }}
              >
                💸 Expense
              </button>
              <button
                type="button"
                id="type-income"
                onClick={() => handleChange({ target: { name: 'type', value: 'income' } })}
                style={{
                  padding: '10px',
                  borderRadius: 'calc(var(--radius-md) - 2px)',
                  border: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  background: form.type === 'income'
                    ? 'linear-gradient(135deg, var(--accent-green), var(--accent-green-dark))'
                    : 'transparent',
                  color: form.type === 'income' ? 'white' : 'var(--text-muted)',
                  boxShadow: form.type === 'income' ? '0 4px 12px rgba(16,185,129,0.3)' : 'none',
                }}
              >
                💰 Income
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-category">Category</label>
              <select
                id="tx-category"
                name="category"
                className="form-select"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>

            {/* Amount */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-amount">Amount (Rs.)</label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', pointerEvents: 'none',
                }}>Rs.</span>
                <input
                  id="tx-amount"
                  type="number"
                  name="amount"
                  className="form-input"
                  style={{ paddingLeft: 44 }}
                  placeholder="0"
                  min="1"
                  step="any"
                  value={form.amount}
                  onChange={handleChange}
                />
              </div>
              {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-date">Date</label>
              <input
                id="tx-date"
                type="date"
                name="date"
                className="form-input"
                value={form.date}
                onChange={handleChange}
                style={{ colorScheme: 'dark' }}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="tx-description">Description <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontSize: '0.78rem' }}>(optional)</span></label>
              <textarea
                id="tx-description"
                name="description"
                className="form-textarea"
                placeholder="Add a note about this transaction..."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 'var(--gap-md)', marginTop: 'var(--gap-sm)' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                id="add-transaction-submit"
                type="submit"
                className={`btn ${form.type === 'income' ? 'btn-primary' : 'btn-danger'}`}
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                    Saving...
                  </>
                ) : (
                  `Add ${form.type === 'income' ? '💰 Income' : '💸 Expense'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
