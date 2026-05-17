function CheckoutForm() {
  return (
    <div className="flex flex-col gap-4">
      
      <div>
        <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
        <input 
          type="text" 
          placeholder="John Doe"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
        <input 
          type="text" 
          placeholder="08xxxxxxxxxx"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Alamat</label>
        <textarea 
          placeholder="Jalan, No. Rumah, RT/RW"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Kota</label>
        <input 
          type="text" 
          placeholder="Jakarta"
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Metode Pembayaran</label>
        <select className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Pilih metode pembayaran</option>
          <option value="transfer">Transfer Bank</option>
          <option value="cod">COD (Bayar di Tempat)</option>
          <option value="ewallet">E-Wallet</option>
        </select>
      </div>

      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
        Konfirmasi Pesanan
      </button>

    </div>
  )
}

export default CheckoutForm