import React, { useState, useEffect, useRef } from "react";
import "../css/main.css";
import useHistory from "../components/history";

function Main() {
  const savedItems = localStorage.getItem("items");
  const initialItems = savedItems ? JSON.parse(savedItems) : [];
  const {
    state: items,
    set: setItems,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(initialItems);

  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const addItem = () => {
    if (input.trim()) {
      if (isEditing && currentIndex !== null) {
        const newItems = [...items];
        newItems[currentIndex] = { ...newItems[currentIndex], text: input };
        setItems(newItems);
        setIsEditing(false);
        setCurrentIndex(null);
      } else {
        setItems([...items, { text: input, completed: false }]);
      }
      setInput("");
    }
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const editItem = (index) => {
    setInput(items[index].text);
    setIsEditing(true);
    setCurrentIndex(index);
  };

  const toggleComplete = (index) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      completed: !newItems[index].completed,
    };
    setItems(newItems);
  };

  const clearAllItems = () => {
    setItems([]);
  };

  return (
    <>
      <div className="main-app">
        <header>
          <h1>
            <a href="/">ChecklistGo.vercel.app</a>
          </h1>
        </header>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add an item"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addItem();
              }
            }}
            ref={inputRef}
          />
          <button onClick={addItem}>{isEditing ? "✅ Update" : "➕"}</button>
        </div>
        <div className="history-controls">
          <button
            className="undo-button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
          >
            ↩
          </button>
          <button
            className="redo-button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
          >
            ↪
          </button>
          <button
            className="trash-button"
            onClick={clearAllItems}
            title="Clear All"
          >
            ✘
          </button>
        </div>
        <ul>
          {items.map((item, index) => (
            <li
              key={index}
              className={item.completed ? "completed" : ""}
              onClick={() => toggleComplete(index)}
            >
              <span className={item.completed ? "completed-text" : ""}>
                {item.text}
              </span>
              <input
                type="checkbox"
                className="checkbox"
                checked={item.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleComplete(index);
                }}
              />
              <div className="button-group">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    editItem(index);
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(index);
                  }}
                >
                  ❌
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Main;
