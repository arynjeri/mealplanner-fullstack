import { useEffect, useState, useContext } from 'react'; // 🟢 Added useContext
import { AuthContext } from '../../context/AuthContext';   // 🟢 Imported security context
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import RecipeModal from '../../components/RecipeModal';

const API_BASE_URL = 'http://localhost:5000/api';

export default function RecipeList() {
  const { token, logout } = useContext(AuthContext); // 🟢 Read active bearer token from store
  const [recipes, setRecipes] = useState([]);        // Initialized safely as an empty array
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // --- FORM STATES ---
  const [newName, setNewName] = useState('');
  const [newTags, setNewTags] = useState(''); 
  const [newIngredients, setNewIngredients] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newImage, setNewImage] = useState('');

  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTags, setEditTags] = useState(''); 
  const [editIngredients, setEditIngredients] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editImage, setEditImage] = useState('');

  // Reusable helper to generate security headers automatically
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // 🟢 Attached token for backend validation check
  });

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      
      // 🟢 FIXED: Added authorization headers to pass your backend protect middleware safely
      const res = await fetch(`${API_BASE_URL}/recipes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        return logout(); // Token expired or bad session state, boot cleanly to login screen
      }

      const data = await res.json();
      
      // 🟢 FIXED SYSTEM GUARD: Always double-check that data is an array before setting state
      if (Array.isArray(data)) {
        setRecipes(data);
      } else {
        setRecipes([]); // Safe fallback to ensure .map() never loops over an error object
      }
    } catch (err) {
      console.error('Error loading recipes:', err);
      setRecipes([]); // Safe fallback on absolute network failure
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCatalog();
  }, [token]);

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    if (!newName || !newIngredients || !newInstructions || !newTags) return;

    const ingredientsArray = newIngredients.split(',').map(item => item.trim()).filter(item => item !== "");
    const tagsArray = newTags.split(',').map(item => item.trim()).filter(item => item !== "");

    try {
      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: 'POST',
        headers: getAuthHeaders(), // 🟢 Secured route mutation call
        body: JSON.stringify({
          name: newName,
          tags: tagsArray,
          ingredients: ingredientsArray,
          instructions: newInstructions,
          image: newImage || ''
        })
      });

      if (response.status === 401) return logout();
      if (response.ok) {
        setNewName('');
        setNewTags('');
        setNewIngredients('');
        setNewInstructions('');
        setNewImage('');
        await fetchCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (recipe) => {
    setEditingRecipeId(recipe._id);
    setEditName(recipe.name);
    setEditTags(recipe.tags ? recipe.tags.join(', ') : '');
    setEditIngredients(recipe.ingredients ? recipe.ingredients.join(', ') : '');
    setEditInstructions(recipe.instructions);
    setEditImage(recipe.image || '');
  };

  const handleUpdateRecipe = async (e, id) => {
    e.preventDefault();
    
    const updatedIngredientsArray = editIngredients.split(',').map(item => item.trim()).filter(item => item !== "");
    const updatedTagsArray = editTags.split(',').map(item => item.trim()).filter(item => item !== "");

    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // 🟢 Secured update call
        body: JSON.stringify({
          name: editName,
          tags: updatedTagsArray,
          ingredients: updatedIngredientsArray,
          instructions: editInstructions,
          image: editImage
        })
      });

      if (response.status === 401) return logout();
      if (response.ok) {
        setEditingRecipeId(null);
        await fetchCatalog();
      }
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` } // 🟢 Secured delete call
      });
      if (response.status === 401) return logout();
      if (response.ok) await fetchCatalog();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <Loader message="Loading secure recipe assets..." />;

  return (
    <div className="space-y-8">
      {/* Creation Workspace Form */}
      <div className="bg-slate-100 border border-slate-200 text-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="font-black text-lg text-slate-900">✨ Add New Recipe</h3>
          <p className="text-xs text-slate-500">Separate values with commas.</p>
        </div>
        <form onSubmit={handleCreateRecipe} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input 
              type="text" 
              placeholder="Recipe Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="p-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
              required
            />
            <input 
              type="text" 
              placeholder="Tags (e.g., Dinner, Spicy)"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="p-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
              required
            />
            <input 
              type="text" 
              placeholder="Ingredients"
              value={newIngredients}
              onChange={(e) => setNewIngredients(e.target.value)}
              className="p-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
              required
            />
            <input 
              type="url" 
              placeholder="Image URL link"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              className="p-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
            />
          </div>
          <textarea 
            placeholder="Step by step preparation instructions..."
            value={newInstructions}
            onChange={(e) => setNewInstructions(e.target.value)}
            className="p-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 h-24 focus:outline-emerald-500"
            required
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 px-4 rounded-xl transition-colors shadow-sm">
            Save into Database
          </button>
        </form>
      </div>

      {/* Catalog Grid Area */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Your Recipe Vault</h2>
        
        {recipes.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No recipes available or authorized for this account yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe._id} title={editingRecipeId === recipe._id ? "Editing..." : recipe.name} tags={recipe.tags} image={recipe.image}>
                {editingRecipeId === recipe._id ? (
                  <form onSubmit={(e) => handleUpdateRecipe(e, recipe._id)} className="space-y-3 mt-2">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-2 text-xs rounded-lg border border-slate-300 text-slate-900" required />
                    <input type="text" value={editTags} onChange={(e) => setEditTags(e.target.value)} className="w-full p-2 text-xs rounded-lg border border-slate-300 text-slate-900" required />
                    <input type="text" value={editIngredients} onChange={(e) => setEditIngredients(e.target.value)} className="w-full p-2 text-xs rounded-lg border border-slate-300 text-slate-900" required />
                    <input type="text" value={editImage} onChange={(e) => setEditImage(e.target.value)} className="w-full p-2 text-xs rounded-lg border border-slate-300 text-slate-900" />
                    <textarea value={editInstructions} onChange={(e) => setEditInstructions(e.target.value)} className="w-full p-2 text-xs rounded-lg border border-slate-300 text-slate-900 h-20" required />
                    <div className="flex gap-1.5">
                      <button type="submit" className="flex-1 bg-emerald-600 text-white text-xs font-bold p-2 rounded-lg">Save</button>
                      <button type="button" onClick={() => setEditingRecipeId(null)} className="bg-slate-300 text-slate-700 text-xs font-bold p-2 rounded-lg">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3 mt-2">
                    <p className="text-xs text-slate-500 line-clamp-2">{recipe.instructions}</p>
                    {recipe.ingredients && (
                      <p className="text-[11px] text-slate-400 truncate">
                        <span className="font-semibold text-slate-500">Ingredients:</span> {recipe.ingredients.join(', ')}
                      </p>
                    )}
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      <button onClick={() => setSelectedRecipe(recipe)} className="flex-1 text-center text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-colors">View</button>
                      <button onClick={() => startEditing(recipe)} className="px-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition-colors">✏️ Edit</button>
                      <button onClick={() => handleDeleteRecipe(recipe._id)} className="px-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-colors">🗑️</button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </div>
  );
}