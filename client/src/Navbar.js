// components/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">A CookBook</div>
      
      <div className="menu-toggle" onClick={toggleMenu}>
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li><a href="/" onClick={() => setMenuOpen(false)}>Home</a></li>
        <li><a href="#" onClick={() => setMenuOpen(false)}>About</a></li>
        <li><a href="/calories" onClick={() => setMenuOpen(false)}>Search with Calories</a></li>
        <li><a href="/mealplans" onClick={() => setMenuOpen(false)}>Meal Planning</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;