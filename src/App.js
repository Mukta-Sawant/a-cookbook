import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import MealList from "./MealList";
import axios from 'axios';
import RecipeList from './reciepe';
import CalorieSearch from './CalorieSearch';
import Ingredient from './ingredient';
// import CollaborativeMealPlanner from './CollaborativeMealPlanner';   // added soon
// import MealPlansList from './MealPlansList';
import './CommunityFeatures.css';

function App() {
  return (
          <div className="App">
            <Router>
                <Navbar />
                
                <Routes>
                  <Route path="/" element={<Ingredient />} />
                  <Route path="/calories" element={<CalorieSearch />} />
                  {/* <Route path="/about" element={<About />} /> */}
                  {/* <Route path="/mealplan/:mealPlanId" element={<CollaborativeMealPlanner />} />
                  <Route path="/mealplan/new" element={<CollaborativeMealPlanner />} />
                  <Route path="/mealplans" element={<MealPlansList />} /> */}
                </Routes>                          
            </Router>
          </div>        
  );
}

export default App;
