import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import ProductForm from './ProductForm';
import ProductTableSkeleton from './ProductTableSkeleton';
import { useProducts, useCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/useProducts';

const ProductTable = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const limit = 10;
  const skip = page * limit;

  const { data, isLoading, error } = useProducts({ limit, skip, search, category });
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleCategoryFilter = (selectedCategory) => {
    setCategory(selectedCategory);
    setPage(0);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync(formData);
        showMessage('success', `"${formData.title}" updated successfully!`);
      } else {
        await createMutation.mutateAsync(formData);
        showMessage('success', `"${formData.title}" created successfully!`);
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      showMessage('error', `Error ${editingProduct ? 'updating' : 'creating'} product. Please try again.`);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        showMessage('success', `"${title}" deleted successfully!`);
      } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('error', 'Error deleting product. Please try again.');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const products = data?.products || [];
  const total = data?.total || 0;

  const renderContent = () => {
    if (isLoading) {
      return <ProductTableSkeleton />;
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          <div className="mb-2">⚠️</div>
          <div className="font-medium">Error loading products</div>
          <div className="text-sm text-gray-500 mt-1">
            {error.response?.status === 404 
              ? 'Products not found' 
              : 'Please check your connection and try again'
            }
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-2">📦</div>
          <div className="font-medium">
            {search || category !== 'all' ? 'No products found' : 'No products available'}
          </div>
          <div className="text-sm mt-1">
            {search || category !== 'all' 
              ? 'Try adjusting your search terms or filters' 
              : 'Start by adding your first product'
            }
          </div>
          {!search && category === 'all' && (
            <Button onClick={handleAddNew} className="mt-4">
              Add Your First Product
            </Button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Title</th>
                <th className="text-left py-2 px-4">Price</th>
                <th className="text-left py-2 px-4">Category</th>
                <th className="text-left py-2 px-4">Stock</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
             {products.map(product => (
  <tr 
    key={product.id} 
    className={`border-b hover:bg-gray-50 ${
      product.isNew 
        ? 'bg-green-50 border-green-200' 
        : product.isUpdated 
        ? 'bg-blue-50 border-blue-200' 
        : ''
    }`}
  >
    <td className="py-2 px-4">
      <div className="font-medium flex items-center gap-2">
        {product.title}
        {product.isNew && (
          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">NEW</span>
        )}
        {product.isUpdated && (
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">UPDATED</span>
        )}
        {product.isCustom && (
          <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded">CUSTOM</span>
        )}
      </div>
    </td>
    <td className="py-2 px-4">
      <div className="font-semibold text-green-600">
        ${product.price}
      </div>
    </td>
    <td className="py-2 px-4">
      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
        {product.category}
      </span>
    </td>
    <td className="py-2 px-4">
      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
        product.stock > 10 
          ? 'bg-green-100 text-green-800' 
          : product.stock > 0 
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-red-100 text-red-800'
      }`}>
        {product.stock} units
      </span>
    </td>
    <td className="py-2 px-4">
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleEdit(product)}
          disabled={deleteMutation.isPending}
        >
          Edit
        </Button>
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => handleDelete(product.id, product.title)}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </td>
  </tr>
))}
            </tbody>
          </table>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="text-sm text-gray-500">
            Showing {skip + 1} to {Math.min(skip + limit, total)} of {total} products
            {category !== 'all' && (
              <span className="ml-1">in "{category}"</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
            >
              Previous
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={skip + limit >= total || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <Card>
      {message.text && (
        <div className={`mx-6 mt-6 p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}
      
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            Products
            {!isLoading && (
              <span className="text-sm font-normal text-gray-500">
                ({total})
              </span>
            )}
            {isLoading && search && (
              <span className="text-sm font-normal text-blue-500 animate-pulse">
                Searching...
              </span>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <Select value={category} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleAddNew} disabled={isLoading}>
              Add Product
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={handleSearch}
            className="max-w-sm"
          />
          {(search || category !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearch('');
                setCategory('all');
                setPage(0);
              }}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {renderContent()}

        <ProductForm
          product={editingProduct}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </CardContent>
    </Card>
  );
};

export default ProductTable;