import api from './api';

export const uploadImage = (productId, formData) =>
  api.post(`/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateImage = (productId, imageId, formData) =>
  api.put(`/products/${productId}/images/${imageId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteImage = (productId, imageId) =>
  api.delete(`/products/${productId}/images/${imageId}`);