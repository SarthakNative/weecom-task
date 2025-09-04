# Product Dashboard

A React-based product dashboard using DummyJSON API with CRUD operations, search, and filtering capabilities.

## 🚀 Live Demo
https://weecom-task.vercel.app/

## 📋 Features

- **Product Management**: Full CRUD operations (Create, Read, Update, Delete)
- **Search & Filter**: Real-time search and category-based filtering
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Loading States**: Skeleton loaders and proper error handling
- **Client-side Persistence**: Custom products persist during browser session
- **Visual Feedback**: Success/error messages and operation indicators

## 🛠️ Libraries Used

- **React** - Frontend framework
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components (Card, Dialog, Button, Input, Select, Skeleton)
- **TanStack Query (React Query)** - Data fetching and state management
- **Axios** - HTTP client for API requests
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library

## 🏗️ My Approach

### 1. **Project Foundation**
- Set up React app with Create React App
- Configured TailwindCSS with custom design tokens
- Integrated shadcn/ui component system for consistent UI

### 2. **API Integration Strategy**
- Created centralized API service using Axios
- Implemented DummyJSON API integration for initial data
- Added response interceptors for error handling

### 3. **State Management Architecture**
- Implemented TanStack Query for server state management
- Created custom hooks for products and categories
- Added caching and background refetching capabilities

### 4. **Component Structure Design**

### 5. **CRUD Operations Implementation**
- **Read**: Fetched products with pagination and search
- **Create**: Added form validation and optimistic updates
- **Update**: Pre-filled forms with existing data
- **Delete**: Confirmation dialogs and immediate UI updates

### 6. **Search & Filter System**
- Implemented real-time search across product titles and categories
- Added dropdown category filter with dynamic options
- Combined search and filter with pagination

### 7. **Client-Side Persistence Solution**
**Challenge**: DummyJSON is a mock API - custom products don't persist
**Solution**: 
- Hybrid approach: Server data + client-side storage
- Custom products (ID ≥ 1000) handled purely client-side
- Original products (ID < 1000) use API + client-side fallback

### 8. **User Experience Enhancements**
- Added skeleton loading states for better perceived performance
- Implemented success/error toast messages
- Visual indicators for new, updated, and custom products
- Responsive design with mobile-first approach

### 9. **Error Handling & Edge Cases**
- Graceful API error handling with fallback states
- Empty state management for no results
- Loading state management during operations
- Form validation with real-time feedback

### 10. **Performance Optimizations**
- React Query caching to minimize API calls
- Optimistic updates for immediate UI feedback
- Debounced search to reduce unnecessary requests
- Efficient re-renders with proper dependency arrays


