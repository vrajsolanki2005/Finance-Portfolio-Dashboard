import "dotenv/config";

import * as XLSX from "xlsx";
import path from "path";
import { supabase } from "../config/supabase";

interface ExcelRow {
  No?: number | string;
  Particulars?: string;
  "Purchase Price"?: number | string;
  Qty?: number | string;
  "NSE/BSE"?: number | string;
}

function cleanText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const cleaned = String(value)
    .replace(/,/g, "")
    .replace(/₹/g, "")
    .replace(/%/g, "")
    .trim();

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
}

function getExchangeCode(value: unknown): string {
  return cleanText(value);
}

async function importExcel() {
  console.log("Starting Excel import...");

  const filePath = path.join(__dirname,"../../data/portfolio.xlsx");

  console.log(`Reading: ${filePath}`);

  const workbook = XLSX.readFile(filePath);

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  // Header is on Excel row 2.
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
    range: 1,
    defval: null,
  });

  console.log(`Found ${rows.length} Excel rows`);

  let currentSector = "Other";

  let importedCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    const particulars = cleanText(row.Particulars);

    if (!particulars) {
      continue;
    }

    // Detect sector rows such as:
    // Financial Sector
    // Tech Sector
    if (particulars.toLowerCase().includes("sector")) {
      currentSector = particulars.replace(/sector/gi, "").trim();

      console.log(`\nSector: ${currentSector}`);

      // Make sure the sector exists.
      const { error } = await supabase.from("sectors").upsert(
        {
          name: currentSector,
        },
        {
          onConflict: "name",
        },
      );

      if (error) {
        throw new Error(
          `Failed to create sector ${currentSector}: ${error.message}`,
        );
      }

      continue;
    }

    const purchasePrice = toNumber(row["Purchase Price"]);

    const quantity = toNumber(row.Qty);

    const exchangeCode = getExchangeCode(row["NSE/BSE"]);

    // Ignore rows that are not actual holdings.
    if (purchasePrice <= 0 || quantity <= 0 || !exchangeCode) {
      skippedCount++;
      continue;
    }

    // Find sector ID.
    const { data: sector, error: sectorError } = await supabase
      .from("sectors")
      .select("id")
      .eq("name", currentSector)
      .single();

    if (sectorError || !sector) {
      throw new Error(`Sector not found: ${currentSector}`);
    }

    const holding = {
      sector_id: sector.id,
      stock_name: particulars,
      purchase_price: purchasePrice,
      quantity: quantity,
      exchange_code: exchangeCode,
    };

    const { error } = await supabase.from("holdings").upsert(holding, {
      onConflict: "stock_name,exchange_code",
    });

    if (error) {
      throw new Error(`Failed to import ${particulars}: ${error.message}`);
    }

    importedCount++;

    console.log(`Imported: ${particulars}`);
  }

  console.log("\nImport complete!");
  console.log(`Imported: ${importedCount}`);
  console.log(`Skipped: ${skippedCount}`);
}

importExcel().catch((error) => {
  console.error("\nImport failed:", error);

  process.exit(1);
});
