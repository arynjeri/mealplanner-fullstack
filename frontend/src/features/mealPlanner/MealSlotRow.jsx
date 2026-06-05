import { useState } from 'react';

export default function MealSlotRow({ slotName, slotData, availableRecipes, onAssignRecipe, onDeleteSlot, isPast }) {
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [notes, setNotes] = useState(slotData?.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const currentRecipes = slotData?.recipe || slotData?.recipes || [];

  const handleAddRecipeSubmit = (e) => {
    e.preventDefault();
    if (!selectedRecipeId || isPast) return;

    const updatedRecipeIds = [...currentRecipes.map(r => r._id || r), selectedRecipeId];
    onAssignRecipe(slotName, updatedRecipeIds, notes || slotData?.notes);
    setSelectedRecipeId(''); 
  };

  const handleSaveNotes = () => {
    if (isPast) return;
    const recipeIds = currentRecipes.map(r => r._id || r);
    onAssignRecipe(slotName, recipeIds, notes);
    setIsEditingNotes(false);
  };

  const handleRemoveIndividualRecipe = (recipeIdToRemove) => {
    if (isPast) return;
    const updatedRecipeIds = currentRecipes
      .map(r => r._id || r)
      .filter(id => id !== recipeIdToRemove);

    if (updatedRecipeIds.length === 0) {
      onDeleteSlot(slotName);
    } else {
      onAssignRecipe(slotName, updatedRecipeIds, slotData?.notes);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-h-[340px] overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
        <div>
          <span className="capitalize font-black text-slate-800 text-base tracking-tight block">
            {slotName}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {currentRecipes.length} {currentRecipes.length === 1 ? 'item' : 'items'} scheduled
          </span>
        </div>

        {/* Only show selector if date is active */}
        {!isPast ? (
          <form onSubmit={handleAddRecipeSubmit} className="flex items-center gap-1.5 flex-1 max-w-xs sm:justify-end">
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
              required
            >
              <option value="">+ Add Menu Item</option>
              {availableRecipes.map((recipe) => (
                <option key={recipe._id} value={recipe._id}>
                  {recipe.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!selectedRecipeId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs p-2 rounded-xl transition-all disabled:opacity-40 flex-shrink-0 shadow-sm"
            >
              ✓
            </button>
          </form>
        ) : (
          <span className="text-[10px] bg-slate-100 text-slate-400 font-bold border border-slate-200 rounded-xl px-2.5 py-1.5">
            Locked History
          </span>
        )}
      </div>

      {/* BODY CARDS VIEW */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Render stacked food items list (Always visible even on past dates!) */}
        <div className="space-y-2 max-h-45 overflow-y-auto pr-1">
          {currentRecipes.length > 0 ? (
            currentRecipes.map((food, idx) => (
              <div key={food._id || idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center justify-between gap-3 transition-colors group">
                <div className="flex items-center gap-2.5 min-w-0">
                  {food.image && (
                    <img src={food.image} alt={food.name} className="w-9 h-9 rounded-lg object-cover shadow-sm flex-shrink-0" />
                  )}
                  <h4 className="font-bold text-slate-800 text-xs truncate">{food.name || "Alternative"}</h4>
                </div>
                
                {/* HIDE ITEM DISMISS BUTTON ON PAST RECORDS */}
                {!isPast && (
                  <button 
                    onClick={() => handleRemoveIndividualRecipe(food._id || food)}
                    className="text-slate-300 hover:text-rose-600 font-bold px-1.5 py-0.5 text-xs transition-colors rounded-md hover:bg-rose-50"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="h-28 flex items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
              <p className="text-xs text-slate-400 italic">No meals planned.</p>
            </div>
          )}
        </div>

        {/* BOTTOM NOTES SECTION */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {currentRecipes.length > 0 && (
            <div className="bg-amber-50/50 border border-amber-100/70 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">Notes</span>
                {/* DISABLE NOTE INTERACTIVE EDITOR IF HISTORIC RECORD */}
                {!isPast && (
                  <>
                    {!isEditingNotes ? (
                      <button onClick={() => setIsEditingNotes(true)} className="text-[10px] text-slate-400 font-bold">Edit</button>
                    ) : (
                      <button onClick={handleSaveNotes} className="text-[10px] text-emerald-600 font-bold hover:underline">Save</button>
                    )}
                  </>
                )}
              </div>
              {!isEditingNotes ? (
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {slotData?.notes ? `“${slotData.notes}”` : "No special prep notes added."}
                </p>
              ) : (
                <input 
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              )}
            </div>
          )}

          {/* HIDE ENTIRE CLEAN UTILITY IF HISTORIC BLOCK ROW TARGETED */}
          {currentRecipes.length > 0 && !isPast && (
            <div className="flex justify-end pt-1">
              <button 
                onClick={() => onDeleteSlot(slotName)}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
              >
                Clear Entire Slot
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}