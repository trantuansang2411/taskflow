import React from 'react';
import type { Todo } from '../api/types';
import { CheckCircle2, Circle, Clock, Edit2, Trash2, UserPlus, User } from 'lucide-react';

interface TodoCardProps {
  todo: Todo;
  onToggleStatus: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (todo: Todo) => void;
  onAssign?: (todo: Todo) => void;
  isAdmin: boolean;
}

export const TodoCard: React.FC<TodoCardProps> = ({
  todo, onToggleStatus, onDelete, onEdit, onAssign, isAdmin,
}) => {
  const isCompleted = todo.status === 'completed';

  return (
    <div
      className="glass-panel animate-fade-in todo-card"
      style={{ borderLeft: `4px solid ${isCompleted ? 'var(--success)' : 'var(--warning)'}` }}
    >
      <div className="todo-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            textDecoration: isCompleted ? 'line-through' : 'none',
            color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
            margin: 0,
          }}>
            {todo.title}
          </h3>
          <span className={`badge ${isCompleted ? 'badge-completed' : 'badge-pending'}`}>
            {isCompleted ? 'Done' : 'Pending'}
          </span>
        </div>

        {todo.description && (
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            marginBottom: '0.75rem',
            lineHeight: 1.6,
          }}>
            {todo.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Clock size={13} />
            {new Date(todo.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
          {isAdmin && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: todo.assigned_to_name ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
              <User size={13} />
              {todo.assigned_to_name || 'Unassigned'}
            </span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        {isAdmin ? (
          <>
            <button className="btn btn-outline" style={{ padding: '0.5rem' }} title="Assign Employee" onClick={() => onAssign?.(todo)}>
              <UserPlus size={17} />
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: '0.5rem' }}
              title="Edit"
              disabled={isCompleted}
              onClick={() => onEdit?.(todo)}
            >
              <Edit2 size={17} />
            </button>
            <button className="btn btn-danger" style={{ padding: '0.5rem' }} title="Delete" onClick={() => onDelete?.(todo.id)}>
              <Trash2 size={17} />
            </button>
          </>
        ) : (
          <button
            className="btn btn-outline"
            style={{ padding: '0.5rem' }}
            title={isCompleted ? 'Mark Pending' : 'Mark Complete'}
            onClick={() => onToggleStatus(todo.id)}
          >
            {isCompleted
              ? <CheckCircle2 size={20} color="var(--success)" />
              : <Circle size={20} color="var(--warning)" />}
          </button>
        )}
      </div>
    </div>
  );
};
