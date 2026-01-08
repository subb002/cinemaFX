
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
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [externalUrl, setExternalUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
    alert(`Success! User "${userName}" created. Passkey: ${userPass}`);
  };

  const handleMovieUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!movieTitle || !movieGenre) {
      setUploadError("Title and Genre are required.");
      return;
    }

    if (uploadMethod === 'file' && !videoFile) {
      setUploadError("Please select a video file.");
      return;
    }

    if (uploadMethod === 'url' && !externalUrl) {
      setUploadError("Please provide a video URL.");
      return;
    }

    setIsUploading(true);

    try {
      let finalVideoUrl = '';
      let storageType: 'local' | 'external' = 'external';

      if (uploadMethod === 'file' && videoFile) {
        // Create local blob URL (Note: this is only valid on the current device/session)
        finalVideoUrl = URL.createObjectURL(videoFile);
        storageType = 'local';
      } else {
        finalVideoUrl = externalUrl;
        storageType = 'external';
      }

      const metadata = await generateMovieMetadata(movieTitle, movieGenre);

      const newMovie: Movie = {
        id: `mov-${Math.random().toString(36).substr(2, 5)}`,
        title: movieTitle,
        genre: movieGenre,
        videoUrl: finalVideoUrl,
        thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(movieTitle)}/1280/720`,
        description: metadata.description,
        year: new Date().getFullYear().toString(),
        duration: 'HD',
        rating: metadata.rating,
        storageType
      };

      onAddMovie(newMovie);
      setMovieTitle('');
      setMovieGenre('');
      setVideoFile(null);
      setExternalUrl('');
      alert(`"${movieTitle}" is now available!`);
    } catch (err) {
      console.error(err);
      setUploadError("Upload process failed. Check your internet connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const copySyncCode = () => {
    // We only sync external movies because local blob URLs don't work on other devices
    const syncableMovies = movies.filter(m => m.storageType !== 'local');
    const data = JSON.stringify({ users, movies: syncableMovies });
    navigator.clipboard.writeText(data);
    alert("Sync code copied! Note: Local file uploads are not synced, only external links.");
  };

  return (
    <div className="pt-24 px-4 md:px-12 max-w-7xl mx-auto pb-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Active Users</p>
          <p className="text-3xl font-bold mt-1">{users.length}</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Library Size</p>
          <p className="text-3xl font-bold mt-1">{movies.length}</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Device Access</p>
          <p className="text-3xl font-bold mt-1 text-blue-500">Public</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Upload Status</p>
          <p className="text-sm font-bold mt-2 text-green-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Online
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-800 pb-6 gap-4">
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-red-600' : 'bg-neutral-800 text-gray-400'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('movies')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'movies' ? 'bg-red-600' : 'bg-neutral-800 text-gray-400'}`}
          >
            Movie Library
          </button>
          <button 
            onClick={() => setActiveTab('sync')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'sync' ? 'bg-blue-600' : 'bg-neutral-800 text-gray-400'}`}
          >
            Sync Devices
          </button>
        </div>
        
        {activeTab !== 'sync' && (
          <div className="relative">
            <input 
              type="text" 
              placeholder={`Search...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-900 border border-gray-700 px-10 py-2.5 rounded-full text-sm focus:outline-none focus:border-red-600 w-full md:w-64"
            />
            <svg className="w-4 h-4 text-gray-500 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        )}
      </div>

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-6">Create Account</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Username</label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" placeholder="e.g. subbu" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Passkey</label>
                  <input type="text" value={userPass} onChange={(e) => setUserPass(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" placeholder="Set a password" required />
                </div>
                <button className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-lg font-bold transition">Add User</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-neutral-800 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="p-5">User</th>
                    <th className="p-5">Password</th>
                    <th className="p-5 text-center">Download</th>
                    <th className="p-5 text-right">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-neutral-800/20 transition">
                      <td className="p-5 font-bold text-white capitalize">{u.name}</td>
                      <td className="p-5"><code className="text-xs bg-black px-2 py-1 rounded text-red-400">{u.password}</code></td>
                      <td className="p-5 text-center">
                        <button onClick={() => onToggleDownload(u.id)} className={`w-10 h-5 rounded-full transition-all relative inline-block ${u.canDownload ? 'bg-red-600' : 'bg-neutral-700'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${u.canDownload ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                      <td className="p-5 text-right">
                        {u.role !== UserRole.ADMIN ? (
                          <button onClick={() => onToggleBlock(u.id)} className={`text-[10px] font-black px-3 py-1.5 rounded uppercase ${u.isBlocked ? 'bg-white text-black' : 'bg-red-950/40 text-red-500 border border-red-500/20'}`}>
                            {u.isBlocked ? 'Blocked' : 'Active'}
                          </button>
                        ) : <span className="text-[10px] text-gray-600 font-bold uppercase">Admin</span>}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-6">Upload Movie</h2>
              
              <div className="flex gap-2 mb-6 p-1 bg-black rounded-lg">
                <button 
                  onClick={() => setUploadMethod('file')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition ${uploadMethod === 'file' ? 'bg-neutral-800 text-white' : 'text-gray-500'}`}
                >
                  Local File
                </button>
                <button 
                  onClick={() => setUploadMethod('url')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition ${uploadMethod === 'url' ? 'bg-neutral-800 text-white' : 'text-gray-500'}`}
                >
                  Online Link
                </button>
              </div>

              <form onSubmit={handleMovieUpload} className="space-y-4">
                {uploadError && <p className="text-xs text-red-500 bg-red-900/10 p-2 rounded border border-red-500/20">{uploadError}</p>}
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Title</label>
                  <input type="text" value={movieTitle} onChange={(e) => setMovieTitle(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" placeholder="Movie Name" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Genre</label>
                  <select value={movieGenre} onChange={(e) => setMovieGenre(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white">
                    <option value="">Choose Genre</option>
                    <option value="Action">Action</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Drama">Drama</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Horror">Horror</option>
                  </select>
                </div>

                {uploadMethod === 'file' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Video File (Max 4GB)</label>
                    <div className="relative border-2 border-dashed border-gray-800 hover:border-red-600 transition rounded-xl p-6 text-center">
                      <input 
                        type="file" 
                        accept="video/mp4,video/x-m4v,video/*" 
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <p className="text-xs text-gray-500">{videoFile ? videoFile.name : 'Select video from laptop'}</p>
                    </div>
                    <p className="text-[9px] text-gray-600 mt-2 italic">Note: File uploads only play on this laptop. Use "Online Link" to sync across all devices.</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Video URL (Direct MP4/MKV Link)</label>
                    <input 
                      type="url" 
                      value={externalUrl} 
                      onChange={(e) => setExternalUrl(e.target.value)} 
                      className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" 
                      placeholder="https://example.com/movie.mp4" 
                    />
                  </div>
                )}

                <button 
                  disabled={isUploading} 
                  className={`w-full py-4 rounded-lg font-bold transition ${isUploading ? 'bg-neutral-800 text-gray-500' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  {isUploading ? 'Processing...' : 'Publish Movie'}
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredMovies.map(movie => (
              <div key={movie.id} className="bg-neutral-900 rounded-xl overflow-hidden border border-gray-800 group hover:border-red-600 transition">
                <div className="relative aspect-video">
                  <img src={movie.thumbnailUrl} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-black/80 text-[9px] px-2 py-0.5 rounded border border-white/10 uppercase font-bold">
                    {movie.storageType === 'local' ? 'Local File' : 'Cloud URL'}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm truncate">{movie.title}</h3>
                  <p className="text-xs text-gray-500">{movie.genre} • {movie.rating}</p>
                </div>
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
              Multi-Device Sync
            </h2>
            <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl mb-8">
              <p className="text-blue-200 text-sm leading-relaxed">
                <strong>Important:</strong> To watch the same movies on your phone and laptop, use the <strong>"Online Link"</strong> upload method. Local files stay on the device where they were uploaded.
              </p>
            </div>

            <div className="space-y-12">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">1. Copy from Laptop</h3>
                  <button onClick={copySyncCode} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold text-sm transition">Copy Code</button>
                </div>
                <div className="p-4 bg-black border border-gray-800 rounded-xl font-mono text-[10px] text-gray-500 break-all h-24 overflow-y-auto">
                  {JSON.stringify({ users, movies: movies.filter(m => m.storageType !== 'local') })}
                </div>
              </section>

              <div className="h-px bg-gray-800 w-full" />

              <section>
                <h3 className="text-lg font-bold mb-4">2. Paste on Other Device</h3>
                <textarea 
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Paste Sync Code here..."
                  className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white text-xs h-32 focus:outline-none focus:border-blue-500 mb-4 font-mono"
                />
                <button onClick={() => onImportData(importCode)} className="w-full bg-neutral-800 hover:bg-neutral-700 py-4 rounded-xl font-bold transition">Sync Now</button>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
