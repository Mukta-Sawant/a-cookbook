// EnhancedRecipeList.js
import React from 'react';
import CommunityRecipeItem from './CommunityRecipeItem';

// Enhanced RecipeList Component with Community Features
export default function EnhancedRecipeList({ recipeData }) {
  if (!recipeData || recipeData.length === 0) {
    return <h3 className='no-recipe'>No recipes found. Try adding more ingredients!</h3>;
  }

  return (
    <div className='meal-card'>
      <ul className='instructions recipe-container'>
        {recipeData.map((recipe, index) => (
          <li key={index} className='recipe-item'>
            <CommunityRecipeItem recipe={recipe} />
          </li>
        ))}
      </ul>
    </div>
  );
}