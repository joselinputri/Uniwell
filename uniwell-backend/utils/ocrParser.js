/**
 * Enhanced OCR Parser for Indonesian receipts
 * Extracts: total amount, merchant, date, items
 */

function parseMerchant(text) {
  let lines = text.split('\n').map(x => x.trim()).filter(x => x);
  let merchant = "";
  
  // Look for common store names in first 6 lines
  const storePatterns = [
    /INDOMARET|ALFAMART|ALFAMIDI/i,
    /HYPERMART|SUPERINDO|GIANT|LOTTE|CARREFOUR/i,
    /WARUNG|TOKO|KIOS|MINIMARKET/i,
    /CAFE|COFFEE|RESTO|RESTAURANT|KEDAI/i,
    /BAKERY|LAUNDRY|APOTEK|PHARMACY/i
  ];
  
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    for (let pattern of storePatterns) {
      if (pattern.test(lines[i])) {
        merchant = lines[i];
        break;
      }
    }
    if (merchant) break;
  }
  
  // Fallback: first non-empty line
  if (!merchant && lines.length) {
    merchant = lines[0];
  }
  
  return merchant.trim().substring(0, 50); // Limit length
}

function parseTotal(text) {
  // Look for TOTAL/JUMLAH keywords
  const patterns = [
    /(?:TOTAL|GRAND\s*TOTAL|JUMLAH|BAYAR|TAGIHAN|AMOUNT|HARGA)\s*[:\-]?\s*Rp?\.?\s*([\d\.,]+)/gi,
    /(?:TOTAL|GRAND\s*TOTAL|JUMLAH)\s*[:\-]?\s*([\d\.,]+)/gi,
    /Rp\.?\s*([\d\.,]+)\s*(?:TOTAL|JUMLAH)/gi
  ];
  
  let maxAmount = 0;
  
  for (let pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      let numStr = match[1]
        .replace(/\./g, '') // Remove thousands separator
        .replace(/,/g, '.'); // Convert comma to decimal point
      
      let num = parseFloat(numStr);
      if (num && num > 0 && num > maxAmount && num < 10000000) { // Reasonable limit
        maxAmount = num;
      }
    }
  }
  
  // Fallback: find largest Rp amount
  if (maxAmount === 0) {
    const rpPattern = /Rp\.?\s*([\d\.,]+)/g;
    let match;
    while ((match = rpPattern.exec(text)) !== null) {
      let numStr = match[1]
        .replace(/\./g, '')
        .replace(/,/g, '.');
      let num = parseFloat(numStr);
      if (num > maxAmount && num < 10000000) {
        maxAmount = num;
      }
    }
  }
  
  return Math.round(maxAmount); // Return as integer
}

function parseDate(text) {
  // Indonesian date patterns
  const patterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,  // dd/mm/yyyy or dd-mm-yyyy
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/,  // yyyy/mm/dd
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/   // dd/mm/yy
  ];
  
  for (let pattern of patterns) {
    let match = text.match(pattern);
    if (match) {
      let [_, p1, p2, p3] = match;
      
      // Determine format
      if (p1.length === 4) {
        // yyyy-mm-dd
        return new Date(`${p1}-${p2.padStart(2,'0')}-${p3.padStart(2,'0')}`);
      } else if (p3.length === 4) {
        // dd-mm-yyyy
        return new Date(`${p3}-${p2.padStart(2,'0')}-${p1.padStart(2,'0')}`);
      } else {
        // dd-mm-yy
        let year = parseInt(p3) < 50 ? `20${p3}` : `19${p3}`;
        return new Date(`${year}-${p2.padStart(2,'0')}-${p1.padStart(2,'0')}`);
      }
    }
  }
  
  // Fallback: today
  return new Date();
}

function parseItems(text) {
  let lines = text.split('\n').map(x => x.trim()).filter(x => x);
  let items = [];
  
  // Pattern: NAME QTY PRICE
  const itemPattern = /^([A-Z][A-Za-z\s]{2,30})\s+(\d+)\s+([\d\.,]+)$/;
  
  for (let line of lines) {
    let m = itemPattern.exec(line);
    if (m) {
      let name = m[1].trim();
      let qty = parseInt(m[2]);
      let price = parseFloat(m[3].replace(/\./g, '').replace(/,/g, '.'));
      
      if (price > 0 && price < 1000000) { // Reasonable price
        items.push({ name, qty, price });
      }
    }
  }
  
  return items;
}

function guessCategory(merchant, items) {
  const merchantLower = merchant.toLowerCase();
  
  // Food & Beverage
  if (/cafe|coffee|resto|bakery|makan|minum|food|warung|kedai/.test(merchantLower)) {
    return "Food";
  }
  
  // Academic
  if (/toko\s*buku|gramedia|gunung\s*agung|fotocopy|print|kampus/.test(merchantLower)) {
    return "Academic";
  }
  
  // Transport
  if (/gojek|grab|ojol|taxi|bensin|pertamina|spbu/.test(merchantLower)) {
    return "Transport";
  }
  
  // Lifestyle/Shopping
  if (/indomaret|alfamart|minimarket|supermarket/.test(merchantLower)) {
    return "Lifestyle";
  }
  
  return "Others";
}

module.exports = function parseOCR(text) {
  const merchant = parseMerchant(text);
  const amount = parseTotal(text);
  const date = parseDate(text);
  const items = parseItems(text);
  const category = guessCategory(merchant, items);

  return {
    merchant,
    amount,
    date,
    items,
    category,
    currency: "IDR",
  };
};