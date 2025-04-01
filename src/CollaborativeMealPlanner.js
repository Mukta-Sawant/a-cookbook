// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { v4 as uuidv4 } from 'uuid';
// import io from 'socket.io-client';
// import './CollaborativeMealPlanner.css';

// // Define color palette for user colors - using your app's existing colors
// const USER_COLORS = [
//   '#F4901D', // Your app's orange color
//   '#552B5B', // Your app's purple color
//   '#3B82F6', // Blue
//   '#10B981', // Green
//   '#EC4899', // Pink
//   '#8B5CF6', // Purple
//   '#F59E0B', // Amber
//   '#EF4444'  // Red
// ];

// const CollaborativeMealPlanner = () => {
//   const { mealPlanId } = useParams();
//   const [socket, setSocket] = useState(null);
//   const [userId] = useState(localStorage.getItem('userId') || uuidv4());
//   const [username, setUsername] = useState(localStorage.getItem('username') || '');
//   const [userColor] = useState(localStorage.getItem('userColor') || USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);
//   const [showUserPrompt, setShowUserPrompt] = useState(!localStorage.getItem('username'));
  
//   const [mealPlan, setMealPlan] = useState({
//     name: '',
//     startDate: new Date(),
//     endDate: new Date(new Date().setDate(new Date().getDate() + 6)),
//     days: [],
//     shoppingList: [],
//     activeUsers: []
//   });
  
//   const [availableRecipes, setAvailableRecipes] = useState([]);
//   const [selectedRecipe, setSelectedRecipe] = useState(null);
//   const [selectedDay, setSelectedDay] = useState(null);
//   const [selectedMeal, setSelectedMeal] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [showChat, setShowChat] = useState(false);
//   const [newShoppingItem, setNewShoppingItem] = useState({ ingredient: '', quantity: '', unit: '' });
//   const [isLoading, setIsLoading] = useState(true);
  
//   const messagesEndRef = useRef(null);
//   const navigate = useNavigate();
//   const hasConnected = useRef(false);
  
//   // Add automatic timeout to exit loading state
//   useEffect(() => {
//     // Force exit loading state after 10 seconds no matter what
//     let loadingTimeout = null;
    
//     if (isLoading) {
//       loadingTimeout = setTimeout(() => {
//         console.log('Loading timeout reached, forcing exit from loading state');
//         setIsLoading(false);
//       }, 10000); // 10 second timeout
//     }
    
//     return () => {
//       if (loadingTimeout) clearTimeout(loadingTimeout);
//     };
//   }, [isLoading]);
  
//   // Initialize socket connection with improved error handling
//   useEffect(() => {
//     if (hasConnected.current || !username || showUserPrompt) return;
    
//     // Store user info for future sessions
//     localStorage.setItem('userId', userId);
//     localStorage.setItem('username', username);
//     localStorage.setItem('userColor', userColor);
    
//     // Connect to socket.io server with better configuration
//     console.log('Attempting socket connection to http://localhost:5000');
//     const newSocket = io('http://localhost:5000', {
//       reconnection: true,        // Enable reconnection
//       reconnectionAttempts: 5,   // Try to reconnect 5 times
//       reconnectionDelay: 1000,   // Wait 1 second between reconnection attempts
//       timeout: 20000             // Longer timeout for connection
//     });
    
//     newSocket.on('connect', () => {
//       console.log('Socket connected successfully:', newSocket.id);
//     });
    
//     newSocket.on('disconnect', (reason) => {
//       console.log('Socket disconnected:', reason);
      
//       // If the server disconnected us, try to reconnect
//       if (reason === 'io server disconnect') {
//         newSocket.connect();
//       }
//     });
    
//     newSocket.on('reconnect', (attemptNumber) => {
//       console.log(`Socket reconnected after ${attemptNumber} attempts`);
      
//       // Re-join the meal plan room after reconnection if we have a meal plan ID
//       if (mealPlanId) {
//         console.log('Rejoining meal plan after reconnection');
//         newSocket.emit('join-mealplan', { 
//           mealPlanId, 
//           userId, 
//           username,
//           color: userColor
//         });
//       }
//     });
    
//     newSocket.on('reconnect_failed', () => {
//       console.error('Socket failed to reconnect after all attempts');
//       setIsLoading(false); // Exit loading state even if reconnection fails
//     });
    
//     newSocket.on('connect_error', (error) => {
//       console.error('Socket connection error:', error);
//       setIsLoading(false); // Exit loading state on connection error
//     });
    
//     setSocket(newSocket);
    
//     // Mark as connected
//     hasConnected.current = true;
    
//     // Clean up on unmount
//     return () => {
//       newSocket.disconnect();
//     };
//   }, [userId, username, userColor, showUserPrompt, mealPlanId]);
  
//   // Join meal plan room once socket and username are set
//   useEffect(() => {
//     if (!socket || !username || !mealPlanId) return;
    
//     console.log(`Joining meal plan with ID: ${mealPlanId}`);
    
//     // Join the meal planning session
//     socket.emit('join-mealplan', { 
//       mealPlanId, 
//       userId, 
//       username,
//       color: userColor
//     });
    
//     // Listen for meal plan data when first joining
//     socket.on('mealplan-data', (data) => {
//       console.log('Received meal plan data:', data);
//       console.log('Days Array:', data.days);
//       console.log('Days Length:', data.days?.length || 0);
      
//       setMealPlan(data);
//       setIsLoading(false);
      
//       // If no days or days length is 0, show a message but don't auto-create
//       if (!data.days || data.days.length === 0) {
//         console.log('No days found in meal plan, user will need to create them');
//       }
//     });
    
//     // Listen for active users update
//     socket.on('active-users', (users) => {
//       console.log('Active users:', users);
//     });
    
//     // Listen for user joining
//     socket.on('user-joined', ({ userId, username, color }) => {
//       console.log(`User joined: ${username}`);
//       // Add system message about user joining
//       setMessages(prev => [
//         ...prev,
//         {
//           id: uuidv4(),
//           type: 'system',
//           text: `${username} joined the meal planning session`,
//           timestamp: Date.now()
//         }
//       ]);
//     });
    
//     // Listen for user leaving
//     socket.on('user-left', ({ userId }) => {
//       // Find username of user who left
//       const user = mealPlan.activeUsers.find(u => u.userId === userId);
//       if (user) {
//         console.log(`User left: ${user.username}`);
//         // Add system message about user leaving
//         setMessages(prev => [
//           ...prev,
//           {
//             id: uuidv4(),
//             type: 'system',
//             text: `${user.username} left the session`,
//             timestamp: Date.now()
//           }
//         ]);
//       }
      
//       // Update active users list
//       setMealPlan(prev => ({
//         ...prev,
//         activeUsers: prev.activeUsers.filter(u => u.userId !== userId)
//       }));
//     });
    
//     // Listen for meal plan name updates
//     socket.on('mealplan-name-updated', ({ name, userId }) => {
//       setMealPlan(prev => ({ ...prev, name }));
//     });
    
//     // Listen for meal updates
//     socket.on('meal-updated', ({ dayIndex, mealType, mealData, userId }) => {
//       setMealPlan(prev => {
//         const newDays = [...prev.days];
//         if (newDays[dayIndex] && newDays[dayIndex].meals) {
//           newDays[dayIndex].meals[mealType] = mealData;
//         }
//         return { ...prev, days: newDays };
//       });
//     });
    
//     // Listen for shopping item additions
//     socket.on('shopping-item-added', ({ item, userId }) => {
//       setMealPlan(prev => ({
//         ...prev,
//         shoppingList: [...prev.shoppingList, item]
//       }));
//     });
    
//     // Listen for shopping item updates
//     socket.on('shopping-item-updated', ({ itemId, updates, userId }) => {
//       setMealPlan(prev => {
//         const newShoppingList = [...prev.shoppingList];
//         const itemIndex = newShoppingList.findIndex(item => item._id.toString() === itemId);
        
//         if (itemIndex !== -1) {
//           newShoppingList[itemIndex] = {
//             ...newShoppingList[itemIndex],
//             ...updates
//           };
//         }
        
//         return { ...prev, shoppingList: newShoppingList };
//       });
//     });
    
//     // Listen for shopping item removals
//     socket.on('shopping-item-removed', ({ itemId, userId }) => {
//       setMealPlan(prev => ({
//         ...prev,
//         shoppingList: prev.shoppingList.filter(item => item._id.toString() !== itemId)
//       }));
//     });
    
//     // Listen for chat messages
//     socket.on('message-received', ({ message, userId, timestamp }) => {
//       const sender = mealPlan.activeUsers.find(u => u.userId === userId) || 
//                     { username: 'Unknown', color: '#999999' };
//       setMessages(prev => [
//         ...prev,
//         {
//           id: uuidv4(),
//           type: 'user',
//           text: message,
//           sender: {
//             userId,
//             username: sender.username,
//             color: sender.color
//           },
//           timestamp
//         }
//       ]);
//     });
    
//     // New listeners for the days creation response
//     socket.on('meal-plan-days-updated', (updatedPlan) => {
//       console.log('Days updated successfully on server:', updatedPlan.days?.length || 0);
//       setMealPlan(updatedPlan);
//       setIsLoading(false);
//     });
    
//     socket.on('meal-plan-days-error', (error) => {
//       console.error('Error updating days on server:', error);
//       setIsLoading(false);
//       alert('There was a problem updating days on the server: ' + error.message);
//     });
    
//     // Listen for errors
//     socket.on('error', ({ message }) => {
//       console.error('Socket error:', message);
//       setIsLoading(false);
//       // Show error to user
//       alert(`Error: ${message}`);
//     });
    
//     // Clean up event listeners on unmount
//     return () => {
//       socket.off('mealplan-data');
//       socket.off('active-users');
//       socket.off('user-joined');
//       socket.off('user-left');
//       socket.off('mealplan-name-updated');
//       socket.off('meal-updated');
//       socket.off('shopping-item-added');
//       socket.off('shopping-item-updated');
//       socket.off('shopping-item-removed');
//       socket.off('message-received');
//       socket.off('meal-plan-days-updated');
//       socket.off('meal-plan-days-error');
//       socket.off('error');
//     };
//   }, [socket, userId, username, userColor, mealPlanId, mealPlan.activeUsers]);
  
//   // Improved days creation function that properly syncs with server
//   const createDaysForMealPlan = () => {
//     try {
//       console.log(`Creating days for meal plan with sync...`);
//       setIsLoading(true); // Show loading while we create days
      
//       // Create a new array of days
//       const startDate = new Date(mealPlan.startDate || new Date());
//       const days = [];
      
//       for (let i = 0; i < 7; i++) {
//         const date = new Date(startDate);
//         date.setDate(date.getDate() + i);
        
//         days.push({
//           date: date,
//           meals: {
//             breakfast: { title: '', recipeId: '', notes: '', assignedTo: '' },
//             lunch: { title: '', recipeId: '', notes: '', assignedTo: '' },
//             dinner: { title: '', recipeId: '', notes: '', assignedTo: '' },
//             snacks: []
//           }
//         });
//       }
      
//       // Check if socket is connected before attempting to use it
//       if (socket && socket.connected) {
//         console.log('Socket is connected, sending days to server');
        
//         // Set a timeout to prevent infinite loading
//         const timeoutId = setTimeout(() => {
//           console.log('Server response timeout, updating locally');
//           setMealPlan(prev => ({
//             ...prev,
//             days: days
//           }));
//           setIsLoading(false);
//           alert('Server response timed out. Changes may not sync with other users.');
//         }, 5000);
        
//         // Emit the event to update the server
//         socket.emit('update-meal-plan-days', {
//           mealPlanId,
//           days,
//           userId
//         });
        
//         // The response will be handled by the socket listeners
//         // We keep the loading state until we get a response or timeout
//       } else {
//         console.warn('Socket not connected, using local update only');
//         // Update local state as a fallback
//         setMealPlan(prev => ({
//           ...prev,
//           days: days
//         }));
//         setIsLoading(false);
        
//         // Alert user about connectivity issue
//         alert('Not connected to server. Changes may not sync with other users.');
//       }
//     } catch (error) {
//       console.error('Error in createDaysForMealPlan:', error);
//       setIsLoading(false);
//     }
//   };
  
//   // Fetch available recipes when component mounts
//   useEffect(() => {
//     const fetchRecipes = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/recipes/summary');
//         if (!response.ok) {
//           throw new Error(`Failed to fetch recipes: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log('Fetched recipes:', data);
//         setAvailableRecipes(data);
//       } catch (error) {
//         console.error('Error fetching recipes:', error);
//         // Set some default recipes if the API fails
//         setAvailableRecipes([
//           { _id: '1', title: 'Pancakes' },
//           { _id: '2', title: 'Scrambled Eggs' },
//           { _id: '3', title: 'Grilled Chicken Salad' },
//           { _id: '4', title: 'Pasta Primavera' },
//           { _id: '5', title: 'Steak and Vegetables' }
//         ]);
//       }
//     };
    
//     fetchRecipes();
//   }, []);
  
//   // Scroll to bottom of messages when new ones arrive
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);
  
//   // Format date for display
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       weekday: 'short', 
//       month: 'short', 
//       day: 'numeric' 
//     });
//   };
  
//   // Format timestamp for chat messages
//   const formatTimestamp = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };
  
//   // Handle setting username
//   const handleSetUsername = (e) => {
//     e.preventDefault();
//     if (username.trim().length > 0) {
//       setShowUserPrompt(false);
//       localStorage.setItem('username', username);
//     }
//   };
  
//   // Handle meal plan name change
//   const handleMealPlanNameChange = (e) => {
//     const newName = e.target.value;
//     setMealPlan(prev => ({ ...prev, name: newName }));
    
//     // Emit change to server
//     if (socket) {
//       socket.emit('update-mealplan-name', { mealPlanId, name: newName, userId });
//     }
//   };
  
//   // Handle meal selection
//   const handleMealSelect = (dayIndex, mealType) => {
//     setSelectedDay(dayIndex);
//     setSelectedMeal(mealType);
//   };
  
//   // Handle assigning recipe to a meal
//   const handleAssignRecipe = (recipeId, recipeTitle) => {
//     if (selectedDay === null || selectedMeal === null) return;
    
//     const mealData = {
//       recipeId,
//       title: recipeTitle,
//       notes: '',
//       assignedTo: username
//     };
    
//     // Update local state
//     setMealPlan(prev => {
//       const newDays = [...prev.days];
//       if (newDays[selectedDay] && newDays[selectedDay].meals) {
//         newDays[selectedDay].meals[selectedMeal] = mealData;
//       }
//       return { ...prev, days: newDays };
//     });
    
//     // Emit change to server
//     if (socket) {
//       socket.emit('update-meal', {
//         mealPlanId,
//         dayIndex: selectedDay,
//         mealType: selectedMeal,
//         mealData,
//         userId
//       });
//     }
    
//     // Reset selection
//     setSelectedRecipe(null);
//     setSelectedDay(null);
//     setSelectedMeal(null);
//   };
  
//   // Handle removing a meal
//   const handleRemoveMeal = (dayIndex, mealType) => {
//     const emptyMeal = {
//       recipeId: '',
//       title: '',
//       notes: '',
//       assignedTo: ''
//     };
    
//     // Update local state
//     setMealPlan(prev => {
//       const newDays = [...prev.days];
//       if (newDays[dayIndex] && newDays[dayIndex].meals) {
//         newDays[dayIndex].meals[mealType] = emptyMeal;
//       }
//       return { ...prev, days: newDays };
//     });
    
//     // Emit change to server
//     if (socket) {
//       socket.emit('update-meal', {
//         mealPlanId,
//         dayIndex,
//         mealType,
//         mealData: emptyMeal,
//         userId
//       });
//     }
//   };
  
//   // Handle meal note change
//   const handleMealNoteChange = (dayIndex, mealType, notes) => {
//     // Update local state
//     setMealPlan(prev => {
//       const newDays = [...prev.days];
//       if (newDays[dayIndex] && newDays[dayIndex].meals && newDays[dayIndex].meals[mealType]) {
//         newDays[dayIndex].meals[mealType].notes = notes;
//       }
//       return { ...prev, days: newDays };
//     });
    
//     // Emit change to server
//     if (socket) {
//       const mealData = { ...mealPlan.days[dayIndex].meals[mealType], notes };
      
//       socket.emit('update-meal', {
//         mealPlanId,
//         dayIndex,
//         mealType,
//         mealData,
//         userId
//       });
//     }
//   };
  
//   // Handle shopping item input change
//   const handleShoppingItemChange = (field, value) => {
//     setNewShoppingItem(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };
  
//   // Handle adding item to shopping list
//   const handleAddShoppingItem = (e) => {
//     e.preventDefault();
    
//     if (!newShoppingItem.ingredient.trim()) return;
    
//     const item = {
//       ...newShoppingItem,
//       purchased: false,
//       addedBy: userId
//     };
    
//     // Emit to server
//     if (socket) {
//       socket.emit('add-shopping-item', {
//         mealPlanId,
//         item,
//         userId
//       });
//     }
    
//     // Reset form
//     setNewShoppingItem({ ingredient: '', quantity: '', unit: '' });
//   };
  
//   // Handle toggling purchased status of shopping item
//   const handleTogglePurchased = (itemId, currentStatus) => {
//     // Emit to server
//     if (socket) {
//       socket.emit('update-shopping-item', {
//         mealPlanId,
//         itemId,
//         updates: { purchased: !currentStatus },
//         userId
//       });
//     }
//   };
  
//   // Handle removing shopping item
//   const handleRemoveShoppingItem = (itemId) => {
//     // Emit to server
//     if (socket) {
//       socket.emit('remove-shopping-item', {
//         mealPlanId,
//         itemId,
//         userId
//       });
//     }
//   };
  
//   // Handle sending chat message
//   const sendMessage = (e) => {
//     e.preventDefault();
    
//     if (!newMessage.trim() || !socket) return;
    
//     // Send to server
//     socket.emit('send-message', {
//       mealPlanId,
//       message: newMessage,
//       userId
//     });
    
//     // Clear input
//     setNewMessage('');
//   };
  
//   // Share meal plan
//   const shareMealPlan = () => {
//     const planUrl = window.location.href;
    
//     if (navigator.share) {
//       navigator.share({
//         title: mealPlan.name || 'Collaborative Meal Plan',
//         text: 'Join me to plan our meals together!',
//         url: planUrl,
//       })
//       .catch(error => console.log('Error sharing:', error));
//     } else {
//       // Fallback for browsers that don't support the Web Share API
//       navigator.clipboard.writeText(planUrl)
//         .then(() => {
//           alert('Meal plan link copied to clipboard!');
//         })
//         .catch(err => {
//           console.error('Failed to copy link: ', err);
//         });
//     }
//   };
  
//   // Debugging logs
//   console.log("Meal Plan Data:", mealPlan);
//   console.log("Days Array:", mealPlan.days);
//   console.log("Days Length:", mealPlan.days?.length || 0);

//   if (showUserPrompt) {
//     return (
//       <div className="username-prompt-container">
//         <div className="username-prompt">
//           <h2>Enter Your Name</h2>
//           <p>Please enter your name to join the meal planning session.</p>
//           <form onSubmit={handleSetUsername}>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               placeholder="Your name"
//               className="username-input"
//               required
//             />
//             <button type="submit" className="username-submit-btn">Join Session</button>
//           </form>
//         </div>
//       </div>
//     );
//   }
  
//   if (isLoading) {
//     return (
//       <div className="meal-planner-container">
//         <div style={{textAlign: 'center', padding: '3rem'}}>
//           <h2>Loading meal plan...</h2>
//           <p>Please wait while we fetch your meal plan data.</p>
          
//           {/* Add a button to create days if it takes too long */}
//           <button 
//             onClick={() => createDaysForMealPlan()}
//             style={{ 
//               marginTop: '1rem',
//               padding: '0.75rem 1.5rem',
//               backgroundColor: '#f4901d',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             Create Days Now
//           </button>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="meal-planner-container">
//       <div className="meal-planner-header">
//         <div className="plan-title-section">
//           <input
//             type="text"
//             className="meal-plan-title-input"
//             value={mealPlan.name}
//             onChange={handleMealPlanNameChange}
//             placeholder="Name your meal plan"
//           />
//           <div className="meal-plan-date-range">
//             {mealPlan.days && mealPlan.days.length > 0 ? (
//               <span>
//                 {formatDate(mealPlan.days[0].date)} - {formatDate(mealPlan.days[mealPlan.days.length - 1].date)}
//               </span>
//             ) : (
//               <span>No date range available</span>
//             )}
//           </div>
//         </div>
        
//         <div className="meal-planner-actions">
//           <div className="active-users-display">
//             <span>Planning now: </span>
//             <div className="active-users-avatars">
//               {mealPlan.activeUsers.map(user => (
//                 <div 
//                   key={user.userId} 
//                   className="user-avatar"
//                   style={{ backgroundColor: user.color }}
//                   title={user.username}
//                 >
//                   {user.username.charAt(0).toUpperCase()}
//                 </div>
//               ))}
//             </div>
//           </div>
          
//           <button onClick={shareMealPlan} className="share-plan-btn">
//             Share Plan
//           </button>
          
//           <button onClick={() => setShowChat(!showChat)} className="toggle-chat-btn">
//             {showChat ? 'Hide Chat' : 'Show Chat'}
//           </button>
//         </div>
//       </div>
      
//       <div className="meal-planner-content">
//         <div className={`meal-calendar ${showChat ? 'with-chat' : ''}`}>
//           {/* Check if days exist, if not show create days button */}
//           {(!mealPlan.days || mealPlan.days.length === 0) ? (
//             <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', marginBottom: '2rem' }}>
//               <p>No meal days available. You need to create the days for this meal plan.</p>
//               <button 
//                 onClick={() => createDaysForMealPlan()} 
//                 className="fix-meal-plan-btn" 
//                 style={{ 
//                   marginTop: '1rem',
//                   padding: '0.75rem 1.5rem',
//                   backgroundColor: '#f4901d',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: 'pointer'
//                 }}
//               >
//                 Create Meal Days
//               </button>
//             </div>
//           ) : (
//             <div className="meal-days-container">
//               {mealPlan.days.map((day, dayIndex) => (
//                 <div key={dayIndex} className="meal-day-card">
//                   <div className="day-header">
//                     <h3>{formatDate(day.date)}</h3>
//                   </div>
                  
//                   <div className="day-meals">
//                     <div 
//                       className={`meal-slot ${selectedDay === dayIndex && selectedMeal === 'breakfast' ? 'selected' : ''}`}
//                       onClick={() => handleMealSelect(dayIndex, 'breakfast')}>
//                       <div className="meal-type">Breakfast</div>
//                       {day.meals.breakfast.title ? (
//                         <div className="meal-card">
//                           <div className="meal-title">{day.meals.breakfast.title}</div>
                          
//                           {day.meals.breakfast.assignedTo && (
//                             <div className="meal-assigned-to">
//                               Chef: {day.meals.breakfast.assignedTo}
//                             </div>
//                           )}
                          
//                           {day.meals.breakfast.notes && (
//                             <div className="meal-notes">{day.meals.breakfast.notes}</div>
//                           )}
                          
//                           <div className="meal-actions">
//                             <input
//                               type="text"
//                               placeholder="Add notes..."
//                               value={day.meals.breakfast.notes || ''}
//                               onChange={(e) => handleMealNoteChange(dayIndex, 'breakfast', e.target.value)}
//                               onClick={(e) => e.stopPropagation()}
//                               className="meal-notes-input"
//                             />
//                             <button 
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleRemoveMeal(dayIndex, 'breakfast');
//                               }}
//                               className="remove-meal-btn"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="empty-meal">
//                           Click to add a meal
//                         </div>
//                       )}
//                     </div>
                    
//                     <div 
//                       className={`meal-slot ${selectedDay === dayIndex && selectedMeal === 'lunch' ? 'selected' : ''}`}
//                       onClick={() => handleMealSelect(dayIndex, 'lunch')}>
//                       <div className="meal-type">Lunch</div>
//                       {day.meals.lunch.title ? (
//                         <div className="meal-card">
//                           <div className="meal-title">{day.meals.lunch.title}</div>
                          
//                           {day.meals.lunch.assignedTo && (
//                             <div className="meal-assigned-to">
//                               Chef: {day.meals.lunch.assignedTo}
//                             </div>
//                           )}
                          
//                           {day.meals.lunch.notes && (
//                             <div className="meal-notes">{day.meals.lunch.notes}</div>
//                           )}
                          
//                           <div className="meal-actions">
//                             <input
//                               type="text"
//                               placeholder="Add notes..."
//                               value={day.meals.lunch.notes || ''}
//                               onChange={(e) => handleMealNoteChange(dayIndex, 'lunch', e.target.value)}
//                               onClick={(e) => e.stopPropagation()}
//                               className="meal-notes-input"
//                             />
//                             <button 
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleRemoveMeal(dayIndex, 'lunch');
//                               }}
//                               className="remove-meal-btn"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="empty-meal">
//                           Click to add a meal
//                         </div>
//                       )}
//                     </div>
                    
//                     <div 
//                       className={`meal-slot ${selectedDay === dayIndex && selectedMeal === 'dinner' ? 'selected' : ''}`}
//                       onClick={() => handleMealSelect(dayIndex, 'dinner')}>
//                       <div className="meal-type">Dinner</div>
//                       {day.meals.dinner.title ? (
//                         <div className="meal-card">
//                           <div className="meal-title">{day.meals.dinner.title}</div>
                          
//                           {day.meals.dinner.assignedTo && (
//                             <div className="meal-assigned-to">
//                               Chef: {day.meals.dinner.assignedTo}
//                             </div>
//                           )}
                          
//                           {day.meals.dinner.notes && (
//                             <div className="meal-notes">{day.meals.dinner.notes}</div>
//                           )}
                          
//                           <div className="meal-actions">
//                             <input
//                               type="text"
//                               placeholder="Add notes..."
//                               value={day.meals.dinner.notes || ''}
//                               onChange={(e) => handleMealNoteChange(dayIndex, 'dinner', e.target.value)}
//                               onClick={(e) => e.stopPropagation()}
//                               className="meal-notes-input"
//                             />
//                             <button 
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleRemoveMeal(dayIndex, 'dinner');
//                               }}
//                               className="remove-meal-btn"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="empty-meal">
//                           Click to add a meal
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
          
//           <div className="meal-selection-panel">
//             {(selectedDay !== null && selectedMeal !== null) ? (
//               <div className="recipe-selection">
//                 <h3>Select a Recipe for {selectedMeal}</h3>
//                 <div className="recipe-search">
//                   <input 
//                     type="text" 
//                     placeholder="Search recipes..." 
//                     className="recipe-search-input"
//                   />
//                 </div>
//                 <div className="recipe-list">
//                   {availableRecipes.length > 0 ? (
//                     availableRecipes.map(recipe => (
//                       <div 
//                         key={recipe._id} 
//                         className="recipe-item"
//                         onClick={() => handleAssignRecipe(recipe._id, recipe.title)}
//                       >
//                         <div className="recipe-title">{recipe.title}</div>
//                       </div>
//                     ))
//                   ) : (
//                     <div style={{ padding: '1rem', textAlign: 'center' }}>
//                       Loading recipes...
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="selection-instructions">
//                 <h3>Plan Your Meals</h3>
//                 <p>Click on a meal slot to add a recipe.</p>
//               </div>
//             )}
//           </div>
          
//           <div className="shopping-list-panel">
//             <h3>Shopping List</h3>
//             <form onSubmit={handleAddShoppingItem} className="add-shopping-item-form">
//               <input
//                 type="text"
//                 placeholder="Ingredient"
//                 value={newShoppingItem.ingredient}
//                 onChange={(e) => handleShoppingItemChange('ingredient', e.target.value)}
//                 className="shopping-item-input"
//                 required
//               />
//               <input
//                 type="text"
//                 placeholder="Qty"
//                 value={newShoppingItem.quantity}
//                 onChange={(e) => handleShoppingItemChange('quantity', e.target.value)}
//                 className="shopping-item-qty"
//               />
//               <input
//                 type="text"
//                 placeholder="Unit"
//                 value={newShoppingItem.unit}
//                 onChange={(e) => handleShoppingItemChange('unit', e.target.value)}
//                 className="shopping-item-unit"
//               />
//               <button type="submit" className="add-item-btn">Add</button>
//             </form>
            
//             <div className="shopping-items">
//               {mealPlan.shoppingList && mealPlan.shoppingList.length > 0 ? (
//                 mealPlan.shoppingList.map(item => (
//                   <div 
//                     key={item._id} 
//                     className={`shopping-item ${item.purchased ? 'purchased' : ''}`}
//                   >
//                     <div className="item-checkbox">
//                       <input
//                         type="checkbox"
//                         checked={item.purchased}
//                         onChange={() => handleTogglePurchased(item._id, item.purchased)}
//                       />
//                     </div>
//                     <div className="item-details">
//                       <span className="item-name">{item.ingredient}</span>
//                       {item.quantity && (
//                         <span className="item-quantity">{item.quantity}</span>
//                       )}
//                       {item.unit && (
//                         <span className="item-unit">{item.unit}</span>
//                       )}
//                     </div>
//                     <button 
//                       onClick={() => handleRemoveShoppingItem(item._id)}
//                       className="remove-meal-btn"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
//                   Your shopping list is empty. Add ingredients above.
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
        
//         {showChat && (
//           <div className="chat-panel">
//             <div className="chat-header">
//               <h3>Planning Chat</h3>
//             </div>
            
//             <div className="chat-messages">
//               {messages.length > 0 ? (
//                 messages.map(message => {
//                   if (message.type === 'system') {
//                     return (
//                       <div key={message.id} className="system-message">
//                         <div className="message-text">{message.text}</div>
//                         <div className="message-time">{formatTimestamp(message.timestamp)}</div>
//                       </div>
//                     );
//                   } else {
//                     const isCurrentUser = message.sender.userId === userId;
                    
//                     return (
//                       <div 
//                         key={message.id} 
//                         className={`user-message ${isCurrentUser ? 'current-user' : 'other-user'}`}
//                       >
//                         <div 
//                           className="message-avatar"
//                           style={{ backgroundColor: message.sender.color }}
//                         >
//                           {message.sender.username.charAt(0).toUpperCase()}
//                         </div>
//                         <div className="message-content">
//                           <div className="message-sender">{isCurrentUser ? 'You' : message.sender.username}</div>
//                           <div className="message-text">{message.text}</div>
//                           <div className="message-time">{formatTimestamp(message.timestamp)}</div>
//                         </div>
//                       </div>
//                     );
//                   }
//                 })
//               ) : (
//                 <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
//                   No messages yet. Start the conversation!
//                 </div>
//               )}
//               <div ref={messagesEndRef} />
//             </div>
            
//             <form onSubmit={sendMessage} className="chat-input-form">
//               <input
//                 type="text"
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 placeholder="Type a message..."
//                 className="chat-input"
//               />
//               <button type="submit" className="chat-send-btn">Send</button>
//             </form>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CollaborativeMealPlanner;