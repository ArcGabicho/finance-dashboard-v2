import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart
} from 'lucide-react';
import useThemeStore from '../store/themeStore';
import { db } from '../db/database';
import { Doughnut, Bar } from 'react-chartjs-2';

function Presupuestos() {
  const theme = useThemeStore((state) => state.theme);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budgetSummary, setBudgetSummary] = useState({});
  const [categorySpending, setCategorySpending] = useState({});
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly',
    startDate: '',
    endDate: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar categorías, presupuestos y calcular gastos
      const [categoriesData, budgetsData] = await Promise.all([
        db.categories.toArray(),
        db.budgets.toArray()
      ]);

      setCategories(categoriesData);
      setBudgets(budgetsData);
      
      // Calcular gastos actuales por categoría (último mes)
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const transactions = await db.transactions
        .where('date')
        .between(startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0], true, true)
        .toArray();

      // Calcular gastos por categoría
      const spending = {};
      transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          const categoryId = transaction.category;
          if (!spending[categoryId]) {
            spending[categoryId] = 0;
          }
          spending[categoryId] += Math.abs(transaction.amount);
        }
      });

      setCategorySpending(spending);
      
      // Calcular resumen de presupuestos
      calculateBudgetSummary(budgetsData, spending);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBudgetSummary = (budgetsData, spending) => {
    const totalBudget = budgetsData.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = Object.values(spending).reduce((sum, amount) => sum + amount, 0);
    const remaining = totalBudget - totalSpent;
    
    const exceededCount = budgetsData.filter(budget => {
      const spent = spending[budget.categoryId] || 0;
      return spent > budget.amount;
    }).length;

    setBudgetSummary({
      totalBudget,
      totalSpent,
      remaining,
      exceededCount,
      totalBudgets: budgetsData.length,
      utilizationPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const budgetData = {
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        period: formData.period,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || getEndDate(formData.period),
        spent: categorySpending[parseInt(formData.categoryId)] || 0
      };

      if (editingBudget) {
        await db.budgets.update(editingBudget.id, budgetData);
      } else {
        await db.budgets.add(budgetData);
      }

      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const getEndDate = (period) => {
    const now = new Date();
    switch (period) {
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      case 'yearly':
        return new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      default:
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId.toString(),
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate
    });
    setShowModal(true);
  };

  const handleDelete = async (budgetId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
      try {
        await db.budgets.delete(budgetId);
        loadData();
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: '',
      amount: '',
      period: 'monthly',
      startDate: '',
      endDate: ''
    });
    setEditingBudget(null);
    setShowModal(false);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoría desconocida';
  };

  const getProgressColor = (percentage) => {
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = (spent, budget) => {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    
    if (percentage > 100) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    } else if (percentage > 80) {
      return <TrendingUp className="w-5 h-5 text-yellow-500" />;
    } else {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  // Datos para el gráfico de presupuestos vs gastos
  const chartData = {
    labels: budgets.map(budget => getCategoryName(budget.categoryId)),
    datasets: [
      {
        label: 'Presupuesto',
        data: budgets.map(budget => budget.amount),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Gasto Real',
        data: budgets.map(budget => categorySpending[budget.categoryId] || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      }
    ]
  };

  // Datos para el gráfico de dona de utilización
  const utilizationData = {
    labels: ['Gastado', 'Disponible'],
    datasets: [
      {
        data: [budgetSummary.totalSpent || 0, Math.max(0, (budgetSummary.totalBudget || 0) - (budgetSummary.totalSpent || 0))],
        backgroundColor: [
          budgetSummary.utilizationPercentage > 80 ? '#EF4444' : '#F59E0B',
          '#10B981'
        ],
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#e5e7eb' : '#374151'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#f3f4f6'
        }
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#9ca3af' : '#6b7280'
        },
        grid: {
          color: theme === 'dark' ? '#374151' : '#f3f4f6'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            💰 Presupuestos
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Gestiona y controla tus presupuestos por categoría
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Presupuesto</span>
        </button>
      </div>

      {/* Resumen de presupuestos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Presupuestado
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${budgetSummary.totalBudget?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Total Gastado
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${budgetSummary.totalSpent?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Disponible
              </p>
              <p className={`text-2xl font-bold ${budgetSummary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${budgetSummary.remaining?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Presupuestos Excedidos
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {budgetSummary.exceededCount || 0} / {budgetSummary.totalBudgets || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de barras: Presupuesto vs Gasto */}
          <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              📊 Presupuesto vs Gasto Real
            </h3>
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Gráfico de dona: Utilización total */}
          <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              🎯 Utilización del Presupuesto Total
            </h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut 
                data={utilizationData} 
                options={{
                  ...chartOptions,
                  cutout: '60%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: theme === 'dark' ? '#e5e7eb' : '#374151'
                      }
                    }
                  }
                }} 
              />
            </div>
            <div className="text-center mt-4">
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {budgetSummary.utilizationPercentage?.toFixed(1) || 0}%
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Utilización total
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de presupuestos */}
      <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            📋 Lista de Presupuestos
          </h3>
        </div>

        {budgets.length === 0 ? (
          <div className="p-8 text-center">
            <PieChart className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`} />
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
              No tienes presupuestos configurados
            </p>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} mt-2`}>
              Crea tu primer presupuesto para empezar a controlar tus gastos
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Crear Presupuesto
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {budgets.map((budget) => {
              const spent = categorySpending[budget.categoryId] || 0;
              const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
              const remaining = budget.amount - spent;

              return (
                <div key={budget.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(spent, budget.amount)}
                        <div>
                          <h4 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {getCategoryName(budget.categoryId)}
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Período: {budget.period === 'monthly' ? 'Mensual' : budget.period === 'weekly' ? 'Semanal' : 'Anual'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            Gastado: ${spent.toLocaleString()}
                          </span>
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                            Presupuesto: ${budget.amount.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getProgressColor(percentage)} transition-all duration-300`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className={`${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {remaining >= 0 ? 'Disponible' : 'Excedido'}: ${Math.abs(remaining).toLocaleString()}
                          </span>
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                            {percentage.toFixed(1)}% utilizado
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(budget)}
                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para crear/editar presupuesto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {editingBudget ? '✏️ Editar Presupuesto' : '➕ Nuevo Presupuesto'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categoría
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.filter(cat => cat.type === 'expense').map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Monto del Presupuesto
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                  Período
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className={`w-full p-3 rounded-lg border ${theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingBudget ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Presupuestos;