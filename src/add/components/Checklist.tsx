import { useEffect } from "react";
import type { Item } from "../../react/types";
import useMemory from "../hooks/useMemory";
import useButtons from "../hooks/useButtons";
import useHistory from "../hooks/useHistory";
import useDnd from "../hooks/useDND";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

import { ItemButtons, HistoryButtons } from "../tools/Buttons";
import "../css/checklist.css";

function Checklist() {
  const createItemId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

  const {
    state: savedItems,
    set: saveItems,
    clear: clearMemory,
  } = useMemory<Item[]>("items", []);

  const {
    state: items,
    set: setItems,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<Item[]>(savedItems);

  useEffect(() => saveItems(items), [items, saveItems]);

  const {
    input,
    isEditing,
    inputRef,
    addItem,
    editItem,
    removeItem,
    toggleComplete,
    clearAllItems,
    setInput,
  } = useButtons(items, setItems, createItemId);

  const { sensors, onDragStart, onDragEnd, onDragCancel } = useDnd(
    items,
    setItems
  );

  function SortableItem({ item, index }: { item: Item; index: number }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging
        ? "none"
        : "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
      zIndex: isDragging ? 1 : undefined,
    };

    return (
      <li
        ref={setNodeRef}
        data-id={item.id}
        style={style}
        className={`sortable-item ${isDragging ? "dragging" : ""} ${
          item.completed ? "completed" : ""
        }`}
        onClick={() => !isDragging && toggleComplete(index)}
      >
        <div
          className="drag-handle"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          ☰
        </div>

        <span className={item.completed ? "completed-text" : ""}>
          {item.text}
        </span>

        <ItemButtons
          index={index}
          item={item}
          onToggleComplete={toggleComplete}
          onEdit={editItem}
          onRemove={removeItem}
        />
      </li>
    );
  }

  return (
    <div className="main-app">
      <div className="input-container">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add an item"
        />
        <button onClick={addItem}>{isEditing ? "Update" : "Add"}</button>
      </div>

      <HistoryButtons
        onUndo={undo}
        onRedo={redo}
        onClearAll={() => {
          clearAllItems();
          clearMemory();
        }}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul>
            {items.map((item, index) => (
              <SortableItem key={item.id} item={item} index={index} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default Checklist;
