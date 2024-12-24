// components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
     <nav class="navbar">
     <div class="logo">A CookBook</div>
     <ul class="nav-links">
       <li><a href="/">Home</a></li>
       <li><a href="#">About</a></li>
       <li><a href="/calories">Search with Calories</a></li>
     </ul>
   </nav> 
  );
}

export default Navbar;