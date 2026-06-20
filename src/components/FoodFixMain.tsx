import { categories, foodItems } from '../data';
import { SearchBar } from './SearchBar';
import { FoodGrid } from './FoodGrid';
import { SupportChat } from './SupportChat';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { LogOut, User as UserIcon } from 'lucide-react';

interface FoodFixMainProps {
  user: SupabaseUser;
  onLogout: () => void;
}

export const FoodFixMain = ({ user, onLogout }: FoodFixMainProps) => {
  const username = user?.email?.split('@')[0] || 'Foodie';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <nav className="bg-white border-b border-slate-100 py-4 px-8 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-orange-500 tracking-tight">Food<span className="text-slate-800">Fix</span></h1>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-1.5 text-xs text-slate-600 font-semibold shadow-sm">
            <UserIcon size={14} className="text-orange-500" />
            <span>{user.email}</span>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-sm transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Sign out of FoodFix"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <header className="py-12 bg-orange-50 text-center px-4">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Hungry, <span className="text-orange-500 capitalize">{username}</span>? We've got you covered.
        </h2>
        <SearchBar />
      </header>


      <main className="max-w-7xl mx-auto px-8 py-8">
        <section className="mb-12">
          <div className="flex gap-6 overflow-x-auto pb-4 justify-between">
            {categories.map(c => (
              <button key={c.id} className="flex flex-col items-center gap-2 min-w-20 bg-white p-4 rounded-2xl border border-slate-100 hover:border-orange-200 transition">
                <span className="text-3xl">{c.icon}</span>
                <span className="font-semibold text-xs text-slate-600">{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Popular near you</h3>
          <FoodGrid items={foodItems} />
        </section>
      </main>
      
      <SupportChat />
    </div>
  );
};

