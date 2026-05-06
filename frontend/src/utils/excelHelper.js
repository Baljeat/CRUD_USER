import * as XLSX from "xlsx";

/**
 * Hàm hỗ trợ xuất dữ liệu JSON ra file Excel dùng chung cho toàn hệ thống
 */
export const exportToExcel = (data, sheetName, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
};