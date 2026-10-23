import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

// Hàm xuất file Excel chung
export const exportToExcel = (data, columns, filename, sheetName = 'Sheet1') => {
    try {
        // Map data according to columns
        const formattedData = data.map((item, index) => {
            const row = { STT: index + 1 };
            columns.forEach(col => {
                let value = item[col.dataIndex];
                // Handle nested objects or custom render if needed
                if (col.render) {
                    value = col.render(value, item);
                }
                row[col.title] = value;
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        
        // Auto fit columns
        const colWidths = [{ wch: 5 }]; // STT column
        columns.forEach(col => {
            colWidths.push({ wch: Math.max(col.title.length, 15) });
        });
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, `${filename}_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
        return true;
    } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        return false;
    }
};

// Hàm xuất file PDF chung — dùng HTML + window.print() để hỗ trợ tiếng Việt hoàn hảo
export const exportToPDF = (data, columns, filename, title) => {
    try {
        const dateStr = moment().format('DD/MM/YYYY HH:mm');

        const headerRow = `<tr>${['STT', ...columns.map(c => c.title)].map(h => `<th>${h}</th>`).join('')}</tr>`;

        const bodyRows = data.map((item, index) => {
            const cells = columns.map(col => {
                let value = item[col.dataIndex];
                if (col.render) value = col.render(value, item);
                return `<td>${value ?? ''}</td>`;
            });
            return `<tr><td>${index + 1}</td>${cells.join('')}</tr>`;
        }).join('');

        const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Be Vietnam Pro', Arial, sans-serif; font-size: 11px; color: #111; padding: 20px; }
  h1 { font-size: 16px; font-weight: 700; color: #a30014; margin-bottom: 4px; text-transform: uppercase; }
  p.meta { font-size: 10px; color: #555; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #a30014; color: #fff; padding: 7px 8px; text-align: left; font-size: 10px; font-weight: 600; }
  td { padding: 6px 8px; border-bottom: 1px solid #e5e5e5; font-size: 10px; }
  tr:nth-child(even) td { background: #fafafa; }
  @media print {
    body { padding: 10px; }
    button { display: none !important; }
  }
</style>
</head>
<body>
<h1>${title}</h1>
<p class="meta">Ngày xuất: ${dateStr} &nbsp;|&nbsp; Tổng số: ${data.length} bản ghi</p>
<table>
  <thead>${headerRow}</thead>
  <tbody>${bodyRows}</tbody>
</table>
<br>
<button onclick="window.print()" style="padding:8px 20px;background:#a30014;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;margin-top:8px;">🖨️ In / Lưu PDF</button>
</body>
</html>`;

        const win = window.open('', '_blank');
        if (!win) {
            alert('Trình duyệt đã chặn cửa sổ mới. Vui lòng cho phép pop-up cho trang này!');
            return false;
        }
        win.document.write(html);
        win.document.close();
        // Trigger print sau khi load font xong (~800ms)
        setTimeout(() => { win.print(); }, 800);
        return true;
    } catch (error) {
        console.error('Lỗi khi xuất PDF:', error);
        return false;
    }
};
