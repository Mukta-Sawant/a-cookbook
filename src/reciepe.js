// // // reciepe.js
// import React from 'react';

// // RecipeList Component
// export default function RecipeList({ recipeData }) {
//   // if (!recipeData || recipeData.length === 0) {
//   //   return <h3 className='no-recipe'>No recipes found. Try adding more ingredients!</h3>;
//   // }

//   return (
//     <div className='meal-card'>
//       <ul className = 'instructions recipe-container'>
//         {recipeData.map((recipe, index) => (
//           <li key={index} className='recipe-item'>
//             <h3 className='recipe-title'>{recipe.title}</h3>
//             <img 
//               src={recipe.image} 
//               alt={recipe.title} 
//               className='recipe-image'
//             //   style={{ width: '200px', borderRadius: '10px' }} 
//             />
//             <ul className='recipe-details'>
//               <li>Used Ingredients: {recipe.usedIngredientCount}</li>
//               <li>Missed Ingredients: {recipe.missedIngredientCount}</li>
//               <li className='button-container'> 
//                   <a
//                   href={`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className='recipe-link'
//                   > 
//                   View Full Recipe
//                   </a>
//               </li>
//             </ul>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';

export default function RecipeList({ recipeData }) {
  // State to manage comments for each recipe
  const [comments, setComments] = useState({});
  
  // State to manage comment inputs
  const [commentInputs, setCommentInputs] = useState({});

  // Effect to initialize comment inputs for each recipe
  useEffect(() => {
    if (recipeData) {
      const initialInputs = {};
      recipeData.forEach(recipe => {
        initialInputs[recipe.id] = '';
      });
      setCommentInputs(initialInputs);
    }
  }, [recipeData]);

  // Function to handle comment posting
  const handleCommentPost = (recipeId, event) => {
    // Prevent default form submission
    if (event) {
      event.preventDefault();
    }

    // Get the comment text
    const commentText = commentInputs[recipeId];
    
    console.log('Attempting to post comment:', {
      recipeId,
      commentText,
      currentComments: comments[recipeId]
    });

    // Validate comment
    if (!commentText || !commentText.trim()) {
      console.warn('Empty comment, cannot post');
      return;
    }

    // Create new comment object
    const newComment = {
      id: Date.now(),
      text: commentText,
      timestamp: new Date().toLocaleString()
    };

    // Update comments state
    setComments(prevComments => {
      const updatedComments = {
        ...prevComments,
        [recipeId]: [...(prevComments[recipeId] || []), newComment]
      };
      
      console.log('Updated comments:', updatedComments);
      
      return updatedComments;
    });

    // Clear the input for this recipe
    setCommentInputs(prevInputs => ({
      ...prevInputs,
      [recipeId]: ''
    }));

    // Manually show comments and update button text
    const commentsContainer = document.querySelector(`.comments-container-${recipeId}`);
    const toggleButton = document.querySelector(`.toggle-comments-btn-${recipeId}`);
    
    if (commentsContainer) {
      commentsContainer.style.display = 'block';
      if (toggleButton) {
        toggleButton.textContent = 'Hide Comments';
      }
    }
  };

  // Function to toggle comment visibility
  const toggleComments = (recipeId) => {
    const commentsContainer = document.querySelector(`.comments-container-${recipeId}`);
    const toggleButton = document.querySelector(`.toggle-comments-btn-${recipeId}`);
    
    if (!commentsContainer || !toggleButton) {
      console.warn('Comments container or toggle button not found');
      return;
    }

    const currentDisplay = commentsContainer.style.display;
    const recipeCommentsCount = (comments[recipeId] || []).length;

    if (currentDisplay === 'none') {
      commentsContainer.style.display = 'block';
      toggleButton.textContent = 'Hide Comments';
    } else {
      commentsContainer.style.display = 'none';
      toggleButton.textContent = `Show Comments (${recipeCommentsCount})`;
    }
  };

  if (!recipeData || recipeData.length === 0) {
    return <h3 className='no-recipe'>No recipes found. Try adding more ingredients!</h3>;
  }

  return (
    <div className='meal-card'>
      <ul className='instructions recipe-container'>
        {recipeData.map((recipe, index) => {
          const recipeComments = comments[recipe.id] || [];

          return (
            <li key={index} className='recipe-item'>
              <h3 className='recipe-title'>{recipe.title}</h3>
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className='recipe-image'
              />
              
              <div>
                <p>Rate this recipe:</p>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div 
                      key={star} 
                      role="button"
                      style={{
                        display: 'inline-block',
                        width: '30px',
                        height: '30px',
                        backgroundColor: '#ddd',
                        margin: '0 2px',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
                <p>No ratings yet</p>
              </div>
              
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
              
              <div className="recipe-comments-section">
                <button 
                  className={`toggle-comments-btn-${recipe.id}`}
                  onClick={() => toggleComments(recipe.id)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#f0f0f0',
                    border: 'none',
                    marginBottom: '10px'
                  }}
                >
                  Show Comments (0)
                </button>
                
                <div 
                  className={`comments-container-${recipe.id}`}
                  style={{ display: 'none' }}
                >
                  <form 
                    onSubmit={(e) => {
                      handleCommentPost(recipe.id, e);
                    }}
                    style={{
                      display: 'flex',
                      marginBottom: '10px'
                    }}
                  >
                    <input 
                      type="text" 
                      placeholder="Best!!" 
                      value={commentInputs[recipe.id] || ''}
                      onChange={(e) => {
                        console.log('Input changed:', e.target.value);
                        setCommentInputs(prev => ({
                          ...prev,
                          [recipe.id]: e.target.value
                        }));
                      }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        marginRight: '10px'
                      }}
                    />
                    <button 
                      type="submit"
                      style={{
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      Post
                    </button>
                  </form>
                  
                  <div>
                    {recipeComments.length > 0 ? (
                      recipeComments.map((comment) => (
                        <div 
                          key={comment.id} 
                          style={{
                            border: '1px solid #e0e0e0',
                            padding: '10px',
                            marginBottom: '5px',
                            borderRadius: '4px'
                          }}
                        >
                          <p>{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p 
                        className="no-comments"
                        style={{ 
                          textAlign: 'center', 
                          color: '#888' 
                        }}
                      >
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}