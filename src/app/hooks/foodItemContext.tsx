"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { FoodItemType } from "../types/food-item";
import { foodItems as initialFoodItems } from "../data/food-items";
import { FoodItem } from "../components/food-item";

interface FoodItemsContextType {
  foodItems: FoodItemType[];
  loading: boolean;
  expiringSoon: FoodItemType[];
  goodItems: FoodItemType[];
  expiredItems: FoodItemType[];
  refreshItems: () => Promise<void>;
  markAsConsumed: (id: string) => Promise<void>;
}

const FoodItemsContext = createContext<FoodItemsContextType | undefined>(
  undefined
);

export function FoodItemsProvider({ children }: { children: ReactNode }) {
  const [foodItems, setFoodItems] = useState<FoodItemType[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch food items
  const refreshItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/supabaseRoute");

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(
          `Failed to fetch data: ${response.status} ${errorText}`
        );
      }

      const data = await response.json();
      console.log(`Received ${data.length} items from API`);
      setFoodItems(data);
    } catch (error) {
      console.error("Error fetching food items:", error);
      setFoodItems(initialFoodItems);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    refreshItems();
  }, []);

  // Function to mark item as consumed
  const markAsConsumed = async (id: string) => {
    try {
      // Update the database first
      const response = await fetch(`/api/supabaseRoute/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to update database");
      }

      // Then update local state
      const updatedItems = foodItems.filter((item) => item.id !== id);
      setFoodItems(updatedItems);
    } catch (error) {
      console.error("Error marking item as consumed:", error);
    }
  };

  // Sort and group items by expiration status
  // Group items by expiration status
  const expiringSoon = foodItems.filter((item) => {
    const expiryDate = new Date(item.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  });

  const goodItems = foodItems.filter((item) => {
    const expiryDate = new Date(item.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 3;
  });

  const expiredItems = foodItems.filter((item) => {
    const expiryDate = new Date(item.expiry_date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // Set to end of yesterday (23:59:59) to include all of yesterday
    yesterday.setHours(23, 59, 59, 999);
    return expiryDate <= yesterday;
  });

  return (
    <FoodItemsContext.Provider
      value={{
        foodItems,
        loading,
        expiringSoon,
        goodItems,
        expiredItems,
        refreshItems,
        markAsConsumed,
      }}
    >
      {children}
    </FoodItemsContext.Provider>
  );
}

export function useFoodItems() {
  const context = useContext(FoodItemsContext);
  if (context === undefined) {
    throw new Error("useFoodItems must be used within a FoodItemsProvider");
  }
  return context;
}
