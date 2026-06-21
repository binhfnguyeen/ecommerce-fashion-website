import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { userService } from '../services/userService';
import { User } from '../types/user';
import Search from '@mui/icons-material/Search';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Lock from '@mui/icons-material/Lock';
import LockOpen from '@mui/icons-material/LockOpen';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search/Filters & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(8);

  // Modal overlays
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');

  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getUsers(search, page, pageSize);
      setUsers(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.message || 'Failed to load user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleOpenAddModal = () => {
    console.log('UsersView handleOpenAddModal called');
    setModalTitle('Create New Account');
    setSelectedUserId(null);
    setUsername('');
    setPassword('');
    setEmail('');
    setFullName('');
    setRole('USER');
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    console.log('UsersView handleOpenEditModal called for user:', user.username);
    setModalTitle('Update Account Information');
    setSelectedUserId(user.id);
    setUsername(user.username); // username cannot be updated
    setPassword(''); // password not updated in this form
    setEmail(user.email);
    setFullName(user.fullName || '');
    setRole(user.role);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('UsersView handleCloseModal called');
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      setSubmitError('Email and Full Name are required!');
      return;
    }

    setSubmitError('');
    setSubmitting(true);
    try {
      if (selectedUserId) {
        // Edit User
        await userService.updateUser(selectedUserId, { email, fullName, role });
      } else {
        // Create User
        if (!username.trim() || !password.trim()) {
          setSubmitError('Please enter Username and Password!');
          setSubmitting(false);
          return;
        }
        await userService.createUser({ username, password, email, fullName, role });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLock = async (user: User) => {
    const action = user.active ? 'lock' : 'unlock';
    if (window.confirm(`Are you sure you want to ${action} account "${user.username}"?`)) {
      try {
        if (user.active) {
          await userService.deactivateUser(user.id);
        } else {
          await userService.activateUser(user.id);
        }
        fetchUsers();
      } catch (err: any) {
        alert(err.message || 'Error performing action.');
      }
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('WARNING: Are you sure you want to PERMANENTLY DELETE this account? This action cannot be undone.')) {
      try {
        await userService.deleteUser(id);
        fetchUsers();
      } catch (err: any) {
        alert(err.message || 'Error deleting user.');
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        description="View user list, manage administrator/customer roles, lock/unlock or delete users."
        actionText="Create User"
        onActionClick={handleOpenAddModal}
      />

      <div className="actions-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            className="search-control"
            placeholder="Search users by name, email..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      {error && <div className="login-error" style={{ marginBottom: '20px' }}>{error}</div>}

      <div className="table-container">
        {loading ? (
          <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
            Loading user data...
          </div>
        ) : users.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', padding: '40px', textAlign: 'center' }}>
            No matching users found.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th style={{ width: '120px' }}>Role</th>
                <th style={{ width: '130px' }}>Status</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(usr => (
                <tr key={usr.id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>#{usr.id}</td>
                  <td style={{ fontWeight: '600' }}>{usr.username}</td>
                  <td>{usr.fullName || <span style={{ color: 'var(--text-muted)' }}>Not specified</span>}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{usr.email}</td>
                  <td>
                    <span className={`badge ${usr.role === 'ADMIN' ? 'badge-success' : 'badge-info'}`}>
                      {usr.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${usr.active ? 'badge-success' : 'badge-danger'}`}>
                      {usr.active ? 'Active' : 'Locked'}
                    </span>
                  </td>
                   <td>
                    <div className="actions-cell" style={{ justifyContent: 'center' }}>
                      <button
                        className="action-icon-btn edit"
                        title="Edit Account"
                        onClick={() => handleOpenEditModal(usr)}
                      >
                        <Edit style={{ fontSize: '18px' }} />
                      </button>
                      <button
                        className="action-icon-btn"
                        style={{ color: usr.active ? 'var(--warning)' : 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title={usr.active ? 'Lock Account' : 'Unlock Account'}
                        onClick={() => handleToggleLock(usr)}
                      >
                        {usr.active ? <Lock style={{ fontSize: '18px' }} /> : <LockOpen style={{ fontSize: '18px' }} />}
                      </button>
                      <button
                        className="action-icon-btn delete"
                        title="Delete Account"
                        onClick={() => handleDeleteUser(usr.id)}
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

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Form modal */}
      <Modal isOpen={isModalOpen} title={modalTitle} onClose={handleCloseModal}>
        <form onSubmit={handleFormSubmit}>
          {submitError && <div className="login-error" style={{ marginBottom: '16px' }}>{submitError}</div>}

          {!selectedUserId && (
            <>
              <div className="form-input-group">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter username..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-input-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </>
          )}

          {selectedUserId && (
            <div className="form-input-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            </div>
          )}

          <div className="form-input-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter full name..."
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-input-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email address..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-input-group">
            <label className="form-label">Role</label>
            <select
              className="form-control"
              value={role}
              onChange={e => setRole(e.target.value as 'USER' | 'ADMIN')}
              disabled={submitting}
            >
              <option value="USER">Customer (USER)</option>
              <option value="ADMIN">Administrator (ADMIN)</option>
            </select>
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
