const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict to your domain
    methods: ["GET", "POST"]
  }
});

// Log API key availability for debugging
const API_KEY = process.env.REACT_APP_API;
console.log('API Key available:', !!API_KEY);

// Connect to MongoDB with improved error handling and options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cookbook', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  retryWrites: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
});

// Add connection event handlers
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('MongoDB connected successfully');
});

// Meal Plan Schema
const mealPlanSchema = new mongoose.Schema({
  name: String, // Name of the meal plan (e.g., "Family Menu - Week of July 10")
  startDate: Date,
  endDate: Date,
  days: [{
    date: Date,
    meals: {
      breakfast: {
        recipeId: String,
        title: String,
        notes: String,
        assignedTo: String
      },
      lunch: {
        recipeId: String,
        title: String,
        notes: String,
        assignedTo: String
      },
      dinner: {
        recipeId: String,
        title: String,
        notes: String,
        assignedTo: String
      },
      snacks: [{
        recipeId: String,
        title: String,
        notes: String
      }]
    }
  }],
  shoppingList: [{
    ingredient: String,
    quantity: String,
    unit: String,
    purchased: Boolean,
    addedBy: String
  }],
  activeUsers: [{
    userId: String,
    username: String,
    color: String,
    lastActive: Date
  }],
  createdAt: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now }
});

// NEW: Recipe Comments and Ratings Schemas
const recipeCommentSchema = new mongoose.Schema({
  recipeId: String,
  userId: String,
  username: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const recipeRatingSchema = new mongoose.Schema({
  recipeId: String,
  userId: String,
  username: String,
  rating: Number,
  timestamp: { type: Date, default: Date.now }
});

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
// NEW: Recipe community models
const RecipeComment = mongoose.model('RecipeComment', recipeCommentSchema);
const RecipeRating = mongoose.model('RecipeRating', recipeRatingSchema);

// NEW: Track active users by recipe
const activeRecipeUsers = {};

// API Routes for Meal Plans
app.get('/api/mealplans', async (req, res) => {
  try {
    console.log('Fetching all meal plans');
    const mealPlans = await MealPlan.find().sort({ createdAt: -1 });
    console.log(`Found ${mealPlans.length} meal plans`);
    res.json(mealPlans);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/mealplans/:id', async (req, res) => {
  try {
    console.log(`Fetching meal plan with ID: ${req.params.id}`);
    const mealPlan = await MealPlan.findById(req.params.id);
    
    if (!mealPlan) {
      console.log('Meal plan not found');
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    console.log(`Meal plan found with name: ${mealPlan.name}, days: ${mealPlan.days?.length || 0}`);
    res.json(mealPlan);
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mealplans', async (req, res) => {
  try {
    console.log('Creating new meal plan with data:', req.body);
    
    // Create a meal plan with 7 days starting from the provided start date
    const startDate = new Date(req.body.startDate);
    console.log('Start date:', startDate);
    
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      days.push({
        date: date,
        meals: {
          breakfast: { title: '', recipeId: '', notes: '', assignedTo: '' },
          lunch: { title: '', recipeId: '', notes: '', assignedTo: '' },
          dinner: { title: '', recipeId: '', notes: '', assignedTo: '' },
          snacks: []
        }
      });
    }
    
    console.log(`Created ${days.length} days for the meal plan`);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const newMealPlan = new MealPlan({
      name: req.body.name || `Meal Plan - Week of ${startDate.toLocaleDateString()}`,
      startDate: startDate,
      endDate: endDate,
      days: days,
      shoppingList: [],
      activeUsers: []
    });
    
    const savedMealPlan = await newMealPlan.save();
    console.log('Saved new meal plan with ID:', savedMealPlan._id);
    res.status(201).json(savedMealPlan);
  } catch (error) {
    console.error('Error creating meal plan:', error);
    res.status(400).json({ error: error.message });
  }
});

// Fix meal plan endpoint - add this new endpoint
app.post('/api/mealplans/:id/fix', async (req, res) => {
  try {
    console.log(`Attempting to fix meal plan with ID: ${req.params.id}`);
    const mealPlan = await MealPlan.findById(req.params.id);
    
    if (!mealPlan) {
      console.log('Meal plan not found');
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    console.log('Found meal plan to fix:', mealPlan.name);
    console.log('Current days count:', mealPlan.days?.length || 0);
    
    // Create a 7-day array if it's empty
    if (!mealPlan.days || mealPlan.days.length === 0) {
      const startDate = new Date(mealPlan.startDate);
      const days = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        days.push({
          date: date,
          meals: {
            breakfast: { title: '', recipeId: '', notes: '', assignedTo: '' },
            lunch: { title: '', recipeId: '', notes: '', assignedTo: '' },
            dinner: { title: '', recipeId: '', notes: '', assignedTo: '' },
            snacks: []
          }
        });
      }
      
      mealPlan.days = days;
      console.log('Added days to meal plan:', days.length);
      
      await mealPlan.save();
      console.log('Meal plan saved with days');
    }
    
    res.json(mealPlan);
  } catch (error) {
    console.error('Error fixing meal plan:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get recipes (to add to meal plan) - Integrated with Spoonacular API
app.get('/api/recipes/summary', async (req, res) => {
  try {
    const API_KEY = process.env.REACT_APP_API;
    
    if (!API_KEY) {
      return res.status(500).json({ error: "API key is not available" });
    }
    
    // Make a request to Spoonacular API to get some recipes
    const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
      params: {
        apiKey: API_KEY,
        number: 10, // Limit to 10 recipes
        sort: 'popularity', // Sort by popularity
        addRecipeInformation: true // Include basic recipe info
      }
    });
    
    // Transform the response to match what our meal planner expects
    const formattedRecipes = response.data.results.map(recipe => ({
      _id: recipe.id.toString(), // Convert id to string to match MongoDB format
      title: recipe.title
    }));
    
    res.json(formattedRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: error.message });
  }
});

// NEW: API endpoint to get recipe comments
app.get('/api/recipes/:recipeId/comments', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const comments = await RecipeComment.find({ recipeId }).sort({ timestamp: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching recipe comments:', error);
    res.status(500).json({ error: error.message });
  }
});

// NEW: API endpoint to get recipe ratings
app.get('/api/recipes/:recipeId/ratings', async (req, res) => {
  try {
    const { recipeId } = req.params;
    const ratings = await RecipeRating.find({ recipeId });
    
    // Calculate average rating
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length
      : 0;
    
    res.json({
      ratings,
      averageRating,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Error fetching recipe ratings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Socket.io connection handling for meal planning
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // User joins a meal planning session
  socket.on('join-mealplan', async ({ mealPlanId, userId, username, color }) => {
    try {
      console.log(`User ${username} (${userId}) joining meal plan ${mealPlanId}`);
      
      // Join the meal plan's room
      socket.join(mealPlanId);
      
      // Add user to active planners or update last active time
      await MealPlan.findByIdAndUpdate(mealPlanId, {
        $pull: { activeUsers: { userId: userId } }
      });
      
      await MealPlan.findByIdAndUpdate(mealPlanId, {
        $push: { 
          activeUsers: { 
            userId, 
            username, 
            color,
            lastActive: new Date()
          } 
        }
      });
      
      // Fetch current meal plan data
      const mealPlan = await MealPlan.findById(mealPlanId);
      
      if (!mealPlan) {
        console.error(`Meal plan ${mealPlanId} not found`);
        socket.emit('error', { message: 'Meal plan not found' });
        return;
      }
      
      console.log(`Found meal plan: ${mealPlan.name}, days: ${mealPlan.days?.length || 0}`);
      
      // If no days, try to fix the meal plan
      if (!mealPlan.days || mealPlan.days.length === 0) {
        console.log(`Fixing meal plan ${mealPlanId} - missing days`);
        
        const startDate = new Date(mealPlan.startDate || new Date());
        const days = [];
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          
          days.push({
            date: date,
            meals: {
              breakfast: { title: '', recipeId: '', notes: '', assignedTo: '' },
              lunch: { title: '', recipeId: '', notes: '', assignedTo: '' },
              dinner: { title: '', recipeId: '', notes: '', assignedTo: '' },
              snacks: []
            }
          });
        }
        
        mealPlan.days = days;
        console.log(`Added ${days.length} days to meal plan`);
        
        await mealPlan.save();
        console.log('Saved fixed meal plan');
      }
      
      // Send current meal plan data to the joining user
      console.log(`Emitting meal plan data to user ${username}`);
      socket.emit('mealplan-data', mealPlan);
      
      // Notify all users in the room about the new user
      io.to(mealPlanId).emit('user-joined', { userId, username, color });
      
      // Send the list of active users to the joining user
      socket.emit('active-users', mealPlan.activeUsers);
    } catch (error) {
      console.error('Error joining meal plan:', error);
      socket.emit('error', { message: 'Failed to join meal planning session' });
    }
  });

  // NEW: User joins a recipe (for community features)
  socket.on('join-recipe', async ({ recipeId, userId, username }) => {
    try {
      console.log(`User ${username} (${userId}) joining recipe ${recipeId}`);
      
      // Join the recipe's room
      socket.join(`recipe:${recipeId}`);
      
      // Track active users for this recipe
      if (!activeRecipeUsers[recipeId]) {
        activeRecipeUsers[recipeId] = [];
      }
      
      // Add user to active users if not already there
      if (!activeRecipeUsers[recipeId].some(user => user.userId === userId)) {
        activeRecipeUsers[recipeId].push({ userId, username, socketId: socket.id });
      }
      
      // Fetch existing comments and ratings for this recipe
      const comments = await RecipeComment.find({ recipeId }).sort({ timestamp: -1 }).limit(50);
      const ratings = await RecipeRating.find({ recipeId }).sort({ timestamp: -1 }).limit(10);
      
      // Calculate average rating
      const allRatings = await RecipeRating.find({ recipeId });
      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length 
        : 0;
      
      console.log(`Recipe ${recipeId}: ${comments.length} comments, ${ratings.length} ratings, avg rating: ${averageRating}`);
      
      // Send data to the user
      socket.emit('recipe-data', {
        comments,
        ratings,
        averageRating,
        totalRatings: allRatings.length,
        activeUsers: activeRecipeUsers[recipeId]
      });
      
    } catch (error) {
      console.error('Error joining recipe:', error);
      socket.emit('error', { message: 'Failed to fetch recipe data' });
    }
  });
  
  // NEW: User adds a comment to a recipe
  socket.on('add-comment', async (commentData) => {
    try {
      console.log(`User ${commentData.username} adding comment to recipe ${commentData.recipeId}`);
      
      // Create and save new comment
      const newComment = new RecipeComment(commentData);
      await newComment.save();
      
      // Broadcast to all users viewing this recipe
      io.to(`recipe:${commentData.recipeId}`).emit('comment-added', newComment);
      
    } catch (error) {
      console.error('Error adding comment:', error);
      socket.emit('error', { message: 'Failed to add comment' });
    }
  });
  
  // NEW: User adds or updates a rating for a recipe
  socket.on('add-rating', async ({ recipeId, userId, username, rating, timestamp }) => {
    try {
      console.log(`User ${username} rating recipe ${recipeId}: ${rating} stars`);
      
      // Check if user already rated this recipe
      let ratingDoc = await RecipeRating.findOne({ recipeId, userId });
      
      if (ratingDoc) {
        // Update existing rating
        console.log(`Updating existing rating for user ${username}`);
        ratingDoc.rating = rating;
        ratingDoc.timestamp = timestamp;
        await ratingDoc.save();
      } else {
        // Create new rating
        console.log(`Creating new rating for user ${username}`);
        ratingDoc = new RecipeRating({ recipeId, userId, username, rating, timestamp });
        await ratingDoc.save();
      }
      
      // Calculate new average
      const allRatings = await RecipeRating.find({ recipeId });
      const averageRating = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length;
      
      console.log(`New average rating for recipe ${recipeId}: ${averageRating} (${allRatings.length} ratings)`);
      
      // Broadcast to all users viewing this recipe
      io.to(`recipe:${recipeId}`).emit('rating-updated', {
        rating: ratingDoc,
        averageRating,
        totalRatings: allRatings.length
      });
      
    } catch (error) {
      console.error('Error updating rating:', error);
      socket.emit('error', { message: 'Failed to update rating' });
    }
  });
  
  // Handle meal plan name updates
  socket.on('update-mealplan-name', async ({ mealPlanId, name, userId }) => {
    try {
      await MealPlan.findByIdAndUpdate(mealPlanId, { 
        name, 
        lastModified: Date.now() 
      });
      
      // Broadcast the change to all users except the sender
      socket.to(mealPlanId).emit('mealplan-name-updated', { name, userId });
    } catch (error) {
      console.error('Error updating meal plan name:', error);
      socket.emit('error', { message: 'Failed to update meal plan name' });
    }
  });
  
  socket.on('update-meal-plan-days', async ({ mealPlanId, days, userId }) => {
    try {
      console.log(`User ${userId} is updating days for meal plan ${mealPlanId}`);
      console.log(`Adding ${days.length} days to the meal plan`);
      
      // Find the meal plan
      const mealPlan = await MealPlan.findById(mealPlanId);
      
      if (!mealPlan) {
        console.error('Meal plan not found');
        socket.emit('meal-plan-days-error', { message: 'Meal plan not found' });
        return;
      }
      
      // Update the days array
      mealPlan.days = days;
      
      // Save the changes
      await mealPlan.save();
      console.log('Meal plan days updated successfully');
      
      // Send confirmation back to the client who made the request
      socket.emit('meal-plan-days-updated', mealPlan);
      
      // Broadcast the updated meal plan to all other users in the room
      socket.to(mealPlanId).emit('mealplan-data', mealPlan);
      
    } catch (error) {
      console.error('Error updating meal plan days:', error);
      socket.emit('meal-plan-days-error', { message: 'Failed to update meal plan days' });
    }
  });
  
  // Handle adding items to shopping list
  socket.on('add-shopping-item', async ({ mealPlanId, item, userId }) => {
    try {
      await MealPlan.findByIdAndUpdate(mealPlanId, {
        $push: { 
          shoppingList: {
            ...item,
            purchased: false,
            addedBy: userId
          }
        },
        lastModified: Date.now()
      });
      
      // Broadcast the change to all users including the sender
      io.to(mealPlanId).emit('shopping-item-added', { 
        item: {
          ...item,
          purchased: false,
          addedBy: userId
        }, 
        userId 
      });
    } catch (error) {
      console.error('Error adding shopping item:', error);
      socket.emit('error', { message: 'Failed to add shopping item' });
    }
  });
  
  // Handle updating shopping item (marking as purchased)
  socket.on('update-shopping-item', async ({ mealPlanId, itemId, updates, userId }) => {
    try {
      const mealPlan = await MealPlan.findById(mealPlanId);
      const itemIndex = mealPlan.shoppingList.findIndex(item => item._id.toString() === itemId);
      
      if (itemIndex === -1) {
        throw new Error('Shopping item not found');
      }
      
      // Update the specific fields of the shopping item
      Object.keys(updates).forEach(key => {
        mealPlan.shoppingList[itemIndex][key] = updates[key];
      });
      
      mealPlan.markModified('shoppingList');
      mealPlan.lastModified = Date.now();
      await mealPlan.save();
      
      // Broadcast the change to all users
      io.to(mealPlanId).emit('shopping-item-updated', { 
        itemId, 
        updates,
        userId 
      });
    } catch (error) {
      console.error('Error updating shopping item:', error);
      socket.emit('error', { message: 'Failed to update shopping item' });
    }
  });
  
  // Handle removing shopping items
  socket.on('remove-shopping-item', async ({ mealPlanId, itemId, userId }) => {
    try {
      // Use mongoose.Types.ObjectId to convert string ID to ObjectId
      const objectId = new mongoose.Types.ObjectId(itemId);
      
      await MealPlan.findByIdAndUpdate(mealPlanId, {
        $pull: { shoppingList: { _id: objectId } },
        lastModified: Date.now()
      });
      
      // Broadcast the change to all users
      io.to(mealPlanId).emit('shopping-item-removed', { itemId, userId });
    } catch (error) {
      console.error('Error removing shopping item:', error);
      socket.emit('error', { message: 'Failed to remove shopping item' });
    }
  });
  
  // Handle chat messages
  socket.on('send-message', ({ mealPlanId, message, userId }) => {
    // Broadcast the message to all users in the room
    io.to(mealPlanId).emit('message-received', { 
      message, 
      userId, 
      timestamp: Date.now() 
    });
  });
  
  // Handle user disconnect
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    try {
      // Find all meal plans where this user was active
      const mealPlans = await MealPlan.find({ 'activeUsers.userId': socket.id });
      
      for (const mealPlan of mealPlans) {
        // Remove user from active users
        await MealPlan.findByIdAndUpdate(mealPlan._id, {
          $pull: { activeUsers: { userId: socket.id } }
        });
        
        // Notify others that user has left
        io.to(mealPlan._id.toString()).emit('user-left', { userId: socket.id });
      }
      
      // NEW: Clean up activeRecipeUsers
      Object.keys(activeRecipeUsers).forEach(recipeId => {
        const userIndex = activeRecipeUsers[recipeId].findIndex(user => user.socketId === socket.id);
        
        if (userIndex !== -1) {
          activeRecipeUsers[recipeId].splice(userIndex, 1);
          
          // If no active users left for this recipe, clean up
          if (activeRecipeUsers[recipeId].length === 0) {
            delete activeRecipeUsers[recipeId];
          }
        }
      });
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});