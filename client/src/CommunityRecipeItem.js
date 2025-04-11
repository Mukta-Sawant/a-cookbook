import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Star, StarHalf } from 'lucide-react';
import { StarRatingDisplay, StarRatingInput } from './StarRating';

const CommunityRecipeItem = ({ recipe }) => {
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [userId] = useState(localStorage.getItem('userId') || generateUserId());
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [showUserPrompt, setShowUserPrompt] = useState(!localStorage.getItem('username'));
  
  // Using useRef for socket
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Generate a simple user ID if not exists
  function generateUserId() {
    const newId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('userId', newId);
    return newId;
  }

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (showUserPrompt || !username) return;

    // Store username for future sessions
    localStorage.setItem('username', username);

    // Connect to socket.io server
    const newSocket = io(window.location.origin, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    newSocket.on('connect', () => {
      console.log('Socket connected for recipe community features');
      setIsConnected(true); // Mark socket as connected
      // Join the recipe room
      newSocket.emit('join-recipe', {
        recipeId: recipe.id,
        userId,
        username
      });
    });

    newSocket.on('recipe-data', (data) => {
      console.log('Received recipe community data:', data);
      setComments(data.comments || []);
      setRatings(data.ratings || []);
      setAverageRating(data.averageRating || 0);
      setTotalRatings(data.totalRatings || 0);
    });

    newSocket.on('comment-added', (newComment) => {
      console.log('New comment received:', newComment);
      setComments((prevComments) => [newComment, ...prevComments]);
    });

    newSocket.on('rating-updated', (data) => {
      setRatings((prevRatings) => [data.rating, ...prevRatings]);
      setAverageRating(data.averageRating);
      setTotalRatings(data.totalRatings);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Save socket in ref to avoid re-render
    socketRef.current = newSocket;

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
        setIsConnected(false); // Mark socket as disconnected
      }
    };
  }, [recipe.id, userId, username, showUserPrompt]);

  // Handle setting username
  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim().length > 0) {
      setShowUserPrompt(false);
      localStorage.setItem('username', username);
    }
  };

  // Handle submitting a comment
  const handleAddComment = (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;
    
    // Debugging connection state
    console.log('Socket connection status:', socketRef.current ? socketRef.current.connected : 'No socket');

    if (!socketRef.current || !socketRef.current.connected) {
      console.error('Socket connection not found. Comment not sent.');
      alert('Socket connection not found. Please try again later.');
      return;
    }

    console.log('Sending comment:', newComment);
    
    socketRef.current.emit('add-comment', {
      recipeId: recipe.id,
      userId,
      username,
      text: newComment,
      timestamp: new Date().toISOString()
    });

    setNewComment('');
  };

  // Handle submitting a rating
  const handleAddRating = (rating) => {
    if (!socketRef.current || !socketRef.current.connected) return;
    
    setUserRating(rating);
    socketRef.current.emit('add-rating', {
      recipeId: recipe.id,
      userId,
      username,
      rating,
      timestamp: new Date().toISOString()
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Render stars based on rating
  // const renderStars = (rating) => {
  //   const stars = [];
  //   const fullStars = Math.floor(rating);
  //   const hasHalfStar = rating % 1 >= 0.5;
    
  //   for (let i = 0; i < fullStars; i++) {
  //     stars.push(
  //       <Star 
  //         key={`full-${i}`} 
  //         className="text-yellow-500" 
  //         fill="#EAB308" 
  //         size={16}
  //       />
  //     );
  //   }
    
  //   if (hasHalfStar) {
  //     stars.push(
  //       <StarHalf 
  //         key="half" 
  //         className="text-yellow-500" 
  //         fill="#EAB308" 
  //         size={16}
  //       />
  //     );
  //   }
    
  //   return <div className="recipe-stars">{stars}</div>;
  // };

  const renderStars = (rating) => {
    return (
      <div className="recipe-stars" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          // Full star
          if (star <= Math.floor(rating)) {
            return (
              <Star 
                key={`star-${star}`} 
                size={16} 
                fill="#EAB308" 
                color="#EAB308" 
                style={{ display: 'block', minWidth: '16px' }}
              />
            );
          }
          // Half star
          else if (star === Math.ceil(rating) && rating % 1 >= 0.5) {
            return (
              <StarHalf 
                key={`star-${star}`} 
                size={16} 
                fill="#EAB308" 
                color="#EAB308" 
                style={{ display: 'block', minWidth: '16px' }}
              />
            );
          }
          // Empty star
          else {
            return (
              <Star 
                key={`star-${star}`} 
                size={16} 
                fill="none" 
                color="#cccccc" 
                style={{ display: 'block', minWidth: '16px' }}
              />
            );
          }
        })}
      </div>
    );
  };

  // If username prompt is shown
  if (showUserPrompt) {
    return (
      <div className="username-prompt-recipe">
        <h4>Join the Community</h4>
        <p>Enter your name to rate and comment on recipes</p>
        <form onSubmit={handleSetUsername}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            className="username-input"
            required
          />
          <button type="submit" className="username-submit-btn">Join</button>
        </form>
      </div>
    );
  }

  return (
    <div className="community-recipe-item">
      <h3 className="recipe-title">{recipe.title}</h3>
      <img 
        src={recipe.image} 
        alt={recipe.title} 
        className="recipe-image"
      />
      
      {/* Rating section */}
      {/* <div className="recipe-rating-section">
        <div className="current-rating">
          {averageRating > 0 ? (
            <>
              {renderStars(averageRating)}
              <span className="rating-number">{averageRating.toFixed(1)}</span>
              <span className="rating-count">({totalRatings})</span>
            </>
          ) : (
            <span className="no-ratings">No ratings yet</span>
          )}
        </div>
        
        <div className="user-rating">
          <p>Rate this recipe:</p>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleAddRating(star)}
                className={`star-btn ${userRating >= star ? 'active' : ''}`}
              >
                <Star 
                  fill={userRating >= star ? '#EAB308' : 'none'} 
                  color={userRating >= star ? '#EAB308' : '#cccccc'}
                  size={20}
                />
              </button>
            ))}
          </div>
        </div>
      </div> */}
      <div className="recipe-rating-section" style={{ margin: '1rem 0' }}>
  <div className="current-rating" style={{ display: 'flex', alignItems: 'center' }}>
    {averageRating > 0 ? (
      <>
        <StarRatingDisplay rating={averageRating} size={16} />
        <span className="rating-count" style={{ 
          fontSize: '0.8rem', 
          color: '#666',
          marginLeft: '4px'
        }}>
          ({totalRatings})
        </span>
      </>
    ) : (
      <span className="no-ratings" style={{ 
        fontStyle: 'italic', 
        color: '#666', 
        fontSize: '0.9rem' 
      }}>
        No ratings yet
      </span>
    )}
  </div>
  
  <div className="user-rating" style={{ marginTop: '12px' }}>
    <p style={{ 
      marginBottom: '8px', 
      fontSize: '0.9rem', 
      color: '#552b5b' 
    }}>
      Rate this recipe:
    </p>
    <StarRatingInput 
      value={userRating} 
      onChange={handleAddRating} 
      size={20}
    />
  </div>
</div>
      
      <ul className="recipe-details">
        <li>Used Ingredients: {recipe.usedIngredientCount}</li>
        <li>Missed Ingredients: {recipe.missedIngredientCount}</li>
        <li className="button-container"> 
          <a
            href={`https://spoonacular.com/recipes/${recipe.title}-${recipe.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="recipe-link"
          > 
            View Full Recipe
          </a>
        </li>
      </ul>
      
      {/* Comments section */}
      <div className="recipe-comments-section">
        <button 
          className="toggle-comments-btn"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? 'Hide Comments' : `Show Comments (${comments.length})`}
        </button>
        
        {showComments && (
          <div className="comments-container">
            <form onSubmit={handleAddComment} className="comment-form">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
              />
              <button 
                type="submit" 
                className="comment-submit-btn"
                disabled={!newComment.trim()}
              >
                Post
              </button>
            </form>
            
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.username}</span>
                      <span className="comment-date">{formatDate(comment.timestamp)}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityRecipeItem;
