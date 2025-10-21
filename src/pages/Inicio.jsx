import { useState, useEffect } from 'react';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building2,
  PiggyBank,
  Wallet,
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  PieChart,
  Zap
} from 'lucide-react';
import useThemeStore from '../store/themeStore';
import { db, getTotalsByType, getCategoryAnalysis, getMonthlyTrend } from '../db/database';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Inicio(){
  const theme = useThemeStore((state) => state.theme);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    summary: {},
    monthlyTrend: [],
    categoryAnalysis: [],
    recentTransactions: [],
    accounts: [],
    goals: [],
    alerts: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos básicos
      const [transactions, accounts, goals] = await Promise.all([
        db.transactions.orderBy('date').reverse().toArray(),
        db.accounts.toArray(),
        db.goals.toArray()
      ]);

      // Calcular resumen general
      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfMonth = thisMonth.toISOString().split('T')[0];
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const monthlyTotals = await getTotalsByType(startOfMonth, endOfMonth);
      const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
      const activeAccounts = accounts.filter(acc => acc.isActive).length;
      
      // Obtener tendencia de los últimos 6 meses
      const monthlyTrend = await getMonthlyTrend(6);
      
      // Análisis de categorías
      const categoryAnalysis = await getCategoryAnalysis(startOfMonth, endOfMonth);
      
      // Transacciones recientes (últimas 7)
      const recentTransactions = transactions.slice(0, 7);
      
      // Generar alertas
      const alerts = generateAlerts(accounts, goals, categoryAnalysis);

      setDashboardData({
        summary: {
          totalBalance,
          activeAccounts,
          totalAccounts: accounts.length,
          totalTransactions: transactions.length,
          monthlyIncome: monthlyTotals.income,
          monthlyExpenses: monthlyTotals.expenses,
          monthlyNet: monthlyTotals.net,
          thisMonthTransactions: transactions.filter(t => 
            new Date(t.date) >= thisMonth
          ).length
        },
        monthlyTrend,
        categoryAnalysis: categoryAnalysis.filter(cat => cat.type === 'expense').slice(0, 6),
        recentTransactions,
        accounts: accounts.filter(acc => acc.isActive).slice(0, 4),
        goals,
        alerts
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (accounts, goals, categoryAnalysis) => {
    const alerts = [];
    
    // Alertas de cuentas con saldo bajo
    accounts.forEach(account => {
      if (account.balance < 100 && account.balance > 0) {
        alerts.push({
          type: 'warning',
          title: 'Saldo Bajo',
          description: `${account.name} tiene un saldo de $${account.balance.toLocaleString()}`,
          icon: 'AlertTriangle',
          color: 'yellow'
        });
      }
      if (account.balance < 0) {
        alerts.push({
          type: 'danger',
          title: 'Saldo Negativo',
          description: `${account.name} tiene un sobregiro de $${Math.abs(account.balance).toLocaleString()}`,
          icon: 'AlertTriangle',
          color: 'red'
        });
      }
    });

    // Alertas de metas próximas a cumplirse
    goals.forEach(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const deadline = new Date(goal.deadline);
      const daysToDeadline = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
      
      if (progress >= 90 && !goal.isCompleted) {
        alerts.push({
          type: 'success',
          title: '¡Meta Casi Cumplida!',
          description: `${goal.name} está al ${progress.toFixed(1)}%`,
          icon: 'Target',
          color: 'green'
        });
      }
      
      if (daysToDeadline <= 30 && daysToDeadline > 0 && progress < 80) {
        alerts.push({
          type: 'warning',
          title: 'Meta con Fecha Próxima',
          description: `${goal.name} vence en ${daysToDeadline} días`,
          icon: 'Clock',
          color: 'yellow'
        });
      }
    });

    // Alertas de gastos altos en categorías
    categoryAnalysis.forEach(category => {
      if (category.budget && category.total > category.budget) {
        alerts.push({
          type: 'danger',
          title: 'Presupuesto Excedido',
          description: `${category.name}: $${category.total.toLocaleString()} de $${category.budget.toLocaleString()}`,
          icon: 'TrendingUp',
          color: 'red'
        });
      }
    });

    return alerts.slice(0, 4); // Máximo 4 alertas
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'checking': return <Building2 className="w-5 h-5" />;
      case 'savings': return <PiggyBank className="w-5 h-5" />;
      case 'credit': return <CreditCard className="w-5 h-5" />;
      case 'cash': return <Wallet className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  const getAlertIcon = (iconName) => {
    switch (iconName) {
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5" />;
      case 'Target': return <Target className="w-5 h-5" />;
      case 'Clock': return <Clock className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  // Configuración de gráficos
  const monthlyChartData = {
    labels: dashboardData.monthlyTrend.map(item => item.month),
    datasets: [
      {
        label: 'Ingresos',
        data: dashboardData.monthlyTrend.map(item => item.income),
        borderColor: theme === 'dark' ? '#10B981' : '#059669',
        backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.15)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: theme === 'dark' ? '#10B981' : '#059669',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Gastos',
        data: dashboardData.monthlyTrend.map(item => item.expenses),
        borderColor: theme === 'dark' ? '#EF4444' : '#DC2626',
        backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.15)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: theme === 'dark' ? '#EF4444' : '#DC2626',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  };

  const categoryChartData = {
    labels: dashboardData.categoryAnalysis.map(cat => cat.name),
    datasets: [{
      data: dashboardData.categoryAnalysis.map(cat => cat.total),
      backgroundColor: theme === 'dark' ? [
        '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6'
      ] : [
        '#F43F5E', '#F59E0B', '#06B6D4', '#10B981', '#6366F1', '#8B5CF6'
      ],
      borderWidth: 3,
      borderColor: theme === 'dark' ? '#374151' : '#ffffff',
      hoverBorderWidth: 4,
      hoverBorderColor: theme === 'dark' ? '#4B5563' : '#f8fafc'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#475569',
          padding: 20,
          font: {
            size: 13,
            weight: 'bold'
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#f9fafb' : '#1e293b',
        bodyColor: theme === 'dark' ? '#e5e7eb' : '#475569',
        borderColor: theme === 'dark' ? '#374151' : '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: {
          color: theme === 'dark' ? '#374151' : '#f1f5f9',
          borderColor: theme === 'dark' ? '#4b5563' : '#e2e8f0'
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#64748b',
          font: {
            size: 12,
            weight: 'medium'
          }
        }
      },
      y: {
        grid: {
          color: theme === 'dark' ? '#374151' : '#f1f5f9',
          borderColor: theme === 'dark' ? '#4b5563' : '#e2e8f0'
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#64748b',
          font: {
            size: 12,
            weight: 'medium'
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#475569',
          padding: 15,
          font: {
            size: 12,
            weight: 'medium'
          },
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12,
          boxHeight: 12
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        titleColor: theme === 'dark' ? '#f9fafb' : '#1e293b',
        bodyColor: theme === 'dark' ? '#e5e7eb' : '#475569',
        borderColor: theme === 'dark' ? '#374151' : '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-32 h-32 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`h-screen overflow-y-auto p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'}`}>
          💰 Dashboard Financiero
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
          Resumen completo de tu situación financiera actual
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-white/20'} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                Balance Total
              </p>
              <p className={`text-2xl font-bold ${dashboardData.summary.totalBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ${dashboardData.summary.totalBalance?.toLocaleString() || '0'}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${dashboardData.summary.totalBalance >= 0 ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:bg-green-900' : 'bg-gradient-to-br from-rose-100 to-rose-200 dark:bg-red-900'}`}>
              <DollarSign className={`w-6 h-6 ${dashboardData.summary.totalBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-white/20'} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                Ingresos del Mes
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                ${dashboardData.summary.monthlyIncome?.toLocaleString() || '0'}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-green-900' : 'bg-gradient-to-br from-emerald-100 to-teal-200'}`}>
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-white/20'} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                Gastos del Mes
              </p>
              <p className="text-2xl font-bold text-rose-600">
                ${dashboardData.summary.monthlyExpenses?.toLocaleString() || '0'}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-red-900' : 'bg-gradient-to-br from-rose-100 to-pink-200'}`}>
              <TrendingDown className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-white/20'} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                Transacciones
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                {dashboardData.summary.totalTransactions?.toLocaleString() || '0'}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-900' : 'bg-gradient-to-br from-blue-100 to-indigo-200'}`}>
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {dashboardData.alerts.length > 0 && (
        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm border-gray-600' : 'bg-white/70 backdrop-blur-sm border-white/20'} shadow-lg border mb-6 hover:shadow-xl transition-all duration-300 ${theme === 'dark' ? 'hover:bg-gray-800/90' : ''}`}>
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-lg mr-3 ${theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-amber-100 text-amber-600'}`}>
              <Zap className="w-5 h-5" />
            </div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-slate-700'}`}>
              Alertas Importantes
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dashboardData.alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-xl border-l-4 ${
                alert.color === 'red' ? 
                  `border-rose-500 bg-gradient-to-r from-rose-50 to-red-50 ${theme === 'dark' ? 'dark:bg-gradient-to-r dark:from-red-950/60 dark:to-rose-900/40 dark:border-red-400' : ''}` :
                alert.color === 'yellow' ? 
                  `border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 ${theme === 'dark' ? 'dark:bg-gradient-to-r dark:from-yellow-950/60 dark:to-amber-900/40 dark:border-yellow-400' : ''}` :
                  `border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 ${theme === 'dark' ? 'dark:bg-gradient-to-r dark:from-emerald-950/60 dark:to-green-900/40 dark:border-emerald-400' : ''}`
              } shadow-sm hover:shadow-md transition-shadow duration-200 ${theme === 'dark' ? 'dark:shadow-lg dark:hover:shadow-xl' : ''}`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    alert.color === 'red' ? 
                      `text-rose-600 bg-rose-100 ${theme === 'dark' ? 'dark:text-red-300 dark:bg-red-800/50' : ''}` :
                    alert.color === 'yellow' ? 
                      `text-amber-600 bg-amber-100 ${theme === 'dark' ? 'dark:text-yellow-300 dark:bg-yellow-800/50' : ''}` :
                      `text-emerald-600 bg-emerald-100 ${theme === 'dark' ? 'dark:text-emerald-300 dark:bg-emerald-800/50' : ''}`
                  }`}>
                    {getAlertIcon(alert.icon)}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${
                      alert.color === 'red' ? 
                        `text-rose-800 ${theme === 'dark' ? 'dark:text-red-200' : ''}` :
                      alert.color === 'yellow' ? 
                        `text-amber-800 ${theme === 'dark' ? 'dark:text-yellow-200' : ''}` :
                        `text-emerald-800 ${theme === 'dark' ? 'dark:text-emerald-200' : ''}`
                    }`}>
                      {alert.title}
                    </h4>
                    <p className={`text-xs mt-1 ${
                      alert.color === 'red' ? 
                        `text-rose-700 ${theme === 'dark' ? 'dark:text-red-300' : ''}` :
                      alert.color === 'yellow' ? 
                        `text-amber-700 ${theme === 'dark' ? 'dark:text-yellow-300' : ''}` :
                        `text-emerald-700 ${theme === 'dark' ? 'dark:text-emerald-300' : ''}`
                    }`}>
                      {alert.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos y análisis */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        {/* Tendencia mensual */}
        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-white/20'} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center mb-6">
            <BarChart3 className={`w-6 h-6 mr-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
              Tendencia de 6 Meses
            </h3>
          </div>
          <div className="h-64">
            {dashboardData.monthlyTrend.length > 0 && (
              <Line data={monthlyChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Análisis de categorías */}
        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-white/20'} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center mb-6">
            <PieChart className={`w-6 h-6 mr-3 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
              Gastos por Categoría
            </h3>
          </div>
          <div className="h-64">
            {dashboardData.categoryAnalysis.length > 0 && (
              <Doughnut data={categoryChartData} options={doughnutOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Resumen de cuentas y transacciones recientes */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
        {/* Cuentas */}
        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-white/20'} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center mb-6">
            <CreditCard className={`w-6 h-6 mr-3 ${theme === 'dark' ? 'text-green-400' : 'text-emerald-600'}`} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
              Mis Cuentas
            </h3>
          </div>
          <div className="space-y-4">
            {dashboardData.accounts.map((account) => (
              <div key={account.id} className={`flex items-center justify-between p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-r from-slate-50 to-gray-100'} hover:shadow-md transition-all duration-200`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${account.type === 'checking' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600' :
                    account.type === 'savings' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600' :
                    account.type === 'credit' ? 'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600' :
                    'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600'} shadow-sm`}>
                    {getAccountIcon(account.type)}
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                      {account.name}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                      {account.type === 'checking' ? 'Cuenta Corriente' :
                       account.type === 'savings' ? 'Ahorros' :
                       account.type === 'credit' ? 'Crédito' : 'Efectivo'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${account.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${account.balance.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transacciones recientes */}
        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-white/20'} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center mb-6">
            <Activity className={`w-6 h-6 mr-3 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
              Transacciones Recientes
            </h3>
          </div>
          <div className="space-y-3">
            {dashboardData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className={`flex items-center justify-between p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-r from-slate-50 to-gray-100'} hover:shadow-md transition-all duration-200`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${transaction.type === 'income' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600' : 'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600'} shadow-sm`}>
                    {transaction.type === 'income' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                      {transaction.description}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                      {new Date(transaction.date).toLocaleDateString('es')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${transaction.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metas financieras */}
      {dashboardData.goals.length > 0 && (
        <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/70 backdrop-blur-sm'} shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-white/20'} hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center mb-6">
            <Target className={`w-6 h-6 mr-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
              Metas Financieras
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dashboardData.goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const deadline = new Date(goal.deadline);
              const daysToDeadline = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={goal.id} className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gradient-to-br from-white to-slate-50'} shadow-md hover:shadow-lg transition-all duration-200 border ${theme === 'dark' ? 'border-gray-600' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                      {goal.name}
                    </h4>
                    {goal.isCompleted && (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
                        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                      </span>
                      <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className={`w-full h-3 ${theme === 'dark' ? 'bg-gray-600' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${goal.isCompleted ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-slate-600'}`}>
                      {goal.isCompleted ? '✅ Completada' : `⏰ ${daysToDeadline} días restantes`}
                    </span>
                    <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>
                      {new Date(goal.deadline).toLocaleDateString('es')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Inicio;