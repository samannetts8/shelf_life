import { DISH_TYPES } from '@/app/constants/food-dishes';

// Filter words commonly excluded from search
const FILTER_WORDS = [
  'and',
  'with',
  'the',
  'spicy',
  'creamy',
  'fresh',
];

/**
 * Extract the most relevant search query from a recipe title
 */
export function getRecipeSearchQuery(title: string): string {
  const lowerTitle = title.toLowerCase();

  const matchedType = DISH_TYPES.find((type) =>
    lowerTitle.includes(type.toLowerCase())
  );

  if (matchedType) {
    const ingredients = lowerTitle
      .split(matchedType)[0]
      .split(' ')
      .filter(
        (word) => word.length > 2 && !FILTER_WORDS.includes(word)
      )
      .slice(-2)
      .join(' ');

    return `${ingredients} ${matchedType}`.trim();
  }

  return title
    .split(' ')
    .filter(
      (word) =>
        word.length > 2 && !FILTER_WORDS.includes(word.toLowerCase())
    )
    .slice(-2)
    .join(' ');
}
