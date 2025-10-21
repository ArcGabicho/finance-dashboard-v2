import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Configuración de colores y estilos
const colors = {
  primary: '#3B82F6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  gray: '#6B7280'
};

// Función para agregar encabezado personalizado
const addHeader = (doc, title) => {
  // Logo/Título principal
  doc.setFontSize(24);
  doc.setTextColor(colors.primary);
  doc.text('Finance Dashboard', 20, 25);
  
  // Título del reporte
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 20, 40);
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.setTextColor(colors.gray);
  const date = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generado el: ${date}`, 20, 50);
  
  // Línea separadora
  doc.setDrawColor(colors.gray);
  doc.line(20, 55, 190, 55);
  
  return 65; // Retorna la posición Y donde continuar el contenido
};

// Función para agregar pie de página
const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Línea separadora
    doc.setDrawColor(colors.gray);
    doc.line(20, 280, 190, 280);
    
    // Información de página
    doc.setFontSize(8);
    doc.setTextColor(colors.gray);
    doc.text(`Página ${i} de ${pageCount}`, 20, 285);
    doc.text('Finance Dashboard - Reporte Confidencial', 130, 285);
  }
};

// Exportar resumen financiero
export const exportFinancialSummary = async (data, period = 'Este Mes') => {
  const doc = new jsPDF();
  
  let yPosition = addHeader(doc, `Resumen Financiero - ${period}`);
  
  // Resumen de totales
  yPosition += 10;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Resumen General', 20, yPosition);
  
  const summaryData = [
    ['Concepto', 'Monto', 'Estado'],
    ['Ingresos Totales', `$${data.income?.toLocaleString() || '0'}`, 'Positivo'],
    ['Gastos Totales', `$${data.expenses?.toLocaleString() || '0'}`, 'Negativo'],
    ['Balance Neto', `$${data.net?.toLocaleString() || '0'}`, data.net >= 0 ? 'Positivo' : 'Negativo'],
    ['Tasa de Ahorro', `${data.income > 0 ? ((data.net / data.income) * 100).toFixed(1) : 0}%`, 'Información']
  ];
  
  autoTable(doc, {
    head: [summaryData[0]],
    body: summaryData.slice(1),
    startY: yPosition + 5,
    styles: {
      fontSize: 10,
      cellPadding: 8
    },
    headStyles: {
      fillColor: colors.primary,
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'center' }
    },
    didParseCell: function(data) {
      if (data.column.index === 2 && data.section === 'body') {
        const status = data.cell.text[0];
        if (status === 'Positivo') {
          data.cell.styles.textColor = colors.success;
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'Negativo') {
          data.cell.styles.textColor = colors.danger;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  yPosition = doc.lastAutoTable.finalY + 20;
  
  // Análisis por categorías
  if (data.categoryAnalysis && data.categoryAnalysis.length > 0) {
    doc.setFontSize(14);
    doc.text('Análisis por Categorías', 20, yPosition);
    
    const categoryData = [
      ['Categoría', 'Tipo', 'Total Gastado', 'Transacciones', 'Promedio', 'Porcentaje']
    ];
    
    data.categoryAnalysis.forEach(cat => {
      if (cat.total > 0) {
        categoryData.push([
          cat.name,
          cat.type === 'income' ? 'Ingreso' : 'Gasto',
          `$${cat.total.toLocaleString()}`,
          cat.count.toString(),
          `$${cat.average.toFixed(0)}`,
          `${cat.percentage.toFixed(1)}%`
        ]);
      }
    });
    
    autoTable(doc, {
      head: [categoryData[0]],
      body: categoryData.slice(1),
      startY: yPosition + 5,
      styles: {
        fontSize: 9,
        cellPadding: 6
      },
      headStyles: {
        fillColor: colors.success,
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    });
  }
  
  addFooter(doc);
  
  // Descargar archivo
  const filename = `resumen-financiero-${period.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

// Exportar reporte de transacciones
export const exportTransactionsReport = async (transactions, categories, accounts, period = 'Período Seleccionado') => {
  const doc = new jsPDF();
  
  let yPosition = addHeader(doc, `Reporte de Transacciones - ${period}`);
  
  // Información general
  yPosition += 10;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total de Transacciones: ${transactions.length}`, 20, yPosition);
  
  // Preparar datos de transacciones
  const transactionData = [
    ['Fecha', 'Descripción', 'Categoría', 'Cuenta', 'Tipo', 'Monto']
  ];
  
  transactions.forEach(transaction => {
    const category = categories.find(cat => cat.id === transaction.category);
    const account = accounts.find(acc => acc.id === transaction.account);
    
    transactionData.push([
      new Date(transaction.date).toLocaleDateString('es-ES'),
      transaction.description || 'Sin descripción',
      category?.name || 'Sin categoría',
      account?.name || 'Sin cuenta',
      transaction.type === 'income' ? 'Ingreso' : 'Gasto',
      `$${Math.abs(transaction.amount).toLocaleString()}`
    ]);
  });
  
  autoTable(doc, {
    head: [transactionData[0]],
    body: transactionData.slice(1),
    startY: yPosition + 10,
    styles: {
      fontSize: 8,
      cellPadding: 4
    },
    headStyles: {
      fillColor: colors.primary,
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 45 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' }
    },
    didParseCell: function(data) {
      if (data.column.index === 4 && data.section === 'body') {
        const type = data.cell.text[0];
        if (type === 'Ingreso') {
          data.cell.styles.textColor = colors.success;
          data.cell.styles.fontStyle = 'bold';
        } else if (type === 'Gasto') {
          data.cell.styles.textColor = colors.danger;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  addFooter(doc);
  
  // Descargar archivo
  const filename = `transacciones-${period.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

// Exportar reporte de categorías
export const exportCategoriesReport = async (categories, categoryStats) => {
  const doc = new jsPDF();
  
  let yPosition = addHeader(doc, 'Reporte de Categorías');
  
  // Resumen de categorías
  yPosition += 10;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Resumen de Categorías', 20, yPosition);
  
  const summaryData = [
    ['Métrica', 'Valor'],
    ['Total de Categorías', categories.length.toString()],
    ['Categorías de Ingreso', categories.filter(cat => cat.type === 'income').length.toString()],
    ['Categorías de Gasto', categories.filter(cat => cat.type === 'expense').length.toString()],
    ['Presupuesto Total', `$${categories.reduce((sum, cat) => sum + (cat.budget || 0), 0).toLocaleString()}`]
  ];
  
  autoTable(doc, {
    head: [summaryData[0]],
    body: summaryData.slice(1),
    startY: yPosition + 5,
    styles: {
      fontSize: 10,
      cellPadding: 8
    },
    headStyles: {
      fillColor: colors.warning,
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      1: { halign: 'right' }
    }
  });
  
  yPosition = doc.lastAutoTable.finalY + 20;
  
  // Detalle de categorías
  doc.setFontSize(14);
  doc.text('Detalle de Categorías', 20, yPosition);
  
  const categoryData = [
    ['Nombre', 'Tipo', 'Presupuesto', 'Gastado', 'Transacciones', 'Estado']
  ];
  
  categories.forEach(category => {
    const stats = categoryStats.find(stat => stat.id === category.id);
    const spent = stats?.total || 0;
    const budget = category.budget || 0;
    
    let status = 'N/A';
    if (category.type === 'expense' && budget > 0) {
      const percentage = (spent / budget) * 100;
      if (percentage <= 70) status = 'Bueno';
      else if (percentage <= 100) status = 'Alerta';
      else status = 'Excedido';
    }
    
    categoryData.push([
      category.name,
      category.type === 'income' ? 'Ingreso' : 'Gasto',
      budget > 0 ? `$${budget.toLocaleString()}` : 'N/A',
      `$${spent.toLocaleString()}`,
      (stats?.count || 0).toString(),
      status
    ]);
  });
  
  autoTable(doc, {
    head: [categoryData[0]],
    body: categoryData.slice(1),
    startY: yPosition + 5,
    styles: {
      fontSize: 9,
      cellPadding: 6
    },
    headStyles: {
      fillColor: colors.success,
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'center' },
      5: { halign: 'center' }
    },
    didParseCell: function(data) {
      if (data.column.index === 5 && data.section === 'body') {
        const status = data.cell.text[0];
        if (status === 'Bueno') {
          data.cell.styles.textColor = colors.success;
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'Alerta') {
          data.cell.styles.textColor = colors.warning;
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'Excedido') {
          data.cell.styles.textColor = colors.danger;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  addFooter(doc);
  
  // Descargar archivo
  const filename = `categorias-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

// Exportar reporte de cuentas
export const exportAccountsReport = async (accounts, transactions) => {
  const doc = new jsPDF();
  
  let yPosition = addHeader(doc, 'Reporte de Cuentas');
  
  // Resumen general
  yPosition += 10;
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text('Resumen de Cuentas', 20, yPosition);
  
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccounts = accounts.filter(acc => acc.isActive);
  
  const summaryData = [
    ['Métrica', 'Valor'],
    ['Total de Cuentas', accounts.length.toString()],
    ['Cuentas Activas', activeAccounts.length.toString()],
    ['Balance Total', `$${totalBalance.toLocaleString()}`],
    ['Balance Promedio', `$${(totalBalance / accounts.length).toFixed(0)}`]
  ];
  
  autoTable(doc, {
    head: [summaryData[0]],
    body: summaryData.slice(1),
    startY: yPosition + 5,
    styles: {
      fontSize: 10,
      cellPadding: 8
    },
    headStyles: {
      fillColor: colors.primary,
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      1: { halign: 'right' }
    }
  });
  
  yPosition = doc.lastAutoTable.finalY + 20;
  
  // Detalle de cuentas
  doc.setFontSize(14);
  doc.text('Detalle de Cuentas', 20, yPosition);
  
  const accountData = [
    ['Nombre', 'Tipo', 'Balance', 'Moneda', 'Estado', 'Transacciones']
  ];
  
  accounts.forEach(account => {
    const accountTransactions = transactions.filter(t => t.account === account.id);
    
    accountData.push([
      account.name,
      account.type,
      `$${account.balance.toLocaleString()}`,
      account.currency,
      account.isActive ? 'Activa' : 'Inactiva',
      accountTransactions.length.toString()
    ]);
  });
  
  autoTable(doc, {
    head: [accountData[0]],
    body: accountData.slice(1),
    startY: yPosition + 5,
    styles: {
      fontSize: 10,
      cellPadding: 8
    },
    headStyles: {
      fillColor: colors.success,
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      2: { halign: 'right' },
      4: { halign: 'center' },
      5: { halign: 'center' }
    },
    didParseCell: function(data) {
      if (data.column.index === 4 && data.section === 'body') {
        const status = data.cell.text[0];
        if (status === 'Activa') {
          data.cell.styles.textColor = colors.success;
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = colors.danger;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  addFooter(doc);
  
  // Descargar archivo
  const filename = `cuentas-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export default {
  exportFinancialSummary,
  exportTransactionsReport,
  exportCategoriesReport,
  exportAccountsReport
};
