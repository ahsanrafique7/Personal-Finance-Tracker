import { useState, useEffect, useCallback } from 'react';
import { getTransactions, deleteTransaction, updateTransaction, emitTransactionChange } from '../services/api';

const INCOME_CATEGORIES = ['Salary', 'Freelancing', 'Business', 'Investments', 'Rental Income', 'Gift', 'Other'];
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Health', 'Rent', 'Entertainment', 'Other'];

const formatAmount = (amount) => `Rs. ${Number(amount).toLocaleString('en-PK')}`;

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sortBy, order };
      if (filterType !== 'all') params.type = filterType;
      if (search.trim()) params.search = search.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await getTransactions(params);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, sortBy, order, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(fetchTransactions, 300);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  const handleSort = (field) => {
    if (sortBy === field) setOrder(order === 'desc' ? 'asc' : 'desc');
    else { setSortBy(field); setOrder('desc'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await deleteTransaction(deleteId);
      emitTransactionChange();
      setTransactions((prev) => prev.filter((t) => t._id !== deleteId));
      setSuccessMsg('Transaction deleted successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
      setDeleteId(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await updateTransaction(editModal._id, {
        type: editModal.type,
        category: editModal.category,
        amount: Number(editModal.amount),
        description: editModal.description,
        date: editModal.date,
      });
      setTransactions((prev) => prev.map((t) => (t._id === editModal._id ? res.data : t)));
      emitTransactionChange();
      setSuccessMsg('Transaction updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
      setEditModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const sortIcon = (field) => {
    if (sortBy !== field) return ' ↕';
    return order === 'desc' ? ' ↓' : ' ↑';
  };

  const editCategories = editModal?.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {successMsg && <div className="alert alert-success"><span>✅</span> {successMsg}</div>}

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          id="tx-search"
          type="text"
          className="form-input"
          placeholder="🔍 Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 2, maxWidth: 280 }}
        />

        <select
          id="tx-filter-type"
          className="form-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          id="tx-start-date"
          type="date"
          className="form-input"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          title="Start Date"
          style={{ colorScheme: 'dark' }}
        />
        <input
          id="tx-end-date"
          type="date"
          className="form-input"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          title="End Date"
          style={{ colorScheme: 'dark' }}
        />

        {(search || filterType !== 'all' || startDate || endDate) && (
          <button
            className="btn btn-ghost"
            style={{ padding: '10px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
            onClick={() => { setSearch(''); setFilterType('all'); setStartDate(''); setEndDate(''); }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-title">No transactions found</p>
            <p className="empty-state-desc">Try adjusting your filters or add a new transaction</p>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('date')}>Date{sortIcon('date')}</th>
                <th>Category</th>
                <th>Description</th>
                <th>Type</th>
                <th onClick={() => handleSort('amount')} style={{ textAlign: 'right' }}>Amount{sortIcon('amount')}</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(tx.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.category}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 200 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${tx.type}`}>
                      {tx.type === 'income' ? '↑ Income' : '↓ Expense'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: tx.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)', whiteSpace: 'nowrap' }}>
                    {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        title="Edit"
                        onClick={() => setEditModal({
                          ...tx,
                          date: tx.date ? tx.date.split('T')[0] : '',
                        })}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-icon"
                        title="Delete"
                        style={{ background: 'var(--accent-red-glow)', border: '1px solid rgba(244,63,94,0.2)', color: 'var(--accent-red-light)' }}
                        onClick={() => setDeleteId(tx._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary bar */}
      {transactions.length > 0 && (
        <div style={{
          display: 'flex', gap: 'var(--gap-lg)', marginTop: 'var(--gap-md)',
          padding: 'var(--gap-md) var(--gap-lg)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', flexWrap: 'wrap',
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Total Income:{' '}
            <strong style={{ color: 'var(--accent-green)' }}>
              {formatAmount(transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}
            </strong>
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Total Expense:{' '}
            <strong style={{ color: 'var(--accent-red)' }}>
              {formatAmount(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}
            </strong>
          </span>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Edit Transaction</h3>
              <button className="modal-close" onClick={() => setEditModal(null)}>✕</button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={editModal.type}
                  onChange={(e) => setEditModal({ ...editModal, type: e.target.value, category: '' })}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={editModal.category}
                  onChange={(e) => setEditModal({ ...editModal, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {editCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (Rs.)</label>
                <input
                  type="number"
                  className="form-input"
                  value={editModal.amount}
                  onChange={(e) => setEditModal({ ...editModal, amount: e.target.value })}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editModal.date}
                  onChange={(e) => setEditModal({ ...editModal, date: e.target.value })}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={editModal.description}
                  onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                  placeholder="Optional note..."
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🗑️ Delete Transaction</h3>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
