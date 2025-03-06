import { HfInference } from '@huggingface/inference';
import { FoodItemType } from '../types/food-item';

export default async function getAiRecipes(ingredients: FoodItemType[], ) {
    console.log('Getting recipes from HuggingFace AI using ingredients');

    try {
        const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN);
        const prompt = `Existing recipes using as many of these ingredients as possible: ${ingredients.join(',')}`;
        const response = await hf.textGeneration({
            model: 'gpt2',
            inputs: prompt,
            parameters: {
                max_new_tokens: 250,
                temperature: 0.7,
            },
        });
        const generatedText = response.generated_text;
        return [
            {
                recipeDetails: generatedText,
                foodList: ingredients,
            },
        ];

    } catch (err) {
        console.error('Error fetching from Hugging Face AI', err);
    }
    return [
        {
            recipeDetails: 'Could not generate AI recipe suggestions',
            foodList: ingredients,
        }
    ];
}
















//Get Recipes helper function
//Given an array of expiring food items (by user clicking find recipes or automatically on fridge load)
//Search our supabase sql database for recipes that include at least one of the expiring food items.
//  If three or more recipes include one or more of the ingredients:
    // Sort them according to most matching ingredients and return the 3 with the highest number of matching ingredients. Each recipe should be formatted... (object within an array of recipe objects?)
//  Else
//  Make a call to hugginface free AI model and request recipes using as many of the expiring food items as possible.
//Save (3 - number of database recipes found) by AI in database.
// Return (3 - number of database recipes found) recipes plus those found in the database.
//Each recipe should be formatted... (object within array of them?)


//(feed to display recipes function)


// Display recipes helper function
// For each object(?) within this array create a card (by adding props to a <Card /> component)
    // Image
    // Ingredients: food, food, food ...
    // Instructions: text of length X words/chars
    // Handle click function
// Return this array of cards 


//(Handle click 
// If card clicked show full screen vrsn with a back or X button to return to multicard view. )