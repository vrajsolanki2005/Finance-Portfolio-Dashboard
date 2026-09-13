import * as XLSX from "xlsx";
import path from "path";

export function readPortfolioExcel() {
  const filePath = path.join(__dirname, "../../data/portfolio.xlsx");
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet);

  return rows;
}
