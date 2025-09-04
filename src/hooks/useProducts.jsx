import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../services/api';

let clientSideProducts = [];
let allCategories = [];
let nextId = 1000;

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

const isCustomProduct = (id) => {
  return id >= 1000; 
};

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      await initializeData();
      
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
      try {
        await productsApi.createProduct(product);
      } catch (error) {
        console.log('API call failed (expected for demo), continuing with client-side operation');
      }
      
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
        isNew: true,
        isCustom: true 
      };
      
      clientSideProducts.unshift(newProduct);
      
      if (!allCategories.includes(product.category)) {
        allCategories.push(product.category);
        allCategories.sort();
      }
      
      return { data: newProduct };
    },
    onSuccess: (data) => {
      console.log('Product created successfully:', data.data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }) => {
      if (!isCustomProduct(id)) {
        try {
          await productsApi.updateProduct(id, product);
        } catch (error) {
          console.log('API update failed for original product:', error);
        }
      } else {
        console.log('Updating custom product (client-side only):', id);
      }
      
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
        
        if (oldCategory !== product.category && !allCategories.includes(product.category)) {
          allCategories.push(product.category);
          allCategories.sort();
        }
        
        return { data: clientSideProducts[index] };
      }
      
      throw new Error('Product not found');
    },
    onSuccess: (data, variables) => {
      console.log('Product updated successfully:', data.data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      if (!isCustomProduct(id)) {
        try {
          await productsApi.deleteProduct(id);
        } catch (error) {
          console.log('API delete failed for original product:', error);
        }
      } else {
        console.log('Deleting custom product (client-side only):', id);
      }
      
      const productExists = clientSideProducts.find(p => p.id === id);
      if (productExists) {
        clientSideProducts = clientSideProducts.filter(p => p.id !== id);
        return { data: { id, isDeleted: true } };
      }
      
      throw new Error('Product not found');
    },
    onSuccess: (data, productId) => {
      console.log('Product deleted successfully:', data.data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });
};

export const resetClientStore = () => {
  clientSideProducts = [];
  allCategories = [];
  nextId = 1000;
};