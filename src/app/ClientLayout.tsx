"use client";

import { AuthProvider } from "./hooks/use-auth";
import { FoodItemsProvider } from "./hooks/foodItemContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <FoodItemsProvider>{children}</FoodItemsProvider>
    </AuthProvider>
  );
}
