import PDFDocument from 'pdfkit';
import { formatCurrency } from '../utils/helpers';

function createDoc(): PDFKit.PDFDocument {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.fontSize(10);
  return doc;
}

function addHeader(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(18).text('TuFinanciera', { align: 'center' });
  doc.fontSize(12).text(title, { align: 'center' });
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown();
}

export const pdfService = {
  generatePaymentReceipt(payment: any, loan: any, client: any): PDFKit.PDFDocument {
    const doc = createDoc();
    addHeader(doc, 'Recibo de Pago');
    doc.fontSize(11);
    doc.text(`Cliente: ${client.firstName} ${client.lastName}`);
    doc.text(`DNI: ${client.dni}`);
    doc.text(`Préstamo #${loan.id} - Cuota #${payment.installment}`);
    doc.text(`Monto: ${formatCurrency(payment.amount)}`);
    doc.text(`Fecha: ${new Date(payment.paidAt).toLocaleDateString('es-AR')}`);
    if (payment.notes) doc.text(`Notas: ${payment.notes}`);
    return doc;
  },

  generateAmortizationTable(loan: any, amortization: any[], client: any): PDFKit.PDFDocument {
    const doc = createDoc();
    addHeader(doc, 'Tabla de Amortización');
    doc.fontSize(11);
    doc.text(`Cliente: ${client.firstName} ${client.lastName}`);
    doc.text(`Monto: ${formatCurrency(loan.amount)} - Tasa: ${loan.interestRate}%`);
    doc.text(`Cuota: ${formatCurrency(loan.installmentAmount)} - Plazo: ${loan.installments} meses`);
    doc.moveDown();
    const tableTop = doc.y;
    doc.fontSize(8);
    doc.text('Cuota', 50, tableTop);
    doc.text('Capital', 120, tableTop);
    doc.text('Interés', 220, tableTop);
    doc.text('Saldo', 320, tableTop);
    doc.moveDown();
    for (const row of amortization) {
      doc.text(String(row.installment), 50, doc.y);
      doc.text(formatCurrency(row.capital), 120, doc.y);
      doc.text(formatCurrency(row.interest), 220, doc.y);
      doc.text(formatCurrency(row.balance), 320, doc.y);
      doc.moveDown(0.5);
    }
    return doc;
  },

  generateClientReport(clients: any[]): PDFKit.PDFDocument {
    const doc = createDoc();
    addHeader(doc, 'Reporte de Clientes');
    clients.forEach((c, i) => {
      doc.fontSize(10).text(`${i + 1}. ${c.firstName} ${c.lastName} - DNI: ${c.dni} - ${c.active ? 'Activo' : 'Inactivo'}`);
    });
    return doc;
  },

  generateLoanReport(loans: any[]): PDFKit.PDFDocument {
    const doc = createDoc();
    addHeader(doc, 'Reporte de Préstamos');
    loans.forEach((l, i) => {
      doc.fontSize(10).text(`${i + 1}. Préstamo #${l.id} - ${formatCurrency(l.amount)} - ${l.status}`);
    });
    return doc;
  },

  generatePaymentReport(payments: any[]): PDFKit.PDFDocument {
    const doc = createDoc();
    addHeader(doc, 'Reporte de Pagos');
    payments.forEach((p, i) => {
      doc.fontSize(10).text(`${i + 1}. Préstamo #${p.loanId} - Cuota ${p.installment} - ${formatCurrency(p.amount)}`);
    });
    return doc;
  },

  generateDashboardReport(metrics: any): PDFKit.PDFDocument {
    const doc = createDoc();
    addHeader(doc, 'Reporte de Dashboard');
    doc.fontSize(11);
    doc.text(`Clientes activos: ${metrics.totalClients}`);
    doc.text(`Total préstamos: ${metrics.totalLoans}`);
    doc.text(`Capital total: ${formatCurrency(metrics.totalCapital)}`);
    doc.text(`Total cobrado: ${formatCurrency(metrics.totalCollected)}`);
    doc.text(`Pendiente: ${formatCurrency(metrics.pendingToCollect)}`);
    return doc;
  },

  generateExchangeReport(operations: any[]): PDFKit.PDFDocument {
    const doc = createDoc();
    addHeader(doc, 'Reporte de Exchange');
    operations.forEach((op, i) => {
      doc.fontSize(10).text(`${i + 1}. ${op.type === 'BUY' ? 'Compra' : 'Venta'} - ARS ${formatCurrency(op.amountARS)} - USD ${op.amountUSD}`);
    });
    return doc;
  },

  generateInvestorReport(investors: any[]): PDFKit.PDFDocument {
    const doc = createDoc();
    addHeader(doc, 'Reporte de Inversores');
    investors.forEach((inv, i) => {
      doc.fontSize(10).text(`${i + 1}. ${inv.name} - TNA: ${inv.tna}% - ${inv.currency}`);
    });
    return doc;
  },

  generateInvestorDetailReport(investor: any, summary: any): PDFKit.PDFDocument {
    const doc = createDoc();
    addHeader(doc, `Detalle de Inversor: ${investor.name}`);
    doc.fontSize(11);
    doc.text(`Capital base: ${formatCurrency(summary.capitalBase)}`);
    doc.text(`Total acreditado: ${formatCurrency(summary.totalAccrued)}`);
    doc.text(`Total pagado: ${formatCurrency(summary.totalPaid)}`);
    doc.text(`Saldo disponible: ${formatCurrency(summary.availableBalance)}`);
    return doc;
  },

  generateInvestorBalanceReport(investors: any[], summaryData: any[]): PDFKit.PDFDocument {
    const doc = createDoc();
    addHeader(doc, 'Balance de Inversores');
    investors.forEach((inv, i) => {
      const s = summaryData[i] || {};
      doc.fontSize(10).text(`${inv.name}: Base ${formatCurrency(s.capitalBase || 0)} - Disp. ${formatCurrency(s.availableBalance || 0)}`);
    });
    return doc;
  },

  generateCashRegisterReport(register: any): PDFKit.PDFDocument {
    const doc = createDoc();
    addHeader(doc, 'Reporte de Caja');
    doc.fontSize(11);
    doc.text(`Fecha: ${new Date(register.date).toLocaleDateString('es-AR')}`);
    doc.text(`Apertura: ${formatCurrency(register.openAmount)}`);
    doc.text(`Ingresos: ${formatCurrency(register.totalIn)}`);
    doc.text(`Egresos: ${formatCurrency(register.totalOut)}`);
    doc.text(`Balance: ${formatCurrency(register.balance)}`);
    return doc;
  },
};
