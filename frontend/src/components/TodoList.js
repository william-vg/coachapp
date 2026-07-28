import React, { useState, useEffect } from 'react';
import './TodoList.css';

function TodoList({ token }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, [token]);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTodo }),
      });

      if (response.ok) {
        const todo = await response.json();
        setTodos([todo, ...todos]);
        setNewTodo('');
      }
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  };

  const handleToggleTodo = async (id, completed) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !completed }),
      });

      setTodos(
        todos.map((t) =>
          t.id === id ? { ...t, completed: !completed } : t
        )
      );
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  return (
    <div className="todo-card">
      <h3>Your Tasks</h3>

      <form onSubmit={handleAddTodo} className="todo-form">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <div className="todo-list">
        {loading ? (
          <p>Loading...</p>
        ) : todos.length === 0 ? (
          <p className="empty">No tasks yet. Start building!</p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className="todo-item">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleTodo(todo.id, todo.completed)}
              />
              <span className={todo.completed ? 'completed' : ''}>
                {todo.title}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodoList;
