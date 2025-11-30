import React, { useState, useEffect, useRef } from "react";
import "../css/main.css";
import useHistory from "../components/history";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function Main() {
  const uid = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

  const savedItems = localStorage.getItem("items");
  let initialItems = savedItems ? JSON.parse(savedItems) : [];
  initialItems = initialItems.map((it) => (it.id ? it : { ...it, id: uid() }));

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

  const [activeId, setActiveId] = useState(null);
  const [overlayRect, setOverlayRect] = useState(null);

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
        setItems([...items, { id: uid(), text: input, completed: false }]);
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  function SortableItem({ item, index }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: item.id,
      animateLayoutChanges: () => true,
    });

    const style = {
      transform:
        CSS.Translate.toString(transform && { x: 0, y: transform.y }) ||
        undefined,
      transition,
      zIndex: isDragging ? 999 : undefined,
      touchAction: "none",
      opacity: isDragging ? 0 : 1,
    };

    return (
      <li
        data-id={item.id}
        ref={setNodeRef}
        style={style}
        className={`${item.completed ? "completed" : ""} sortable-item`}
        onClick={() => {
          if (!isDragging) toggleComplete(index);
        }}
      >
        <button
          className="drag-handle"
          {...attributes}
          {...listeners}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          aria-label="drag-handle"
          title="Drag to reorder"
        >
          ☰
        </button>

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
    );
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveId(null);
      setOverlayRect(null);
      return;
    }

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      setActiveId(null);
      setOverlayRect(null);
      return;
    }

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    setActiveId(null);
    setOverlayRect(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverlayRect(null);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    try {
      const node = document.querySelector(`[data-id="${event.active.id}"]`);
      if (node) {
        const rect = node.getBoundingClientRect();
        setOverlayRect({ width: rect.width, height: rect.height });
      } else {
        setOverlayRect(null);
      }
    } catch {
      setOverlayRect(null);
    }
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
              if (e.key === "Enter") addItem();
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul>
              {items.map((item, index) => (
                <SortableItem key={item.id} item={item} index={index} />
              ))}
            </ul>
          </SortableContext>

          <DragOverlay>
            {activeId &&
              (() => {
                const activeItem = items.find((it) => it.id === activeId);
                if (!activeItem) return null;
                return (
                  <div className="drag-overlay">
                    <div
                      className={`sortable-item ${
                        activeItem.completed ? "completed" : ""
                      }`}
                      style={
                        overlayRect
                          ? {
                              width: `${overlayRect.width}px`,
                              height: `${overlayRect.height}px`,
                            }
                          : undefined
                      }
                    >
                      <div className="drag-handle">☰</div>
                      <span
                        className={activeItem.completed ? "completed-text" : ""}
                      >
                        {activeItem.text}
                      </span>
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={activeItem.completed}
                        readOnly
                      />
                      <div className="button-group">
                        <button aria-hidden>✏️</button>
                        <button aria-hidden>❌</button>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  );
}

export default Main;
