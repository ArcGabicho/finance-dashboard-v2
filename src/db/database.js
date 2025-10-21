import Dexie from 'dexie';

// Configuración de la base de datos
export const db = new Dexie('FinanceDashboardDB');

// Definición del esquema de la base de datos
db.version(1).stores({
  transactions: '++id, type, category, amount, description, date, account',
  categories: '++id, name, type, color, icon, budget',
  accounts: '++id, name, type, balance, currency, isActive',
  budgets: '++id, categoryId, amount, period, startDate, endDate, spent',
  goals: '++id, name, targetAmount, currentAmount, deadline, description, isCompleted'
});

// Datos de ejemplo para inicializar la base de datos
export const initializeData = async () => {
  // Verificar si ya hay datos
  const existingTransactions = await db.transactions.count();
  if (existingTransactions > 0) return;

  // Categorías por defecto
  const defaultCategories = [
    { name: 'Alimentación', type: 'expense', color: 'bg-red-500', icon: 'Utensils', budget: 500 },
    { name: 'Transporte', type: 'expense', color: 'bg-blue-500', icon: 'Car', budget: 300 },
    { name: 'Entretenimiento', type: 'expense', color: 'bg-purple-500', icon: 'Gamepad2', budget: 200 },
    { name: 'Salud', type: 'expense', color: 'bg-green-500', icon: 'Heart', budget: 150 },
    { name: 'Educación', type: 'expense', color: 'bg-indigo-500', icon: 'BookOpen', budget: 100 },
    { name: 'Compras', type: 'expense', color: 'bg-orange-500', icon: 'ShoppingBag', budget: 250 },
    { name: 'Salario', type: 'income', color: 'bg-emerald-500', icon: 'Banknote', budget: 0 },
    { name: 'Freelance', type: 'income', color: 'bg-cyan-500', icon: 'Laptop', budget: 0 },
    { name: 'Inversiones', type: 'income', color: 'bg-yellow-500', icon: 'TrendingUp', budget: 0 },
  ];

  // Cuentas por defecto
  const defaultAccounts = [
    { name: 'Cuenta Corriente', type: 'checking', balance: 2500, currency: 'USD', isActive: true },
    { name: 'Cuenta de Ahorros', type: 'savings', balance: 8500, currency: 'USD', isActive: true },
    { name: 'Tarjeta de Crédito', type: 'credit', balance: -1200, currency: 'USD', isActive: true },
    { name: 'Efectivo', type: 'cash', balance: 350, currency: 'USD', isActive: true },
  ];

  // Transacciones de ejemplo (últimos 3 meses)
  const defaultTransactions = [];
  const categories = await db.categories.bulkAdd(defaultCategories, { allKeys: true });
  const accounts = await db.accounts.bulkAdd(defaultAccounts, { allKeys: true });

  // Generar transacciones de ejemplo
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generar 1-3 transacciones por día
    const transactionsPerDay = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < transactionsPerDay; j++) {
      const isExpense = Math.random() > 0.3; // 70% gastos, 30% ingresos
      const categoryType = isExpense ? 'expense' : 'income';
      const availableCategories = categories.filter((_, index) => 
        defaultCategories[index].type === categoryType
      );
      
      if (availableCategories.length === 0) continue;
      
      const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
      const randomAccount = accounts[Math.floor(Math.random() * accounts.length)];
      
      let amount;
      if (categoryType === 'expense') {
        amount = -(Math.floor(Math.random() * 200) + 10); // Gastos entre 10-210
      } else {
        amount = Math.floor(Math.random() * 1000) + 100; // Ingresos entre 100-1100
      }
      
      const descriptions = {
        'Alimentación': ['Supermercado', 'Restaurante', 'Comida rápida', 'Cafetería', 'Grocería'],
        'Transporte': ['Gasolina', 'Uber', 'Metro', 'Estacionamiento', 'Mantenimiento auto'],
        'Entretenimiento': ['Cine', 'Concierto', 'Videojuegos', 'Suscripción streaming', 'Deportes'],
        'Salud': ['Médico', 'Farmacia', 'Gimnasio', 'Dentista', 'Seguro médico'],
        'Educación': ['Libros', 'Curso online', 'Certificación', 'Universidad', 'Material escolar'],
        'Compras': ['Ropa', 'Electrónicos', 'Casa', 'Regalo', 'Accesorios'],
        'Salario': ['Sueldo mensual', 'Bonificación', 'Pago quincenal', 'Comisión'],
        'Freelance': ['Proyecto web', 'Consultoría', 'Diseño gráfico', 'Desarrollo'],
        'Inversiones': ['Dividendos', 'Venta acciones', 'Intereses', 'Cripto']
      };
      
      const categoryName = defaultCategories.find(cat => cat.type === categoryType && 
        categories.indexOf(randomCategory) === defaultCategories.indexOf(cat))?.name || 'Otros';
      
      const randomDescription = descriptions[categoryName] ? 
        descriptions[categoryName][Math.floor(Math.random() * descriptions[categoryName].length)] : 
        categoryName;

      defaultTransactions.push({
        type: categoryType,
        category: randomCategory,
        amount: amount,
        description: randomDescription,
        date: date.toISOString().split('T')[0],
        account: randomAccount
      });
    }
  }

  // Metas financieras de ejemplo
  const defaultGoals = [
    {
      name: 'Fondo de emergencia',
      targetAmount: 10000,
      currentAmount: 6500,
      deadline: '2025-12-31',
      description: 'Ahorrar para 6 meses de gastos',
      isCompleted: false
    },
    {
      name: 'Vacaciones 2026',
      targetAmount: 3000,
      currentAmount: 1200,
      deadline: '2026-06-15',
      description: 'Viaje a Europa',
      isCompleted: false
    },
    {
      name: 'Nuevo laptop',
      targetAmount: 1500,
      currentAmount: 1500,
      deadline: '2025-11-01',
      description: 'MacBook Pro para trabajo',
      isCompleted: true
    }
  ];

  // Insertar datos en la base de datos
  await db.transactions.bulkAdd(defaultTransactions);
  await db.goals.bulkAdd(defaultGoals);

  console.log('Base de datos inicializada con datos de ejemplo');
};

// Funciones de utilidad para análisis
export const getTransactionsByPeriod = async (startDate, endDate) => {
  return await db.transactions
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
};

export const getTransactionsByCategory = async (categoryId) => {
  return await db.transactions
    .where('category')
    .equals(categoryId)
    .toArray();
};

export const getTotalsByType = async (startDate, endDate) => {
  const transactions = await getTransactionsByPeriod(startDate, endDate);
  
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = Math.abs(transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0));
    
  return { income, expenses, net: income - expenses };
};

export const getCategoryAnalysis = async (startDate, endDate) => {
  const transactions = await getTransactionsByPeriod(startDate, endDate);
  const categories = await db.categories.toArray();
  
  const analysis = categories.map(category => {
    const categoryTransactions = transactions.filter(t => t.category === category.id);
    const total = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const count = categoryTransactions.length;
    const average = count > 0 ? total / count : 0;
    
    return {
      ...category,
      total,
      count,
      average,
      percentage: 0 // Se calculará después
    };
  });
  
  // Calcular porcentajes
  const totalAmount = analysis.reduce((sum, cat) => sum + cat.total, 0);
  analysis.forEach(cat => {
    cat.percentage = totalAmount > 0 ? (cat.total / totalAmount) * 100 : 0;
  });
  
  return analysis.sort((a, b) => b.total - a.total);
};

export const getMonthlyTrend = async (months = 12) => {
  const today = new Date();
  const trends = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const totals = await getTotalsByType(startDate, endDate);
    
    trends.push({
      month: date.toLocaleString('es', { month: 'short', year: 'numeric' }),
      date: startDate,
      ...totals
    });
  }
  
  return trends;
};

// Inicializar la base de datos al importar
db.open().then(() => {
  initializeData();
});

export default db;