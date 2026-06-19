import api from './api';

const cartService = {
  /**
   * Get all cart items for authenticated user.
   */
  async getCart() {
    const response = await api.get('/cart');
    return response.data;
  },

  /**
   * Add item to cart. If same product+variant exists, increments quantity.
   * @param {number} productId
   * @param {number|null} variantId
   * @param {number} quantity
   */
  async addToCart(productId, variantId = null, quantity = 1) {
    const response = await api.post('/cart', {
      product_id: productId,
      variant_id: variantId,
      quantity,
    });
    return response.data;
  },

  /**
   * Update quantity for a specific cart item.
   * @param {number} cartItemId
   * @param {number} quantity
   */
  async updateCartItem(cartItemId, quantity) {
    const response = await api.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  /**
   * Remove a single item from cart.
   * @param {number} cartItemId
   */
  async removeCartItem(cartItemId) {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
  },

  /**
   * Clear all cart items for authenticated user.
   */
  async clearCart() {
    const response = await api.delete('/cart');
    return response.data;
  },
};

export default cartService;
