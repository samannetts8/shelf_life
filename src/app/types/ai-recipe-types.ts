export interface Recipe {
  id?: string;
  title: string;
  ingredients: string[];
  instructions: string;
  source: string;
  imageUrl?: string;
  matchScore?: number;
  matchPercentage?: number;
}

export interface OpenAIRecipeResponse {
  title: string;
  ingredients: string[] | string;
  instructions: string;
}

