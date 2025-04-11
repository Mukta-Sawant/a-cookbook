import React, { useState } from 'react';
import MealList from "./MealList";
import axios from 'axios';
import RecipeList from './reciepe';


// const apiKey = process.env.REACT_APP_API;

function CalorieSearch() {

  const [mealData, setMealData] = useState(null);
  const [calories, setCalories] = useState(3000);   

 function getMealData(){
  const API_KEY = process.env.REACT_APP_API;
    fetch(
      `https://api.spoonacular.com/mealplanner/generate?apiKey=${API_KEY}&timeFrame=day&targetCalories=${calories}`
    )
    .then((response) => response.json())
    .then((data) => {
      setMealData(data);
    })
    .catch(() => {
      console.log("error");
    });
  }

function handleChange(e){
  setCalories(e.target.value);
}

return (
    <div className="App">
      <header className="App-header">
        <div className="controls">
            <h2>Count, Cook, Enjoy!
            </h2>
          <input
            type='number'
            placeholder='Calories (3000)'
            onChange={handleChange}
          />
          <button className='calorie-button' onClick={getMealData}>Get a Meal Plan</button>
        </div>
        {mealData && <MealList mealData={mealData} />}
      </header>    
    </div> 
    );
}

export default CalorieSearch;
