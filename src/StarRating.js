// StarRating.js - A new component for consistent star rating display
import React from 'react';

// Simple star SVG component with inline styling
const StarIcon = ({ filled = false, half = false, size = 16 }) => {
  const color = filled || half ? '#EAB308' : '#cccccc';
  
  if (half) {
    return (
      <div style={{ width: `${size}px`, height: `${size}px`, position: 'relative', margin: '0 1px' }}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
        </svg>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill={color} 
          stroke="none"
          style={{ position: 'absolute', top: 0, left: 0, clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
        >
          <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
        </svg>
      </div>
    );
  }
  
  return (
    <div style={{ width: `${size}px`, height: `${size}px`, margin: '0 1px' }}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill={filled ? color : 'none'} 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
      </svg>
    </div>
  );
};

// Display-only star rating 
const StarRatingDisplay = ({ rating = 0, totalStars = 5, size = 16 }) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      height: `${size}px`, 
      lineHeight: `${size}px` 
    }}>
      {Array.from({ length: totalStars }).map((_, index) => {
        const starNumber = index + 1;
        // Determine if this star should be full, half, or empty
        const isFilled = starNumber <= Math.floor(rating);
        const isHalf = !isFilled && starNumber === Math.ceil(rating) && rating % 1 >= 0.5;
        
        return (
          <StarIcon 
            key={index} 
            filled={isFilled} 
            half={isHalf} 
            size={size} 
          />
        );
      })}
      
      <span style={{ 
        marginLeft: '6px', 
        fontSize: `${Math.max(12, size - 2)}px`, 
        fontWeight: 'bold',
        color: '#552b5b',
        display: 'inline-block',
        lineHeight: `${size}px`
      }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// Interactive star rating component
const StarRatingInput = ({ value = 0, onChange, totalStars = 5, size = 20 }) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center',
      height: `${size}px`, 
      lineHeight: `${size}px`
    }}>
      {Array.from({ length: totalStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;
        
        return (
          <div 
            key={index}
            onClick={() => onChange(starValue)}
            style={{ 
              cursor: 'pointer',
              margin: '0 1px',
              width: `${size}px`,
              height: `${size}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <StarIcon filled={isFilled} size={size} />
          </div>
        );
      })}
    </div>
  );
};

export { StarRatingDisplay, StarRatingInput };