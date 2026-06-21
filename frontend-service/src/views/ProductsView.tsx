import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { mediaService } from '../services/mediaService';
import { Product } from '../types/product';
import { Category } from '../types/category';
import { formatCurrency } from '../utils/formatters';
import Search from '@mui/icons-material/Search';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import CloudUpload from '@mui/icons-material/CloudUpload';

export const ProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtering / Search states
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(6);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategoryForm, setSelectedCategoryForm] = useState<number | ''>('');

  // Upload and submit states
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories('', 0, 50);
      setCategories(data.content);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const catId = selectedCategoryFilter === 'ALL' ? undefined : Number(selectedCategoryFilter);
      const data = await productService.getProductsForAdmin(search, catId, page, pageSize);
      setProducts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.message || 'Failed to load product list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategoryFilter]);

  const handleOpenAddModal = () => {
    setModalTitle('Add New Product');
    setSelectedProductId(null);
    setName('');
    setDescription('');
    setPrice(0);
    setStock(0);
    setStatus('ACTIVE');
    setImageUrl('');
    setSelectedCategoryForm(categories.length > 0 ? categories[0].id : '');
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setModalTitle('Update Product');
    setSelectedProductId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price);
    setStock(product.stock);
    setStatus(product.status);
    setImageUrl(product.imageUrl || '');
    setSelectedCategoryForm(product.categoryId);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setSubmitError('');
    try {
      const res = await mediaService.uploadFile(files[0]);
      setImageUrl(res.url);
    } catch (err: any) {
      setSubmitError(err.message || 'Error uploading image to server.');
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError('Product name cannot be empty!');
      return;
    }
    if (!selectedCategoryForm) {
      setSubmitError('Please select a product category!');
      return;
    }
    if (price < 0 || stock < 0) {
      setSubmitError('Price and stock quantities cannot be negative!');
      return;
    }

    setSubmitError('');
    setSubmitting(true);
    try {
      const reqBody = {
        name,
        description,
        price,
        stock,
        status,
        imageUrl,
        categoryId: Number(selectedCategoryForm)
      };

      if (selectedProductId) {
        await productService.updateProduct(selectedProductId, reqBody);
      } else {
        await productService.createProduct(reqBody);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      setSubmitError(err.message || 'Error saving product information.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (err: any) {
        alert(err.message || 'Error deleting product.');
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Product Management"
        description="Add, edit, delete fashion products and manage stock levels."
        actionText="Add Product"
        onActionClick={handleOpenAddModal}
      />

      {/* Action and Filter controls */}
      <div className="actions-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-control"
            placeholder="Search products by name..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>

        <div className="filters-wrapper">
          <label className="form-label" style={{ margin: 0 }}>Category:</label>
          <select
            className="filter-select"
            value={selectedCategoryFilter}
            onChange={e => {
              setSelectedCategoryFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="login-error" style={{ marginBottom: '20px' }}>{error}</div>}

      {/* Grid Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
            Loading products data...
          </div>
        ) : products.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
            No matching products found.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th style={{ width: '120px' }}>Stock</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => {
                const isLowStock = prod.stock < 5;
                const gatewayImageUrl = prod.imageUrl
                  ? (prod.imageUrl.startsWith('http') ? prod.imageUrl : `http://localhost:8000${prod.imageUrl}`)
                  : 'https://placehold.co/100x100?text=No+Image';

                return (
                  <tr key={prod.id}>
                    <td>
                      <img src={gatewayImageUrl} alt={prod.name} className="table-img" />
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{prod.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: #{prod.id}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{prod.categoryName || 'Uncategorized'}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{formatCurrency(prod.price)}</td>
                    <td>
                      <span className={`badge ${isLowStock ? 'badge-warning' : 'badge-info'}`}>
                        {prod.stock} {prod.stock <= 1 ? 'unit' : 'units'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${prod.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {prod.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'center' }}>
                        <button
                          className="action-icon-btn edit"
                          title="Edit Product"
                          onClick={() => handleOpenEditModal(prod)}
                        >
                          <Edit style={{ fontSize: '18px' }} />
                        </button>
                        <button
                          className="action-icon-btn delete"
                          title="Delete Product"
                          onClick={() => handleDeleteProduct(prod.id)}
                        >
                          <Delete style={{ fontSize: '18px' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination component */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Add / Edit product Modal */}
      <Modal isOpen={isModalOpen} title={modalTitle} onClose={handleCloseModal}>
        <form onSubmit={handleFormSubmit}>
          {submitError && <div className="login-error" style={{ marginBottom: '16px' }}>{submitError}</div>}

          <div className="form-input-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter product name..."
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-input-group">
            <label className="form-label">Product Category *</label>
            <select
              className="form-control"
              value={selectedCategoryForm}
              onChange={e => setSelectedCategoryForm(Number(e.target.value))}
              disabled={submitting}
              required
            >
              <option value="" disabled>-- Select Category --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-input-group">
              <label className="form-label">Price (VND) *</label>
              <input
                type="number"
                className="form-control"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                disabled={submitting}
                min={0}
                required
              />
            </div>
            <div className="form-input-group">
              <label className="form-label">Stock *</label>
              <input
                type="number"
                className="form-control"
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                disabled={submitting}
                min={0}
                required
              />
            </div>
          </div>

          <div className="form-input-group">
            <label className="form-label">Sale Status</label>
            <select
              className="form-control"
              value={status}
              onChange={e => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              disabled={submitting}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Media image upload */}
          <div className="form-input-group">
            <label className="form-label">Product Image</label>
            <div className="media-uploader-box">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading || submitting}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {uploading ? 'Uploading image...' : <><CloudUpload /> <span>Click or Drag & Drop image here to upload</span></>}
              </div>
            </div>
            {imageUrl && (
              <div className="media-uploader-preview">
                <img
                  src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`}
                  alt="Product preview"
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--success)' }}>Uploaded successfully!</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setImageUrl('')}
                    style={{ padding: '4px 8px', fontSize: '10px' }}
                  >
                    Delete image
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="form-input-group">
            <label className="form-label">Product Description</label>
            <textarea
              className="form-control"
              placeholder="Material, design, sizing details..."
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={submitting}
              style={{ resize: 'none' }}
            />
          </div>

          <div className="modal-footer" style={{ padding: '20px 0 0 0', background: 'transparent', borderTop: 'none' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
              disabled={submitting || uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || uploading}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
