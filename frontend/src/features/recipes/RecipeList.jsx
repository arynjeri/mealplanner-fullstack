import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';   
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import RecipeModal from '../../components/RecipeModal';

const API_BASE_URL = 'http://localhost:5000/api';

export default function RecipeList() {
  const { token, logout } = useContext(AuthContext); 
  const [recipes, setRecipes] = useState([]);        
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // --- CREATION FORM STATES ---
  const [newName, setNewName] = useState('');
  const [newTags, setNewTags] = useState(''); 
  const [newIngredients, setNewIngredients] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newImageFile, setNewImageFile] = useState(null); 

  // --- EDITING FORM STATES ---
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editTags, setEditTags] = useState(''); 
  const [editIngredients, setEditIngredients] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editImageFile, setEditImageFile] = useState(null); 

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/recipes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) return logout();
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setRecipes(data);
      } else {
        setRecipes([]);
      }
    } catch (err) {
      console.error('Error loading recipes:', err);
      setRecipes([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCatalog();
  }, [token]);

  const handleCreateRecipe = async (e) => {
    e.preventDefault();
    if (!newName || !newIngredients || !newInstructions || !newTags) {
      alert("Please fill out all required fields!");
      return;
    }

    const formData = new FormData();
    formData.append('name', newName);
    formData.append('tags', newTags);
    formData.append('ingredients', newIngredients);
    formData.append('instructions', newInstructions);
    if (newImageFile) {
      formData.append('image', newImageFile); 
    }

    try {
      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, 
        body: formData
      });

      if (response.status === 401) return logout();
      
      if (response.ok) {
        setNewName('');
        setNewTags('');
        setNewIngredients('');
        setNewInstructions('');
        setNewImageFile(null);
        e.target.reset(); 
        await fetchCatalog(); 
      } else {
        const errorData = await response.json();
        alert(`Server Error: ${errorData.message || 'Could not save recipe.'}`);
      }
    } catch (err) {
      console.error("Network upload error:", err);
    }
  };

  // Pre-fills data into edit states and switches view mode
  const startEditing = (recipe) => {
    setEditingRecipeId(recipe._id);
    setEditName(recipe.name || '');
    setEditTags(recipe.tags ? recipe.tags.join(', ') : '');
    setEditIngredients(recipe.ingredients ? recipe.ingredients.join(', ') : '');
    setEditInstructions(recipe.instructions || '');
    setEditImageFile(null); // Clear previous selection
  };

  const handleUpdateRecipe = async (e, id) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('tags', editTags);
    formData.append('ingredients', editIngredients);
    formData.append('instructions', editInstructions);
    
    if (editImageFile) {
        formData.append('image', editImageFile);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }, 
        body: formData
      });

      if (response.status === 401) return logout();
      
      if (response.ok) {
        setEditingRecipeId(null);
        setEditImageFile(null); 
        await fetchCatalog(); // Force immediate UI list re-fetch to view updates
      } else {
        const errorData = await response.json();
        alert(`Update Error: ${errorData.message || 'Could not save changes.'}`);
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
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (response.status === 401) return logout();
      if (response.ok) await fetchCatalog();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <Loader message="Loading dynamic recipe assets..." />;

  return (
    <div className="space-y-8">
      {/* Creation Workspace Form */}
      <div className="bg-slate-100 border border-slate-200 text-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div>
          <h3 className="font-black text-lg text-slate-900">✨ Add New Recipe</h3>
          <p className="text-xs text-slate-500">Separate values with commas (e.g. Flour, Water, Sugar).</p>
        </div>
        
        <form onSubmit={handleCreateRecipe} className="flex flex-col gap-3" encType="multipart/form-data">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input 
              type="text" 
              placeholder="Recipe Name (e.g. Chicken Biryani)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="p-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
              required
            />
            <input 
              type="text" 
              placeholder="Tags (Dinner, Festive, Spicy)"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="p-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
              required
            />
            <input 
              type="text" 
              placeholder="Ingredients (Chicken, Yogurt, Rice)"
              value={newIngredients}
              onChange={(e) => setNewIngredients(e.target.value)}
              className="p-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-emerald-500"
              required
            />
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setNewImageFile(e.target.files[0])} 
              className="p-2 text-xs rounded-xl border border-slate-300 bg-white cursor-pointer text-slate-700 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          </div>
          <textarea 
            placeholder="Step-by-step preparation instructions..."
            value={newInstructions}
            onChange={(e) => setNewInstructions(e.target.value)}
            className="p-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 h-24 focus:outline-emerald-500"
            required
          />
          <button 
            type="submit" 
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.99]"
          >
            Save Recipe
          </button>
        </form>
      </div>

      {/* Catalog Render Workspace Grid Area */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Your Recipe Vault</h2>
        
        {recipes.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No custom recipes added yet. Create your first!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe._id} title={editingRecipeId === recipe._id ? "Editing..." : recipe.name} tags={recipe.tags} image={recipe.image}>
                
                {/* INLINE EDIT MODE VIEW CONDITIONAL */}
                {editingRecipeId === recipe._id ? (
                  <form onSubmit={(e) => handleUpdateRecipe(e, recipe._id)} className="space-y-3 mt-2" encType="multipart/form-data">
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-emerald-500" 
                      placeholder="Recipe Name" 
                      required 
                    />
                    <input 
                      type="text" 
                      value={editTags} 
                      onChange={(e) => setEditTags(e.target.value)} 
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-emerald-500" 
                      placeholder="Tags (comma separated)" 
                      required 
                    />
                    <input 
                      type="text" 
                      value={editIngredients} 
                      onChange={(e) => setEditIngredients(e.target.value)} 
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white focus:outline-emerald-500" 
                      placeholder="Ingredients (comma separated)" 
                      required 
                    />
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block font-bold">Replace Image File (Optional):</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setEditImageFile(e.target.files[0])} 
                        className="w-full text-[11px] bg-white border rounded border-slate-200 p-1 cursor-pointer text-slate-700" 
                      />
                    </div>

                    <textarea 
                      value={editInstructions} 
                      onChange={(e) => setEditInstructions(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white h-20 focus:outline-emerald-500" 
                      placeholder="Instructions..." 
                      required 
                    />
                    
                    <div className="flex gap-1.5">
                      <button type="submit" className="flex-1 bg-emerald-600 text-white text-xs font-bold p-2 rounded-lg hover:bg-emerald-700 transition-colors">Save</button>
                      <button type="button" onClick={() => setEditingRecipeId(null)} className="bg-slate-300 text-slate-700 text-xs font-bold p-2 rounded-lg hover:bg-slate-400 transition-colors">Cancel</button>
                    </div>
                  </form>
                ) : (
                  /* DEFAULT view layout card mode */
                  <div className="space-y-3 mt-2">
                    <p className="text-xs text-slate-500 line-clamp-2">{recipe.instructions}</p>
                    {recipe.ingredients && (
                      <p className="text-[11px] text-slate-400 truncate">
                        <span className="font-semibold text-slate-500">Ingredients:</span> {recipe.ingredients.join(', ')}
                      </p>
                    )}
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      <button onClick={() => setSelectedRecipe(recipe)} className="flex-1 text-center text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-colors">View</button>
                      <button onClick={() => startEditing(recipe)} className="px-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition-colors hover:bg-amber-100">Edit</button>
                      <button onClick={() => handleDeleteRecipe(recipe._id)} className="px-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold transition-colors hover:bg-rose-100">Delete</button>
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