import { useState, useEffect } from 'react';
import useThemeStore from '../store/themeStore';
import { db, getCategoryAnalysis } from '../db/database';
import {
  Plus,
  Edit3,
  Trash2,
  Tag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Utensils,
  Car,
  Gamepad2,
  Heart,
  BookOpen,
  ShoppingBag,
  Banknote,
  Laptop,
  Home,
  Phone,
  Coffee,
  Shirt,
  Fuel,
  Plane,
  Gift,
  Save
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Iconos disponibles para las categorías
const availableIcons = {
  Utensils, Car, Gamepad2, Heart, BookOpen, ShoppingBag,
  Banknote, Laptop, TrendingUp, Home, Phone, Coffee, Shirt, Fuel, Plane, Gift
};

function Categorias() {
  const { theme } = useThemeStore();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAmounts, setShowAmounts] = useState(true);
  const [categoryStats, setCategoryStats] = useState([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: 'bg-blue-500',
    icon: 'Tag',
    budget: 0
  });

  // Colores disponibles
  const availableColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500'
  ];

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const categoriesData = await db.categories.toArray();
      setCategories(categoriesData);
      
      // Cargar estadísticas de categorías
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const stats = await getCategoryAnalysis(startDate, endDate);
      setCategoryStats(stats);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtrar categorías
  useEffect(() => {
    let filtered = categories;

    if (searchTerm) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(cat => cat.type === filterType);
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm, filterType]);

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await db.categories.update(editingCategory.id, formData);
      } else {
        await db.categories.add(formData);
      }
      
      await loadCategories();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Eliminar categoría
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      try {
        await db.categories.delete(id);
        await loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      color: 'bg-blue-500',
      icon: 'Tag',
      budget: 0
    });
    setEditingCategory(null);
  };

  // Abrir modal para editar
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      budget: category.budget || 0
    });
    setShowModal(true);
  };

  // Formatear montos
  const formatAmount = (amount) => {
    if (!showAmounts) return '****';
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Obtener estadísticas para gráficos
  const getBudgetChartData = () => {
    const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense' && cat.budget > 0);
    const colors = availableColors.slice(0, expenseCategories.length);
    
    return {
      labels: expenseCategories.map(cat => cat.name),
      datasets: [{
        data: expenseCategories.map(cat => cat.budget),
        backgroundColor: colors.map(color => {
          const colorMap = {
            'bg-red-500': '#EF4444',
            'bg-blue-500': '#3B82F6',
            'bg-green-500': '#10B981',
            'bg-yellow-500': '#F59E0B',
            'bg-purple-500': '#8B5CF6',
            'bg-pink-500': '#EC4899',
            'bg-indigo-500': '#6366F1',
            'bg-orange-500': '#F97316',
            'bg-teal-500': '#14B8A6',
            'bg-cyan-500': '#06B6D4',
            'bg-emerald-500': '#10B981',
            'bg-rose-500': '#F43F5E'
          };
          return colorMap[color] || '#3B82F6';
        }),
        borderWidth: 2,
        borderColor: theme === 'dark' ? '#374151' : '#FFFFFF'
      }]
    };
  };

  const getUsageChartData = () => {
    const categoryUsage = categoryStats.filter(stat => stat.total > 0);
    
    return {
      labels: categoryUsage.map(stat => stat.name),
      datasets: [{
        label: 'Gasto Total',
        data: categoryUsage.map(stat => stat.total),
        backgroundColor: categoryUsage.map(stat => {
          const colorMap = {
            'bg-red-500': '#EF4444',
            'bg-blue-500': '#3B82F6',
            'bg-green-500': '#10B981',
            'bg-yellow-500': '#F59E0B',
            'bg-purple-500': '#8B5CF6',
            'bg-pink-500': '#EC4899',
            'bg-indigo-500': '#6366F1',
            'bg-orange-500': '#F97316',
            'bg-teal-500': '#14B8A6',
            'bg-cyan-500': '#06B6D4',
            'bg-emerald-500': '#10B981',
            'bg-rose-500': '#F43F5E'
          };
          return colorMap[stat.color] || '#3B82F6';
        }),
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
          <Tag className="h-6 w-6 animate-pulse text-blue-500" />
          <span className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Cargando categorías...
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
                theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'
              }`}>
                <Tag className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Gestión de Categorías</h1>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Organiza y administra las categorías de tus transacciones</p>
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
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nueva Categoría
              </button>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                }`}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-800'
                }`}
              >
                <option value="all">Todas</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-800/30' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                  }`}>Total Categorías</p>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>{categories.length}</p>
                </div>
                <Tag className={`h-8 w-8 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-800/30' 
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-700'
                  }`}>Categorías de Ingreso</p>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>{categories.filter(cat => cat.type === 'income').length}</p>
                </div>
                <TrendingUp className={`h-8 w-8 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-red-900/20 to-pink-900/20 border-red-800/30' 
                : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-700'
                  }`}>Categorías de Gasto</p>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>{categories.filter(cat => cat.type === 'expense').length}</p>
                </div>
                <TrendingDown className={`h-8 w-8 ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-800/30' 
                : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
                  }`}>Presupuesto Total</p>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {formatAmount(categories.reduce((sum, cat) => sum + (cat.budget || 0), 0))}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de Presupuestos por Categoría */}
            <div className={`p-6 rounded-2xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Distribución de Presupuestos</h3>
                <PieChart className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
              
              <div className="h-64">
                {filteredCategories.filter(cat => cat.type === 'expense' && cat.budget > 0).length > 0 ? (
                  <Doughnut 
                    data={getBudgetChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 11 }
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
                      <PieChart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Sin presupuestos configurados</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico de Uso por Categoría */}
            <div className={`p-6 rounded-2xl border ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Uso de Categorías (Este Mes)</h3>
                <BarChart3 className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`} />
              </div>
              
              <div className="h-64">
                {categoryStats.filter(stat => stat.total > 0).length > 0 ? (
                  <Bar 
                    data={getUsageChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                            font: { size: 10 }
                          },
                          grid: {
                            color: theme === 'dark' ? '#374151' : '#E5E7EB'
                          }
                        },
                        y: {
                          ticks: {
                            color: theme === 'dark' ? '#F3F4F6' : '#1F2937',
                            font: { size: 10 },
                            callback: function(value) {
                              return '$' + value.toLocaleString();
                            }
                          },
                          grid: {
                            color: theme === 'dark' ? '#374151' : '#E5E7EB'
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
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Sin datos de uso disponibles</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Categorías */}
          <div className={`rounded-2xl border ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Categorías ({filteredCategories.length})
              </h3>
            </div>

            <div className="p-6">
              {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCategories.map((category) => {
                    const IconComponent = availableIcons[category.icon] || Tag;
                    const stat = categoryStats.find(s => s.id === category.id);
                    
                    return (
                      <div
                        key={category.id}
                        className={`p-4 rounded-xl border transition-all hover:scale-105 ${
                          theme === 'dark' 
                            ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${category.color}`}>
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className={`font-semibold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-800'
                              }`}>{category.name}</h4>
                              <p className={`text-sm ${
                                category.type === 'income' ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {category.type === 'income' ? 'Ingreso' : 'Gasto'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className={`p-1 rounded transition-colors ${
                                theme === 'dark'
                                  ? 'hover:bg-gray-600 text-gray-400 hover:text-white'
                                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className={`p-1 rounded transition-colors ${
                                theme === 'dark'
                                  ? 'hover:bg-red-900/50 text-gray-400 hover:text-red-400'
                                  : 'hover:bg-red-100 text-gray-600 hover:text-red-600'
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {category.type === 'expense' && category.budget > 0 && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                Presupuesto
                              </span>
                              <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
                                {formatAmount(category.budget)}
                              </span>
                            </div>
                            
                            {stat && (
                              <>
                                <div className="flex justify-between text-sm mb-2">
                                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Gastado
                                  </span>
                                  <span className={`${
                                    stat.total > category.budget ? 'text-red-500' : 'text-green-500'
                                  }`}>
                                    {formatAmount(stat.total)}
                                  </span>
                                </div>
                                
                                <div className={`w-full h-2 rounded-full ${
                                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                                }`}>
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      stat.total > category.budget 
                                        ? 'bg-red-500' 
                                        : 'bg-green-500'
                                    }`}
                                    style={{ 
                                      width: `${Math.min((stat.total / category.budget) * 100, 100)}%` 
                                    }}
                                  ></div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        
                        {stat && (
                          <div className="text-xs text-gray-500">
                            <div className="flex justify-between">
                              <span>Transacciones: {stat.count}</span>
                              <span>Promedio: {formatAmount(stat.average)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`text-center py-12 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <Tag className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No se encontraron categorías</p>
                  <p className="text-sm mb-4">
                    {searchTerm || filterType !== 'all' 
                      ? 'Prueba ajustando los filtros de búsqueda'
                      : 'Comienza creando tu primera categoría'
                    }
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Nueva Categoría
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Agregar/Editar Categoría */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-2xl border ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  required
                />
              </div>

              {/* Tipo */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-800'
                  }`}
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>

              {/* Color */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={`w-8 h-8 rounded-full ${color} ${
                        formData.color === color 
                          ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800' 
                          : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Icono */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Icono
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {Object.entries(availableIcons).map(([iconName]) => {
                    const IconComponent = availableIcons[iconName];
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormData({...formData, icon: iconName})}
                        className={`p-2 rounded-lg border transition-colors ${
                          formData.icon === iconName
                            ? 'border-blue-500 bg-blue-500/10'
                            : theme === 'dark'
                              ? 'border-gray-600 hover:border-gray-500'
                              : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 mx-auto ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Presupuesto (solo para gastos) */}
              {formData.type === 'expense' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Presupuesto mensual (opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: parseFloat(e.target.value) || 0})}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
              )}

              {/* Botones */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categorias;