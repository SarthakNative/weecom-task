import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../services/api';

// This will store our client-side modifications
let clientSideProducts = [];
let allCategories = [];
let nextId = 1000;

// Initialize with DummyJSON data on first load
const initializeData = async () => {
  if (clientSideProducts.length === 0) {
    try {
      const response = await productsApi.getProducts({ limit: 100, skip: 0 });
      clientSideProducts = [...response.data.products];
      allCategories = [...new Set(clientSideProducts.map(p => p.category))].sort();
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  }
};

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      // Initialize data if needed
      await initializeData();
      
      // Filter client-side products based on search and category
      let filteredProducts = [...clientSideProducts];
      
      if (params.search) {
        filteredProducts = filteredProducts.filter(product =>
          product.title.toLowerCase().includes(params.search.toLowerCase()) ||
          product.category.toLowerCase().includes(params.search.toLowerCase())
        );
      }
      
      if (params.category && params.category !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
          product.category.toLowerCase() === params.category.toLowerCase()
        );
      }
      
      // Apply pagination
      const paginatedProducts = filteredProducts.slice(
        params.skip || 0,
        (params.skip || 0) + (params.limit || 10)
      );
      
      return {
        products: paginatedProducts,
        total: filteredProducts.length,
        skip: params.skip || 0,
        limit: params.limit || 10
      };
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      await initializeData();
      return allCategories;
    },
    staleTime: Infinity,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product) => {
      const response = await productsApi.createProduct(product);
      
      const newProduct = {
        id: nextId++,
        title: product.title,
        price: Number(product.price),
        category: product.category,
        stock: Number(product.stock),
        description: product.description || 'Product description',
        brand: product.brand || 'Generic',
        thumbnail: 'https://via.placeholder.com/150',
        rating: 4.5,
        discountPercentage: 0,
        isNew: true
      };
      
      clientSideProducts.unshift(newProduct);
      
      // Update categories if new category
      if (!allCategories.includes(product.category)) {
        allCategories.push(product.category);
        allCategories.sort();
      }
      
      return { data: newProduct };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }) => {
      await productsApi.updateProduct(id, product);
      
      const index = clientSideProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        const oldCategory = clientSideProducts[index].category;
        clientSideProducts[index] = {
          ...clientSideProducts[index],
          title: product.title,
          price: Number(product.price),
          category: product.category,
          stock: Number(product.stock),
          isUpdated: true
        };
        
        // Update categories if category changed
        if (oldCategory !== product.category && !allCategories.includes(product.category)) {
          allCategories.push(product.category);
          allCategories.sort();
        }
      }
      
      return { data: clientSideProducts[index] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await productsApi.deleteProduct(id);
      clientSideProducts = clientSideProducts.filter(p => p.id !== id);
      return { data: { id, isDeleted: true } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const resetClientStore = () => {
  clientSideProducts = [];
  allCategories = [];
};