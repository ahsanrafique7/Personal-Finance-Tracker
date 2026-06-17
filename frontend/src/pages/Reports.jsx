import { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
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
import { Doughnut, Line } from 'react-chartjs-2';
import { getReports } from '../services/api';
import { IncomeIcon, ExpenseIcon, SavingsIcon, SavingsRateIcon } from '../components/CardIcons';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler);

const formatAmount = (amount) => `Rs. ${Number(amount).toLocaleString('en-PK')}`;

const CATEGORY_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#f43f5e', '#06b6d4', '#84cc16', '#ec4899',
  '#f97316', '#a78bfa',
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef();

  const handleDownloadPdf = () => {
    const element = reportRef.current;
    if (!element) return;
    
    setIsDownloading(true);
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     'PFT_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsDownloading(false);
    });
  };

  useEffect(() => {
    getReports()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p className="loading-text">Loading reports...</p>
      </div>
    );
  }

  const { totalIncome = 0, totalExpense = 0, balance = 0, categoryBreakdown = [], monthly = [] } = data || {};
  const savingsPct = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  // Category doughnut chart
  const doughnutData = {
    labels: categoryBreakdown.map((c) => c._id),
    datasets: [{
      data: categoryBreakdown.map((c) => c.total),
      backgroundColor: CATEGORY_COLORS.slice(0, categoryBreakdown.length),
      borderColor: 'transparent',
      hoverOffset: 8,
    }],
  };

  // Monthly cumulative growth chart with 6-month padding
  const monthlyData = monthly || [];
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    last6Months.push({
      key: `${y}-${String(m).padStart(2, '0')}`,
      label: `${MONTH_NAMES[m - 1]} ${String(y).slice(2)}`,
      income: 0,
      expense: 0
    });
  }

  monthlyData.forEach(({ _id, total }) => {
    const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
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
        borderWidth: 3,
      },
    ],
  };

  const chartOpts = {
    responsive: true,
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
        callbacks: { label: (ctx) => ` Rs. ${Number(ctx.raw).toLocaleString('en-PK')}` },
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

  const doughnutOpts = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, boxWidth: 10, padding: 14 },
      },
      tooltip: {
        backgroundColor: '#0f1629',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        callbacks: { label: (ctx) => ` Rs. ${Number(ctx.raw).toLocaleString('en-PK')}` },
      },
    },
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Financial insights and spending analysis</p>
        </div>
        <button 
          onClick={handleDownloadPdf} 
          disabled={isDownloading}
          style={{ 
            background: 'var(--accent-blue)', 
            color: '#fff', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            cursor: isDownloading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isDownloading ? 0.7 : 1
          }}
        >
          {isDownloading ? '⏳ Generating...' : '📥 Download PDF'}
        </button>
      </div>

      <div ref={reportRef} style={{ padding: '10px', background: 'var(--bg-color)' }}>
        {/* Summary Cards */}
        <div className="stats-grid" style={{ marginBottom: 'var(--gap-xl)' }}>
        <div className="stat-card income">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Income</span>
            <div className="stat-card-icon">
              <IncomeIcon size={20} />
            </div>
          </div>
          <div className="stat-card-value">{formatAmount(totalIncome)}</div>
          <div className="stat-card-sub">Cumulative earnings</div>
        </div>

        <div className="stat-card expense">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Expense</span>
            <div className="stat-card-icon">
              <ExpenseIcon size={20} />
            </div>
          </div>
          <div className="stat-card-value">{formatAmount(totalExpense)}</div>
          <div className="stat-card-sub">Cumulative spending</div>
        </div>

        <div className="stat-card balance">
          <div className="stat-card-header">
            <span className="stat-card-label">Net Savings</span>
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
            {savingsPct >= 20 ? '✅ Great savings!' : savingsPct >= 10 ? '👍 Good progress' : '⚠️ Try to save more'}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid" style={{ marginBottom: 'var(--gap-xl)' }}>
        <div className="chart-card">
          <h3 className="chart-card-title">📊 Cumulative Income vs Expenses Growth (Last 6 Months)</h3>
          {monthEntries.length > 0 ? (
            <Line data={lineData} options={chartOpts} />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p className="empty-state-title">No growth data</p>
              <p className="empty-state-desc">Add transactions to see growth trends</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3 className="chart-card-title">🍩 Expense by Category</h3>
          {categoryBreakdown.length > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOpts} />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🍩</div>
              <p className="empty-state-title">No expense data</p>
              <p className="empty-state-desc">Add expenses to see category breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Table */}
      {categoryBreakdown.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--gap-lg)' }}>
            📋 Category-Wise Expense Breakdown
          </h3>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Amount Spent</th>
                  <th>% of Total</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((cat, idx) => {
                  const pct = totalExpense > 0 ? ((cat.total / totalExpense) * 100).toFixed(1) : 0;
                  return (
                    <tr key={cat._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                            flexShrink: 0,
                          }} />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat._id}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--accent-red)', fontWeight: 700 }}>
                        {formatAmount(cat.total)}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{pct}%</td>
                      <td style={{ minWidth: 140 }}>
                        <div style={{
                          height: 6, background: 'rgba(255,255,255,0.06)',
                          borderRadius: 'var(--radius-full)', overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.8s ease',
                          }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Reports;
