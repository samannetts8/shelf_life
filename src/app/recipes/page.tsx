"use client"
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import styles from './recipes.module.css';
import { MobileLayout } from '../components/mobile-layout';

// Define the Recipe type
interface Recipe {
  id: number;
  title: string;
  expiry_matches: number;
  image_url: string;
}

// Initialize Supabase client (replace with your actual Supabase URL and key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function RecipesPage() {
  const [topMatches, setTopMatches] = useState<Recipe[]>([]);
  const [otherMatches, setOtherMatches] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        // Fetch top matches (assumed to be sorted by expiry_matches in descending order)
        const { data: topData, error: topError } = await supabase
          .from('recipes')
          .select('*')
          .order('expiry_matches', { ascending: false })
          .limit(3);

        if (topError) throw topError;
        
        // Fetch other suggestions (next 10 recipes)
        const { data: otherData, error: otherError } = await supabase
          .from('recipes')
          .select('*')
          .order('expiry_matches', { ascending: false })
          .range(3, 12); // Skip the first 3 (top matches) and get the next 10

        if (otherError) throw otherError;

        setTopMatches(topData || []);
        setOtherMatches(otherData || []);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

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

  return (
    <div className={`${styles.recipeCard} ${cardClass}`}>
      <div className={styles.recipeImageContainer}>
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.title} 
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
        <h3 className={styles.recipeTitle}>{recipe.title}</h3>
        <p className={styles.recipeMatches}>
          {recipe.expiry_matches} expiry matches...
        </p>
      </div>
    </div>
  );
}