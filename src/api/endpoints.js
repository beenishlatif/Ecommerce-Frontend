import api from './axios.js';

// Thin, explicit wrappers — every call site knows exactly what it's hitting.
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const productApi = {
  list: (params) => api.get('/products', { params }),
  bySlug: (slug) => api.get(`/products/${slug}`),
  reviews: (productId) => api.get(`/products/${productId}/reviews`),
  addReview: (productId, data) => api.post(`/products/${productId}/reviews`, data),
};

export const categoryApi = {
  list: () => api.get('/categories'),
  bySlug: (slug) => api.get(`/categories/${slug}`),
};

export const orderApi = {
  create: (data) => api.post('/orders', data),
  mine: () => api.get('/orders'),
  byId: (id) => api.get(`/orders/${id}`),
};

export const userApi = {
  updateProfile: (data) => api.put('/users/me', data),
  addAddress: (data) => api.post('/users/me/addresses', data),
  updateAddress: (id, data) => api.put(`/users/me/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/me/addresses/${id}`),
  wishlist: () => api.get('/users/me/wishlist'),
  toggleWishlist: (productId) => api.put(`/users/me/wishlist/${productId}`),
};

export const couponApi = {
  validate: (data) => api.post('/coupons/validate', data),
};

// Site-wide settings — currently just the homepage hero image.
// Both routes live under /api/settings — the PUT route itself enforces
// admin-only access (protect + authorize inside settingRoutes.js), so the
// frontend path does not need an /admin prefix.
export const settingApi = {
  getHomepage: () => api.get('/settings/homepage'),
  updateHomepage: (data) => api.put('/settings/homepage', data),
};

// Multipart image/video uploads + gallery listing — used by the admin product form.
// Kept as a top-level export (not nested under adminApi) since every
// current call site imports it directly as `uploadApi`.
export const uploadApi = {
  listGallery: () => api.get('/upload/gallery'),
  gallery: () => api.get('/upload/gallery'), // alias for listGallery
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  upload: (file) => uploadApi.uploadImage(file), // alias
  uploadSingle: (file) => uploadApi.uploadImage(file), // alias — kept for older call sites
  uploadImages: (files) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultiple: (files) => uploadApi.uploadImages(files), // alias
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  products: {
    list: () => api.get('/admin/products'),
    get: (id) => api.get(`/admin/products/${id}`),
    create: (data) => api.post('/admin/products', data),
    update: (id, data) => api.put(`/admin/products/${id}`, data),
    remove: (id) => api.delete(`/admin/products/${id}`),
  },
  categories: {
    create: (data) => api.post('/admin/categories', data),
    update: (id, data) => api.put(`/admin/categories/${id}`, data),
    remove: (id) => api.delete(`/admin/categories/${id}`),
  },
  orders: {
    list: (params) => api.get('/admin/orders', { params }),
    updateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  },
  customers: () => api.get('/admin/customers'),
  users: () => api.get('/admin/users'),
  coupons: {
    list: () => api.get('/admin/coupons'),
    create: (data) => api.post('/admin/coupons', data),
    update: (id, data) => api.put(`/admin/coupons/${id}`, data),
    remove: (id) => api.delete(`/admin/coupons/${id}`),
  },
  payments: {
    list: () => api.get('/admin/payments'),
    byId: (id) => api.get(`/admin/payments/${id}`),
  },
  reviews: {
    list: () => api.get('/admin/reviews'),
    moderate: (id, status) => api.put(`/admin/reviews/${id}/status`, { status }),
  },
  sales: {
    active: () => api.get('/admin/sales/active'),
    preview: (data) => api.post('/admin/sales/preview', data),
    apply: (data) => api.post('/admin/sales/apply', data),
    remove: (data) => api.post('/admin/sales/remove', data),
  },
  uploads: uploadApi,
};