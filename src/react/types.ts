export interface Item {
  id: string;
  text: string;
  completed: boolean;
}

export interface HistoryState<T> {
  state: T[];
  set: (newState: T[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface SortableItemProps {
  item: Item;
  index: number;
}

export interface OverlayRect {
  width: number;
  height: number;
}

export interface DndTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}
