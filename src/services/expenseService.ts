import api, { expensesAPI } from "./api";

export async function uploadReceipt(file: File, extra: Record<string, any> = {}) {
  const form = new FormData();
  form.append("receipt", file);
  Object.keys(extra).forEach(k => {
    const v = extra[k];
    form.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  });
  const res = await expensesAPI.uploadReceipt(form);
  return res.data;
}