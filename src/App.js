import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('items');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [input, setInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const inputRef = useRef(null); // Create a ref to hold the input element

  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    // Focus on the input when isEditing becomes true
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
      setInput('');
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
    newItems[index] = { ...newItems[index], completed: !newItems[index].completed };
    setItems(newItems);
  };

  return (
    <div className="App">
      <h1>Grocery List</h1>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add an item"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addItem(); // Call addItem on Enter key press
            }
          }}
          ref={inputRef} // Assign the inputRef to the input element
        />
        <button onClick={addItem}>{isEditing ? '✅ Update' : '➕'}</button>
      </div>
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className={item.completed ? 'completed' : ''}
            onClick={() => toggleComplete(index)}
          >
            <span className={item.completed ? 'completed-text' : ''}>{item.text}</span>
            <div className="checkbox-container">
              <input
                type="checkbox"
                className="checkbox"
                checked={item.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleComplete(index);
                }}
              />
              <div>
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
