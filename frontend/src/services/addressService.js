import api from './api';

const addressService = {
  /**
   * Get all addresses for authenticated user.
   */
  async getAddresses() {
    const response = await api.get('/addresses');
    return response.data;
  },

  /**
   * Get a single address by ID.
   * @param {string} id - Address UUID
   */
  async getAddress(id) {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  /**
   * Create a new address.
   * @param {Object} data - Address fields
   */
  async createAddress(data) {
    const response = await api.post('/addresses', data);
    return response.data;
  },

  /**
   * Update an existing address.
   * @param {string} id - Address UUID
   * @param {Object} data - Address fields to update
   */
  async updateAddress(id, data) {
    const response = await api.put(`/addresses/${id}`, data);
    return response.data;
  },

  /**
   * Delete an address.
   * @param {string} id - Address UUID
   */
  async deleteAddress(id) {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },
};

export default addressService;
