// hooks/useButtons.ts
import { useState, useRef } from "react";
import type { Item } from "../../react/types";

type UseButtonsResult = {
  input: string;
  isEditing: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  addItem: () => void;
  editItem: (index: number) => void;
  removeItem: (index: number) => void;
  toggleComplete: (index: number) => void;
  clearAllItems: () => void;
  setInput: (value: string) => void;
};

export default function useButtons(
  items: Item[],
  setItems: (items: Item[]) => void,
  uid: () => string
): UseButtonsResult {
  const [input, setInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addItem = () => {
    if (!input.trim()) return;

    if (isEditing && currentIndex !== null) {
      const nextItems = [...items];
      nextItems[currentIndex] = { ...nextItems[currentIndex], text: input };
      setItems(nextItems);
      setIsEditing(false);
      setCurrentIndex(null);
    } else {
      setItems([...items, { id: uid(), text: input, completed: false }]);
    }

    setInput("");
  };

  const editItem = (index: number) => {
    setInput(items[index].text);
    setIsEditing(true);
    setCurrentIndex(index);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const toggleComplete = (index: number) => {
    const nextItems = [...items];
    nextItems[index] = {
      ...nextItems[index],
      completed: !nextItems[index].completed,
    };
    setItems(nextItems);
  };

  const clearAllItems = () => {
    setItems([]);
    setIsEditing(false);
    setCurrentIndex(null);
    setInput("");
  };

  return {
    input,
    isEditing,
    inputRef,
    addItem,
    editItem,
    removeItem,
    toggleComplete,
    clearAllItems,
    setInput,
  };
}
