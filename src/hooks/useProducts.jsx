import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../services/api';

// This will store our client-side modifications
let clientSideProducts = [];
let nextId = 1000; // Start from a high number to avoid conflicts

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await productsApi.getProducts(params);
      const serverProducts = response.data.products;
      
      // If this is the first load, initialize our client-side store
      if (clientSideProducts.length === 0 && params.skip === 0 && !params.search && !params.category) {
        clientSideProducts = [...serverProducts];
      }
      
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
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

// Hook to get unique categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => {
      const uniqueCategories = [...new Set(clientSideProducts.map(product => product.category))];
      return uniqueCategories.sort();
    },
    enabled: clientSideProducts.length > 0,
    staleTime: Infinity, // Categories don't change often
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product) => {
      // Call the API (for demonstration)
      const response = await productsApi.createProduct(product);
      
      // Add to our client-side store with a new ID
      const newProduct = {
        id: nextId++,
        title: product.title,
        price: Number(product.price),
        category: product.category,
        stock: Number(product.stock),
        description: product.description || 'Product description',
        brand: product.brand || 'Generic',
        thumbnail: 'https://via.placeholder.com/150',
        // Add timestamp to show it's newly created
        isNew: true
      };
      
      clientSideProducts.unshift(newProduct);
      
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
      // Call the API (for demonstration)
      await productsApi.updateProduct(id, product);
      
      // Update in our client-side store
      const index = clientSideProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        clientSideProducts[index] = {
          ...clientSideProducts[index],
          title: product.title,
          price: Number(product.price),
          category: product.category,
          stock: Number(product.stock),
          isUpdated: true // Mark as updated
        };
      }
      
      return { data: clientSideProducts[index] };
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
      // Call the API (for demonstration)
      await productsApi.deleteProduct(id);
      
      // Remove from our client-side store
      clientSideProducts = clientSideProducts.filter(p => p.id !== id);
      
      return { data: { id, isDeleted: true } };
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

// Helper function to reset the client-side store (useful for development)
export const resetClientStore = () => {
  clientSideProducts = [];
};