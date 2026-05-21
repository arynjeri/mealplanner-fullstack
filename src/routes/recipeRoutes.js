const express = require('express');
const recipeController = require('../controllers/recipeController');

const router = express.Router();

// Create a new recipe
router.post('/', recipeController.createRecipe);

// Get all recipes
router.get('/', recipeController.getAllRecipes);

// Get a single recipe by ID
router.get('/:id', recipeController.getRecipeById);

// Update a recipe by ID
router.put('/:id', recipeController.updateRecipe);

// Delete a recipe by ID
router.delete('/:id', recipeController.deleteRecipe);

module.exports = router;