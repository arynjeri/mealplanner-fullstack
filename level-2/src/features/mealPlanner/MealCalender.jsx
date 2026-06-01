import { useState, useEffect, useContext } from 'react'; // 🟢 Added useContext
import { AuthContext } from '../../context/AuthContext';   // 🟢 Imported context
import MealSlotRow from './MealSlotRow';
import Loader from '../../components/Loader';

const API_BASE_URL = 'http://localhost:5000/api';

export default function MealCalendar() {
  const { token, logout } = useContext(AuthContext); // 🟢 Gather security token from store
  const [currentDate, setCurrentDate] = useState("2026-05-22");
  const [activeDayDocument, setActiveDayDocument] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper object to instantly build safe authorized header configurations
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // 🟢 Pass the token directly to Express protect guard
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const recipeRes = await fetch(`${API_BASE_URL}/recipes`);
      if (!recipeRes.ok) throw new Error('Failed to pull recipes.');
      const recipeData = await recipeRes.json();
      setRecipes(recipeData);

      // GET Single Day with Auth Headers
      const mealRes = await fetch(`${API_BASE_URL}/meals/${currentDate}`, {
        headers: { 'Authorization': `Bearer ${token}` } // 🟢 Protected read
      });
      
      if (mealRes.ok) {
        const mealData = await mealRes.json();
        setActiveDayDocument(mealData); 
      } else if (mealRes.status === 404) {
        setActiveDayDocument(null);
      } else if (mealRes.status === 401) {
        logout(); // Token expired or malicious, log out immediately
      } else {
        throw new Error('Could not pull calendar assets.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentDate]);

  const handleAssignRecipe = async (slot, recipeIds, notes) => {
    try {
      setLoading(true);
      const slotExists = activeDayDocument?.meals?.some(m => m.slot.toLowerCase() === slot.toLowerCase());

      let response;
      if (slotExists) {
        // PATCH existing slot
        response = await fetch(`${API_BASE_URL}/meals/${currentDate}/slots/${slot.toLowerCase()}`, {
          method: 'PATCH',
          headers: authHeaders, // 🟢 Protected update
          body: JSON.stringify({ recipeIds, notes }),
        });
      } else {
        // POST new slot
        response = await fetch(`${API_BASE_URL}/meals`, {
          method: 'POST',
          headers: authHeaders, // 🟢 Protected creation
          body: JSON.stringify({ date: currentDate, slot: slot.toLowerCase(), recipeIds, notes }),
        });
      }

      if (response.status === 401) return logout();
      if (!response.ok) throw new Error('Database validation error.');

      await loadDashboardData();
    } catch (err) {
      alert(`⚠️ Scheduling Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slot) => {
    if (!window.confirm(`Are you sure you want to clear all recipes from ${slot}?`)) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/meals/${currentDate}/slots/${slot.toLowerCase()}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` } // 🟢 Protected delete
      });

      if (response.status === 401) return logout();
      await loadDashboardData();
    } catch (err) {
      alert(`⚠️ Error clearing slot: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSlotData = (slotName) => {
    if (!activeDayDocument || !activeDayDocument.meals) return null;
    return activeDayDocument.meals.find(m => m.slot.toLowerCase() === slotName.toLowerCase()) || null;
  };

  if (loading && recipes.length === 0) return <Loader message="Connecting dynamic calendar grids..." />;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
      {/* Navbar segment with integrated Logout functionality */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <h2 className="text-xl font-black text-slate-800">Dynamic Meal Scheduler</h2>
        <button onClick={logout} className="text-xs bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-colors">
          Log Out
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-500">Perfectly synced with secure token authorization.</p>
        <input
          type="date"
          value={currentDate}
          onChange={(e) => setCurrentDate(e.target.value)}
          className="border border-slate-300 p-2.5 rounded-xl text-sm font-bold bg-white text-slate-800 focus:outline-emerald-500 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {['breakfast', 'lunch', 'dinner'].map((slotName) => (
          <MealSlotRow
            key={slotName}
            slotName={slotName}
            slotData={getSlotData(slotName)}
            availableRecipes={recipes}
            onAssignRecipe={handleAssignRecipe}
            onDeleteSlot={handleDeleteSlot} 
          />
        ))}
      </div>
    </div>
  );
}