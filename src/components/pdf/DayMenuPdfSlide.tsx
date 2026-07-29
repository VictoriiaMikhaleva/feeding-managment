import type { CSSProperties } from "react";
import type { MealPlanDay, MealType, PlannedMeal } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/types";
import { formatCookingMethods, getDishCookingMethods } from "@/lib/cooking-methods";
import { formatDishNutrition, getDayCaloriesTotal } from "@/lib/dish-calories";
import {
  formatIngredientsShort,
  getDishPresentation,
} from "@/lib/dish-presentation";

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner"];

const pageStyle: CSSProperties = {
  width: 1123,
  height: 794,
  backgroundColor: "#FAF7F2",
  fontFamily: "'Segoe UI', 'Noto Sans', system-ui, sans-serif",
  color: "#3D3229",
  padding: "40px 44px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
};

const cardStyle: CSSProperties = {
  flex: 1,
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  padding: "18px 16px",
  boxShadow: "0 4px 24px rgba(61, 50, 41, 0.08)",
  display: "flex",
  flexDirection: "column",
  minHeight: 580,
  border: "1px solid #EDE6DC",
};

interface DayMenuPdfSlideProps {
  day: MealPlanDay;
}

function MealColumn({
  mealType,
  meal,
}: {
  mealType: MealType;
  meal?: PlannedMeal;
}) {
  const label = MEAL_TYPE_LABELS[mealType];

  if (!meal) {
    return (
      <div style={cardStyle}>
        <p
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#5C6B4F",
            margin: "0 0 12px",
          }}
        >
          {label}
        </p>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#A89888",
            fontSize: 15,
            textAlign: "center",
            padding: 24,
          }}
        >
          Не запланировано
        </div>
      </div>
    );
  }

  const p = getDishPresentation(meal.dish, mealType);
  const ingredients = formatIngredientsShort(meal.dish);
  const cookingMethods = formatCookingMethods(getDishCookingMethods(meal.dish));

  return (
    <div style={cardStyle}>
      <p
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#5C6B4F",
          margin: "0 0 12px",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </p>

      <div
        style={{
          height: 130,
          borderRadius: 14,
          background: `linear-gradient(145deg, ${p.imageGradient[0]} 0%, ${p.imageGradient[1]} 100%)`,
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}
        >
          {mealType === "breakfast" ? "🥣" : mealType === "lunch" ? "🥗" : "🍽️"}
        </div>
        <span
          style={{
            position: "absolute",
            bottom: 8,
            right: 10,
            fontSize: 10,
            color: "rgba(61,50,41,0.45)",
            letterSpacing: 0.5,
          }}
        >
          иллюстрация блюда
        </span>
      </div>

      <h3
        style={{
          fontSize: 17,
          fontWeight: 700,
          margin: "0 0 8px",
          lineHeight: 1.3,
          color: "#2C241C",
        }}
      >
        {meal.dish.name}
      </h3>

      <p
        style={{
          fontSize: 12.5,
          lineHeight: 1.55,
          color: "#6B5E52",
          margin: "0 0 12px",
          flex: "0 0 auto",
        }}
      >
        {p.description}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 12,
          fontSize: 11,
          color: "#5C5348",
        }}
      >
        <span style={chipStyle}>🔥 {formatDishNutrition(meal.dish)}</span>
        <span style={chipStyle}>⏱ {p.cookTimeMin} мин</span>
      </div>

      <p
        style={{
          fontSize: 11.5,
          lineHeight: 1.45,
          color: "#7A6E62",
          margin: "0 0 12px",
        }}
      >
        <strong style={{ color: "#5C5348" }}>Состав:</strong> {ingredients}
      </p>

      <p
        style={{
          fontSize: 11.5,
          lineHeight: 1.45,
          color: "#516D8A",
          margin: "0 0 12px",
        }}
      >
        <strong style={{ color: "#47607A" }}>Способ:</strong> {cookingMethods}
      </p>

      <div
        style={{
          marginTop: "auto",
          backgroundColor: "#F3EDE4",
          borderRadius: 10,
          padding: "10px 12px",
          borderLeft: `4px solid ${p.imageAccent}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 600,
            color: "#5C6B4F",
          }}
        >
          ✦ {p.benefit}
        </p>
      </div>
    </div>
  );
}

const chipStyle: CSSProperties = {
  backgroundColor: "#F5F0E8",
  padding: "4px 8px",
  borderRadius: 8,
};

export function DayMenuPdfSlide({ day }: DayMenuPdfSlideProps) {
  const mealMap = new Map(day.meals.map((m) => [m.mealType, m]));
  const dayCalories = getDayCaloriesTotal(day);

  return (
    <div style={pageStyle} data-pdf-page>
      <header style={{ textAlign: "center", marginBottom: 28 }}>
        <p
          style={{
            margin: 0,
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#8B7355",
            fontWeight: 600,
          }}
        >
          Семейное меню
        </p>
        <h1
          style={{
            margin: "8px 0 6px",
            fontSize: 36,
            fontWeight: 700,
            color: "#3D3229",
            letterSpacing: -0.5,
          }}
        >
          Меню на день {day.day}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            color: "#8B7D6E",
            fontWeight: 400,
          }}
        >
          Простой, сбалансированный и вкусный план питания
          {dayCalories > 0 && (
            <>
              {" "}
              · ~{dayCalories} ккал за день
            </>
          )}
        </p>
      </header>

      <div
        style={{
          display: "flex",
          gap: 20,
          flex: 1,
          alignItems: "stretch",
        }}
      >
        {MEAL_ORDER.map((type) => (
          <MealColumn
            key={type}
            mealType={type}
            meal={mealMap.get(type)}
          />
        ))}
      </div>

      {day.comment && (
        <p
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 11,
            color: "#9A8B7A",
            fontStyle: "italic",
          }}
        >
          {day.comment}
        </p>
      )}

      <p
        style={{
          marginTop: 8,
          textAlign: "center",
          fontSize: 9,
          color: "#B5A898",
        }}
      >
        Меню носит рекомендательный характер. Калорийность и КБЖУ — ориентировочные значения на порцию.
      </p>
    </div>
  );
}
