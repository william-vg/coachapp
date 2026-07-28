import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../utils/api';
import { useForm } from '../hooks/useForm';
import { Button, Input, Alert, Spinner } from '../components/UI';

const validators = {
  title: [(v) => (!v?.trim() ? 'Task title is required' : null)],
};

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [serverError, setServerError] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, reset } = useForm(
    { title: '' },
    validators
  );

  const fetchTodos = useCallback(async () => {
    try {
      const data = await api.get('/todos');
      setTodos(data.todos);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const onAdd = handleSubmit(async (vals) => {
    setLoadingAdd(true);
    setServerError('');
    try {
      const data = await api.post('/todos', { title: vals.title.trim() });
      setTodos((prev) => [data.todo, ...prev]);
      reset();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoadingAdd(false);
    }
  });

  async function toggleTodo(id) {
    setTogglingId(id);
    try {
      const data = await api.patch(`/todos/${id}/toggle`);
      setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
    } catch (err) {
      setServerError(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteTodo(id) {
    setDeletingId(id);
    try {
      await api.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setServerError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const done = todos.filter((t) => t.completed);
  const pending = todos.filter((t) => !t.completed);

  return (
    <div className="page animate-fade-in">
      <div className="page__header">
        <h2 className="page__title">My Tasks</h2>
        <span className="badge">{pending.length} pending</span>
      </div>

      {serverError && <Alert onDismiss={() => setServerError('')}>{serverError}</Alert>}

      <form onSubmit={onAdd} className="todo-form">
        <Input
          id="title"
          name="title"
          placeholder="Add a new task…"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.title}
          touched={touched.title}
          className="todo-form__input"
        />
        <Button type="submit" loading={loadingAdd} className="todo-form__btn">
          Add
        </Button>
      </form>

      {loadingPage ? (
        <div className="center-spinner"><Spinner size="lg" /></div>
      ) : todos.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">✅</span>
          <p>No tasks yet. Add your first one above!</p>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="todo-section">
              <h3 className="todo-section__heading">Pending</h3>
              <ul className="todo-list">
                {pending.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    toggling={togglingId === todo.id}
                    deleting={deletingId === todo.id}
                  />
                ))}
              </ul>
            </section>
          )}
          {done.length > 0 && (
            <section className="todo-section">
              <h3 className="todo-section__heading">Completed</h3>
              <ul className="todo-list">
                {done.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    toggling={togglingId === todo.id}
                    deleting={deletingId === todo.id}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete, toggling, deleting }) {
  return (
    <li className={`todo-item ${todo.completed ? 'todo-item--done' : ''} animate-slide-in`}>
      <button
        className="todo-item__check"
        onClick={() => onToggle(todo.id)}
        disabled={toggling}
        aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {toggling ? <Spinner size="sm" /> : todo.completed ? '✓' : ''}
      </button>
      <span className="todo-item__title">{todo.title}</span>
      <button
        className="todo-item__delete"
        onClick={() => onDelete(todo.id)}
        disabled={deleting}
        aria-label="Delete task"
      >
        {deleting ? <Spinner size="sm" /> : '×'}
      </button>
    </li>
  );
}
