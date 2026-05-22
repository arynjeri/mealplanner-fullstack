const express = require('express');
const Recipe = require('../models/Recipe');
const MealPlan = require('../models/MealPlan');

// 1. Get all mealplans
exports.getAllMeals = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let filter = {};

        if (startDate && endDate) {
            filter.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const meals = await MealPlan.find(filter).populate('meals.recipe');
        res.json(meals);
    } catch (error) {
        console.error('Error fetching meals:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2. Get a single day's mealplan
exports.getMealByDate = async (req, res, next) => {
    try {
        const { date } = req.params;

        const mealPlan = await MealPlan.findOne({ date }).populate('meals.recipe');

        if (!mealPlan) {
            return res.status(404).json({ message: `Meal plan not found for the specified date: ${date}` });
        }
        res.json(mealPlan);
    } catch (error) {
        console.error('Error fetching meal plan:', error);
        next(error);
    }
};

//Get  a specific meal slot
exports.getMealSlot = async (req, res, next) => {
    try {
        const { date, slot } = req.params;

        if (!(date.match(/^\d{4}-\d{2}-\d{2}$/))){
            return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD.' });
        };

        const plan = await MealPlan.findOne({ date }).populate('meals.recipe');
        if (!plan) {
            return res.status(404).json({ message: `No meal plan found for date: ${date}` });
        }

        const targetSlot = plan.meals.find(m => m.slot.toLowerCase() === slot.toLowerCase());
        if (!targetSlot) {
            return res.status(404).json({ message: `Slot '${slot}' not found for date: ${date}` });
        }
        res.status(200).json({
            date: plan.date,
            slot: targetSlot.slot,
            recipes: targetSlot.recipe,
            notes: targetSlot.notes
        });
        } catch (errror) {
            console.error('Error fetching specific meal slot:', error);
            next(error);
        }
            
        };
// 3. Create a single meal slot 
exports.createMealSlot = async (req, res, next) => {
    try {
        const { date, slot, recipeIds, notes } = req.body;

        if (!date || !slot || !Array.isArray(recipeIds) || recipeIds.length === 0) {
            return res.status(400).json({ message: 'Date, slot, and an array of recipeIds are required.' });
        }

        //verify ID exists
       const validRecipesCount = await Recipe.countDocuments({ _id: { $in: recipeIds } });
        if (validRecipesCount !== recipeIds.length) {
            return res.status(400).json({ 
                message: 'Validation failed: One or more provided recipe IDs do not exist in your catalog.' 
            });
        }
        let plan = await MealPlan.findOne({ date });

        if (plan) {
            // Check if this specific slot already exists on this day
            const slotExists = plan.meals.some(m => m.slot === slot);
            if (slotExists) {
                return res.status(409).json({ 
                    message: `The ${slot} slot already exists for ${date}. Use the specific update endpoint instead.` 
                });
            }
            
            // If the day exists but the slot is fresh, push it
            plan.meals.push({ slot, recipe: recipeIds, notes });
        } else {
            // If the day is completely new, initialize the document
            plan = new MealPlan({
                date,
                meals: [{ slot, recipe: recipeIds, notes }]
            });
        }

        await plan.save();
        await plan.populate('meals.recipe');
        res.status(201).json(plan);
    } catch (error) {
        console.error('Error creating meal slot:', error);
        next(error);
    }
};

// 4. Update a single meal slot for a specific date and slot
exports.updateSpecificMealSlot = async (req, res, next) => {
    try {
        const { date, slot } = req.params;
        const { recipeIds, notes } = req.body; 
        if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
            return res.status(400).json({ message: 'An array of recipeIds is required to perform an update.' });
        }
        //verify ID exists
        const validRecipesCount = await Recipe.countDocuments({ _id: { $in: recipeIds } });
        if (validRecipesCount !== recipeIds.length) {
            return res.status(400).json({ 
                message: 'Update failed: One or more provided recipe IDs do not exist in your catalog.' 
            });
        }       

        const plan = await MealPlan.findOne({ date });
        if (!plan) {
            return res.status(404).json({ message: `No meal plan document found for date: ${date}` });
        }
        // Locate the index of the target slot array item
        const slotIndex = plan.meals.findIndex(m => m.slot === slot);
        if (slotIndex === -1) {
            return res.status(404).json({ message: `Slot '${slot}' has not been planned yet for ${date}. Create it first.` });
        }
     //compare existing saved IDs with incoming IDs
        const existingIds = plan.meals[slotIndex].recipe.map(id => id.toString()).sort();
        const incomingIds = recipeIds.map(id => id.toString()).sort();
        
        const isExactlyTheSame = existingIds.length === incomingIds.length && 
                                 existingIds.every((id, index) => id === incomingIds[index]);

        if (isExactlyTheSame && notes === plan.meals[slotIndex].notes) {
            return res.status(400).json({ 
                message: "No changes detected. The recipe IDs and notes you provided match what is already saved in this slot." 
            });
        }


        plan.meals[slotIndex].recipe = recipeIds;
        if (notes !== undefined) plan.meals[slotIndex].notes = notes;

        await plan.save();
        await plan.populate('meals.recipe');
        
        res.status(200).json(plan);
    } catch (error) {
        console.error('Error updating specific meal slot:', error);
        next(error);
    }
};

// 5. Update an entire day's meal array layout by date
exports.updateMealPlan = async (req, res, next) => {
    try {
        const { date } = req.params;
        const { meals } = req.body;

        if (!meals || !Array.isArray(meals)) {
            return res.status(400).json({ message: 'Please provide a valid meals array layout.' });
        }

        const updatePlan = await MealPlan.findOneAndUpdate(
            { date },
            { meals },
            { runValidators: true, returnDocument: 'after' }
        ).populate('meals.recipe');

        if (!updatePlan) {
            return res.status(404).json({ message: `Meal plan not found for the specified date: ${date}` });
        }
        res.json(updatePlan);
    } catch (error) {
        console.error('Error updating meal plan:', error);
        next(error);
    }
};

// 6. Delete an entire mealplan document by date
exports.deleteEntireMealPlan = async (req, res, next) => {
    try {
        const { date } = req.params;

        const deletedPlan = await MealPlan.findOneAndDelete({ date });

        // FIXED: Renamed from deletePlan to deletedPlan to match variable scope declaration above
        if (!deletedPlan) {
            return res.status(404).json({ message: `Meal plan not found for the specified date: ${date}` });
        }
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        console.error('Error deleting entire meal plan:', error);
        next(error);
    }
};

// 7. Delete a specific single slot out of a day's array
exports.deleteMealSlot = async (req, res, next) => {
    try {
        const { date, slot } = req.params;

        const plan = await MealPlan.findOne({ date });
        if (!plan) {
           
            return res.status(404).json({ message: `No meal plan found for date: ${date}` });
        }

        plan.meals = plan.meals.filter(m => m.slot !== slot);

        if (plan.meals.length === 0) {
            await MealPlan.findByIdAndDelete(plan._id);
            return res.status(204).json({ status: 'success', data: null });
        }
        await plan.save();
        await plan.populate('meals.recipe');
        res.status(200).json(plan);
    } catch (error) {
        console.error('Error removing specific meal slot:', error);
        next(error);
    }
};