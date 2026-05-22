const express = require('express');
const mealController = require('../controllers/mealController');
const router = express.Router();

// Get all meal plans
router.get('/', mealController.getAllMeals);

// Get a single day's meal plan by date
router.get('/:date', mealController.getMealByDate);

//Get a specific meal slot for a specific date
router.get('/:date/slots/:slot', mealController.getMealSlot);

// Create a new meal slot or update an existing one
router.post('/', mealController.createMealSlot);


// Update a meal slot for a specific date
router.put('/:date', mealController.updateMealPlan);

//changes to a specific slot
router.patch('/:date/slots/:slot', mealController.updateSpecificMealSlot);

//Delete  an entire meal plan for a specific date
router.delete('/:date', mealController.deleteEntireMealPlan);

// Delete a meal slot for a specific date and slot
router.delete('/:date/slots/:slot', mealController.deleteMealSlot);

module.exports = router;