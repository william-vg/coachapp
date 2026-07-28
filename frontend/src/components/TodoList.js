import React, { useState, useEffect } from 'react';
import './TodoList.css';

const MAX_TITLE = 200;

function TodoList({ token }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/todos', {
        headers: { Authorization: `****** },
      });
      if (!response.ok) throw new Error('Failed to load tasks');
      const data = await response.json();
      setTodos(data);
    } catch {
      setError('Could not load tasks. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    const trimmed = newTodo.trim();
    if (!trimmed) {
      setAddError('Task title cannot be empty');
      return;
    }
    if (trimmed.length > MAX_TITLE) {
      setAddError(`Task title must be ${MAX_TITLE} characters or less`);
      return;
    }
    setAddError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `******
        },
        body: JSON.stringify({ title: trimmed }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAddError(data.error || 'Failed to add task');
        return;
      }
      setTodos((prev) => [data, ...prev]);
      setNewTodo('');
    } catch {
      setAddError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTodo = async (id, completed) => {
    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
    );
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `******
        },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!response.ok) {
        // Revert
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed } : t))
        );
      }
    } catch {
      // Revert
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed } : t))
      );
    }
  };

  const charsLeft = MAX_TITLE - newTodo.length;

  return (
    <div className="todo-card">
      <h3>Your Tasks</h3>

      <form onSubmit={handleAddTodo} className="todo-form">
        <div className="todo-input-wrap">
          <input
            type="text"
            placeholder="Add a new task…"
            value={newTodo}
            onChange={(e) => {
              setNewTodo(e.target.value);
              if (addError) setAddError('');
            }}
            maxLength={MAX_TITLE + 1}
            className={addError ? 'input-error' : ''}
            aria-label="New task title"
          />
          {newTodo.length > MAX_TITLE - 30 && (
            <span className={`char-count ${charsLeft < 0 ? 'over' : ''}`}>
              {charsLeft}
            </span>
          )}
        </div>
        <button type="submit" disabled={submitting} className="add-btn">
          {submitting ? <span className="btn-spinner" aria-hidden="true" /> : 'Add'}
        </button>
      </form>

      {addError && <p className="inline-error" role="alert">{addError}</p>}

      <div className="todo-list">
        {loading ? (
          <div className="loading-wrap" aria-label="Loading tasks">
            <span className="spinner" />
            <span>Loading tasks…</span>
          </div>
        ) : error ? (
          <p className="inline-error" role="alert">{error}</p>
        ) : todos.length === 0 ? (
          <p className="empty">No tasks yet. Start building!</p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className={`todo-item${todo.completed ? ' done' : ''}`}>
              <input
                type="checkbox"
                checked={!!todo.completed}
                onChange={() => handleToggleTodo(todo.id, !!todo.completed)}
                id={`todo-${todo.id}`}
              />
              <label htmlFor={`todo-${todo.id}`} className={todo.completed ? 'completed' : ''}>
                {todo.title}
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodoList;
