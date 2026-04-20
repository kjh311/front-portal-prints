import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import CaptureCard from '../components/CaptureCard';
import { Search, LogOut, Printer, Grid, RefreshCw } from 'lucide-react';

interface Capture {
  id: string;
  user_id: string;
  video_title: string;
  video_url: string;
  image_path: string;
  created_at: string;
}

const PAGE_SIZE = 12;

const Dashboard: React.FC = () => {
  const [captures, setCaptures] = useState<Capture[]>(() => {
    const initial: Capture[] = [];
    return initial;
  });
  const [loading, setLoading] = useState(() => {
    const initial = true;
    return initial;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);

  const fetchCaptures = async (pageNum: number) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { data, error, count } = await supabase
        .from('captures')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      if (pageNum === 0) {
        setCaptures(data || []);
      } else {
        setCaptures(prev => [...prev, ...(data || [])]);
      }

      setHasMore((captures.length + (data?.length || 0)) < (count || 0));
    } catch (err) {
      console.error('Error fetching captures:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCaptures(0);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCaptures(nextPage);
  };

  const handleLogout = () => {
    supabase.auth.signOut();
  };

  const filteredCaptures = useMemo(() => {
    return captures.filter(c => 
      c.video_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [captures, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="glass-nav px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Printer size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Portal <span className="text-indigo-600">Prints</span>
            </h1>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Filter by video title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl transition-all outline-none text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg flex items-center gap-2 text-sm font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium">Fetching your collection...</p>
          </div>
        ) : filteredCaptures.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCaptures.map((capture) => (
                <CaptureCard key={capture.id} capture={capture} />
              ))}
            </div>

            {hasMore && !searchQuery && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm hover:shadow-md hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : null}
                  {loadingMore ? 'Loading...' : 'Load More Prints'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="bg-slate-200/50 p-6 rounded-full mb-6">
              <Grid size={48} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No prints found</h2>
            <p className="text-slate-500 max-w-xs">
              {searchQuery 
                ? "We couldn't find any captures matching your search." 
                : "Your collection is empty. Start capturing moments using the Chrome Extension!"}
            </p>
          </div>
        )}
      </main>

      <footer className="py-8 px-6 border-t border-slate-200 mt-auto bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-slate-400 text-sm italic font-medium">
          <p>© 2024 Portal Prints</p>
          <p>Curated with ❤️ for Cinema</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
