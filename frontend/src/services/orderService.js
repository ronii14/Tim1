import api from './api';

const orderService = {
  /**
   * List authenticated user's orders.
   */
  async getOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  /**
   * Get detail of a specific order.
   * @param {string} id - Order UUID
   */
  async getOrder(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Place order (checkout).
   * @param {Object} data - { address_id, promo_code, shipping_method, shipping_cost, notes, payment_method }
   */
  async placeOrder(data) {
    const response = await api.post('/orders', data);
    return response.data;
  },

  /**
   * Cancel a pending order.
   * @param {string} id - Order UUID
   */
  async cancelOrder(id) {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },
};

export default orderService;
