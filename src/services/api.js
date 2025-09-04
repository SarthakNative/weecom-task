import axios from 'axios';

const BASE_URL = 'https://dummyjson.com';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const productsApi = {
  getProducts: (params = {}) => {
    const { limit = 10, skip = 0, search = '' } = params;
    if (search) {
      return api.get(`/products/search?q=${search}&limit=${limit}&skip=${skip}`);
    }
    return api.get(`/products?limit=${limit}&skip=${skip}`);
  },
  
  createProduct: (product) => {
    return api.post('/products/add', {
      title: product.title,
      price: Number(product.price),
      category: product.category,
      stock: Number(product.stock),
      description: product.description || 'Product description',
      brand: product.brand || 'Generic',
      thumbnail: 'https://via.placeholder.com/150'
    });
  },
  
  updateProduct: (id, product) => {
    return api.put(`/products/${id}`, {
      title: product.title,
      price: Number(product.price),
      category: product.category,
      stock: Number(product.stock)
    });
  },
  
  deleteProduct: (id) => {
    return api.delete(`/products/${id}`);
  },
};