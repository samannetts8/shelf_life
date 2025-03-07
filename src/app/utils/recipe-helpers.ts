import { DISH_TYPES } from '@/app/constants/food-dishes';

export function getRecipeSearchQuery(title: string): string {
  if (!title) return '';
  const lowerTitle = title.toLowerCase();

  const matchedType = DISH_TYPES.find((type) =>
    lowerTitle.includes(type.toLowerCase())
  );

  // Filter words commonly excluded from search
  const filterWords = [
    'and',
    'with',
    'the',
    'spicy',
    'creamy',
    'fresh',
  ];

  if (matchedType) {
    // Get ingredients before dish type
    const parts = lowerTitle.split(matchedType);
    const ingredients = parts[0]
      .split(' ')
      .filter(
        (word) =>
          word.length > 2 &&
          !filterWords.includes(word) &&
          !filterWords.some((fw) => word.includes(fw))
      )
      .slice(-2)
      .join(' ');

    return `${ingredients} ${matchedType}`.trim();
  }

  // If no dish type found, extract key words
  const keywords = lowerTitle
    .split(' ')
    .filter(
      (word) =>
        word.length > 2 &&
        !filterWords.includes(word) &&
        !filterWords.some((fw) => word.includes(fw))
    )
    .slice(0, 3) // Take first 3 significant words
    .join(' ');

  return keywords || title.toLowerCase();
}
