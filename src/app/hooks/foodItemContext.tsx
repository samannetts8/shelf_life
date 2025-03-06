'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';
import { FoodItemType } from '../types/food-item';
import { foodItems as initialFoodItems } from '../data/food-items';
import { FoodItem } from '../components/food-item';

interface FoodItemsContextType {
  foodItems: FoodItemType[];
  loading: boolean;
  expiringSoon: FoodItemType[];
  goodItems: FoodItemType[];
  expiredItems: FoodItemType[];
  refreshItems: () => Promise<void>;
  markAsConsumed: (id: string) => Promise<void>;
}

const FoodItemsContext = createContext<FoodItemsContextType | undefined>(undefined);
