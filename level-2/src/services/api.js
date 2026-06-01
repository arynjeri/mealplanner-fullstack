const API_BASE_URL = 'http://localhost:5000/api';

export const mealAPI = {
  // Fetches all meals. If you pass a specific date range, it filters them.
  getMealPlans: async (startDate, endDate) => {
    const url = startDate && endDate 
      ? `${API_BASE_URL}/meals?startDate=${startDate}&endDate=${endDate}`
      : `${API_BASE_URL}/meals`;
      
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to retrieve calendar meal records.');
    return response.json(); // Directly returns the raw array from your controller
  },

  // Calls your exports.createMealSlot backend controller
  createMealSlot: async (mealData) => {
    const response = await fetch(`${API_BASE_URL}/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mealData), // Sends { date, slot, recipeIds, notes }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to pin meal slot.');
    }
    return response.json();
  }
};

export const recipeAPI = {
  getAllRecipes: async () => {
    const response = await fetch(`${API_BASE_URL}/recipes`);
    if (!response.ok) throw new Error('Failed to download recipe catalog.');
    return response.json();
  }
};