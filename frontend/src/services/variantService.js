import api from './api';

export const createVariant = (productId, data) =>
  api.post(`/products/${productId}/variants`, data);

export const updateVariant = (productId, variantId, data) =>
  api.put(`/products/${productId}/variants/${variantId}`, data);

export const deleteVariant = (productId, variantId) =>
  api.delete(`/products/${productId}/variants/${variantId}`);