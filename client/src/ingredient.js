import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import MealList from "./MealList";
import axios from 'axios';
// import RecipeList from './reciepe';
import EnhancedRecipeList from './EnhancedRecipeList';
import CalorieSearch from './CalorieSearch';


function Ingredient() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);

const fetchRecipes = async () => {
  const API_KEY = process.env.REACT_APP_API;
  const BASE_URL = 'https://api.spoonacular.com/recipes/findByIngredients';

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        apiKey: API_KEY,
        ingredients: ingredients,
        number: 3, // Number of recipes to fetch
      },
    });
    setRecipes(response.data);
  } catch (error) {
    console.error('Error fetching recipes:', error);
  }
};

  return (
          <div className="App">
            <div className='container-title'>
                <h1 className='main-title'>Heaven Of Spices</h1>
                <p>A CookBook : Heaven Of Spices helps you cook the perfect dish. You can easily search the perfect combination of ingredients to make your desired dish. It’s the
                best place to find new recipes and cook delicious food.  </p>
                <input
                  type="text"
                  placeholder="What's in your fridge?"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                />
                <button onClick={fetchRecipes}>Find Recipes</button>
                <div className='recipe-data'>
                {/* <RecipeList recipeData={recipes} /> */}
                <EnhancedRecipeList recipeData={recipes} />
                </div>
            </div> 
          </div>
  );
}

export default Ingredient;
