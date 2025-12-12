import React, { useState, useEffect, useRef } from "react";
import "../css/main.css";
import useHistory from "./history";
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
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Item } from "../../react/types";

function Main() {
  const uid = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

  const savedItems = localStorage.getItem("items");
  let initialItems: Item[] = savedItems ? JSON.parse(savedItems) : [];
  initialItems = initialItems.map((it) => (it.id ? it : { ...it, id: uid() }));

  const {
    state: items,
    set: setItems,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<Item[]>(initialItems);

  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayRect, setOverlayRect] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const addItem = () => {
    if (!input.trim()) return;
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
  };

  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const editItem = (index: number) => {
    setInput(items[index].text);
    setIsEditing(true);
    setCurrentIndex(index);
  };

  const toggleComplete = (index: number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      completed: !newItems[index].completed,
    };
    setItems(newItems);
  };

  const clearAllItems = () => setItems([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  function SortableItem({ item, index }: { item: Item; index: number }) {
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
      transform: CSS.Translate.toString(
        transform
          ? {
              x: 0,
              y: transform.y,
              scaleX: transform.scaleX ?? 1,
              scaleY: transform.scaleY ?? 1,
            }
          : null
      ),
      transition,
      zIndex: isDragging ? 999 : undefined,
      touchAction: "none",
      opacity: isDragging ? 0 : 1,
      cursor: isDragging ? "grabbing" : "pointer",
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        className={`${item.completed ? "completed" : ""} sortable-item`}
        onClick={() => !isDragging && toggleComplete(index)}
      >
        <button
          className="drag-handle"
          {...attributes}
          {...listeners}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
          aria-label="drag-handle"
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

  const handleDragStart = (event: any) => {
    document.body.classList.add("dnd-grabbing");
    setActiveId(event.active.id);
    const node = document.querySelector(`[data-id="${event.active.id}"]`);
    if (node) {
      const rect = node.getBoundingClientRect();
      setOverlayRect({ width: rect.width, height: rect.height });
    } else setOverlayRect(null);
  };

  const handleDragEnd = (event: any) => {
    document.body.classList.remove("dnd-grabbing");
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
    setItems(arrayMove(items, oldIndex, newIndex));
    setActiveId(null);
    setOverlayRect(null);
  };

  const handleDragCancel = () => {
    document.body.classList.remove("dnd-grabbing");
    setActiveId(null);
    setOverlayRect(null);
  };

  return (
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
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          ref={inputRef}
        />
        <button onClick={addItem}>{isEditing ? "✅ Update" : "➕"}</button>
      </div>

      <div className="history-controls">
        <button className="undo-button" onClick={undo} disabled={!canUndo}>
          ↩
        </button>
        <button className="redo-button" onClick={redo} disabled={!canRedo}>
          ↪
        </button>
        <button className="trash-button" onClick={clearAllItems}>
          ✘
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul style={{ position: "relative" }}>
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
                <div className="drag-overlay" style={{ cursor: "grabbing" }}>
                  <div
                    className={`sortable-item ${
                      activeItem.completed ? "completed" : ""
                    }`}
                    style={{
                      width: "100%",
                      height: overlayRect
                        ? `${overlayRect.height}px`
                        : undefined,
                      cursor: "grabbing",
                    }}
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
  );
}

export default Main;
