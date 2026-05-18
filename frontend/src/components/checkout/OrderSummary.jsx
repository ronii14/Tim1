function OrderSummary() {
  // nanti data ini dari API backend, sekarang dummy dulu
  const items = [
    { id: 1, nama: "Kaos Polos Hitam", harga: 85000, qty: 2 },
    { id: 2, nama: "Hoodie Abu-abu", harga: 250000, qty: 1 },
  ]

  const total = items.reduce((acc, item) => acc + item.harga * item.qty, 0)

  return (
    <div className="flex flex-col gap-4">
      
      {/* List produk */}
      {items.map(item => (
        <div key={item.id} className="flex justify-between text-sm">
          <div>
            <p className="font-medium">{item.nama}</p>
            <p className="text-gray-500">x{item.qty}</p>
          </div>
          <p className="font-medium">Rp {(item.harga * item.qty).toLocaleString('id-ID')}</p>
        </div>
      ))}

      <hr />

      {/* Total */}
      <div className="flex justify-between font-bold text-lg">
        <p>Total</p>
        <p>Rp {total.toLocaleString('id-ID')}</p>
      </div>

    </div>
  )
}

export default OrderSummary