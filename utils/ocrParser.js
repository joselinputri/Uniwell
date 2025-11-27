/**
 * Function to parse OCR result text from struk/receipt image
 * Extracts: total amount, merchant, date, items (optional)
 */

function parseMerchant(text) {
  // Try finding merchant/title in the first 5 lines
  let lines = text.split('\n').map(x => x.trim()).filter(x => x);
  let merchant = "";
  // Heuristik: cari baris uppercase, atau baris awal yang mengandung "Toko|Cafe|Warung|Indomaret|Alfamart"
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    if (/^(TOKO|INDOMARET|ALFAMART|CAFE|COFFEE|MINIMARKET|WARUNG)/i.test(lines[i]) || /[a-z]{4,}/i.test(lines[i])) {
      merchant = lines[i];
      break;
    }
  }
  // Fallback: merchant di baris awal yang bukan tanggal/jumlah
  if (!merchant && lines.length) {
    merchant = lines[0];
  }
  return merchant.trim();
}

function parseTotal(text) {
  // Cari kata kunci 'TOTAL', 'JUMLAH', 'GRAND TOTAL', dst, dan ambil angka di sebelahnya
  const totalRegex = /(?:TOTAL|JUMLAH|GRAND TOTAL|BAYAR|TAGIHAN|AMOUNT)\s*[:\-]?\s*([\d\.,]+)/gi;
  let match;
  let amount = 0;
  while ((match = totalRegex.exec(text)) !== null) {
    let val = match[1]?.replace(/[,\.]+/, (m) => m === ',' ? '.' : '');
    val = val.replace(/[^0-9\.]/g, "");
    let num = parseFloat(val);
    // Hanya ambil jika nominal realistis (> 0)
    if (num && num > 0 && num > amount) amount = num;
  }
  // Fallback: cari baris 'Rp' besar terakhir
  if (!amount) {
    const rpRegex = /Rp\.?\s?([\d\.,]+)/g;
    let tmp;
    while ((tmp = rpRegex.exec(text)) !== null) {
      let val = tmp[1]?.replace(/,/g, '.');
      val = val.replace(/[^0-9\.]/g, "");
      let num = parseFloat(val);
      if (num > amount) amount = num;
    }
  }
  return amount;
}

function parseDate(text) {
  // Regex tanggal Indonesia dan format umum
  const datePattern = /(\b\d{1,2}[ \/\-\.]\d{1,2}[ \/\-\.]\d{2,4}\b)|(\b\d{4}[ \/\-\.]\d{1,2}[ \/\-\.]\d{1,2}\b)/g;
  let match = datePattern.exec(text);
  if (match) {
    let raw = match[0].replace(/[\s]+/g, '');
    // Ambil tanggal dan parsing ke Date
    let parts = raw.split(/\/|-|\./);
    if (parts.length === 3) {
      if (parts[2].length === 4) { // dd-mm-yyyy
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else if (parts[0].length === 4) { // yyyy-mm-dd
        return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      } else { // fallback dd-mm-yy
        let year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
        return new Date(`${year}-${parts[1]}-${parts[0]}`);
      }
    }
  }
  // Fallback: hari ini
  return new Date();
}

function parseItems(text) {
  // Cari baris item: <name> <qty> <price>
  // Contoh baris: "ROTI SOBEK   1  8500"
  let lines = text.split('\n').map(x => x.trim()).filter(x => x);
  let items = [];
  let itemPattern = /^([A-Za-z ]+)\s+(\d+)\s+([\d\.,]+)$/;
  for (let line of lines) {
    let m = itemPattern.exec(line);
    if (m) {
      let name = m[1];
      let qty = parseInt(m[2]);
      let price = parseFloat(m[3].replace(/,/g,'.'));
      items.push({ name, qty, price });
    }
  }
  return items;
}

module.exports = function parseOCR(text) {
  const merchant = parseMerchant(text);
  const amount = parseTotal(text);
  const date = parseDate(text);
  const items = parseItems(text);

  return {
    merchant,
    amount,
    date,
    items,
    currency: "IDR", // Default untuk Indonesia
  };
};