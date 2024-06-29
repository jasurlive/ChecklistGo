import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem('items');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [input, setInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem('items', JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (input.trim()) {
      if (isEditing) {
        const newItems = items.map((item, index) =>
          index === currentIndex ? input : item
        );
        setItems(newItems);
        setIsEditing(false);
        setCurrentIndex(null);
      } else {
        setItems([...items, input]);
      }
      setInput('');
    }
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const editItem = (index) => {
    setInput(items[index]);
    setIsEditing(true);
    setCurrentIndex(index);
  };

  return (
    <div className="App">
      <h1>Grocery List</h1>
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        placeholder="Add an item" 
      />
      <button onClick={addItem}>{isEditing ? 'Update' : 'Add'}</button>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item} 
            <button onClick={() => editItem(index)}>Edit</button>
            <button onClick={() => removeItem(index)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
