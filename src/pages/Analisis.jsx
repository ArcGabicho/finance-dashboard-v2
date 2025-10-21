import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Target,
  Wallet,
  CreditCard,
  Banknote,
  Eye,
  EyeOff,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingDown as LineChart
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import useThemeStore from '../store/themeStore';
import { 
  db, 
  getTotalsByType, 
  getCategoryAnalysis, 
  getMonthlyTrend
} from '../db/database';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Analisis() {
  const { theme } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [showAmounts, setShowAmounts] = useState(true);
  
  // Estados para datos
  const [summary, setSummary] = useState({ income: 0, expenses: 0, net: 0 });
  const [categoryAnalysis, setCategoryAnalysis] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);


  // Calcular fechas según el período seleccionado
  const getDateRange = (period) => {
    const today = new Date();
    let startDate, endDate;

    switch (period) {
      case 'thisWeek':
        startDate = new Date(today.setDate(today.getDate() - today.getDay()));
        endDate = new Date();
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date();
        break;
      case 'last3Months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        endDate = new Date();
        break;
      case 'thisYear':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date();
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date();
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Cargar datos
  const loadData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);
      
      // Cargar datos en paralelo
      const [
        summaryData,
        categoryData,
        trendData,
        accountsData,
        goalsData
      ] = await Promise.all([
        getTotalsByType(startDate, endDate),
        getCategoryAnalysis(startDate, endDate),
        getMonthlyTrend(6),
        db.accounts.toArray(),
        db.goals.toArray()
      ]);

      setSummary(summaryData);
      setCategoryAnalysis(categoryData);
      setMonthlyTrend(trendData);
      setAccounts(accountsData);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  // Función para formatear montos
  const formatAmount = (amount) => {
    if (!showAmounts) return '****';
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  // Función para formatear porcentajes
  const formatPercentage = (value) => `${value.toFixed(1)}%`;

  // Configuración de colores para gráficos según el tema
  const getChartColors = () => {
    if (theme === 'dark') {
      return {
        background: ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#06B6D4'],
        border: ['#059669', '#DC2626', '#2563EB', '#D97706', '#7C3AED', '#0891B2'],
        text: '#F3F4F6',
        grid: '#374151'
      };
    }
    return {
      background: ['#34D399', '#F87171', '#60A5FA', '#FBBF24', '#A78BFA', '#22D3EE'],
      border: ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#06B6D4'],
      text: '#1F2937',
      grid: '#E5E7EB'
    };
  };



  // Datos para gráfico de categorías (Pie/Doughnut)
  const getCategoryChartData = () => {
    const expenseCategories = categoryAnalysis.filter(cat => cat.type === 'expense' && cat.total > 0);
    const colors = getChartColors();
    
    return {
      labels: expenseCategories.map(cat => cat.name),
      datasets: [{
        data: expenseCategories.map(cat => cat.total),
        backgroundColor: colors.background.slice(0, expenseCategories.length),
        borderColor: colors.border.slice(0, expenseCategories.length),
        borderWidth: 2,
        hoverBorderWidth: 3
      }]
    };
  };

  // Datos para gráfico de tendencias (Line)
  const getTrendChartData = () => {
    const colors = getChartColors();
    
    return {
      labels: monthlyTrend.map(month => month.month),
      datasets: [
        {
          label: 'Ingresos',
          data: monthlyTrend.map(month => month.income),
          borderColor: colors.border[0],
          backgroundColor: colors.background[0] + '20',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors.border[0],
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 6
        },
        {
          label: 'Gastos',
          data: monthlyTrend.map(month => month.expenses),
          borderColor: colors.border[1],
          backgroundColor: colors.background[1] + '20',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: colors.border[1],
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 6
        },
        {
          label: 'Balance',
          data: monthlyTrend.map(month => month.net),
          borderColor: colors.border[2],
          backgroundColor: colors.background[2] + '20',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: colors.border[2],
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 6
        }
      ]
    };
  };

  // Datos para gráfico de barras de cuentas
  const getAccountsChartData = () => {
    const colors = getChartColors();
    const activeAccounts = accounts.filter(acc => acc.isActive);
    
    return {
      labels: activeAccounts.map(acc => acc.name),
      datasets: [{
        label: 'Balance',
        data: activeAccounts.map(acc => acc.balance),
        backgroundColor: activeAccounts.map((acc) => {
          if (acc.balance >= 0) {
            return colors.background[0]; // Verde para positivos
          }
          return colors.background[1]; // Rojo para negativos
        }),
        borderColor: activeAccounts.map((acc) => {
          if (acc.balance >= 0) {
            return colors.border[0];
          }
          return colors.border[1];
        }),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  };

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Cargando análisis financiero...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen overflow-hidden p-6 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
              }`}>
                <BarChart3 className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Análisis Financiero</h1>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Insights detallados de tus finanzas personales</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAmounts(!showAmounts)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                <option value="thisWeek">Esta semana</option>
                <option value="thisMonth">Este mes</option>
                <option value="last3Months">Últimos 3 meses</option>
                <option value="thisYear">Este año</option>
              </select>
              
              <button
                onClick={loadData}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Resumen Principal */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Ingresos */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-800/30' 
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100'
                }`}>
                  <ArrowUp className="h-6 w-6 text-green-500" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-700'
                }`}>Ingresos Totales</p>
                <p className={`text-2xl font-bold mt-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>{formatAmount(summary.income)}</p>
              </div>
            </div>

            {/* Gastos */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-red-900/20 to-pink-900/20 border-red-800/30' 
                : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100'
                }`}>
                  <ArrowDown className="h-6 w-6 text-red-500" />
                </div>
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-700'
                }`}>Gastos Totales</p>
                <p className={`text-2xl font-bold mt-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>{formatAmount(summary.expenses)}</p>
              </div>
            </div>

            {/* Balance Neto */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
              summary.net >= 0 
                ? theme === 'dark' 
                  ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-800/30'
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                : theme === 'dark'
                  ? 'bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-800/30'
                  : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  summary.net >= 0 
                    ? theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-100'
                    : theme === 'dark' ? 'bg-orange-900/50' : 'bg-orange-100'
                }`}>
                  <DollarSign className={`h-6 w-6 ${
                    summary.net >= 0 ? 'text-blue-500' : 'text-orange-500'
                  }`} />
                </div>
                {summary.net >= 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  summary.net >= 0
                    ? theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                    : theme === 'dark' ? 'text-orange-400' : 'text-orange-700'
                }`}>Balance Neto</p>
                <p className={`text-2xl font-bold mt-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>{formatAmount(summary.net)}</p>
              </div>
            </div>

            {/* Tasa de Ahorro */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-800/30' 
                : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'
                }`}>
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <PieChart className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                }`}>Tasa de Ahorro</p>
                <p className={`text-2xl font-bold mt-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {summary.income > 0 ? formatPercentage((summary.net / summary.income) * 100) : '0%'}
                </p>
              </div>
            </div>
          </div>

          {/* Gráficos con Chart.js */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de Gastos por Categoría (Doughnut) */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Distribución de Gastos</h3>
                <PieChart className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
              
              <div className="h-80">
                {categoryAnalysis.filter(cat => cat.type === 'expense' && cat.total > 0).length > 0 ? (
                  <Doughnut 
                    data={getCategoryChartData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: getChartColors().text,
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 12, weight: '500' }
                          }
                        },
                        tooltip: {
                          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                          titleColor: getChartColors().text,
                          bodyColor: getChartColors().text,
                          borderColor: getChartColors().grid,
                          borderWidth: 1,
                          cornerRadius: 8,
                          padding: 12,
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                            }
                          }
                        }
                      },
                      cutout: '60%'
                    }}
                  />
                ) : (
                  <div className={`h-full flex items-center justify-center text-center ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <div>
                      <PieChart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">Sin datos de gastos</p>
                      <p className="text-sm">No hay gastos registrados en el período seleccionado</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico de Balance de Cuentas (Bar) */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Balance por Cuenta</h3>
                <Wallet className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
              
              <div className="h-80">
                {accounts.filter(acc => acc.isActive).length > 0 ? (
                  <Bar 
                    data={getAccountsChartData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                          titleColor: getChartColors().text,
                          bodyColor: getChartColors().text,
                          borderColor: getChartColors().grid,
                          borderWidth: 1,
                          cornerRadius: 8,
                          padding: 12,
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed.y;
                              return `Balance: $${value.toLocaleString()}`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: getChartColors().text,
                            font: { size: 11 }
                          },
                          grid: {
                            color: getChartColors().grid,
                            drawBorder: false
                          }
                        },
                        y: {
                          ticks: {
                            color: getChartColors().text,
                            font: { size: 11 },
                            callback: function(value) {
                              return '$' + value.toLocaleString();
                            }
                          },
                          grid: {
                            color: getChartColors().grid,
                            drawBorder: false
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className={`h-full flex items-center justify-center text-center ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <div>
                      <Wallet className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">Sin cuentas activas</p>
                      <p className="text-sm">Configura tus cuentas para ver el análisis</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gráfico de Tendencias y Metas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Gráfico de Tendencias Mensuales (Line) */}
            <div className={`lg:col-span-2 p-6 rounded-2xl border transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Tendencia Financiera (6 meses)</h3>
                <div className="flex items-center gap-2">
                  <LineChart className={`h-5 w-5 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <button className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    theme === 'dark' 
                      ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}>
                    6M
                  </button>
                </div>
              </div>
              
              <div className="h-80">
                {monthlyTrend.length > 0 ? (
                  <Line 
                    data={getTrendChartData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            color: getChartColors().text,
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 12, weight: '500' }
                          }
                        },
                        tooltip: {
                          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                          titleColor: getChartColors().text,
                          bodyColor: getChartColors().text,
                          borderColor: getChartColors().grid,
                          borderWidth: 1,
                          cornerRadius: 8,
                          padding: 12,
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: getChartColors().text,
                            font: { size: 11 }
                          },
                          grid: {
                            color: getChartColors().grid,
                            drawBorder: false
                          }
                        },
                        y: {
                          ticks: {
                            color: getChartColors().text,
                            font: { size: 11 },
                            callback: function(value) {
                              return '$' + value.toLocaleString();
                            }
                          },
                          grid: {
                            color: getChartColors().grid,
                            drawBorder: false
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className={`h-full flex items-center justify-center text-center ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <div>
                      <LineChart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">Sin datos históricos</p>
                      <p className="text-sm">Los datos de tendencias aparecerán con el tiempo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metas Financieras */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Metas Financieras</h3>
                <Target className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
              
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {goals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  const isCompleted = goal.isCompleted || progress >= 100;
                  
                  return (
                    <div key={goal.id} className={`p-4 rounded-xl border transition-all hover:scale-105 ${
                      theme === 'dark' 
                        ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isCompleted ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${
                              theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}>{goal.name}</p>
                            <p className={`text-xs ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>{goal.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className={`font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {formatAmount(goal.currentAmount)}
                          </span>
                          <span className={`font-bold ${
                            isCompleted ? 'text-green-500' : 'text-blue-500'
                          }`}>
                            {Math.min(progress, 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className={`w-full h-3 rounded-full ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-right mt-1">
                          <span className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Meta: {formatAmount(goal.targetAmount)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          📅 {goal.deadline}
                        </span>
                        {isCompleted && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            ✅ Completada
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {goals.length === 0 && (
                  <div className={`text-center py-12 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <Target className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">Sin metas configuradas</p>
                    <p className="text-sm mb-4">Define tus objetivos financieros</p>
                    <button className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}>
                      + Agregar Meta
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analisis;