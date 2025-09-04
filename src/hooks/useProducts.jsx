import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../services/api';

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: (data) => {
      console.log('Product created successfully:', data.data);
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Optionally, you can also update the cache optimistically
      queryClient.setQueryData(['products'], (oldData) => {
        if (oldData?.products) {
          return {
            ...oldData,
            products: [data.data, ...oldData.products],
            total: oldData.total + 1
          };
        }
        return oldData;
      });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...product }) => productsApi.updateProduct(id, product),
    onSuccess: (data, variables) => {
      console.log('Product updated successfully:', data.data);
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Update the specific product in cache
      queryClient.setQueryData(['products'], (oldData) => {
        if (oldData?.products) {
          const updatedProducts = oldData.products.map(product => 
            product.id === variables.id ? { ...product, ...data.data } : product
          );
          return {
            ...oldData,
            products: updatedProducts
          };
        }
        return oldData;
      });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: (data, productId) => {
      console.log('Product deleted successfully:', data.data);
      // Invalidate and refetch products
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Remove the product from cache
      queryClient.setQueryData(['products'], (oldData) => {
        if (oldData?.products) {
          return {
            ...oldData,
            products: oldData.products.filter(product => product.id !== productId),
            total: oldData.total - 1
          };
        }
        return oldData;
      });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });
};