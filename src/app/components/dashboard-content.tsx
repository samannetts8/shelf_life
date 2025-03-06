"use client";

import { Fridge } from "./fridge";
import { FoodItemsProvider } from "../hooks/foodItemContext";

export function DashboardContent() {
  return (
    <FoodItemsProvider>
      <Fridge />
    </FoodItemsProvider>
  );
}
