import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

const ProductForm = ({ product, isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    stock: ''
  });

  const [errors, setErrors] = useState({});

  // Update form data when product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        stock: product.stock?.toString() || ''
      });
    } else {
      setFormData({
        title: '',
        price: '',
        category: '',
        stock: ''
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.stock || isNaN(formData.stock) || Number(formData.stock) < 0) {
      newErrors.stock = 'Valid stock number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const submitData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock)
    };
    
    if (product) {
      submitData.id = product.id;
    }
    
    onSubmit(submitData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      price: '',
      category: '',
      stock: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              name="title"
              placeholder="Product Title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          <div>
            <Input
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Price (e.g., 29.99)"
              value={formData.price}
              onChange={handleChange}
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>
          
          <div>
            <Input
              name="category"
              placeholder="Category (e.g., Electronics)"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'border-red-500' : ''}
            />
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>
          
          <div>
            <Input
              name="stock"
              type="number"
              min="0"
              placeholder="Stock Quantity"
              value={formData.stock}
              onChange={handleChange}
              className={errors.stock ? 'border-red-500' : ''}
            />
            {errors.stock && (
              <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
            )}
          </div>
          
          <div className="flex gap-2 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {product ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;