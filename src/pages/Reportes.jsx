import { useState, useEffect } from 'react';
import useThemeStore from '../store/themeStore';
import { db, getCategoryAnalysis, getTotalsByType, getMonthlyTrend, getTransactionsByPeriod } from '../db/database';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Users,
  CreditCard,
  Tag,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  Target
} from 'lucide-react';
import {
  exportFinancialSummary,
  exportTransactionsReport,
  exportCategoriesReport,
  exportAccountsReport
} from '../utils/exportPDF';
import {
  exportFinancialSummaryXLSX,
  exportTransactionsXLSX,
  exportCategoriesXLSX,
  exportAccountsXLSX,
  exportCompleteReportXLSX
} from '../utils/exportXLSX';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Reportes() {
  const { theme } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedReport, setSelectedReport] = useState('summary');
  const [showAmounts, setShowAmounts] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Estados para datos
  const [reportData, setReportData] = useState({
    summary: { income: 0, expenses: 0, net: 0 },
    categoryAnalysis: [],
    monthlyTrend: [],
    transactions: [],
    categories: [],
    accounts: [],
    goals: []
  });

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
      case 'lastYear':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31);
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

  // Obtener nombre del período
  const getPeriodName = (period) => {
    const names = {
      'thisWeek': 'Esta Semana',
      'thisMonth': 'Este Mes',
      'last3Months': 'Últimos 3 Meses',
      'thisYear': 'Este Año',
      'lastYear': 'Año Pasado'
    };
    return names[period] || 'Período Personalizado';
  };

  // Cargar datos del reporte
  const loadReportData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);
      
      // Cargar todos los datos en paralelo
      const [
        summaryData,
        categoryData,
        trendData,
        transactionsData,
        categoriesData,
        accountsData,
        goalsData
      ] = await Promise.all([
        getTotalsByType(startDate, endDate),
        getCategoryAnalysis(startDate, endDate),
        getMonthlyTrend(6),
        getTransactionsByPeriod(startDate, endDate),
        db.categories.toArray(),
        db.accounts.toArray(),
        db.goals.toArray()
      ]);

      setReportData({
        summary: summaryData,
        categoryAnalysis: categoryData,
        monthlyTrend: trendData,
        transactions: transactionsData,
        categories: categoriesData,
        accounts: accountsData,
        goals: goalsData
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  // Formatear montos
  const formatAmount = (amount) => {
    if (!showAmounts) return '****';
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  // Configuración de colores para gráficos
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

  // Funciones de exportación
  const handleExport = async (format, reportType) => {
    setExporting(true);
    try {
      const periodName = getPeriodName(selectedPeriod);
      
      switch (reportType) {
        case 'summary':
          if (format === 'pdf') {
            await exportFinancialSummary({
              ...reportData.summary,
              categoryAnalysis: reportData.categoryAnalysis,
              monthlyTrend: reportData.monthlyTrend
            }, periodName);
          } else {
            await exportFinancialSummaryXLSX({
              ...reportData.summary,
              categoryAnalysis: reportData.categoryAnalysis,
              monthlyTrend: reportData.monthlyTrend
            }, periodName);
          }
          break;
        case 'transactions':
          if (format === 'pdf') {
            await exportTransactionsReport(reportData.transactions, reportData.categories, reportData.accounts, periodName);
          } else {
            await exportTransactionsXLSX(reportData.transactions, reportData.categories, reportData.accounts, periodName);
          }
          break;
        case 'categories':
          if (format === 'pdf') {
            await exportCategoriesReport(reportData.categories, reportData.categoryAnalysis);
          } else {
            await exportCategoriesXLSX(reportData.categories, reportData.categoryAnalysis);
          }
          break;
        case 'accounts':
          if (format === 'pdf') {
            await exportAccountsReport(reportData.accounts, reportData.transactions);
          } else {
            await exportAccountsXLSX(reportData.accounts, reportData.transactions);
          }
          break;
        case 'complete':
          if (format === 'xlsx') {
            await exportCompleteReportXLSX(reportData);
          }
          break;
      }
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 animate-pulse text-blue-500" />
          <span className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Cargando reportes...
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'
              }`}>
                <FileText className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Reportes Financieros</h1>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Genera y exporta reportes detallados de tus finanzas</p>
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
              
              <button
                onClick={loadReportData}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Controles */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
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
                <option value="lastYear">Año pasado</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                <option value="summary">Resumen Financiero</option>
                <option value="transactions">Transacciones</option>
                <option value="categories">Categorías</option>
                <option value="accounts">Cuentas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Resumen Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Ingresos */}
            <div className={`p-4 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-800/30' 
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-700'
                  }`}>Ingresos</p>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>{formatAmount(reportData.summary.income)}</p>
                </div>
                <TrendingUp className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
            </div>

            {/* Gastos */}
            <div className={`p-4 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-red-900/20 to-pink-900/20 border-red-800/30' 
                : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-700'
                  }`}>Gastos</p>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>{formatAmount(reportData.summary.expenses)}</p>
                </div>
                <BarChart3 className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
            </div>

            {/* Balance */}
            <div className={`p-4 rounded-xl border ${
              reportData.summary.net >= 0
                ? theme === 'dark' 
                  ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-800/30'
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                : theme === 'dark'
                  ? 'bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-800/30'
                  : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    reportData.summary.net >= 0
                      ? theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                      : theme === 'dark' ? 'text-orange-400' : 'text-orange-700'
                  }`}>Balance</p>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>{formatAmount(reportData.summary.net)}</p>
                </div>
                <DollarSign className={`h-6 w-6 ${
                  reportData.summary.net >= 0
                    ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    : theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
            </div>

            {/* Transacciones */}
            <div className={`p-4 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-800/30' 
                : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                  }`}>Transacciones</p>
                  <p className={`text-xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>{reportData.transactions.length}</p>
                </div>
                <CreditCard className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
            </div>
          </div>

          {/* Sección Principal del Reporte */}
          {selectedReport === 'summary' && (
            <div className="space-y-6">
              {/* Gráficos de Resumen */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribución de Gastos */}
                <div className={`p-6 rounded-2xl border ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
                }`}>
                  <h3 className={`text-lg font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>Distribución de Gastos</h3>
                  
                  <div className="h-64">
                    {reportData.categoryAnalysis.filter(cat => cat.type === 'expense' && cat.total > 0).length > 0 ? (
                      <Doughnut 
                        data={{
                          labels: reportData.categoryAnalysis
                            .filter(cat => cat.type === 'expense' && cat.total > 0)
                            .map(cat => cat.name),
                          datasets: [{
                            data: reportData.categoryAnalysis
                              .filter(cat => cat.type === 'expense' && cat.total > 0)
                              .map(cat => cat.total),
                            backgroundColor: getChartColors().background,
                            borderColor: getChartColors().border,
                            borderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: { color: getChartColors().text, font: { size: 10 } }
                            }
                          },
                          cutout: '60%'
                        }}
                      />
                    ) : (
                      <div className={`h-full flex items-center justify-center ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <div className="text-center">
                          <PieChart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                          <p>Sin datos de gastos</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tendencia Mensual */}
                <div className={`p-6 rounded-2xl border ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                    : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
                }`}>
                  <h3 className={`text-lg font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>Tendencia Mensual</h3>
                  
                  <div className="h-64">
                    {reportData.monthlyTrend.length > 0 ? (
                      <Line 
                        data={{
                          labels: reportData.monthlyTrend.map(trend => trend.month),
                          datasets: [
                            {
                              label: 'Ingresos',
                              data: reportData.monthlyTrend.map(trend => trend.income),
                              borderColor: getChartColors().border[0],
                              backgroundColor: getChartColors().background[0] + '20',
                              fill: true,
                              tension: 0.4
                            },
                            {
                              label: 'Gastos',
                              data: reportData.monthlyTrend.map(trend => trend.expenses),
                              borderColor: getChartColors().border[1],
                              backgroundColor: getChartColors().background[1] + '20',
                              fill: true,
                              tension: 0.4
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              labels: { color: getChartColors().text, font: { size: 10 } }
                            }
                          },
                          scales: {
                            x: { ticks: { color: getChartColors().text, font: { size: 9 } } },
                            y: { ticks: { color: getChartColors().text, font: { size: 9 } } }
                          }
                        }}
                      />
                    ) : (
                      <div className={`h-full flex items-center justify-center ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                          <p>Sin datos de tendencias</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Análisis Detallado */}
              <div className={`p-6 rounded-2xl border ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Análisis Detallado por Categorías</h3>
                
                <div className="overflow-x-auto">
                  <table className={`w-full text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <thead>
                      <tr className={`border-b ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <th className="text-left p-3">Categoría</th>
                        <th className="text-left p-3">Tipo</th>
                        <th className="text-right p-3">Total</th>
                        <th className="text-center p-3">Transacciones</th>
                        <th className="text-right p-3">Promedio</th>
                        <th className="text-right p-3">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.categoryAnalysis
                        .filter(cat => cat.total > 0)
                        .slice(0, 10)
                        .map((category) => (
                        <tr key={category.id} className={`border-b ${
                          theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100'
                        }`}>
                          <td className="p-3 font-medium">{category.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              category.type === 'income'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {category.type === 'income' ? 'Ingreso' : 'Gasto'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {formatAmount(category.total)}
                          </td>
                          <td className="p-3 text-center">{category.count}</td>
                          <td className="p-3 text-right">
                            {formatAmount(category.average)}
                          </td>
                          <td className="p-3 text-right">
                            {category.percentage.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Otros tipos de reportes se pueden agregar aquí */}
          {selectedReport === 'transactions' && (
            <div className={`p-6 rounded-2xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
            }`}>
              <h3 className={`text-lg font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Reporte de Transacciones - {getPeriodName(selectedPeriod)}</h3>
              
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                    Total de Transacciones
                  </p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {reportData.transactions.length}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                    Ingresos
                  </p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {reportData.transactions.filter(t => t.type === 'income').length}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                    Gastos
                  </p>
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {reportData.transactions.filter(t => t.type === 'expense').length}
                  </p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className={`w-full text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <thead>
                    <tr className={`border-b ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <th className="text-left p-3">Fecha</th>
                      <th className="text-left p-3">Descripción</th>
                      <th className="text-left p-3">Categoría</th>
                      <th className="text-left p-3">Cuenta</th>
                      <th className="text-center p-3">Tipo</th>
                      <th className="text-right p-3">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.transactions.slice(0, 20).map((transaction) => {
                      const category = reportData.categories.find(cat => cat.id === transaction.category);
                      const account = reportData.accounts.find(acc => acc.id === transaction.account);
                      
                      return (
                        <tr key={transaction.id} className={`border-b ${
                          theme === 'dark' ? 'border-gray-700/50' : 'border-gray-100'
                        }`}>
                          <td className="p-3">{new Date(transaction.date).toLocaleDateString('es-ES')}</td>
                          <td className="p-3">{transaction.description || 'Sin descripción'}</td>
                          <td className="p-3">{category?.name || 'Sin categoría'}</td>
                          <td className="p-3">{account?.name || 'Sin cuenta'}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.type === 'income'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                            </span>
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {formatAmount(transaction.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {reportData.transactions.length > 20 && (
                <div className={`mt-4 p-3 text-center text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Mostrando las primeras 20 transacciones de {reportData.transactions.length} totales.
                  Exporta el reporte completo para ver todas las transacciones.
                </div>
              )}
            </div>
          )}

          {/* Botones de Exportación */}
          <div className={`mt-6 p-6 rounded-2xl border ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Download className={`h-5 w-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <h3 className={`text-lg font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Exportar Reporte</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Botones de exportación PDF */}
              <button
                onClick={() => handleExport('pdf', selectedReport)}
                disabled={exporting}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <FileText className="h-4 w-4" />
                PDF
              </button>
              
              {/* Botones de exportación Excel */}
              <button
                onClick={() => handleExport('xlsx', selectedReport)}
                disabled={exporting}
                className="flex items-center gap-2 p-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </button>
              
              {/* Reporte completo Excel */}
              <button
                onClick={() => handleExport('xlsx', 'complete')}
                disabled={exporting}
                className="flex items-center gap-2 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Completo
              </button>
              
              {/* Estado de exportación */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {exporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Exportando...
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Listo
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className={`mt-4 p-3 rounded-lg ${
              theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
            }`}>
              <div className="flex items-start gap-2">
                <Info className={`h-4 w-4 mt-0.5 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  <p className="font-medium mb-1">Opciones de exportación:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>PDF:</strong> Reporte formateado para impresión y presentación</li>
                    <li>• <strong>Excel:</strong> Datos estructurados para análisis adicional</li>
                    <li>• <strong>Completo:</strong> Todos los datos en múltiples hojas de Excel</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reportes;