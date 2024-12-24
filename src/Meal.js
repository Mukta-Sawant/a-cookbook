import React, { useState, useEffect } from 'react';

export default function Meal({ meal }) {
  const [imageUrl, setImageURL] = useState('');
  const [nutrientsData, setNutrientsData] = useState(null);
  
  useEffect(() => {
    const API_KEY = process.env.REACT_APP_API;

    fetch(
        `https://api.spoonacular.com/recipes/${meal.id}/information?apiKey=${API_KEY}&includeNutrition=true`
    )
    .then((response) => response.json())
    .then((data) => {
      setImageURL(data.image);
      setNutrientsData(data.nutrition?.nutrients);
    })
    .catch(() => {
      console.log("error");
    });
  },[meal.id]);

    // Find fat and protein values from nutrition data
  const getFatContent = () => {
    return nutrientsData?.find(nutrient => nutrient.name === "Fat")?.amount.toFixed(1) || "N/A";
  };

  const getProteinContent = () => {
    return nutrientsData?.find(nutrient => nutrient.name === "Protein")?.amount.toFixed(1) || "N/A";
  };

  const getCaloriesContent = () => {
    return nutrientsData?.find(nutrient => nutrient.name === "Calories")?.amount.toFixed(1) || "N/A";
  };

  return (
    <div className='meal-card'>
        <article>
            <h1>{meal.title}</h1>
            <img src={imageUrl} alt='Recipe'/>
            <ul className='instructions'>
                <li>Ready in {meal.readyInMinutes} minutes</li>  
                <li>Servings: {meal.servings}</li> 
                {/* <li>Healthscore: {meal.healthScore}</li>      */}
                <li>Fats: {getFatContent()}g</li>   
                <li>Proteins: {getProteinContent()}g</li>   
                <li>Calories: {getCaloriesContent()}</li>  
               <li className='button-container'>
                <a href={meal.sourceUrl} className='reciepe-container'>Check Out Recipe</a> 
               </li> 
            </ul>
        </article>
    </div>
  );
}



