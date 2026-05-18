/**
 * formatCurrency.js
 * -----------------
 * Utility function untuk memformat angka menjadi format Rupiah.
 *
 * Contoh: 150000 → "Rp 150.000"
 *
 * Menggunakan Intl.NumberFormat bawaan JavaScript
 * agar pemisah ribuan otomatis sesuai locale Indonesia.
 */
export function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
