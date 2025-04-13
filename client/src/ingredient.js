import React, { useState } from 'react';
import EnhancedRecipeList from './EnhancedRecipeList';
import axios from 'axios';
import { saveRecipes, getStoredRecipes } from './indexedDB'; // #offline

function Ingredient() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);

  const fetchRecipes = async () => {
    const API_KEY = process.env.REACT_APP_API;
    const BASE_URL = 'https://api.spoonacular.com/recipes/findByIngredients';
    const isOnline = navigator.onLine;

    try {
      if (isOnline) {
        console.log('[Online] Fetching from API...');
        const response = await axios.get(BASE_URL, {
          params: {
            apiKey: API_KEY,
            ingredients: ingredients,
            number: 3,
          },
        });

        // Add _id key for IndexedDB
        const fetched = response.data.map(r => ({ ...r, _id: r.id }));

        setRecipes(fetched);
        await saveRecipes(fetched); // ✅ Save to IndexedDB
        console.log('[Online] Recipes saved to IndexedDB ✅');
      } else {
        console.warn('[Offline] Trying IndexedDB...');
      const stored = await getStoredRecipes() || [];
      const filtered = Array.isArray(stored)
        ? stored.filter((r) =>
        (r.title?.toLowerCase().includes(ingredients.toLowerCase()) ||
        r?.usedIngredients?.some(ing =>
         ing.name?.toLowerCase().includes(ingredients.toLowerCase())
       ) ||
       r?.missedIngredients?.some(ing =>
         ing.name?.toLowerCase().includes(ingredients.toLowerCase())
       ))
    )
    : [];

      setRecipes(filtered);
      console.log('[Offline] Loaded from IndexedDB:', filtered);

      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  return (
    <div className="App">
      <div className="container-title">
        <h1 className="main-title">Heaven Of Spices</h1>
        <p>
          A CookBook : Heaven Of Spices helps you cook the perfect dish. You
          can easily search the perfect combination of ingredients to make your
          desired dish.
        </p>
        <input
          type="text"
          placeholder="What's in your fridge?"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button onClick={fetchRecipes}>Find Recipes</button>
        <div className="recipe-data">
          <EnhancedRecipeList recipeData={recipes} />
        </div>
      </div>
    </div>
  );
}

export default Ingredient;
