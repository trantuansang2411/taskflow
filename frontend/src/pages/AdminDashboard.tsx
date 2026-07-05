import React, { useState, useEffect, useCallback } from 'react';
import { todoApi } from '../api/todoApi';
import type { Todo, User } from '../api/types';
import { TodoCard } from '../components/TodoCard';
import { TodoFormModal, AssignModal } from '../components/Modals';
import { Plus, ClipboardList, Clock, CheckCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [assigningTodo, setAssigningTodo] = useState<Todo | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 5;

  // Stats derived from full count (fetched separately when no filter)
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (activeSearch) params.search = activeSearch;

      const res = await todoApi.getAll(params);

      // If we are on a page that no longer exists (e.g. after deleting the last item on the page)
      if (res.data.todos.length === 0 && page > 1) {
        setPage(Math.max(1, res.data.totalPages));
        return; // setPage will trigger a re-fetch
      }

      setTodos(res.data.todos);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch {
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, activeSearch]);

  const fetchStats = useCallback(async () => {
    try {
      const [all, pending, completed] = await Promise.all([
        todoApi.getAll({ limit: 1 }),
        todoApi.getAll({ status: 'pending', limit: 1 }),
        todoApi.getAll({ status: 'completed', limit: 1 }),
      ]);
      setStats({
        total: all.data.total,
        pending: pending.data.total,
        completed: completed.data.total,
      });
    } catch { /* non-critical */ }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await todoApi.getEmployees();
      setEmployees(res.data.employees);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    fetchStats();
    fetchEmployees();
  }, [fetchStats, fetchEmployees]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchInput);
    setPage(1);
  };

  const handleToggleStatus = async (id: string) => {
    try { await todoApi.toggleStatus(id); fetchTodos(); fetchStats(); }
    catch (err: any) { alert(err.message || 'Failed to toggle status'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this task?')) return;
    try { await todoApi.delete(id); fetchTodos(); fetchStats(); }
    catch (err: any) { alert(err.message || 'Failed to delete'); }
  };

  const handleFormSubmit = async (data: { title: string; description: string }) => {
    try {
      if (editingTodo) await todoApi.update(editingTodo.id, data);
      else await todoApi.create(data);
      fetchTodos(); fetchStats();
    } catch (err: any) { alert(err.message || 'Failed to save'); }
  };

  const handleAssignSubmit = async (employeeId: string) => {
    if (!assigningTodo) return;
    try { await todoApi.assign(assigningTodo.id, employeeId); fetchTodos(); }
    catch (err: any) { alert(err.message || 'Failed to assign'); }
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Manage Tasks</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{total} task{total !== 1 ? 's' : ''} total</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setEditingTodo(null); setIsFormModalOpen(true); }}>
            <Plus size={18} /> Create Task
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ClipboardList size={16} color="var(--accent-primary)" />
            <span className="stat-label" style={{ margin: 0 }}>Total</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{stats.total}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Clock size={16} color="var(--warning)" />
            <span className="stat-label" style={{ margin: 0 }}>Pending</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle size={16} color="var(--success)" />
            <span className="stat-label" style={{ margin: 0 }}>Done</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.completed}</div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="stat-label" style={{ margin: 0 }}>Progress</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{completionRate}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${completionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-outline">Search</button>
        </form>
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: '140px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Todo List */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /><span>Loading tasks...</span></div>
      ) : todos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>No tasks found</p>
          <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters or create a new task.</p>
        </div>
      ) : (
        <div>
          {todos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              isAdmin={true}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              onEdit={(t) => { setEditingTodo(t); setIsFormModalOpen(true); }}
              onAssign={(t) => { setAssigningTodo(t); setIsAssignModalOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            return p <= totalPages ? (
              <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ) : null;
          })}
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
        </div>
      )}

      <TodoFormModal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} onSubmit={handleFormSubmit} initialData={editingTodo} />
      <AssignModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} employees={employees} onAssign={handleAssignSubmit} todoTitle={assigningTodo?.title || ''} />
    </div>
  );
};
