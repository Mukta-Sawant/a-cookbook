import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import MealList from "./MealList";
import axios from 'axios';
import RecipeList from './reciepe';
import CalorieSearch from './CalorieSearch';
import Ingredient from './ingredient';

function App() {
  return (
          <div className="App">
            <Router>
                <Navbar />
                
                <Routes>
                  <Route path="/" element={<Ingredient />} />
                  <Route path="/calories" element={<CalorieSearch />} />
                  {/* <Route path="/about" element={<About />} /> */}
                </Routes>
                          
            </Router>
          </div>        
  );
}

export default App;
