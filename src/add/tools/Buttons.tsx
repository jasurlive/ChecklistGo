// Buttons.tsx
import type { Item } from "../../react/types";

import "../css/buttons.css";

type ItemButtonsProps = {
  index: number;
  item: Item;
  onToggleComplete: (index: number) => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
};

export function ItemButtons({
  index,
  item,
  onToggleComplete,
  onEdit,
  onRemove,
}: ItemButtonsProps) {
  return (
    <div className="buttons-container">
      <input
        type="checkbox"
        className="checkbox"
        checked={item.completed}
        onChange={(e) => {
          e.stopPropagation();
          onToggleComplete(index);
        }}
      />

      <div className="button-group">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(index);
          }}
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
        >
          ❌
        </button>
      </div>
    </div>
  );
}

type HistoryButtonsProps = {
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export function HistoryButtons({
  onUndo,
  onRedo,
  onClearAll,
  canUndo,
  canRedo,
}: HistoryButtonsProps) {
  return (
    <div className="history-controls">
      <button onClick={onUndo} disabled={!canUndo}>
        ⏪
      </button>
      <button onClick={onRedo} disabled={!canRedo}>
        ⏩
      </button>
      <button onClick={onClearAll}>🗑️</button>
    </div>
  );
}
