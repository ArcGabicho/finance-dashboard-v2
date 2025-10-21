import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Edit3,
  Trash2,
  CreditCard,
  Building2,
  PiggyBank,
  Wallet,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import useThemeStore from '../store/themeStore';
import { db } from '../db/database';
import { Bar } from 'react-chartjs-2';

function Transacciones() {
  const theme = useThemeStore((state) => state.theme);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all', // all, income, expense
    category: 'all',
    account: 'all',
    dateRange: 'all', // all, today, week, month, year
    sortBy: 'date', // date, amount, description
    sortOrder: 'desc' // asc, desc
  });
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    type: 'expense',
    category: '',
    account: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Estados de estadísticas
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [transactionsData, categoriesData, accountsData] = await Promise.all([
        db.transactions.orderBy('date').reverse().toArray(),
        db.categories.toArray(),
        db.accounts.toArray()
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setAccounts(accountsData);
      
      calculateStats(transactionsData);
      generateChartData(transactionsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactionsData) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    const thisMonthTransactions = transactionsData.filter(t => 
      new Date(t.date) >= thisMonth
    );
    
    const thisWeekTransactions = transactionsData.filter(t => 
      new Date(t.date) >= thisWeek
    );

    const totalIncome = transactionsData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpenses = Math.abs(transactionsData
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0));

    const monthlyIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthlyExpenses = Math.abs(thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0));

    setStats({
      totalTransactions: transactionsData.length,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      monthlyNet: monthlyIncome - monthlyExpenses,
      thisMonthCount: thisMonthTransactions.length,
      thisWeekCount: thisWeekTransactions.length,
      avgTransaction: transactionsData.length > 0 ? 
        (totalIncome + totalExpenses) / transactionsData.length : 0
    });
  };

  const generateChartData = (transactionsData) => {
    // Últimos 7 días de actividad
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTransactions = transactionsData.filter(t => t.date === dateStr);
      const income = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = Math.abs(dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
      
      last7Days.push({
        date: dateStr,
        day: date.toLocaleDateString('es', { weekday: 'short' }),
        income,
        expenses
      });
    }

    setChartData({
      labels: last7Days.map(d => d.day),
      datasets: [
        {
          label: 'Ingresos',
          data: last7Days.map(d => d.income),
          backgroundColor: '#10B981',
          borderRadius: 4,
        },
        {
          label: 'Gastos',
          data: last7Days.map(d => d.expenses),
          backgroundColor: '#EF4444',
          borderRadius: 4,
        }
      ]
    });
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(t.category).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getAccountName(t.account).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Filtro por categoría
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === parseInt(filters.category));
    }

    // Filtro por cuenta
    if (filters.account !== 'all') {
      filtered = filtered.filter(t => t.account === parseInt(filters.account));
    }

    // Filtro por rango de fecha
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(t => new Date(t.date) >= startDate);
      }
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount);
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        case 'date':
        default:
          comparison = new Date(a.date) - new Date(b.date);
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredTransactions(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        type: formData.type,
        category: parseInt(formData.category),
        account: parseInt(formData.account),
        amount: formData.type === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
        description: formData.description,
        date: formData.date
      };

      if (editingTransaction) {
        await db.transactions.update(editingTransaction.id, transactionData);
      } else {
        await db.transactions.add(transactionData);
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category.toString(),
      account: transaction.account.toString(),
      amount: Math.abs(transaction.amount).toString(),
      description: transaction.description,
      date: transaction.date
    });
    setShowModal(true);
  };

  const handleDelete = async (transactionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      try {
        await db.transactions.delete(transactionId);
        loadData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category: '',
      account: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingTransaction(null);
    setShowModal(false);
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      account: 'all',
      dateRange: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
    setSearchTerm('');
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };



  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Cuenta desconocida';
  };

  const getAccountIcon = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return <Building2 className="w-4 h-4" />;
    
    switch (account.type) {
      case 'checking': return <Building2 className="w-4 h-4" />;
      case 'savings': return <PiggyBank className="w-4 h-4" />;
      case 'credit': return <CreditCard className="w-4 h-4" />;
      case 'cash': return <Wallet className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#374151',
          padding: 20
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: theme === 'dark' ? '#374151' : '#f3f4f6'
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        grid: {
          color: theme === 'dark' ? '#374151' : '#f3f4f6'
        },
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
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
    <div className={`h-screen overflow-y-auto p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col mb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            💳 Transacciones
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestiona y analiza todas tus transacciones financieras
          </p>
        </div>
        <div className="flex items-center mt-4 space-x-3 lg:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 
              theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva</span>
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-4">
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Balance Neto</p>
              <p className={`text-xl font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${stats.netBalance?.toLocaleString() || '0'}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${stats.netBalance >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              {stats.netBalance >= 0 ? 
                <TrendingUp className={`w-5 h-5 ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} /> :
                <TrendingDown className={`w-5 h-5 ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              }
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ingresos Mensuales</p>
              <p className="text-xl font-bold text-green-600">
                ${stats.monthlyIncome?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
              <ArrowUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Gastos Mensuales</p>
              <p className="text-xl font-bold text-red-600">
                ${stats.monthlyExpenses?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900">
              <ArrowDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total Transacciones</p>
              <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalTransactions?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Filtros</h3>
            <button
              onClick={resetFilters}
              className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Tipo
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className={`w-full p-2 rounded-lg border ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">Todos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className={`w-full p-2 rounded-lg border ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">Todas</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Cuenta
              </label>
              <select
                value={filters.account}
                onChange={(e) => setFilters({ ...filters, account: e.target.value })}
                className={`w-full p-2 rounded-lg border ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">Todas</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Período
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className={`w-full p-2 rounded-lg border ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">Todo</option>
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Ordenar por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className={`w-full p-2 rounded-lg border ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="date">Fecha</option>
                <option value="amount">Monto</option>
                <option value="description">Descripción</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Orden
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value })}
                className={`w-full p-2 rounded-lg border ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 h-96">
        {/* Gráfico de actividad semanal */}
        {chartData && (
          <div className={`lg:col-span-1 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📊 Últimos 7 días
            </h3>
            <div className="h-72">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Lista de transacciones */}
        <div className={`lg:col-span-3 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                📋 Transacciones Recientes
              </h3>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 w-64 rounded-lg border ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
            </div>
          </div>
          
          <div className="overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 max-h-80">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center">
                <DollarSign className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`} />
                <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                  No hay transacciones
                </p>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} mt-2`}>
                  {searchTerm || filters.type !== 'all' || filters.category !== 'all' ? 
                    'No se encontraron transacciones con los filtros aplicados' : 
                    'Crea tu primera transacción para empezar'
                  }
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {transaction.type === 'income' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {transaction.description}
                        </h4>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getCategoryName(transaction.category)}
                          </span>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <div className="flex items-center space-x-1">
                            {getAccountIcon(transaction.account)}
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {getAccountName(transaction.account)}
                            </span>
                          </div>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(transaction.date).toLocaleDateString('es')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-1 text-red-500 transition-colors rounded hover:bg-red-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Análisis adicional */}
      <div className="grid grid-cols-1 gap-4 mt-6 lg:grid-cols-3">
        {/* Categorías más utilizadas */}
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            🏷️ Top Categorías (Este Mes)
          </h3>
          <div className="space-y-3">
            {categories
              .filter(cat => cat.type === 'expense')
              .slice(0, 5)
              .map(category => {
                const categoryTransactions = filteredTransactions.filter(t => 
                  t.category === category.id && 
                  t.type === 'expense' &&
                  new Date(t.date).getMonth() === new Date().getMonth()
                );
                const total = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                const count = categoryTransactions.length;
                
                return (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color || 'bg-gray-500'}`}></div>
                      <div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {category.name}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {count} transacciones
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* Tendencia semanal */}
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            📈 Resumen Semanal
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowUp className="w-4 h-4 text-green-600" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Ingresos promedio/día
                </span>
              </div>
              <span className={`text-sm font-semibold text-green-600`}>
                ${chartData ? (chartData.datasets[0].data.reduce((sum, val) => sum + val, 0) / 7).toLocaleString() : '0'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowDown className="w-4 h-4 text-red-600" />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Gastos promedio/día
                </span>
              </div>
              <span className={`text-sm font-semibold text-red-600`}>
                ${chartData ? (chartData.datasets[1].data.reduce((sum, val) => sum + val, 0) / 7).toLocaleString() : '0'}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Balance semanal
                </span>
                <span className={`text-sm font-bold ${(stats.monthlyIncome - stats.monthlyExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${chartData ? 
                    ((chartData.datasets[0].data.reduce((sum, val) => sum + val, 0) - chartData.datasets[1].data.reduce((sum, val) => sum + val, 0))).toLocaleString() : '0'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transacciones recientes rápidas */}
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            ⚡ Transacciones Rápidas
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                setFormData({
                  type: 'expense',
                  category: categories.find(c => c.name === 'Alimentación')?.id?.toString() || '',
                  account: accounts[0]?.id?.toString() || '',
                  amount: '',
                  description: 'Comida',
                  date: new Date().toISOString().split('T')[0]
                });
                setShowModal(true);
              }}
              className={`w-full p-2 text-left rounded-lg border-2 border-dashed transition-colors ${
                theme === 'dark' 
                  ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="p-1 text-red-600 bg-red-100 rounded">
                  <ArrowDown className="w-3 h-3" />
                </div>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Gasto en Alimentación
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setFormData({
                  type: 'expense',
                  category: categories.find(c => c.name === 'Transporte')?.id?.toString() || '',
                  account: accounts[0]?.id?.toString() || '',
                  amount: '',
                  description: 'Transporte',
                  date: new Date().toISOString().split('T')[0]
                });
                setShowModal(true);
              }}
              className={`w-full p-2 text-left rounded-lg border-2 border-dashed transition-colors ${
                theme === 'dark' 
                  ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="p-1 text-blue-600 bg-blue-100 rounded">
                  <ArrowDown className="w-3 h-3" />
                </div>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Gasto en Transporte
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                setFormData({
                  type: 'income',
                  category: categories.find(c => c.name === 'Salario')?.id?.toString() || '',
                  account: accounts[0]?.id?.toString() || '',
                  amount: '',
                  description: 'Ingreso',
                  date: new Date().toISOString().split('T')[0]
                });
                setShowModal(true);
              }}
              className={`w-full p-2 text-left rounded-lg border-2 border-dashed transition-colors ${
                theme === 'dark' 
                  ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="p-1 text-green-600 bg-green-100 rounded">
                  <ArrowUp className="w-3 h-3" />
                </div>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Registrar Ingreso
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 lg:grid-cols-4">
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Transacción Promedio
              </p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${stats.avgTransaction?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg dark:bg-indigo-900">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Cuentas Activas
              </p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {accounts.filter(acc => acc.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900">
              <ArrowUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Transacciones Hoy
              </p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {transactions.filter(t => 
                  new Date(t.date).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 rounded-lg dark:bg-teal-900">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                Esta Semana
              </p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.thisWeekCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar transacción */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingTransaction ? '✏️ Editar Transacción' : '➕ Nueva Transacción'}
              </h3>
              <button
                onClick={resetForm}
                className={`p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo de Transacción
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.type === 'income' 
                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <ArrowUp className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Ingreso</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      formData.type === 'expense' 
                        ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-red-300'
                    }`}
                  >
                    <ArrowDown className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Gasto</span>
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Monto
                </label>
                <div className="relative">
                  <DollarSign className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Ej: Compra en supermercado"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories
                    .filter(cat => cat.type === formData.type)
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cuenta
                </label>
                <select
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                >
                  <option value="">Selecciona una cuenta</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className={`px-4 py-2 rounded-lg ${theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  } transition-colors`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {editingTransaction ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transacciones;