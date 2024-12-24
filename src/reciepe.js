// // reciepe.js
import React from 'react';

// RecipeList Component
export default function RecipeList({ recipeData }) {
  // if (!recipeData || recipeData.length === 0) {
  //   return <h3 className='no-recipe'>No recipes found. Try adding more ingredients!</h3>;
  // }

  return (
    <div className='meal-card'>
      <ul className = 'instructions recipe-container'>
        {recipeData.map((recipe, index) => (
          <li key={index} className='recipe-item'>
            <h3 className='recipe-title'>{recipe.title}</h3>
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className='recipe-image'
            //   style={{ width: '200px', borderRadius: '10px' }} 
            />
            <ul className='recipe-details'>
              <li>Used Ingredients: {recipe.usedIngredientCount}</li>
              <li>Missed Ingredients: {recipe.missedIngredientCount}</li>
              <li className='button-container'> 
                  <a
                  href={`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className='recipe-link'
                  > 
                  View Full Recipe
                  </a>
              </li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
