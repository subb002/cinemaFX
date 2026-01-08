
import React, { useState, useMemo } from 'react';
import { User, UserRole, Movie } from '../types';
import { generateMovieMetadata } from '../services/geminiService';

interface AdminDashboardProps {
  users: User[];
  movies: Movie[];
  onAddUser: (user: User) => void;
  onAddMovie: (movie: Movie) => void;
  onToggleDownload: (userId: string) => void;
  onToggleBlock: (userId: string) => void;
  onImportData: (data: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, 
  movies, 
  onAddUser, 
  onAddMovie, 
  onToggleDownload,
  onToggleBlock,
  onImportData
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'movies' | 'sync'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  
  // User creation state
  const [userName, setUserName] = useState('');
  const [userPass, setUserPass] = useState('');

  // Movie upload state
  const [movieTitle, setMovieTitle] = useState('');
  const [movieGenre, setMovieGenre] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Sync state
  const [importCode, setImportCode] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, searchTerm]);

  const filteredMovies = useMemo(() => {
    return movies.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [movies, searchTerm]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPass) return;
    
    const newUser: User = {
      id: `user-${Math.random().toString(36).substr(2, 5)}`,
      name: userName,
      password: userPass,
      role: UserRole.USER,
      canDownload: false,
      isBlocked: false,
      lastLogin: '-'
    };
    
    onAddUser(newUser);
    setUserName('');
    setUserPass('');
    alert(`Success! User "${userName}" created. Give them password: ${userPass}`);
  };

  const handleMovieUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieTitle || !movieGenre || !videoFile) {
      setUploadError("All fields are required.");
      return;
    }
    setIsUploading(true);
    try {
      const videoUrl = URL.createObjectURL(videoFile);
      const metadata = await generateMovieMetadata(movieTitle, movieGenre);
      const newMovie: Movie = {
        id: `mov-${Math.random().toString(36).substr(2, 5)}`,
        title: movieTitle,
        genre: movieGenre,
        videoUrl: videoUrl,
        thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(movieTitle)}/1280/720`,
        description: metadata.description,
        year: new Date().getFullYear().toString(),
        duration: 'HD',
        rating: metadata.rating
      };
      onAddMovie(newMovie);
      setMovieTitle('');
      setMovieGenre('');
      setVideoFile(null);
      alert(`"${movieTitle}" uploaded successfully!`);
    } catch (err) {
      setUploadError("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const copySyncCode = () => {
    const data = JSON.stringify({ users, movies });
    navigator.clipboard.writeText(data);
    alert("Sync code copied! Paste this in the 'Import' section on your other device.");
  };

  return (
    <div className="pt-24 px-4 md:px-12 max-w-7xl mx-auto pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Users</p>
          <p className="text-3xl font-bold mt-1">{users.length}</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Movies in Library</p>
          <p className="text-3xl font-bold mt-1">{movies.length}</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Download Ready</p>
          <p className="text-3xl font-bold mt-1 text-green-500">{users.filter(u => u.canDownload).length}</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Sync Status</p>
          <p className="text-sm font-bold mt-2 text-blue-400">Local Only</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-800 pb-6 gap-4">
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-red-600 shadow-lg shadow-red-900/20' : 'bg-neutral-800 text-gray-400 hover:text-white'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('movies')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'movies' ? 'bg-red-600 shadow-lg shadow-red-900/20' : 'bg-neutral-800 text-gray-400 hover:text-white'}`}
          >
            Library
          </button>
          <button 
            onClick={() => setActiveTab('sync')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'sync' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'bg-neutral-800 text-gray-400 hover:text-white'}`}
          >
            Device Sync
          </button>
        </div>
        
        {activeTab !== 'sync' && (
          <div className="relative">
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-900 border border-gray-700 px-10 py-2.5 rounded-full text-sm focus:outline-none focus:border-red-600 w-full md:w-64"
            />
            <svg className="w-4 h-4 text-gray-500 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        )}
      </div>

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-6">Add New User</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Username</label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" placeholder="e.g. subbu" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Passkey</label>
                  <input type="text" value={userPass} onChange={(e) => setUserPass(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" placeholder="Enter password" />
                </div>
                <button className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-lg font-bold transition">Create Account</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-neutral-800 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="p-5">User</th>
                    <th className="p-5">Password</th>
                    <th className="p-5 text-center">DL</th>
                    <th className="p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-neutral-800/20">
                      <td className="p-5 font-bold text-white capitalize">{u.name}</td>
                      <td className="p-5"><code className="text-xs bg-black px-2 py-1 rounded text-red-400">{u.password}</code></td>
                      <td className="p-5 text-center">
                        <button onClick={() => onToggleDownload(u.id)} className={`w-10 h-5 rounded-full transition-all relative inline-block ${u.canDownload ? 'bg-red-600' : 'bg-neutral-700'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${u.canDownload ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="p-5 text-right">
                        {u.role !== UserRole.ADMIN && (
                          <button onClick={() => onToggleBlock(u.id)} className={`text-[10px] font-black px-3 py-1.5 rounded uppercase ${u.isBlocked ? 'bg-white text-black' : 'bg-red-950/40 text-red-500 border border-red-500/20'}`}>
                            {u.isBlocked ? 'Blocked' : 'Active'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'movies' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-6">Upload Content</h2>
              <form onSubmit={handleMovieUpload} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Title</label>
                  <input type="text" value={movieTitle} onChange={(e) => setMovieTitle(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Genre</label>
                  <select value={movieGenre} onChange={(e) => setMovieGenre(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white">
                    <option value="">Choose Genre</option>
                    <option value="Action">Action</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Drama">Drama</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Video File (Max 4GB)</label>
                  <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500" />
                </div>
                <button disabled={isUploading} className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-lg font-bold">{isUploading ? 'Publishing...' : 'Publish Movie'}</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredMovies.map(movie => (
              <div key={movie.id} className="bg-neutral-900 rounded-xl overflow-hidden border border-gray-800 p-4">
                <img src={movie.thumbnailUrl} className="w-full aspect-video object-cover rounded mb-4" />
                <h3 className="font-bold">{movie.title}</h3>
                <p className="text-xs text-gray-500">{movie.genre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-neutral-900 p-8 rounded-2xl border border-gray-800 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Device Synchronization
            </h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Because this app is currently "Serverless," data is stored locally in your browser. To use your users and movies on a different device (like your phone), use the tools below.
            </p>

            <div className="space-y-12">
              {/* Export Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">1. Export from this device</h3>
                  <button 
                    onClick={copySyncCode}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copy Sync Code
                  </button>
                </div>
                <div className="p-4 bg-black border border-gray-800 rounded-xl font-mono text-[10px] text-gray-500 break-all h-24 overflow-y-auto">
                  {JSON.stringify({ users, movies })}
                </div>
              </section>

              <div className="h-px bg-gray-800 w-full" />

              {/* Import Section */}
              <section>
                <h3 className="text-lg font-bold text-white mb-4">2. Import to this device</h3>
                <textarea 
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Paste the Sync Code from your other device here..."
                  className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white text-xs h-32 focus:outline-none focus:border-blue-500 mb-4 font-mono"
                />
                <button 
                  onClick={() => onImportData(importCode)}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Sync Now
                </button>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
