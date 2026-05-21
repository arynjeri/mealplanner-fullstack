const Recipe = require('../models/Recipe');

//Get all recipes
exports.getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//Create a new recipe
exports.createRecipe = async (req, res) => {
    const { name, tags, ingredients, instructions, image } = req.body;

    if (!name || !tags || !ingredients || !instructions) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newRecipe = new Recipe({
            name,
            tags,
            ingredients,
            instructions,
            image: image || ''
        });

        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe);
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//Get a single recipe by ID
exports.getRecipeById = async (req, res) => {
    const { id } = req.params;

    try {
        const recipe = await Recipe.findById(id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//Update a recipe by ID
exports.updateRecipe = async (req, res) => {
    const { id } = req.params;
    const { name, tags, ingredients, instructions, image } = req.body;

    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id,
            { name, tags, ingredients, instructions, image: image || '' },
            { new: true }
        );

        if (!updatedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.json(updatedRecipe);
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

//Delete a recipe by ID
exports.deleteRecipe = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRecipe = await Recipe.findByIdAndDelete(id);
        if (!deletedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

