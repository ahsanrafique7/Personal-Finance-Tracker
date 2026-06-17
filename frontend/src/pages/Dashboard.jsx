import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { getTransactions, getReports } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { IncomeIcon, ExpenseIcon, SavingsIcon, SavingsRateIcon } from '../components/CardIcons';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler);

const formatAmount = (amount) =>
  `Rs. ${Number(amount).toLocaleString('en-PK')}`;

const CATEGORY_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#f43f5e', '#06b6d4', '#84cc16', '#ec4899',
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [repRes, txRes] = await Promise.all([
        getReports(),
        getTransactions({ sortBy: 'date', order: 'desc' }),
      ]);
      setReports(repRes.data);
      setRecentTx(txRes.data.slice(0, 6));
      setTransactionCount(Number(txRes.headers['x-total-count'] || txRes.data.length || 0));
      setApiError('');
    } catch (err) {
      console.error(err);
      setApiError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(fetchData);
    const onFocus = () => fetchData();
    const onTransactionChange = () => fetchData();

    // Re-fetch when window gains focus (e.g. returning from another tab)
    window.addEventListener('focus', onFocus);
    window.addEventListener('pft:transactions-changed', onTransactionChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pft:transactions-changed', onTransactionChange);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  const totalIncome = reports?.totalIncome || 0;
  const totalExpense = reports?.totalExpense || 0;
  const balance = reports?.balance || 0;
  const savingsPct = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  // Tier info
  const userTier = reports?.tier || user?.tier || 'free';
  const totalTx = reports?.totalTransactions ?? transactionCount;
  const tierLimits = reports?.tierLimits || { free: 20, premium: 200, enterprise: 999999 };
  const userLimit = tierLimits[userTier];
  const usagePct = Math.min((totalTx / userLimit) * 100, 100);

  // Weekly spending chart
  const dailySpending = reports?.dailySpending || [];
  const barData = {
    labels: dailySpending.map(d => {
      const date = new Date(d._id);
      return date.toLocaleDateString('en-PK', { weekday: 'short' });
    }),
    datasets: [{
      label: 'Daily Spending',
      data: dailySpending.map(d => d.total),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };

  // Doughnut chart — category breakdown
  const categories = reports?.categoryBreakdown || [];
  const doughnutData = {
    labels: categories.map((c) => c._id),
    datasets: [{
      data: categories.map((c) => c.total),
      backgroundColor: CATEGORY_COLORS.slice(0, categories.length),
      borderColor: 'transparent',
      hoverOffset: 6,
    }],
  };

  // Line chart — Monthly cumulative growth (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = reports?.monthly || [];

  // Programmatically generate last 6 months to ensure a line is always visible
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    last6Months.push({
      key: `${y}-${m}`,
      label: `${monthNames[m - 1]} ${y}`,
      income: 0,
      expense: 0
    });
  }

  monthlyData.forEach(({ _id, total }) => {
    const key = `${_id.year}-${_id.month}`;
    const entry = last6Months.find(e => e.key === key);
    if (entry) entry[_id.type] = total;
  });

  const monthEntries = last6Months;

  let runIncome = 0;
  let runExpense = 0;
  const lineData = {
    labels: monthEntries.map((m) => m.label),
    datasets: [
      {
        label: 'Total Income Growth',
        data: monthEntries.map((m) => {
          runIncome += m.income;
          return runIncome;
        }),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
      {
        label: 'Total Expense Growth',
        data: monthEntries.map((m) => {
          runExpense += m.expense;
          return runExpense;
        }),
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244,63,94,0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#f43f5e',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, boxWidth: 12, padding: 16 },
      },
      tooltip: {
        backgroundColor: '#0f1629',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` Rs. ${Number(ctx.raw).toLocaleString('en-PK')}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 11 },
          callback: (v) => `Rs.${(v / 1000).toFixed(0)}k`,
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, boxWidth: 10, padding: 14 },
      },
      tooltip: {
        backgroundColor: '#0f1629',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => ` Rs. ${Number(ctx.raw).toLocaleString('en-PK')}`,
        },
      },
    },
  };

  const isLimitReached = userTier !== 'enterprise' && totalTx >= userLimit;

  return (
    <div className="animate-fade-in">
      {apiError && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--gap-lg)' }}>
          <span>⚠️</span> {apiError}
        </div>
      )}
      {isLimitReached && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(244,63,94,0.1), rgba(244,63,94,0.05))',
          border: '1px solid rgba(244,63,94,0.2)',
          padding: '16px',
          borderRadius: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <p style={{ fontWeight: 700, color: 'white', marginBottom: 2 }}>Monthly Transaction Limit Reached!</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                You've used {totalTx} of your {userLimit} transaction slots. Please upgrade to continue recording entries.
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/profile')}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            🚀 Upgrade Plan
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title">Dashboard</h1>
            <button
              onClick={() => window.location.reload()}
              className="btn-icon"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.6 }}
              title="Refresh Data"
            >
              🔄
            </button>
          </div>
          <p className="page-subtitle">
            Welcome back, <strong style={{ color: 'var(--accent-green)' }}>{user?.name}</strong>! Here's your financial overview.
          </p>
        </div>
        <Link to="/add-transaction" className="btn btn-primary">
          {/* <span>➕</span> */}
          Add Transaction
        </Link>
      </div>

      {/* Tier Usage Meter */}
      <div className="card" style={{ marginBottom: 'var(--gap-xl)', padding: 'var(--gap-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem' }}>📊</span>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                {userTier.toUpperCase()} Plan Usage
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                {totalTx} of {userLimit === 999999 ? 'Unlimited' : userLimit} transactions used
              </p>
            </div>
          </div>
          {userTier !== 'enterprise' && (
            <Link to="/profile" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Upgrade Plan
            </Link>
          )}
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${usagePct}%`,
            background: usagePct > 90 ? 'var(--accent-red)' : usagePct > 70 ? 'var(--accent-gold)' : 'var(--accent-green)',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Income</span>
            <div className="stat-card-icon">
              <IncomeIcon size={20} />
            </div>
          </div>
          <div className="stat-card-value">{formatAmount(totalIncome)}</div>
          <div className="stat-card-sub">All time income</div>
        </div>

        <div className="stat-card expense">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Expense</span>
            <div className="stat-card-icon">
              <ExpenseIcon size={20} />
            </div>
          </div>
          <div className="stat-card-value">{formatAmount(totalExpense)}</div>
          <div className="stat-card-sub">All time expenses</div>
        </div>

        <div className="stat-card balance">
          <div className="stat-card-header">
            <span className="stat-card-label">Current Balance</span>
            <div className="stat-card-icon">
              <SavingsIcon size={20} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: balance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {formatAmount(balance)}
          </div>
          <div className="stat-card-sub">Income − Expenses</div>
        </div>

        <div className="stat-card savings">
          <div className="stat-card-header">
            <span className="stat-card-label">Savings Rate</span>
            <div className="stat-card-icon">
              <SavingsRateIcon size={20} />
            </div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--accent-gold)' }}>
            {savingsPct}%
          </div>
          <div className="stat-card-sub">
            {user?.savingsGoal > 0 ? `Goal: ${formatAmount(user.savingsGoal)}` : 'Set a savings goal in Profile'}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="section-header" style={{ marginTop: 'var(--gap-xl)', marginBottom: 'var(--gap-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>🏆 Achievements & Badges</h2>
        <p className="page-subtitle">Your financial milestones and rewards</p>
      </div>

      <div className="card" style={{ marginBottom: 'var(--gap-xl)' }}>
        <div style={{ display: 'flex', gap: 'var(--gap-lg)', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'thin' }}>
          {reports?.achievements?.map((ach) => (
            <div 
              key={ach.id} 
              style={{ 
                minWidth: '160px', 
                flex: 1,
                padding: 'var(--gap-md)', 
                borderRadius: 'var(--radius-lg)', 
                border: ach.unlocked ? '2px solid var(--accent-gold)' : '1px solid var(--border)',
                background: ach.unlocked ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
                opacity: ach.unlocked ? 1 : 0.5,
                textAlign: 'center',
                transition: 'var(--transition)',
                boxShadow: ach.unlocked ? '0 0 20px rgba(245, 158, 11, 0.15)' : 'none'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px', filter: ach.unlocked ? 'none' : 'grayscale(100%)' }}>
                {ach.icon}
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px', color: ach.unlocked ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                {ach.title}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ach.description}</p>
              {!ach.unlocked && <div style={{ marginTop: '8px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔒 Locked</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <div className="section-header" style={{ marginTop: 'var(--gap-xl)', marginBottom: 'var(--gap-lg)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>📈 Proper Advanced Analytics</h2>
        <p className="page-subtitle">Deep dive into your recent financial habits</p>
      </div>

      <div className="charts-grid" style={{ marginBottom: 'var(--gap-xl)' }}>
        <div className="chart-card">
          <h3 className="chart-card-title" style={{ color: 'var(--text-primary)' }}>📅 Weekly Spending Trend (Last 7 Days)</h3>
          <div style={{ height: 260 }}>
            {dailySpending.length > 0 ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <p className="empty-state-title">Not enough data</p>
                <p className="empty-state-desc">Keep tracking to see daily patterns</p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-card-title" style={{ color: 'var(--text-primary)' }}>🎯 Savings Goal Tracking</h3>
          <div style={{ height: 260, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 180, height: 180, marginBottom: 'var(--gap-md)' }}>
              <Doughnut
                data={{
                  labels: ['Saved', 'Remaining'],
                  datasets: [{
                    data: [balance > 0 ? balance : 0, user?.savingsGoal > balance ? user.savingsGoal - balance : 0],
                    backgroundColor: ['#10b981', 'rgba(255,255,255,0.05)'],
                    borderWidth: 0,
                    cutout: '85%'
                  }]
                }}
                options={{
                  ...doughnutOptions,
                  plugins: { ...doughnutOptions.plugins, legend: { display: false } }
                }}
              />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{savingsPct}%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Saved</div>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {balance >= (user?.savingsGoal || 0)
                ? "🎉 Goal Achieved! Great work!"
                : `You need ${formatAmount((user?.savingsGoal || 0) - balance)} more to reach your goal.`}
            </p>
          </div>
        </div>
      </div>

      {/* Historical Trends */}
      <div className="section-header" style={{ marginBottom: 'var(--gap-lg)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>⏳ Historical Overview</h3>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-card-title" style={{ color: 'var(--text-primary)' }}>📊 Monthly Income vs Expenses</h3>
          <div style={{ height: 260 }}>
            {monthEntries.length > 0 ? (
              <Line data={lineData} options={chartOptions} />
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📉</div>
                <p className="empty-state-title">No monthly data yet</p>
                <p className="empty-state-desc">Add transactions to see trends</p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-card-title" style={{ color: 'var(--text-primary)' }}>🍩 Expense by Category</h3>
          <div style={{ height: 260 }}>
            {categories.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🍩</div>
                <p className="empty-state-title">No expense data yet</p>
                <p className="empty-state-desc">Add some expenses to see breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--gap-lg)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>🕐 Recent Transactions</h3>
          <Link to="/transactions" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            View All →
          </Link>
        </div>

        {recentTx.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-title">No transactions yet</p>
            <p className="empty-state-desc">Start by adding your first income or expense</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTx.map((tx) => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.category}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {tx.description || '—'}
                    </td>
                    <td>
                      <span className={`badge badge-${tx.type}`}>
                        {tx.type === 'income' ? '↑ Income' : '↓ Expense'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: tx.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
