import { useState } from "react";
import {
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Item } from "../../react/types";

type UseDndResult = {
  sensors: ReturnType<typeof useSensors>;
  activeId: string | null;
  onDragStart: (event: any) => void;
  onDragEnd: (event: any) => void;
  onDragCancel: () => void;
};

export default function useDnd(
  items: Item[],
  setItems: (items: Item[]) => void
): UseDndResult {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const onDragStart = (event: any) => {
    document.body.classList.add("dnd-grabbing");
    setActiveId(event.active.id);
  };

  const onDragEnd = (event: any) => {
    document.body.classList.remove("dnd-grabbing");

    const { active, over } = event;

    setActiveId(null);

    if (!over || active.id === over.id) return;

    const fromIndex = items.findIndex((item) => item.id === active.id);
    const toIndex = items.findIndex((item) => item.id === over.id);

    if (fromIndex === -1 || toIndex === -1) return;

    setItems(arrayMove(items, fromIndex, toIndex));
  };

  const onDragCancel = () => {
    document.body.classList.remove("dnd-grabbing");
    setActiveId(null);
  };

  return {
    sensors,
    activeId,
    onDragStart,
    onDragEnd,
    onDragCancel,
  };
}
