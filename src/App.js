import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [userPassword, setUserPassword] = useState(
    localStorage.getItem("userPassword") || ""
  );
  const [showPasswordScreen, setShowPasswordScreen] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ SUPER SEARCH

  // Save password and start app
  const savePassword = () => {
    if (!userPassword.trim()) return;
    localStorage.setItem("userPassword", userPassword);
    setShowPasswordScreen(false);
  };

  useEffect(() => {
    if (userPassword) {
      fetchTodos();
    }
  }, [userPassword]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(
        `https://todolist-backend-lv5j.onrender.com/api/todos?password=${userPassword}`
      );
      setTodos(response.data);
    } catch (error) {
      console.log("Backend not running");
    }
  };

  // ✅ SUPER SEARCH - Real-time filter
  const filteredTodos = todos.filter((todo) =>
    todo.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    try {
      const response = await axios.post(
        "https://todolist-backend-lv5j.onrender.com/api/todos",
        {
          text: newTodo,
          userPassword: userPassword,
        }
      );
      fetchTodos();
      setNewTodo("");
    } catch (error) {
      console.log("Add failed");
    }
  };

  const editTodo = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = async () => {
    try {
      await axios.put(
        `https://todolist-backend-lv5j.onrender.com/api/todos/${editingId}`,
        {
          text: editText,
          userPassword: userPassword,
        }
      );
      fetchTodos();
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.log("Edit failed");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(
        `https://todolist-backend-lv5j.onrender.com/api/${id}`
      );
      fetchTodos();
    } catch (error) {
      console.log("Delete failed");
    }
  };

  if (showPasswordScreen) {
    return (
      <div className="App password-screen">
        <h1>🔐 Enter Password</h1>
        <div className="password-form">
          <input
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            placeholder="Your secret password"
            autoFocus
            onKeyPress={(e) => e.key === "Enter" && savePassword()}
          />
          <button onClick={savePassword}>Continue</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>📝 Todo App</h1>

      {/* ✅ SUPER SEARCH BAR */}
      <div className="search-form">
        <input
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search todos..."
          onKeyPress={(e) => e.key === "Enter" && setSearchQuery("")}
        />
        {searchQuery && (
          <button className="clear-search" onClick={() => setSearchQuery("")}>
            Clear
          </button>
        )}
        <div className="search-info">
          {filteredTodos.length !== todos.length && (
            <small>
              {filteredTodos.length} of {todos.length} shown
            </small>
          )}
        </div>
      </div>

      <div className="add-form">
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo"
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
        />
        <button onClick={addTodo}>➕ Add</button>
      </div>

      <ul className="todo-list">
        {filteredTodos.map(
          (
            todo // ✅ SEARCHED LIST
          ) => (
            <li key={todo._id} className="todo-item">
              {editingId === todo._id ? (
                <>
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                  />
                  <div>
                    <button onClick={saveEdit}>💾 Save</button>
                    <button onClick={cancelEdit}>❌ Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <span>{todo.text}</span>
                  <div>
                    <button
                      onClick={() => editTodo(todo._id, todo.text)}
                      className="edit-btn"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteTodo(todo._id)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          )
        )}
      </ul>

      <p className="stats">
        📊 Total: <strong>{todos.length}</strong> | 🔍 Found:{" "}
        <strong>{filteredTodos.length}</strong>
      </p>
    </div>
  );
}

export default App;
