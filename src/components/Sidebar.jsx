import { Link, useLocation } from "react-router-dom";
import { Home, ArrowUpDown, CreditCard, PiggyBank, FileText, Tag, BarChart3, Settings, Github, ExternalLink, Sun, Moon } from 'lucide-react';
import useThemeStore from '../store/themeStore';

const Sidebar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'transacciones', label: 'Transacciones', icon: ArrowUpDown },
    { id: 'cuentas', label: 'Cuentas', icon: CreditCard },
    { id: 'presupuestos', label: 'Presupuestos', icon: PiggyBank },
    { id: 'reportes', label: 'Reportes', icon: FileText },
    { id: 'categorias', label: 'Categorías', icon: Tag },
    { id: 'analisis', label: 'Análisis', icon: BarChart3 },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className={`${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700' 
        : 'bg-gradient-to-b from-white to-gray-50 border-r border-gray-200'
    } shadow-xl w-72 h-screen flex flex-col transition-colors duration-300`}>
      {/* Header */}
      <div className={`p-6 border-b ${
        theme === 'dark' 
          ? 'border-gray-700 bg-gray-900' 
          : 'border-gray-200 bg-white'
      } transition-colors duration-300`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-bold">F</span>
          </div>
          <h1 className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          } transition-colors duration-300`}>
            Finance<span className="text-blue-600">Dashboard</span>
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === (item.id === 'inicio' ? '/' : `/${item.id}`);
          
          return (
            <Link
              key={item.id}
              to={item.id === 'inicio' ? '/' : `/${item.id}`}
            >
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/30 text-blue-300 shadow-sm border border-blue-700/50'
                      : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md'
                      : 'text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-md'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                )}
                <Icon 
                  className={`h-5 w-5 transition-colors ${
                    isActive 
                      ? 'text-blue-600' 
                      : theme === 'dark'
                        ? 'text-gray-400 group-hover:text-blue-400'
                        : 'text-gray-500 group-hover:text-blue-500'
                  }`} 
                />
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 pb-3">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 border-gray-600 text-white'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-gray-300 text-gray-700'
          }`}
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-gray-600" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-400" />
          )}
          <div className="flex-1 flex items-center justify-between">
            <span className="font-medium text-sm">
              {theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
            </span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </button>
      </div>

      {/* GitHub Repository */}
      <div className="px-4 pb-3">
        <div className={`rounded-xl p-4 border transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600'
            : 'bg-gradient-to-br from-white to-blue-50 border-blue-200'
        }`}>
          {/* Repository Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'
            }`}>
              <Github className={`h-5 w-5 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-sm ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>finance-dashboard-v2</h3>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Dashboard Financiero</p>
            </div>
          </div>

          {/* Action Button */}
          <a 
            href="https://github.com/ArcGabicho/finance-dashboard-v2" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 group font-semibold text-sm border ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md hover:shadow-lg'
            }`}
          >
            <span>Ver en GitHub</span>
            <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* System Status */}
      <div className={`p-4 border-t transition-colors duration-300 ${
        theme === 'dark' 
          ? 'border-gray-700 bg-gray-900' 
          : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-600">Online</p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>Sistema Activo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;