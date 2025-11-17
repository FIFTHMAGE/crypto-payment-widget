/** Transaction Export Functionality */
export class ExportService {
  async exportToCSV(payments: any[]) {
    const header = 'ID,Amount,Address,Status,Date\n';
    const rows = payments.map(p => `${p.id},${p.amount},${p.address},${p.status},${p.createdAt}`).join('\n');
    return header + rows;
  }
  
  async exportToJSON(payments: any[]) {
    return JSON.stringify(payments, null, 2);
  }
}

