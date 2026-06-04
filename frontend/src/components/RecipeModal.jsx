export default function RecipeModal({ recipe, onClose }) {
  if (!recipe) return null;

  // Fallback broken image handler
  const handleImgError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&auto=format&fit=crop&q=60";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner Image */}
        <div className="relative h-56 bg-slate-100 shrink-0">
          <img 
            src={recipe.image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&auto=format&fit=crop&q=60"} 
            alt={recipe.name} 
            onError={handleImgError}
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full p-2 text-xs font-bold transition-colors shadow-md"
          >
            ✕ Close
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Recipe Profile</span>
            <h2 className="text-2xl font-black text-slate-800 mt-1">{recipe.name}</h2>
            <div className="flex flex-wrap gap-1 mt-2">
              {recipe.tags?.map((tag, idx) => (
                <span key={idx} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Ingredients Section */}
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
              <span>📝</span> Required Ingredients
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.ingredients?.map((ingredient, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <input type="checkbox" className="accent-emerald-600 rounded" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-slate-100" />

          {/* Cooking Instructions Section */}
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
              <span>🍳</span> Preparation Instructions
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-emerald-50/40 border border-emerald-100/50 p-4 rounded-xl whitespace-pre-line">
              {recipe.instructions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}