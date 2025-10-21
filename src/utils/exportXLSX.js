import * as XLSX from 'xlsx';

// Configuración de colores profesionales
const colors = {
  primary: '3B82F6',      // Azul
  success: '10B981',      // Verde
  danger: 'EF4444',       // Rojo  
  warning: 'F59E0B',      // Amarillo
  info: '06B6D4',         // Cian
  purple: '8B5CF6',       // Morado
  gray: '6B7280',         // Gris
  lightGray: 'F3F4F6',   // Gris claro
  white: 'FFFFFF',        // Blanco
  darkBlue: '1E40AF'      // Azul oscuro
};

// Función para crear libro de Excel con estilos profesionales
const createWorkbook = () => {
  const workbook = XLSX.utils.book_new();
  // Configurar propiedades del documento
  workbook.Props = {
    Title: "Finance Dashboard - Reporte Profesional",
    Subject: "Análisis Financiero Detallado",
    Author: "Finance Dashboard System",
    Company: "Finance Dashboard",
    CreatedDate: new Date()
  };
  return workbook;
};

// Función para crear encabezado profesional con estilos
const addProfessionalHeader = (worksheet, title, period, startRow = 1) => {
  // Título principal
  const titleCell = XLSX.utils.encode_cell({ r: startRow - 1, c: 0 });
  worksheet[titleCell] = {
    v: `📊 FINANCE DASHBOARD - ${title.toUpperCase()}`,
    t: 's',
    s: {
      font: { 
        name: 'Arial', 
        sz: 16, 
        bold: true, 
        color: { rgb: colors.darkBlue }
      },
      fill: { 
        patternType: 'solid', 
        fgColor: { rgb: colors.lightGray }
      },
      alignment: { 
        horizontal: 'left', 
        vertical: 'center' 
      },
      border: {
        top: { style: 'thin', color: { rgb: colors.primary }},
        bottom: { style: 'thin', color: { rgb: colors.primary }},
        left: { style: 'thin', color: { rgb: colors.primary }},
        right: { style: 'thin', color: { rgb: colors.primary }}
      }
    }
  };

  // Información de fecha y período
  const dateCell = XLSX.utils.encode_cell({ r: startRow, c: 0 });
  worksheet[dateCell] = {
    v: `📅 Fecha: ${new Date().toLocaleDateString('es-ES')} | Período: ${period}`,
    t: 's',
    s: {
      font: { 
        name: 'Arial', 
        sz: 10, 
        color: { rgb: colors.gray }
      },
      alignment: { 
        horizontal: 'left', 
        vertical: 'center' 
      }
    }
  };

  // Línea separadora
  const separatorCell = XLSX.utils.encode_cell({ r: startRow + 1, c: 0 });
  worksheet[separatorCell] = {
    v: '═'.repeat(50),
    t: 's',
    s: {
      font: { 
        name: 'Arial', 
        sz: 8, 
        color: { rgb: colors.primary }
      }
    }
  };

  return startRow + 3; // Retorna la fila donde empezar los datos
};

// Función para aplicar estilos a encabezados de tabla
const styleTableHeaders = (worksheet, range, backgroundColor = colors.primary) => {
  const decode = XLSX.utils.decode_range(range);
  for (let R = decode.s.r; R <= decode.e.r; ++R) {
    for (let C = decode.s.c; C <= decode.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { 
          name: 'Arial', 
          sz: 11, 
          bold: true, 
          color: { rgb: colors.white }
        },
        fill: { 
          patternType: 'solid', 
          fgColor: { rgb: backgroundColor }
        },
        alignment: { 
          horizontal: 'center', 
          vertical: 'center' 
        },
        border: {
          top: { style: 'thin', color: { rgb: colors.white }},
          bottom: { style: 'thin', color: { rgb: colors.white }},
          left: { style: 'thin', color: { rgb: colors.white }},
          right: { style: 'thin', color: { rgb: colors.white }}
        }
      };
    }
  }
};

// Función para aplicar estilos a filas de datos
const styleDataRows = (worksheet, range) => {
  const decode = XLSX.utils.decode_range(range);
  for (let R = decode.s.r; R <= decode.e.r; ++R) {
    const isEvenRow = (R - decode.s.r) % 2 === 0;
    const rowColor = isEvenRow ? colors.white : colors.lightGray;
    
    for (let C = decode.s.c; C <= decode.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        font: { 
          name: 'Arial', 
          sz: 10, 
          color: { rgb: colors.gray }
        },
        fill: { 
          patternType: 'solid', 
          fgColor: { rgb: rowColor }
        },
        alignment: { 
          horizontal: 'left', 
          vertical: 'center' 
        },
        border: {
          top: { style: 'thin', color: { rgb: colors.gray }},
          bottom: { style: 'thin', color: { rgb: colors.gray }},
          left: { style: 'thin', color: { rgb: colors.gray }},
          right: { style: 'thin', color: { rgb: colors.gray }}
        }
      };
    }
  }
};

// Función para aplicar estilos condicionales
const applyConditionalStyling = (worksheet, cellAddress, value, type = 'default') => {
  if (!worksheet[cellAddress]) return;
  
  let cellColor = colors.gray;
  let textColor = colors.gray;
  
  switch (type) {
    case 'currency':
      if (typeof value === 'number') {
        cellColor = value >= 0 ? colors.success : colors.danger;
        textColor = colors.white;
        // Formatear como moneda
        worksheet[cellAddress].z = '"$"#,##0.00';
      }
      break;
    case 'percentage':
      if (typeof value === 'number') {
        cellColor = value >= 0 ? colors.success : colors.danger;
        textColor = colors.white;
        worksheet[cellAddress].z = '0.00"%"';
      }
      break;
    case 'status':
      switch (value) {
        case 'Positivo':
        case 'income':
        case 'Activo':
          cellColor = colors.success;
          textColor = colors.white;
          break;
        case 'Negativo':
        case 'expense':
        case 'Inactivo':
          cellColor = colors.danger;
          textColor = colors.white;
          break;
        default:
          cellColor = colors.info;
          textColor = colors.white;
      }
      break;
  }
  
  worksheet[cellAddress].s = {
    ...worksheet[cellAddress].s,
    fill: { 
      patternType: 'solid', 
      fgColor: { rgb: cellColor }
    },
    font: {
      ...worksheet[cellAddress].s?.font,
      color: { rgb: textColor },
      bold: type === 'currency' || type === 'status'
    }
  };
};

// Función para formatear columnas
const formatWorksheet = (worksheet, headers) => {
  const columnWidths = headers.map(header => {
    const maxLength = Math.max(header.length, 15);
    return { wch: Math.min(maxLength * 1.2, 25) };
  });
  
  worksheet['!cols'] = columnWidths;
  worksheet['!margins'] = {
    left: 0.7, right: 0.7, top: 0.75, bottom: 0.75,
    header: 0.3, footer: 0.3
  };
};

// Exportar resumen financiero con diseño profesional
export const exportFinancialSummaryXLSX = async (data, period = 'Este Mes') => {
  const workbook = createWorkbook();
  
  // Hoja 1: Resumen General
  let worksheet = XLSX.utils.aoa_to_sheet([]);
  
  // Agregar encabezado profesional
  const headerRows = addProfessionalHeader(worksheet, 'Resumen Financiero', period);
  
  // Datos del resumen con formato profesional
  const summaryData = [
    ['💰 CONCEPTO', '💵 MONTO (USD)', '📊 ESTADO'],
    ['💹 Ingresos Totales', data.income || 0, 'Positivo'],
    ['💸 Gastos Totales', data.expenses || 0, 'Negativo'],
    ['⚖️ Balance Neto', data.net || 0, data.net >= 0 ? 'Positivo' : 'Negativo'],
    ['🎯 Tasa de Ahorro (%)', data.income > 0 ? parseFloat(((data.net / data.income) * 100).toFixed(1)) : 0, 'Información']
  ];
  
  // Agregar datos del resumen
  XLSX.utils.sheet_add_aoa(worksheet, summaryData, { origin: `A${headerRows + 1}` });
  
  // Aplicar estilos profesionales
  const headerRange = `A${headerRows + 1}:C${headerRows + 1}`;
  const dataRange = `A${headerRows + 2}:C${headerRows + summaryData.length}`;
  
  styleTableHeaders(worksheet, headerRange, colors.primary);
  styleDataRows(worksheet, dataRange);
  
  // Aplicar estilos condicionales
  for (let i = 1; i < summaryData.length; i++) {
    const rowIndex = headerRows + 1 + i;
    const amountCell = `B${rowIndex}`;
    const statusCell = `C${rowIndex}`;
    
    applyConditionalStyling(worksheet, amountCell, summaryData[i][1], 'currency');
    applyConditionalStyling(worksheet, statusCell, summaryData[i][2], 'status');
  }
  
  formatWorksheet(worksheet, summaryData[0]);
  XLSX.utils.book_append_sheet(workbook, worksheet, '📊 Resumen');

  // Hoja 2: Análisis por Categorías (si hay datos)
  if (data.categories && data.categories.length > 0) {
    const categoryWorksheet = XLSX.utils.aoa_to_sheet([]);
    const categoryHeaderRows = addProfessionalHeader(categoryWorksheet, 'Análisis por Categorías', period);
    
    const categoryData = [
      ['🏷️ CATEGORÍA', '📋 TIPO', '💵 MONTO (USD)', '📊 PORCENTAJE', '🔢 TRANSACCIONES'],
      ...data.categories.map(cat => [
        cat.name || 'Sin Categoría',
        cat.type || 'Gasto',
        cat.total || 0,
        cat.percentage ? parseFloat(cat.percentage.toString().replace('%', '')) : 0,
        cat.count || 0
      ])
    ];
    
    XLSX.utils.sheet_add_aoa(categoryWorksheet, categoryData, { origin: `A${categoryHeaderRows + 1}` });
    
    // Aplicar estilos profesionales
    const catHeaderRange = `A${categoryHeaderRows + 1}:E${categoryHeaderRows + 1}`;
    const catDataRange = `A${categoryHeaderRows + 2}:E${categoryHeaderRows + categoryData.length}`;
    
    styleTableHeaders(categoryWorksheet, catHeaderRange, colors.success);
    styleDataRows(categoryWorksheet, catDataRange);
    
    // Aplicar estilos condicionales a las columnas de monto y porcentaje
    for (let i = 1; i < categoryData.length; i++) {
      const rowIndex = categoryHeaderRows + 1 + i;
      applyConditionalStyling(categoryWorksheet, `C${rowIndex}`, categoryData[i][2], 'currency');
      applyConditionalStyling(categoryWorksheet, `D${rowIndex}`, categoryData[i][3], 'percentage');
    }
    
    formatWorksheet(categoryWorksheet, categoryData[0]);
    XLSX.utils.book_append_sheet(workbook, categoryWorksheet, '🏷️ Categorías');
  }

  // Hoja 3: Tendencias Mensuales (si hay datos)
  if (data.monthlyTrend && data.monthlyTrend.length > 0) {
    const trendWorksheet = XLSX.utils.aoa_to_sheet([]);
    const trendHeaderRows = addProfessionalHeader(trendWorksheet, 'Tendencias Mensuales', period);
    
    const trendData = [
      ['📅 MES', '💹 INGRESOS', '💸 GASTOS', '⚖️ BALANCE'],
      ...data.monthlyTrend.map(trend => [
        trend.month || 'Sin Mes',
        trend.income || 0,
        trend.expenses || 0,
        trend.net || 0
      ])
    ];
    
    XLSX.utils.sheet_add_aoa(trendWorksheet, trendData, { origin: `A${trendHeaderRows + 1}` });
    
    // Aplicar estilos profesionales
    const trendHeaderRange = `A${trendHeaderRows + 1}:D${trendHeaderRows + 1}`;
    const trendDataRange = `A${trendHeaderRows + 2}:D${trendHeaderRows + trendData.length}`;
    
    styleTableHeaders(trendWorksheet, trendHeaderRange, colors.info);
    styleDataRows(trendWorksheet, trendDataRange);
    
    // Aplicar estilos condicionales
    for (let i = 1; i < trendData.length; i++) {
      const rowIndex = trendHeaderRows + 1 + i;
      applyConditionalStyling(trendWorksheet, `B${rowIndex}`, trendData[i][1], 'currency');
      applyConditionalStyling(trendWorksheet, `C${rowIndex}`, trendData[i][2], 'currency');
      applyConditionalStyling(trendWorksheet, `D${rowIndex}`, trendData[i][3], 'currency');
    }
    
    formatWorksheet(trendWorksheet, trendData[0]);
    XLSX.utils.book_append_sheet(workbook, trendWorksheet, '📈 Tendencias');
  }
  
  // Guardar archivo
  const filename = `resumen-financiero-profesional-${period.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

// Exportar transacciones con diseño profesional
export const exportTransactionsXLSX = async (transactions, categories = [], accounts = [], period = 'Todas') => {
  const workbook = createWorkbook();
  
  // Preparar datos de transacciones enriquecidos
  const transactionHeaders = ['📅 Fecha', '📋 Tipo', '🏷️ Categoría', '💵 Monto', '📝 Descripción', '🏦 Cuenta'];
  const transactionData = [
    transactionHeaders,
    ...transactions.map(t => {
      // Buscar nombre de categoría completo
      const categoryObj = categories.find(cat => cat.id === t.category || cat.name === t.category);
      const categoryName = categoryObj ? categoryObj.name : (t.category || 'Sin Categoría');
      
      // Buscar nombre de cuenta completo
      const accountObj = accounts.find(acc => acc.id === t.account || acc.name === t.account);
      const accountName = accountObj ? accountObj.name : (t.account || 'Cuenta Principal');
      
      return [
        new Date(t.date).toLocaleDateString('es-ES'),
        t.type === 'income' ? '💹 Ingreso' : '💸 Gasto',
        categoryName,
        t.amount || 0,
        t.description || 'Sin descripción',
        accountName
      ];
    })
  ];

  let worksheet = XLSX.utils.aoa_to_sheet([]);
  const headerRows = addProfessionalHeader(worksheet, `Transacciones (${transactions.length} registros)`, period);
  
  XLSX.utils.sheet_add_aoa(worksheet, transactionData, { origin: `A${headerRows + 1}` });
  
  // Aplicar estilos profesionales
  const transHeaderRange = `A${headerRows + 1}:F${headerRows + 1}`;
  const transDataRange = `A${headerRows + 2}:F${headerRows + transactionData.length}`;
  
  styleTableHeaders(worksheet, transHeaderRange, colors.primary);
  styleDataRows(worksheet, transDataRange);
  
  // Aplicar estilos condicionales
  for (let i = 1; i < transactionData.length; i++) {
    const rowIndex = headerRows + 1 + i;
    applyConditionalStyling(worksheet, `D${rowIndex}`, transactionData[i][3], 'currency');
    applyConditionalStyling(worksheet, `B${rowIndex}`, transactionData[i][1], 'status');
  }
  
  formatWorksheet(worksheet, transactionHeaders);
  XLSX.utils.book_append_sheet(workbook, worksheet, '💳 Transacciones');

  // Hoja 2: Resumen por tipo
  const incomeTotal = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseTotal = Math.abs(transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0));

  const summaryHeaders = ['📊 Tipo', '🔢 Cantidad de Transacciones', '💵 Monto Total', '📈 Promedio'];
  const summaryData = [
    summaryHeaders,
    ['💹 Ingresos', transactions.filter(t => t.type === 'income').length, incomeTotal, incomeTotal / (transactions.filter(t => t.type === 'income').length || 1)],
    ['💸 Gastos', transactions.filter(t => t.type === 'expense').length, expenseTotal, expenseTotal / (transactions.filter(t => t.type === 'expense').length || 1)]
  ];

  let summaryWorksheet = XLSX.utils.aoa_to_sheet([]);
  const summaryHeaderRows = addProfessionalHeader(summaryWorksheet, 'Resumen por Tipo', period);
  
  XLSX.utils.sheet_add_aoa(summaryWorksheet, summaryData, { origin: `A${summaryHeaderRows + 1}` });
  
  // Aplicar estilos profesionales
  const sumHeaderRange = `A${summaryHeaderRows + 1}:D${summaryHeaderRows + 1}`;
  const sumDataRange = `A${summaryHeaderRows + 2}:D${summaryHeaderRows + summaryData.length}`;
  
  styleTableHeaders(summaryWorksheet, sumHeaderRange, colors.warning);
  styleDataRows(summaryWorksheet, sumDataRange);
  
  // Aplicar estilos condicionales
  for (let i = 1; i < summaryData.length; i++) {
    const rowIndex = summaryHeaderRows + 1 + i;
    applyConditionalStyling(summaryWorksheet, `C${rowIndex}`, summaryData[i][2], 'currency');
    applyConditionalStyling(summaryWorksheet, `D${rowIndex}`, summaryData[i][3], 'currency');
  }
  
  formatWorksheet(summaryWorksheet, summaryHeaders);
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, '📊 Resumen');
  
  // Guardar archivo
  const filename = `transacciones-profesional-${period.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

// Exportar categorías con diseño profesional
export const exportCategoriesXLSX = async (categories, categoryAnalysis = null) => {
  const workbook = createWorkbook();
  
  // Hoja 1: Resumen de categorías
  const summaryHeaders = ['🏷️ Categoría', '📋 Tipo', '💵 Presupuesto', '📊 Uso Actual', '⚠️ Estado'];
  const summaryData = [
    summaryHeaders,
    ...categories.map(cat => [
      cat.name,
      cat.type === 'income' ? 'Ingreso' : 'Gasto',
      cat.budget || 0,
      cat.currentSpent || 0,
      cat.budget && cat.currentSpent > cat.budget ? 'Excedido' : 'Normal'
    ])
  ];
  
  let summaryWorksheet = XLSX.utils.aoa_to_sheet([]);
  const summaryHeaderRows = addProfessionalHeader(summaryWorksheet, 'Resumen de Categorías', 'Todas');
  
  XLSX.utils.sheet_add_aoa(summaryWorksheet, summaryData, { origin: `A${summaryHeaderRows + 1}` });
  
  // Aplicar estilos profesionales
  const sumHeaderRange = `A${summaryHeaderRows + 1}:E${summaryHeaderRows + 1}`;
  const sumDataRange = `A${summaryHeaderRows + 2}:E${summaryHeaderRows + summaryData.length}`;
  
  styleTableHeaders(summaryWorksheet, sumHeaderRange, colors.purple);
  styleDataRows(summaryWorksheet, sumDataRange);
  
  // Aplicar estilos condicionales
  for (let i = 1; i < summaryData.length; i++) {
    const rowIndex = summaryHeaderRows + 1 + i;
    applyConditionalStyling(summaryWorksheet, `C${rowIndex}`, summaryData[i][2], 'currency');
    applyConditionalStyling(summaryWorksheet, `D${rowIndex}`, summaryData[i][3], 'currency');
    applyConditionalStyling(summaryWorksheet, `E${rowIndex}`, summaryData[i][4], 'status');
  }
  
  formatWorksheet(summaryWorksheet, summaryHeaders);
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, '📊 Resumen');
  
  // Hoja 2: Análisis detallado (si se proporciona)
  if (categoryAnalysis && Object.keys(categoryAnalysis).length > 0) {
    const analysisHeaders = ['🏷️ Categoría', '💵 Total', '📊 Porcentaje', '🔢 Transacciones', '📈 Promedio'];
    const analysisData = [
      analysisHeaders,
      ...Object.entries(categoryAnalysis).map(([catName, data]) => [
        catName,
        data.total || 0,
        data.percentage || 0,
        data.count || 0,
        data.count > 0 ? (data.total || 0) / data.count : 0
      ])
    ];
    
    let analysisWorksheet = XLSX.utils.aoa_to_sheet([]);
    const analysisHeaderRows = addProfessionalHeader(analysisWorksheet, 'Análisis Detallado de Categorías', 'Completo');
    
    XLSX.utils.sheet_add_aoa(analysisWorksheet, analysisData, { origin: `A${analysisHeaderRows + 1}` });
    
    // Aplicar estilos profesionales
    const analHeaderRange = `A${analysisHeaderRows + 1}:E${analysisHeaderRows + 1}`;
    const analDataRange = `A${analysisHeaderRows + 2}:E${analysisHeaderRows + analysisData.length}`;
    
    styleTableHeaders(analysisWorksheet, analHeaderRange, colors.success);
    styleDataRows(analysisWorksheet, analDataRange);
    
    // Aplicar estilos condicionales
    for (let i = 1; i < analysisData.length; i++) {
      const rowIndex = analysisHeaderRows + 1 + i;
      applyConditionalStyling(analysisWorksheet, `B${rowIndex}`, analysisData[i][1], 'currency');
      applyConditionalStyling(analysisWorksheet, `C${rowIndex}`, analysisData[i][2], 'percentage');
      applyConditionalStyling(analysisWorksheet, `E${rowIndex}`, analysisData[i][4], 'currency');
    }
    
    formatWorksheet(analysisWorksheet, analysisHeaders);
    XLSX.utils.book_append_sheet(workbook, analysisWorksheet, '📈 Análisis');
  }
  
  // Guardar archivo
  const filename = `categorias-profesional-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

// Exportar cuentas con diseño profesional
export const exportAccountsXLSX = async (accounts, transactions = []) => {
  const workbook = createWorkbook();
  
  // Hoja 1: Resumen de cuentas
  const summaryHeaders = ['🏦 Cuenta', '💵 Balance', '🏷️ Tipo', '📊 Estado', '🔢 Transacciones'];
  const summaryData = [
    summaryHeaders,
    ...accounts.map(acc => {
      const accountTransactions = transactions.filter(t => t.account === acc.name).length;
      return [
        acc.name || 'Cuenta sin nombre',
        acc.balance || 0,
        acc.type || 'Efectivo',
        acc.balance >= 0 ? 'Positivo' : 'Negativo',
        accountTransactions
      ];
    })
  ];
  
  let summaryWorksheet = XLSX.utils.aoa_to_sheet([]);
  const summaryHeaderRows = addProfessionalHeader(summaryWorksheet, 'Resumen de Cuentas', 'Todas');
  
  XLSX.utils.sheet_add_aoa(summaryWorksheet, summaryData, { origin: `A${summaryHeaderRows + 1}` });
  
  // Aplicar estilos profesionales
  const sumHeaderRange = `A${summaryHeaderRows + 1}:E${summaryHeaderRows + 1}`;
  const sumDataRange = `A${summaryHeaderRows + 2}:E${summaryHeaderRows + summaryData.length}`;
  
  styleTableHeaders(summaryWorksheet, sumHeaderRange, colors.info);
  styleDataRows(summaryWorksheet, sumDataRange);
  
  // Aplicar estilos condicionales
  for (let i = 1; i < summaryData.length; i++) {
    const rowIndex = summaryHeaderRows + 1 + i;
    applyConditionalStyling(summaryWorksheet, `B${rowIndex}`, summaryData[i][1], 'currency');
    applyConditionalStyling(summaryWorksheet, `D${rowIndex}`, summaryData[i][3], 'status');
  }
  
  formatWorksheet(summaryWorksheet, summaryHeaders);
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, '🏦 Cuentas');
  
  // Hoja 2: Actividad por cuenta
  if (transactions.length > 0) {
    const activityHeaders = ['🏦 Cuenta', '💹 Ingresos', '💸 Gastos', '⚖️ Balance Neto', '📊 Actividad'];
    const accountActivity = accounts.map(acc => {
      const accountTrans = transactions.filter(t => t.account === acc.name || t.account === acc.id);
      const income = accountTrans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = Math.abs(accountTrans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0));
      const net = income - expenses;
      
      return [
        acc.name,
        income,
        expenses,
        net,
        accountTrans.length > 0 ? 'Activa' : 'Inactiva'
      ];
    });
    
    const activityData = [activityHeaders, ...accountActivity];
    
    let activityWorksheet = XLSX.utils.aoa_to_sheet([]);
    const activityHeaderRows = addProfessionalHeader(activityWorksheet, 'Actividad por Cuenta', 'Histórica');
    
    XLSX.utils.sheet_add_aoa(activityWorksheet, activityData, { origin: `A${activityHeaderRows + 1}` });
    
    // Aplicar estilos profesionales
    const actHeaderRange = `A${activityHeaderRows + 1}:E${activityHeaderRows + 1}`;
    const actDataRange = `A${activityHeaderRows + 2}:E${activityHeaderRows + activityData.length}`;
    
    styleTableHeaders(activityWorksheet, actHeaderRange, colors.purple);
    styleDataRows(activityWorksheet, actDataRange);
    
    // Aplicar estilos condicionales
    for (let i = 1; i < activityData.length; i++) {
      const rowIndex = activityHeaderRows + 1 + i;
      applyConditionalStyling(activityWorksheet, `B${rowIndex}`, activityData[i][1], 'currency');
      applyConditionalStyling(activityWorksheet, `C${rowIndex}`, activityData[i][2], 'currency');
      applyConditionalStyling(activityWorksheet, `D${rowIndex}`, activityData[i][3], 'currency');
      applyConditionalStyling(activityWorksheet, `E${rowIndex}`, activityData[i][4], 'status');
    }
    
    formatWorksheet(activityWorksheet, activityHeaders);
    XLSX.utils.book_append_sheet(workbook, activityWorksheet, '📊 Actividad');
  }
  
  // Hoja 3: Balance total y resumen
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const activeAccounts = accounts.filter(acc => (acc.balance || 0) !== 0).length;
  const totalTransactions = transactions.length;
  
  const balanceHeaders = ['📊 Métrica', '💵 Valor', '📈 Estado'];
  const balanceData = [
    balanceHeaders,
    ['💰 Balance Total', totalBalance, totalBalance >= 0 ? 'Positivo' : 'Negativo'],
    ['🏦 Cuentas Totales', accounts.length, 'Información'],
    ['🏦 Cuentas Activas', activeAccounts, activeAccounts > 0 ? 'Activo' : 'Inactivo'],
    ['💳 Transacciones Totales', totalTransactions, 'Información'],
    ['📊 Promedio por Cuenta', accounts.length > 0 ? totalBalance / accounts.length : 0, 'Información']
  ];
  
  let balanceWorksheet = XLSX.utils.aoa_to_sheet([]);
  const balanceHeaderRows = addProfessionalHeader(balanceWorksheet, 'Análisis de Balance', 'Actual');
  
  XLSX.utils.sheet_add_aoa(balanceWorksheet, balanceData, { origin: `A${balanceHeaderRows + 1}` });
  
  // Aplicar estilos profesionales
  const balHeaderRange = `A${balanceHeaderRows + 1}:C${balanceHeaderRows + 1}`;
  const balDataRange = `A${balanceHeaderRows + 2}:C${balanceHeaderRows + balanceData.length}`;
  
  styleTableHeaders(balanceWorksheet, balHeaderRange, colors.warning);
  styleDataRows(balanceWorksheet, balDataRange);
  
  // Aplicar estilos condicionales
  for (let i = 1; i < balanceData.length; i++) {
    const rowIndex = balanceHeaderRows + 1 + i;
    applyConditionalStyling(balanceWorksheet, `B${rowIndex}`, balanceData[i][1], 'currency');
    applyConditionalStyling(balanceWorksheet, `C${rowIndex}`, balanceData[i][2], 'status');
  }
  
  formatWorksheet(balanceWorksheet, balanceHeaders);
  XLSX.utils.book_append_sheet(workbook, balanceWorksheet, '📊 Balance');
  
  // Guardar archivo
  const filename = `cuentas-profesional-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

// Exportar dashboard completo con diseño profesional
export const exportCompleteReportXLSX = async (data) => {
  const workbook = createWorkbook();
  
  // Dashboard principal con métricas clave
  const dashboardHeaders = ['📊 Métrica', '💵 Valor', '📈 Variación', '📅 Período'];
  const dashboardData = [
    dashboardHeaders,
    ['💰 Balance Total', data.totalBalance || 0, data.balanceChange || 0, 'Actual'],
    ['💹 Ingresos del Mes', data.monthlyIncome || 0, data.incomeChange || 0, 'Este Mes'],
    ['💸 Gastos del Mes', data.monthlyExpenses || 0, data.expenseChange || 0, 'Este Mes'],
    ['🎯 Tasa de Ahorro', data.savingsRate || 0, data.savingsChange || 0, 'Mensual'],
    ['🏦 Cuentas Activas', data.activeAccounts || 0, 0, 'Actual'],
    ['🏷️ Categorías Usadas', data.usedCategories || 0, 0, 'Este Mes']
  ];
  
  let dashboardWorksheet = XLSX.utils.aoa_to_sheet([]);
  const dashboardHeaderRows = addProfessionalHeader(dashboardWorksheet, 'Dashboard Financiero Completo', 'Actualizado');
  
  XLSX.utils.sheet_add_aoa(dashboardWorksheet, dashboardData, { origin: `A${dashboardHeaderRows + 1}` });
  
  // Aplicar estilos profesionales
  const dashHeaderRange = `A${dashboardHeaderRows + 1}:D${dashboardHeaderRows + 1}`;
  const dashDataRange = `A${dashboardHeaderRows + 2}:D${dashboardHeaderRows + dashboardData.length}`;
  
  styleTableHeaders(dashboardWorksheet, dashHeaderRange, colors.darkBlue);
  styleDataRows(dashboardWorksheet, dashDataRange);
  
  // Aplicar estilos condicionales
  for (let i = 1; i < dashboardData.length; i++) {
    const rowIndex = dashboardHeaderRows + 1 + i;
    applyConditionalStyling(dashboardWorksheet, `B${rowIndex}`, dashboardData[i][1], 'currency');
    applyConditionalStyling(dashboardWorksheet, `C${rowIndex}`, dashboardData[i][2], 'currency');
  }
  
  formatWorksheet(dashboardWorksheet, dashboardHeaders);
  XLSX.utils.book_append_sheet(workbook, dashboardWorksheet, '📊 Dashboard');
  
  // Guardar archivo
  const filename = `reporte-completo-profesional-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
};