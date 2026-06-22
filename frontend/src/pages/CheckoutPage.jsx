import CheckoutForm from '../components/checkout/CheckoutForm'
import OrderSummary from '../components/checkout/OrderSummary'

function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="flex gap-8">
        
        <div className="flex-1 bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Alamat Pengiriman</h2>
          <CheckoutForm />
        </div>

        <div className="w-80 bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
          <OrderSummary />
        </div>

      </div>
    </div>
  )
}

export default CheckoutPage