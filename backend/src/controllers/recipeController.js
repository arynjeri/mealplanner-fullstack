const Recipe = require('../models/Recipe');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

exports.upload = multer({ storage: storage });

//Get all recipes
exports.getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ user: req.user.id});
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

    let imagePath = '';
    if(req.file) {
        imagePath = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    try {
        const newRecipe = new Recipe({
            name,
            tags,
            ingredients,
            instructions,
            image: imagePath,
            user: req.user.id
        });

        const savedRecipe = await newRecipe.save();
        req.io.emit('notification', { title: "Recipe Created", message: `Your recipe "${savedRecipe.name}" was successfully saved!` });
        res.status(201).json(savedRecipe);
    } catch (error) {
        console.error('Error creating recipe:', error);
        req.io.emit('notification', { title: " Recipe Creation Failed", message: "An error occurred while saving your recipe. Please try again." });
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
    
    try {
        // If req.body is completely missing, fall back to an empty object to avoid crashes
        const body = req.body || {};
        const { name, tags, ingredients, instructions } = body;

        // Form data fields arrive as strings; parse them back to clean arrays if needed
        const tagsArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
        const ingredientsArray = typeof ingredients === 'string' ? ingredients.split(',').map(i => i.trim()) : ingredients;

        // Build the update payload
        const updateData = {
            name,
            tags: tagsArray,
            ingredients: ingredientsArray,
            instructions
        };

        // If a brand new image file was selected during the edit, update the path url string
        if (req.file) {
            updateData.image = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        req.io.emit('notification', { title: " Recipe Updated", message: `Your recipe "${updatedRecipe.name}" was successfully updated!` });
        res.json(updatedRecipe);
    } catch (error) {
        console.error('Error updating recipe:', error);
        req.io.emit('notification', { title: " Recipe Update Failed", message: "An error occurred while updating your recipe. Please try again." });
        res.status(500).json({ message: 'Server error updating recipe.' });
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
        req.io.emit('notification', { title: "Recipe Deleted", message: `Your recipe "${deletedRecipe.name}" was successfully deleted!` });
        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        req.io.emit('notification', { title: "Recipe Deletion Failed", message: "An error occurred while deleting your recipe. Please try again." });
        res.status(500).json({ message: 'Server error' });
    }
};

