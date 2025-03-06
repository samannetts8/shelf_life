"use client"
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import styles from './recipes.module.css';
import { MobileLayout } from '../components/mobile-layout';
import { FoodItemType } from '../types/food-item';
import { foodItems as initialFoodItems } from '../data/food-items';
import { FoodItem } from '../components/food-item';

// Define the Recipe type
interface Recipe {
  id: number;
  name: string;
  cuisine: string;
  dietaryInfoType: string;
  dietaryInfoRestrictions: string;
  dietaryInfoSuitableFor: string;
  dietaryInfoAllergens: string;
  dietaryInfoVeganSubstitutions: string | null;
  dietaryInfoGlutenFreeOption: string | null;
  dietaryInfoProteinSource: string | null;
  dietaryInfoNutrientDense: string | null;
  dietaryInfoTraditionalDish: string | null;
  ingredients: string[];
  steps: string[];
  cookingUtensils: string[];
  nutritionalInfoServings: number;
  nutritionalInfoCaloriesPerServing: number;
  nutritionalInfoProteinPerServing: number;
  nutritionalInfoCarbsPerServing: number;
  nutritionalInfoFatPerServing: number;
  nutritionalInfoFiber: number;
  nutritionalInfoCholesterol: number | null;
  imageUrl: string;
  prepTime: string;
  cookTime: string;
  ingredientsLowercase: string[];
}

// Initialize Supabase client (replace with your actual Supabase URL and key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';


const supabase = createClient(supabaseUrl, supabaseKey);

export default function RecipesPage() {
  const [topMatches, setTopMatches] = useState<Recipe[]>([]);
  const [otherMatches, setOtherMatches] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [foodItems, setFoodItems] = useState<FoodItemType[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Function to fetch food items
  const refreshItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/supabaseRoute');
      console.log(JSON.stringify(response,null,2))
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(`Failed to fetch data: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log(`Received ${data.length} items from API`);
      setFoodItems(data);
    } catch (error) {
      console.error('Error fetching food items:', error);
      setFoodItems(initialFoodItems);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      refreshItems();
    }, []);
  

  function cleanIngredientsData(ingredients: Array<{name: string, expiry_date: string}>) {
    return ingredients.map(ingredient => ({
      name: ingredient.name.toLowerCase(),
      expiry_date: ingredient.expiry_date.split(' ')[0] // or .slice(0, 10)
    }));
  }

  useEffect(() => {
    if (foodItems.length === 0) return; // Don't run if no food items

    const clean_dummy = cleanIngredientsData(foodItems);
    console.log('Cleaned food items:', clean_dummy);

    async function fetchRecipes() {
      try {
        const { data: allRecipes, error } = await supabase
          .from('recipes')
          .select('*');

        if (error) throw error;
        console.log("test1")
        console.log(allRecipes)
     
      // Process recipes to count matches
      const processedRecipes = allRecipes.map(recipe => {
        let matchCount = 0;
        
        try {
          const ingredientsArray = recipe.ingredients_lowercase.split(',')
            .map(ing => ing.trim()); // trim whitespace
          console.log('Recipe ingredients:', ingredientsArray);
          
          // Extract just the names from clean_dummy
          const cleanedIngredientNames = clean_dummy.map(item => item.name);
          console.log('Cleaned ingredients to match:', cleanedIngredientNames);
      
          // Count matches
          matchCount = cleanedIngredientNames.filter(cleanName => 
            ingredientsArray.some(recipeIng => recipeIng.includes(cleanName))
          ).length;
          
          console.log(`Recipe ${recipe.name} match count:`, matchCount);
        } catch (e) {
          console.error(`Error processing recipe ${recipe.id}:`, e);
        }
        
        return { ...recipe, match_count: matchCount };
      });
      
      console.log("test3")
      // Sort by match count and take top 4
      const topData = processedRecipes
        .filter(recipe => recipe.match_count > 0)
        .sort((a, b) => b.match_count - a.match_count)
        .slice(0, 4);
        if (error) throw error;
        // Fetch other suggestions (next 10 recipes)
        const { data: otherData, error: otherError } = await supabase
          .from('recipes')
          .select('*')
          // .order('expiry_matches', { ascending: false })
          .range(4, 12); // Skip the first 3 (top matches) and get the next 10
          console.log(otherData)
        if (otherError) throw otherError;
        console.log(`topData:`, JSON.stringify(topData,null,2))
        console.log(`otherData:`, JSON.stringify(otherData,null,2))
        setTopMatches(topData || []);
        setOtherMatches(otherData || []);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [foodItems]);

  // Scroll functions for the carousel
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <MobileLayout>
    <div className={styles.container}>
      {/* Top Matches Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Top Matches!!</h2>
        
        {loading ? (
          <p>Loading top matches...</p>
        ) : topMatches.length > 0 ? (
          <div className={styles.cardsContainer}>
            {topMatches.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                cardColor="orange"
              />
            ))}
          </div>
        ) : (
          <p className={styles.noMatches}>No matching recipes...</p>
        )}
      </section>

      {/* Other Matches Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Other matches</h2>
        
        {loading ? (
          <p>Loading suggestions...</p>
        ) : otherMatches.length > 0 ? (
          <div className={styles.carouselContainer}>
            <button 
              className={`${styles.carouselButton} ${styles.leftButton}`}
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              &lt;
            </button>
            
            <div className={styles.carousel} ref={carouselRef}>
              {otherMatches.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe}
                  cardColor="teal"
                />
              ))}
            </div>
            
            <button 
              className={`${styles.carouselButton} ${styles.rightButton}`}
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              &gt;
            </button>
          </div>
        ) : (
          <p className={styles.noMatches}>No additional suggestions...</p>
        )}
      </section>

      {/* Bottom Action Buttons */}
      <section className={styles.actionsSection}>
        <Link href="/fullrecipelist" className={styles.actionButton}>
          <div className={styles.fullDatabaseBtn}>
            Full Recipe Database
          </div>
        </Link>
        
        <Link href="/ai" className={styles.actionButton}>
          <div className={styles.aiSuggestionBtn}>
            AI Suggestion
          </div>
        </Link>
      </section>
    </div>
    </MobileLayout>
  );
}

// Recipe Card Component
interface RecipeCardProps {
  recipe: Recipe;
  cardColor: 'orange' | 'teal';
}

function RecipeCard({ recipe, cardColor }: RecipeCardProps) {
  const cardClass = cardColor === 'orange' 
    ? styles.orangeCard 
    : styles.tealCard;

  // Truncate title if longer than 25 characters
  const truncateTitle = (title: string, maxLength: number = 25) => {
    return title.length > maxLength 
      ? `${title.substring(0, maxLength)}...` 
      : title;
  };

  return (
    <div className={`${styles.recipeCard} ${cardClass}`}>
      <div className={styles.recipeImageContainer}>
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.name} 
            className={styles.recipeImage}
          />
        ) : (
          <div className={styles.placeholderImage}>
            <div className={styles.mountainIcon}></div>
            <div className={styles.sunIcon}></div>
          </div>
        )}
      </div>
      <div className={styles.recipeInfo}>
        <h3 className={styles.recipeTitle}>
          {truncateTitle(recipe.name)}
        </h3>
        <p className={styles.recipeMatches}>
          Ingredients used: <span>{recipe.match_count}</span>
        </p>
      </div>
    </div>
  );
}