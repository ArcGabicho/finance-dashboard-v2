import { useState } from 'react';
import { 
  Palette, 
  Globe, 
  Bell, 
  User, 
  Shield, 
  RefreshCw, 
  Info, 
  HelpCircle,
  Sun,
  Moon,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  BarChart3,
  FileText,
  Lock,
  Smartphone,
  AlertCircle,
  Upload,
  Download,
  Database
} from 'lucide-react';
import useThemeStore from '../store/themeStore';

function Configuracion() {
  const { theme, toggleTheme } = useThemeStore();
  
  // Estados locales ficticios
  const [userSettings, setUserSettings] = useState({
    name: 'Gabriel Martinez',
    email: 'gabriel@financedashboard.com',
    language: 'es',
    notifications: {
      email: true,
      push: false,
      alerts: true
    },
    privacy: {
      showSalary: true,
      showBalance: false,
      publicProfile: true
    }
  });

  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleUserChange = (field, value) => {
    setUserSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (type) => {
    setUserSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handlePrivacyChange = (setting) => {
    setUserSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: !prev.privacy[setting]
      }
    }));
  };

  const handleReset = () => {
    setUserSettings({
      name: 'Gabriel Martinez',
      email: 'gabriel@financedashboard.com',
      language: 'es',
      notifications: {
        email: true,
        push: false,
        alerts: true
      },
      privacy: {
        showSalary: true,
        showBalance: false,
        publicProfile: true
      }
    });
    setShowResetDialog(false);
  };

  return (
    <div className={`h-screen overflow-hidden p-4 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 rounded-xl ${
              theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
            }`}>
              <Shield className={`h-6 w-6 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Configuración</h1>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Personaliza tu experiencia en el dashboard financiero</p>
            </div>
          </div>
        </div>

        {/* Content Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
          
          {/* Preferencias de Tema */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-blue-900/50' : 'bg-blue-50'
              }`}>
                <Palette className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Apariencia</h2>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Cambia el tema de la aplicación</p>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600 hover:border-blue-500'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  theme === 'light' ? 'bg-yellow-100' : 'bg-blue-900/50'
                }`}>
                  {theme === 'light' ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <div className="text-left">
                  <span className={`font-semibold text-sm block ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {theme === 'light' ? 'Modo Claro' : 'Modo Oscuro'}
                  </span>
                  <span className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {theme === 'light' ? 'Interfaz luminosa' : 'Interfaz nocturna'}
                  </span>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full animate-pulse ${
                theme === 'light' ? 'bg-yellow-500' : 'bg-blue-500'
              }`}></div>
            </button>
          </div>

          {/* Idioma */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-green-900/50' : 'bg-green-50'
              }`}>
                <Globe className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Idioma y Región</h2>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Selecciona tu preferencia</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="relative">
                <select 
                  value={userSettings.language}
                  onChange={(e) => handleUserChange('language', e.target.value)}
                  className={`w-full p-4 text-sm rounded-xl border-2 appearance-none bg-transparent transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400 focus:bg-gray-600'
                      : 'bg-white border-gray-200 text-gray-800 focus:border-green-500 focus:bg-green-50'
                  } focus:outline-none focus:ring-4 focus:ring-green-500/20`}
                >
                  <option value="es">🇪🇸 Español (España)</option>
                  <option value="en">🇺🇸 English (US)</option>
                  <option value="fr">🇫🇷 Français (France)</option>
                  <option value="pt">🇧🇷 Português (Brasil)</option>
                  <option value="de">🇩🇪 Deutsch (Germany)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700/50 border-gray-600' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    theme === 'dark' ? 'bg-green-400' : 'bg-green-500'
                  }`}></div>
                  <span className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-green-700'
                  }`}>
                    Idioma aplicado: <strong>Español</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notificaciones */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-yellow-900/50' : 'bg-yellow-50'
              }`}>
                <Bell className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Notificaciones</h2>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Configura tus alertas</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {Object.entries(userSettings.notifications).map(([key, value]) => {
                const notificationInfo = {
                  email: { icon: Mail, label: 'Email', desc: 'Resúmenes por correo', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
                  push: { icon: Smartphone, label: 'Push', desc: 'Alertas en tiempo real', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                  alerts: { icon: AlertCircle, label: 'Alertas', desc: 'Notificaciones del sistema', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' }
                };
                const info = notificationInfo[key];
                const Icon = info?.icon || Bell;
                
                return (
                  <div key={key} className={`p-4 rounded-xl border transition-all ${
                    theme === 'dark' 
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${info?.iconBg || 'bg-gray-100'}`}>
                          <Icon className={`h-4 w-4 ${info?.iconColor || 'text-gray-600'}`} />
                        </div>
                        <div>
                          <span className={`font-medium text-sm ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {info?.label || key}
                          </span>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {info?.desc || 'Configurar notificaciones'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleNotificationChange(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          value 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg' 
                            : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Datos de Usuario */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-50'
              }`}>
                <User className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Perfil de Usuario</h2>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Actualiza tu información personal</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Nombre completo</label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      value={userSettings.name}
                      onChange={(e) => handleUserChange('name', e.target.value)}
                      placeholder="Ingresa tu nombre"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:bg-gray-600'
                          : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:bg-purple-50'
                      } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>Correo electrónico</label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="email"
                      value={userSettings.email}
                      onChange={(e) => handleUserChange('email', e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400 focus:bg-gray-600'
                          : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:bg-purple-50'
                      } focus:outline-none focus:ring-4 focus:ring-purple-500/20`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                }`}>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>

          {/* Privacidad */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-red-900/50' : 'bg-red-50'
              }`}>
                <Shield className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Privacidad y Seguridad</h2>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Controla tu información visible</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {Object.entries(userSettings.privacy).map(([key, value]) => {
                const privacyInfo = {
                  showSalary: { 
                    icon: BarChart3, 
                    label: 'Mostrar Salario', 
                    desc: 'Tu salario será visible en reportes',
                    iconBg: 'bg-emerald-100',
                    iconColor: 'text-emerald-600'
                  },
                  showBalance: { 
                    icon: FileText, 
                    label: 'Mostrar Saldo', 
                    desc: 'Tu saldo aparecerá en el dashboard',
                    iconBg: 'bg-blue-100',
                    iconColor: 'text-blue-600'
                  },
                  publicProfile: { 
                    icon: Globe, 
                    label: 'Perfil Público', 
                    desc: 'Otros usuarios pueden ver tu perfil',
                    iconBg: 'bg-indigo-100',
                    iconColor: 'text-indigo-600'
                  }
                };
                
                const info = privacyInfo[key];
                const Icon = info?.icon || Lock;
                
                return (
                  <div key={key} className={`p-4 rounded-xl border transition-all ${
                    theme === 'dark' 
                      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${info?.iconBg || 'bg-gray-100'} relative`}>
                          <Icon className={`h-4 w-4 ${info?.iconColor || 'text-gray-600'}`} />
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                            value 
                              ? 'bg-green-500 border-2 border-white' 
                              : 'bg-red-500 border-2 border-white'
                          }`}></div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${
                              theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}>
                              {info?.label || key}
                            </span>
                            {value ? (
                              <Eye className="h-3 w-3 text-green-500" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {info?.desc || 'Configurar privacidad'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePrivacyChange(key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                          value 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg' 
                            : 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Restablecer */}
          <div className={`p-6 rounded-2xl border-2 border-dashed transition-all duration-300 hover:shadow-lg ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-700/50 hover:border-red-600' 
              : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200 hover:border-red-300 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-orange-900/50' : 'bg-orange-100'
              }`}>
                <RefreshCw className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Zona de Riesgo</h2>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Restablece todas las configuraciones</p>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border mb-4 ${
              theme === 'dark' 
                ? 'bg-red-900/20 border-red-800/50' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`} />
                <div>
                  <h3 className={`font-semibold text-sm mb-1 ${
                    theme === 'dark' ? 'text-red-300' : 'text-red-800'
                  }`}>
                    ⚠️ Acción Irreversible
                  </h3>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-700'
                  }`}>
                    Esta acción restaurará todas las configuraciones, preferencias de tema, 
                    notificaciones y datos de usuario a sus valores predeterminados. 
                    <strong> No se puede deshacer.</strong>
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowResetDialog(true)}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 font-bold rounded-xl transition-all duration-200 transform hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg'
                  : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg'
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
              Restablecer Toda la Configuración
              <RefreshCw className="h-4 w-4 opacity-70" />
            </button>

            {/* Dialog de confirmación */}
            {showResetDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`p-6 rounded-xl max-w-sm mx-4 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>¿Confirmar restablecimiento?</h3>
                  <p className={`mb-6 text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setShowResetDialog(false)}
                      className={`flex-1 py-2 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preferencias de Dashboard */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-cyan-900/50' : 'bg-cyan-50'
              }`}>
                <BarChart3 className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Dashboard</h2>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Personaliza tu experiencia</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border transition-all ${
                theme === 'dark' 
                  ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className={`font-medium text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>Gráficos Animados</span>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Transiciones suaves en charts</p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform shadow-lg" />
                  </button>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border transition-all ${
                theme === 'dark' 
                  ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <RefreshCw className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <span className={`font-medium text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>Auto-actualizar</span>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Actualización automática cada 30s</p>
                    </div>
                  </div>
                  <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                  }`}>
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1 transition-transform shadow-lg" />
                  </button>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border transition-all ${
                theme === 'dark' 
                  ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Bell className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <span className={`font-medium text-sm ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>Sonidos</span>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Alertas sonoras habilitadas</p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform shadow-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Seguridad */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-red-900/50' : 'bg-red-50'
              }`}>
                <Shield className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Seguridad</h2>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Protege tu cuenta</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 hover:scale-105 group ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600 hover:border-red-500 text-white hover:from-red-900/30 hover:to-gray-800'
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:border-red-400 text-gray-800 hover:from-red-100 hover:to-pink-100'
              } shadow-md hover:shadow-lg`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <Lock className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block">Cambiar Contraseña</span>
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Actualiza tu contraseña actual</span>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              <button className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 hover:scale-105 group ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600 hover:border-blue-500 text-white hover:from-blue-900/30 hover:to-gray-800'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400 text-gray-800 hover:from-blue-100 hover:to-indigo-100'
              } shadow-md hover:shadow-lg`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block">Autenticación 2FA</span>
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Configurar doble factor</span>
                  </div>
                  <div className="ml-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-orange-600 font-medium">Pendiente</span>
                    </div>
                  </div>
                </div>
              </button>
              
              <button className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 hover:scale-105 group ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600 hover:border-green-500 text-white hover:from-green-900/30 hover:to-gray-800'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-400 text-gray-800 hover:from-green-100 hover:to-emerald-100'
              } shadow-md hover:shadow-lg`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Eye className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block">Sesiones Activas</span>
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Revisar dispositivos conectados</span>
                  </div>
                  <div className="ml-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600 font-medium">3 activas</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Exportar/Importar */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-gray-600' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`p-3 rounded-xl ${
                theme === 'dark' ? 'bg-emerald-900/50' : 'bg-emerald-50'
              }`}>
                <FileText className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                }`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Gestión de Datos</h2>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Import/Export de información</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/30">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm block">Importar CSV</span>
                    <span className="text-xs opacity-90">Cargar datos desde archivo</span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-200 transform hover:scale-105 shadow-lg group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/30">
                    <Download className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm block">Exportar Excel</span>
                    <span className="text-xs opacity-90">Descargar reporte completo</span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
              
              <button className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg group ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600 hover:border-purple-500 text-white hover:from-purple-900/30 hover:to-gray-800'
                  : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-400 text-gray-800 hover:from-purple-100 hover:to-indigo-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Database className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <span className={`font-semibold text-sm block ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>Backup Completo</span>
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Respaldo de toda la información</span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Acerca de */}
          <div className={`lg:col-span-3 p-4 rounded-xl border transition-all duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-100'
              }`}>
                <Info className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                }`} />
              </div>
              <h2 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>Acerca de</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className={`font-semibold mb-2 text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Información de la Aplicación</h3>
                <div className="space-y-1 text-xs">
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    <strong>Nombre:</strong> Finance Dashboard v2
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    <strong>Versión:</strong> 2.1.0
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    <strong>Desarrollador:</strong> Gabriel Martinez
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    <strong>Licencia:</strong> MIT
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Tecnologías</h3>
                <div className="space-y-1 text-xs">
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    ⚛️ React 18.2.0
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    ⚡ Vite 5.0.0
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    🎨 Tailwind CSS 3.3.0
                  </div>
                  <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    🐻 Zustand 4.4.0
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className={`font-semibold mb-2 text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Soporte</h3>
                <div className="space-y-2">
                  <a 
                    href="mailto:soporte@financedashboard.com"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-xs"
                  >
                    <Mail className="h-3 w-3" />
                    Correo Soporte
                  </a>
                  <a 
                    href="tel:+1234567890"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-xs"
                  >
                    <Phone className="h-3 w-3" />
                    Teléfono
                  </a>
                  <a 
                    href="https://github.com/ArcGabicho/finance-dashboard-v2/wiki"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors text-xs"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Documentación
                  </a>
                </div>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Estado del Sistema</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Servidor: Activo
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Base de Datos: OK
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Última actualización: Hoy
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      Tiempo activo: 99.9%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configuracion;