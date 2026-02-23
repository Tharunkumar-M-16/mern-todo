import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  // Load tasks on startup
  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error("Error fetching tasks:", err));
  }, []);

  const addTask = async () => {
    if (!input.trim()) return;
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input })
      });
      const newTask = await res.json();
      setTasks([...tasks, newTask]);
      setInput("");
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      });
      const updatedTask = await res.json();
      setTasks(tasks.map(t => (t._id === id ? updatedTask : t)));
    } catch (err) {
      console.error("Error toggling task:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTask();
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>✦ Todo App</h1>
        <p>Stay organized, stay productive</p>
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
        />
        <button className="btn-add" onClick={addTask}>+ Add</button>
      </div>

      {tasks.length > 0 && (
        <div className="task-stats">
          <div className="stat">
            <span className="stat-number">{tasks.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat">
            <span className="stat-number">{completedCount}</span>
            <span className="stat-label">Done</span>
          </div>
          <div className="stat">
            <span className="stat-number">{tasks.length - completedCount}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📝</div>
          <p>No tasks yet. Add one above!</p>
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <button
                className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                onClick={() => toggleComplete(task._id, task.completed)}
              >
                {task.completed ? '✓' : ''}
              </button>
              <span className="task-title">{task.title}</span>
              <button className="btn-delete" onClick={() => deleteTask(task._id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;