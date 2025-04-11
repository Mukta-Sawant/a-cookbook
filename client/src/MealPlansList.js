// // src/MealPlansList.js
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import './MealPlansList.css';

// const MealPlansList = () => {
//   const [mealPlans, setMealPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [newPlanName, setNewPlanName] = useState('');
//   const [startDate, setStartDate] = useState(formatDate(new Date()));

//   useEffect(() => {
//     fetchMealPlans();
//   }, []);

//   const fetchMealPlans = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('http://localhost:5000/api/mealplans');
//       setMealPlans(response.data);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching meal plans:', error);
//       setLoading(false);
//     }
//   };

//   const handleCreatePlan = async (e) => {
//     e.preventDefault();
//     try {
//       const newPlan = {
//         name: newPlanName || `Meal Plan - Week of ${new Date(startDate).toLocaleDateString()}`,
//         startDate: startDate
//       };
      
//       const response = await axios.post('http://localhost:5000/api/mealplans', newPlan);
      
//       // Redirect to the new meal plan
//       window.location.href = `/mealplan/${response.data._id}`;
//     } catch (error) {
//       console.error('Error creating meal plan:', error);
//       alert('Failed to create meal plan');
//     }
//   };

//   function formatDate(date) {
//     const d = new Date(date);
//     let month = '' + (d.getMonth() + 1);
//     let day = '' + d.getDate();
//     const year = d.getFullYear();

//     if (month.length < 2) month = '0' + month;
//     if (day.length < 2) day = '0' + day;

//     return [year, month, day].join('-');
//   }

//   return (
//     <div className="meal-plans-container">
//       <h1>Meal Plans</h1>
      
//       <div className="create-plan-form">
//         <h2>Create New Plan</h2>
//         <form onSubmit={handleCreatePlan}>
//           <div className="form-group">
//             <label>Plan Name (optional)</label>
//             <input
//               type="text"
//               value={newPlanName}
//               onChange={(e) => setNewPlanName(e.target.value)}
//               placeholder="Family Meal Plan"
//               className="form-input"
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Start Date</label>
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="form-input"
//               required
//             />
//           </div>
          
//           <button type="submit" className="create-plan-btn">Create New Meal Plan</button>
//         </form>
//       </div>
      
//       <div className="meal-plans-list">
//         <h2>Your Meal Plans</h2>
        
//         {loading ? (
//           <p>Loading meal plans...</p>
//         ) : mealPlans.length === 0 ? (
//           <p>No meal plans yet. Create your first one above!</p>
//         ) : (
//           <div className="plans-grid">
//             {mealPlans.map(plan => (
//               <div key={plan._id} className="meal-plan-card">
//                 <h3>{plan.name}</h3>
//                 <p className="date-range">
//                   {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
//                 </p>
//                 <Link to={`/mealplan/${plan._id}`} className="view-plan-btn">
//                   Open Plan
//                 </Link>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MealPlansList;