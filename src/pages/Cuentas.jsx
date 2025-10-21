import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  CreditCard,
  Wallet,
  PiggyBank,
  Building2,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Activity,
  MoreVertical,
  Copy,
  CheckCircle
} from 'lucide-react';
import useThemeStore from '../store/themeStore';
import { db } from '../db/database';


function Cuentas() {
  const theme = useThemeStore((state) => state.theme);
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountSummary, setAccountSummary] = useState({});
  const [showBalances, setShowBalances] = useState({});
  const [copiedCard, setCopiedCard] = useState(null);
  const [accountTransactions, setAccountTransactions] = useState({});
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    balance: '',
    currency: 'USD',
    isActive: true
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar cuentas y transacciones
      const [accountsData, transactionsData] = await Promise.all([
        db.accounts.toArray(),
        db.transactions.toArray()
      ]);

      setAccounts(accountsData);
      
      // Calcular resumen de cuentas
      calculateAccountSummary(accountsData, transactionsData);
      
      // Calcular transacciones por cuenta
      calculateAccountTransactions(accountsData, transactionsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAccountSummary = (accountsData, transactionsData) => {
    const totalBalance = accountsData.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const activeAccounts = accountsData.filter(acc => acc.isActive).length;
    const totalTransactions = transactionsData.length;
    
    // Calcular balance por tipo de cuenta
    const balanceByType = accountsData.reduce((acc, account) => {
      if (!acc[account.type]) {
        acc[account.type] = 0;
      }
      acc[account.type] += account.balance || 0;
      return acc;
    }, {});

    setAccountSummary({
      totalBalance,
      activeAccounts,
      totalAccounts: accountsData.length,
      totalTransactions,
      balanceByType,
      averageBalance: accountsData.length > 0 ? totalBalance / accountsData.length : 0
    });
  };

  const calculateAccountTransactions = (accountsData, transactionsData) => {
    const accountTrans = {};
    
    accountsData.forEach(account => {
      const accountTransList = transactionsData.filter(t => 
        t.account === account.id || t.account === account.name
      );
      
      // Últimas 30 transacciones para el gráfico
      const recent = accountTransList
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 30)
        .reverse();
      
      // Calcular balance histórico para el gráfico
      let runningBalance = account.balance;
      const balanceHistory = recent.map(t => {
        runningBalance -= t.amount; // Restar porque vamos hacia atrás
        return {
          date: t.date,
          balance: runningBalance
        };
      });
      
      accountTrans[account.id] = {
        transactions: accountTransList,
        recent: recent,
        balanceHistory: balanceHistory,
        income: accountTransList.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expenses: Math.abs(accountTransList.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))
      };
    });
    
    setAccountTransactions(accountTrans);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const accountData = {
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
        currency: formData.currency,
        isActive: formData.isActive
      };

      if (editingAccount) {
        await db.accounts.update(editingAccount.id, accountData);
      } else {
        await db.accounts.add(accountData);
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      currency: account.currency,
      isActive: account.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cuenta? Se eliminarán también todas las transacciones asociadas.')) {
      try {
        // Eliminar transacciones de la cuenta
        await db.transactions.where('account').equals(accountId).delete();
        // Eliminar cuenta
        await db.accounts.delete(accountId);
        loadData();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'checking',
      balance: '',
      currency: 'USD',
      isActive: true
    });
    setEditingAccount(null);
    setShowModal(false);
  };

  const toggleBalanceVisibility = (accountId) => {
    setShowBalances(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'checking': return <Building2 className="w-6 h-6" />;
      case 'savings': return <PiggyBank className="w-6 h-6" />;
      case 'credit': return <CreditCard className="w-6 h-6" />;
      case 'cash': return <Wallet className="w-6 h-6" />;
      default: return <Building2 className="w-6 h-6" />;
    }
  };

  const getAccountTypeLabel = (type) => {
    switch (type) {
      case 'checking': return 'Cuenta Corriente';
      case 'savings': return 'Cuenta de Ahorros';
      case 'credit': return 'Tarjeta de Crédito';
      case 'cash': return 'Efectivo';
      default: return 'Cuenta';
    }
  };

  const getCardGradient = (type, index) => {
    const gradients = {
      checking: ['from-blue-600 via-blue-700 to-indigo-800', 'from-emerald-600 via-teal-700 to-cyan-800'],
      savings: ['from-green-600 via-emerald-700 to-teal-800', 'from-purple-600 via-violet-700 to-indigo-800'],
      credit: ['from-red-600 via-rose-700 to-pink-800', 'from-orange-600 via-amber-700 to-yellow-800'],
      cash: ['from-gray-600 via-slate-700 to-zinc-800', 'from-stone-600 via-neutral-700 to-gray-800']
    };
    
    const typeGradients = gradients[type] || gradients.checking;
    return typeGradients[index % typeGradients.length];
  };

  const copyCardNumber = (accountId) => {
    const cardNumber = `**** **** **** ${accountId.toString().padStart(4, '0')}`;
    navigator.clipboard.writeText(cardNumber);
    setCopiedCard(accountId);
    setTimeout(() => setCopiedCard(null), 2000);
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
      <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            🏦 Cuentas
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestiona tus cuentas bancarias y tarjetas
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-6 py-3 mt-4 space-x-2 text-white transition-colors bg-blue-600 rounded-lg md:mt-0 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Cuenta</span>
        </button>
      </div>

      {/* Resumen de cuentas */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Balance Total
              </p>
              <p className={`text-2xl font-bold ${accountSummary.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${accountSummary.totalBalance?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full dark:bg-green-900">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Cuentas Activas
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {accountSummary.activeAccounts || 0} / {accountSummary.totalAccounts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Transacciones
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {accountSummary.totalTransactions?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de cuentas estilo real */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account, index) => (
          <div key={account.id} className="group">
            {/* Tarjeta realista */}
            <div className={`relative w-full h-56 rounded-2xl bg-gradient-to-br ${getCardGradient(account.type, index)} p-6 text-white shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl`}>
              {/* Patrón de fondo sutil */}
              <div className="absolute inset-0 bg-white opacity-5 rounded-2xl" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
              
              {/* Chip de la tarjeta */}
              <div className="absolute top-6 left-6">
                <div className="flex items-center justify-center w-12 rounded-md shadow-md h-9 bg-gradient-to-br from-yellow-200 to-yellow-400">
                  <div className="w-8 h-6 rounded-sm bg-gradient-to-br from-yellow-300 to-amber-500"></div>
                </div>
              </div>
              
              {/* Logo del banco */}
              <div className="absolute top-6 right-6">
                <div className="p-2 bg-white rounded-full bg-opacity-20 backdrop-blur-sm">
                  {getAccountIcon(account.type)}
                </div>
              </div>
              
              {/* Número de tarjeta */}
              <div className="absolute top-20 left-6 right-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => copyCardNumber(account.id)}
                    className="flex items-center px-3 py-1 space-x-2 font-mono text-xl tracking-wider transition-colors rounded-lg hover:bg-white hover:bg-opacity-10"
                  >
                    <span>**** **** **** {account.id.toString().padStart(4, '0')}</span>
                    {copiedCard === account.id ? 
                      <CheckCircle className="w-4 h-4 text-green-300" /> : 
                      <Copy className="w-4 h-4 opacity-60" />
                    }
                  </button>
                </div>
              </div>
              
              {/* Información de la cuenta */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs tracking-wide uppercase opacity-75">Titular</p>
                    <p className="text-lg font-semibold">{account.name}</p>
                    <p className="text-xs opacity-75">{getAccountTypeLabel(account.type)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs tracking-wide uppercase opacity-75">Balance</p>
                    <div className="flex items-center space-x-2">
                      <p className={`text-xl font-bold ${showBalances[account.id] ? '' : 'blur-sm select-none'}`}>
                        ${Math.abs(account.balance).toLocaleString()}
                      </p>
                      <button
                        onClick={() => toggleBalanceVisibility(account.id)}
                        className="p-1 transition-colors rounded hover:bg-white hover:bg-opacity-10"
                      >
                        {showBalances[account.id] ? 
                          <EyeOff className="w-4 h-4" /> : 
                          <Eye className="w-4 h-4" />
                        }
                      </button>
                    </div>
                    {account.balance < 0 && (
                      <p className="text-xs text-red-200">Saldo negativo</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Indicador de estado */}
              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${account.isActive ? 'bg-green-400' : 'bg-red-400'} shadow-md`}></div>
            </div>
            
            {/* Controles de la tarjeta */}
            <div className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} opacity-0 group-hover:opacity-100 transition-opacity`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ingresos</p>
                    <p className="text-sm font-semibold text-green-600">
                      +${accountTransactions[account.id]?.income?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Gastos</p>
                    <p className="text-sm font-semibold text-red-600">
                      -${accountTransactions[account.id]?.expenses?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Transacciones</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {accountTransactions[account.id]?.transactions?.length || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(account)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lista detallada de cuentas */}
      {accounts.length > 0 && (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📋 Detalle de Cuentas
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {accounts.map((account) => (
              <div key={account.id} className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${account.type === 'checking' ? 'bg-blue-100 text-blue-600' :
                      account.type === 'savings' ? 'bg-green-100 text-green-600' :
                      account.type === 'credit' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'}`}>
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {account.name}
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {getAccountTypeLabel(account.type)} • {account.currency}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ingresos</p>
                      <p className="text-sm font-semibold text-green-600">
                        +${accountTransactions[account.id]?.income?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Gastos</p>
                      <p className="text-sm font-semibold text-red-600">
                        -${accountTransactions[account.id]?.expenses?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${account.balance.toLocaleString()}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {account.isActive ? 'Activa' : 'Inactiva'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(account)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {accounts.length === 0 && (
        <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-8 text-center`}>
          <CreditCard className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`} />
          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
            No tienes cuentas configuradas
          </p>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} mt-2`}>
            Crea tu primera cuenta para empezar a gestionar tus finanzas
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Crear Cuenta
          </button>
        </div>
      )}

      {/* Modal para crear/editar cuenta */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {editingAccount ? '✏️ Editar Cuenta' : '➕ Nueva Cuenta'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nombre de la Cuenta
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Ej: Mi Cuenta Principal"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo de Cuenta
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="checking">Cuenta Corriente</option>
                  <option value="savings">Cuenta de Ahorros</option>
                  <option value="credit">Tarjeta de Crédito</option>
                  <option value="cash">Efectivo</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Balance Inicial
                </label>
                <div className="relative">
                  <DollarSign className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
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
                  Moneda
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="USD">USD - Dólar Americano</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cuenta activa
                </label>
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
                  {editingAccount ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cuentas;