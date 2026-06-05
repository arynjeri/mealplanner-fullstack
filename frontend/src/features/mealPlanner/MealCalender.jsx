import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import MealSlotRow from './MealSlotRow';
import Loader from '../../components/Loader';

const API_BASE_URL = 'http://localhost:5000/api';

export default function MealCalendar() {
  const { token, logout } = useContext(AuthContext);

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [currentDate, setCurrentDate] = useState(getTodayDateString());
  const [activeDayDocument, setActiveDayDocument] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const evaluateIfPastDate = () => {
    const selected = new Date(currentDate);
    selected.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return selected < today;
  };

  const isPast = evaluateIfPastDate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const recipeRes = await fetch(`${API_BASE_URL}/recipes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!recipeRes.ok) throw new Error('Failed to pull recipes.');
      const recipeData = await recipeRes.json();
      setRecipes(recipeData);

      const mealRes = await fetch(`${API_BASE_URL}/meals/${currentDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (mealRes.ok) {
        const mealData = await mealRes.json();
        setActiveDayDocument(mealData); 
      } else if (mealRes.status === 404) {
        setActiveDayDocument(null);
      } else if (mealRes.status === 401) {
        logout();
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
    if (token) loadDashboardData();
  }, [currentDate, token]);

  const handleAssignRecipe = async (slot, recipeIds, notes) => {
    if (isPast) return alert("Operation blocked: Historic planner logs are read-only!");
    
    try {
      setLoading(true);
      const slotExists = activeDayDocument?.meals?.some(m => m.slot.toLowerCase() === slot.toLowerCase());

      let response;
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      if (slotExists) {
        response = await fetch(`${API_BASE_URL}/meals/${currentDate}/slots/${slot.toLowerCase()}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ recipeIds, notes }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/meals`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ date: currentDate, slot: slot.toLowerCase(), recipeIds, notes }),
        });
      }

      if (response.status === 401) return logout();
      await loadDashboardData();
    } catch (err) {
      alert(`Scheduling Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slot) => {
    if (isPast) return alert("Operation blocked: Historic planner records cannot be dropped!");
    if (!window.confirm(`Are you sure you want to clear all recipes from ${slot}?`)) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/meals/${currentDate}/slots/${slot.toLowerCase()}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) return logout();
      await loadDashboardData();
    } catch (err) {
      alert(`Error clearing slot: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Clears all 3 slots specifically for the currently active day document
  const handleDeleteEntireDay = async () => {
    if (isPast) return alert("Operation blocked: Cannot clear historic data logs!");
    if (!activeDayDocument) return alert("There are no scheduled slots on this day to clear.");
    if (!window.confirm(`Are you sure you want to wipe the complete meal plan for ${currentDate}? This will remove Breakfast, Lunch, and Dinner rows simultaneously.`)) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/meals/${currentDate}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 401) return logout();
      await loadDashboardData();
    } catch (err) {
      alert(`Error deleting entire day: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSlotData = (slotName) => {
    if (!activeDayDocument || !activeDayDocument.meals) return null;
    return activeDayDocument.meals.find(m => m.slot.toLowerCase() === slotName.toLowerCase()) || null;
  };

  if (loading && recipes.length === 0) return <Loader message="Syncing calendar coordinates..." />;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
      
      {/* APP TOP PANEL LOGOUT ELEMENT */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <div>
          <h2 className="text-xl font-black text-slate-800">Dynamic Meal Scheduler</h2>
          <p className="text-xs text-slate-500">Scheduled meals.</p>
        </div>
        <button onClick={logout} className="text-xs bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition-colors cursor-pointer">
          Log Out
        </button>
      </div>

      {/* TARGETED OPERATIONAL ROW HEADER TOOLBAR PANEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            📅 : {currentDate}
          </span>
          {isPast && (
            <span className="text-[10px] font-black tracking-wide text-rose-600 bg-rose-50 border border-rose-150 rounded-md px-2 py-1 uppercase">
              🔒 Locked History 
            </span>
          )}
          {/* SPECIFIC DATE INNER ROW MASTER WIPE SWITCH BUTTON BUTTON BLOCK */}
          {activeDayDocument && !isPast && (
            <button
              onClick={handleDeleteEntireDay}
              className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              title={`Clear all 3 meal slots for ${currentDate}`}
            >
            Clear All Slots for This Day
            </button>
          )}
        </div>

        <input
          type="date"
          value={currentDate}
          onChange={(e) => setCurrentDate(e.target.value)}
          className="border border-slate-300 p-2 rounded-xl text-sm font-bold bg-slate-50 text-slate-800 focus:outline-emerald-500 shadow-sm"
        />
      </div>

      {/* INTERACTIVE ROWS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {['breakfast', 'lunch', 'dinner'].map((slotName) => (
          <MealSlotRow
            key={slotName}
            slotName={slotName}
            slotData={getSlotData(slotName)}
            availableRecipes={recipes}
            onAssignRecipe={handleAssignRecipe}
            onDeleteSlot={handleDeleteSlot} 
            isPast={isPast}
          />
        ))}
      </div>
    </div>
  );
}