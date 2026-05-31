import api from './api';

// Read — butuh permission: view-products
export const getProducts  = ()     => api.get('/products');
export const getProduct   = (id)   => api.get(`/products/${id}`);

// Manage — butuh permission: manage-products
export const createProduct = (data)      => api.post('/products', data);
export const updateProduct = (id, data)  => api.put(`/products/${id}`, data);
export const deleteProduct = (id)        => api.delete(`/products/${id}`);
export const syncCategories = (productId, categoryIds) =>
  api.put(`/products/${productId}/categories`, { category_ids: categoryIds });