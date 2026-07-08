"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { GeneratedMealPlan, MealType } from "@/lib/types";
import { reorderDays } from "@/lib/meal-plan-actions";
import { DayCard } from "./DayCard";

interface SortableDayListProps {
  plan: GeneratedMealPlan;
  onPlanChange: (plan: GeneratedMealPlan) => void;
  onSwapMeal: (day: number, mealType: MealType) => void;
  isMealSelected?: (day: number, mealType: MealType) => boolean;
  onToggleMealSelection?: (day: number, mealType: MealType) => void;
}

function SortableDayItem({
  day,
  onSwapMeal,
  isMealSelected,
  onToggleMealSelection,
}: {
  day: GeneratedMealPlan["days"][0];
  onSwapMeal: (day: number, mealType: MealType) => void;
  isMealSelected?: (day: number, mealType: MealType) => boolean;
  onToggleMealSelection?: (day: number, mealType: MealType) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: day.day });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <DayCard
        day={day}
        onSwapMeal={onSwapMeal}
        isMealSelected={isMealSelected}
        onToggleMealSelection={onToggleMealSelection}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  );
}

export function SortableDayList({
  plan,
  onPlanChange,
  onSwapMeal,
  isMealSelected,
  onToggleMealSelection,
}: SortableDayListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = plan.days.findIndex((d) => d.day === active.id);
    const toIndex = plan.days.findIndex((d) => d.day === over.id);
    if (fromIndex === -1 || toIndex === -1) return;

    onPlanChange(reorderDays(plan, fromIndex, toIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={plan.days.map((d) => d.day)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {plan.days.map((day) => (
            <SortableDayItem
              key={day.day}
              day={day}
              onSwapMeal={onSwapMeal}
              isMealSelected={isMealSelected}
              onToggleMealSelection={onToggleMealSelection}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
