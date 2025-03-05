import { v4 as uuidv4 } from "uuid"
import type { FoodItemType } from "../types/food-item"

// Get current date
const today = new Date()

// Sample food items with different expiration dates
export const FoodItem: FoodItemType[] = [
  {
    id: uuidv4(),
    name: "Milk",
    category: "dairy",
    quantity: "1",
    unit: "l",
    expiryDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: today.toISOString(),
  },
  {
    id: uuidv4(),
    name: "Apples",
    category: "fruits",
    quantity: "5",
    unit: "item",
    expiryDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: today.toISOString(),
  },
  {
    id: uuidv4(),
    name: "Chicken Breast",
    category: "meat",
    quantity: "500",
    unit: "g",
    expiryDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: today.toISOString(),
  },
  {
    id: uuidv4(),
    name: "Yogurt",
    category: "dairy",
    quantity: "1",
    unit: "pkg",
    expiryDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: today.toISOString(),
  },
  {
    id: uuidv4(),
    name: "Bread",
    category: "bakery",
    quantity: "1",
    unit: "item",
    expiryDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

