import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import AuthScreen from './components/AuthScreen';
import MealCalendar from './features/mealPlanner/MealCalender';
import RecipeList from './features/recipes/RecipeList';

export default function App() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sticky top brand identifier */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🥑</span>
          <h1 className="text-xl font-black bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            BitePlan Dashboard
          </h1>
        </div>
      </header>

      {/* Main operational view block */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Top Feature Layout: Dynamic scheduling workspace */}
        <MealCalendar />

        {/* Bottom Feature Layout: Repository items grid */}
        <RecipeList />
      </main>
    </div>
  );
}