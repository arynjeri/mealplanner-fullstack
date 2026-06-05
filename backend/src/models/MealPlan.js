const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  // Storing as YYYY-MM-DD string
  date: { 
    type: String, 
    required: true, 
    unique: true,
    match: /^\d{4}-\d{2}-\d{2}$/ 
  },
  meals: [{
    slot: { 
      type: String, 
      required: true, 
      enum: ['breakfast', 'lunch', 'dinner'] 
    },
    recipe: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Recipe', 
      required: true 
    }],
    notes: { type: String, trim: true }
  }]
}, { timestamps: true });

// Ensure a day cannot have duplicate slots (e.g., two breakfasts)
mealPlanSchema.index({ "date": 1, "meals.slot": 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);