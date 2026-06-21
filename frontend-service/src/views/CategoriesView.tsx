import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { categoryService } from '../services/categoryService';
import { Category } from '../types/category';
import { formatDate } from '../utils/formatters';
import Search from '@mui/icons-material/Search';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';

export const CategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search and Pagination states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(8);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await categoryService.getCategories(search, page, pageSize);
      setCategories(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const handleOpenAddModal = () => {
    setModalTitle('Add New Category');
    setSelectedCategoryId(null);
    setName('');
    setDescription('');
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setModalTitle('Update Category');
    setSelectedCategoryId(category.id);
    setName(category.name);
    setDescription(category.description || '');
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError('Category name cannot be empty!');
      return;
    }

    setSubmitError('');
    setSubmitting(true);
    try {
      if (selectedCategoryId) {
        // Edit
        await categoryService.updateCategory(selectedCategoryId, { name, description });
      } else {
        // Create
        await categoryService.createCategory({ name, description });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while saving the category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category? All products under this category will be affected.')) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (err: any) {
        alert(err.message || 'Failed to delete this category.');
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Category Management"
        description="Manage the store's fashion categories (e.g., T-shirts, Jeans, Accessories...)"
        actionText="Add Category"
        onActionClick={handleOpenAddModal}
      />

      {/* Filter and Search Bar */}
      <div className="actions-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-control"
            placeholder="Search categories by name..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(0); // Reset page on query change
            }}
          />
        </div>
      </div>

      {error && <div className="login-error" style={{ marginBottom: '20px' }}>{error}</div>}

      {/* Categories Grid Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
            Loading categories data...
          </div>
        ) : categories.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
            No matching categories found.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Category Name</th>
                <th>Description</th>
                <th style={{ width: '220px' }}>Created Date</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>#{cat.id}</td>
                  <td style={{ fontWeight: '600' }}>{cat.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{cat.description || 'No description'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{formatDate(cat.createdAt)}</td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'center' }}>
                      <button
                        className="action-icon-btn edit"
                        title="Edit Category"
                        onClick={() => handleOpenEditModal(cat)}
                      >
                        <Edit style={{ fontSize: '18px' }} />
                      </button>
                      <button
                        className="action-icon-btn delete"
                        title="Delete Category"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        <Delete style={{ fontSize: '18px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* Modal Dialog */}
      <Modal isOpen={isModalOpen} title={modalTitle} onClose={handleCloseModal}>
        <form onSubmit={handleFormSubmit}>
          {submitError && <div className="login-error" style={{ marginBottom: '16px' }}>{submitError}</div>}

          <div className="form-input-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter category name (e.g. Polo T-shirt)..."
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-input-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-control"
              placeholder="Enter description for category..."
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
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
