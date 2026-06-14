import api from './api';

const adminCustomerService = {
  async getConversations(params = {}) {
    const response = await api.get('/admin/customer-service/conversations', { params });
    return response.data;
  },

  async getConversation(id) {
    const response = await api.get(`/admin/customer-service/conversations/${id}`);
    return response.data;
  },

  async sendMessage(id, message) {
    const response = await api.post(`/admin/customer-service/conversations/${id}/messages`, { message });
    return response.data;
  },

  async updateStatus(id, status) {
    const response = await api.patch(`/admin/customer-service/conversations/${id}/status`, { status });
    return response.data;
  },
};

export default adminCustomerService;
