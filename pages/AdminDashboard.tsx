
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserRole, Movie } from '../types';
import { generateMovieMetadata } from '../services/geminiService';
import { saveVideoBlob, initDB } from '../services/storageService';

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
  const [uploadProgress, setUploadProgress] = useState(0);
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
    setUploadProgress(0);

    if (!movieTitle || !movieGenre) {
      setUploadError("Title and Genre are required.");
      return;
    }

    if (uploadMethod === 'file' && !videoFile) {
      setUploadError("Please select a video file (MP4/MKV) from your laptop.");
      return;
    }

    if (uploadMethod === 'url' && !externalUrl) {
      setUploadError("Please provide a valid video URL.");
      return;
    }

    setIsUploading(true);

    try {
      const movieId = `mov-${Math.random().toString(36).substr(2, 5)}`;
      let finalVideoUrl = '';
      let storageType: 'local' | 'external' = 'external';
      let originalExtension = 'mp4';

      setUploadProgress(20);

      if (uploadMethod === 'file' && videoFile) {
        // Extract extension
        const fileNameParts = videoFile.name.split('.');
        if (fileNameParts.length > 1) {
          originalExtension = fileNameParts.pop() || 'mp4';
        }

        // Save large file to persistent IndexedDB
        setUploadProgress(40);
        await saveVideoBlob(movieId, videoFile);
        finalVideoUrl = 'PERSISTENT_LOCAL_STORAGE';
        storageType = 'local';
      } else {
        finalVideoUrl = externalUrl;
        storageType = 'external';
        // Try to guess from URL
        const urlMatch = externalUrl.match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
        if (urlMatch) originalExtension = urlMatch[1];
      }

      setUploadProgress(60);
      const metadata = await generateMovieMetadata(movieTitle, movieGenre);
      setUploadProgress(90);

      const newMovie: Movie = {
        id: movieId,
        title: movieTitle,
        genre: movieGenre,
        videoUrl: finalVideoUrl,
        thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(movieTitle)}/1280/720`,
        description: metadata.description,
        year: new Date().getFullYear().toString(),
        duration: 'HD',
        rating: metadata.rating,
        storageType,
        originalExtension
      };

      onAddMovie(newMovie);
      setMovieTitle('');
      setMovieGenre('');
      setVideoFile(null);
      setExternalUrl('');
      setUploadProgress(100);
      alert(`"${movieTitle}" has been uploaded to your laptop library!`);
    } catch (err) {
      console.error(err);
      setUploadError("Upload failed. File might be too large or invalid.");
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const copySyncCode = () => {
    const syncableMovies = movies.filter(m => m.storageType !== 'local');
    const data = JSON.stringify({ users, movies: syncableMovies });
    navigator.clipboard.writeText(data);
    alert("Cloud Library synced! MKV/MP4 links will work on all devices.");
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
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Laptop Space</p>
          <p className="text-3xl font-bold mt-1 text-blue-500">{movies.filter(m => m.storageType === 'local').length} Files</p>
        </div>
        <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Format Support</p>
          <p className="text-sm font-bold mt-2 text-red-500 flex items-center gap-2">
            MP4 + MKV OK
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-800 pb-6 gap-4">
        <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-red-600 shadow-lg shadow-red-600/20' : 'bg-neutral-800 text-gray-400 hover:text-white'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('movies')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'movies' ? 'bg-red-600 shadow-lg shadow-red-600/20' : 'bg-neutral-800 text-gray-400 hover:text-white'}`}
          >
            Movie Library
          </button>
          <button 
            onClick={() => setActiveTab('sync')}
            className={`px-6 py-2.5 rounded-full font-bold transition-all whitespace-nowrap ${activeTab === 'sync' ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'bg-neutral-800 text-gray-400 hover:text-white'}`}
          >
            Sync All Devices
          </button>
        </div>
        
        {activeTab !== 'sync' && (
          <div className="relative">
            <input 
              type="text" 
              placeholder={`Search movies...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-900 border border-gray-700 px-10 py-2.5 rounded-full text-sm focus:outline-none focus:border-red-600 w-full md:w-64"
            />
            <svg className="w-4 h-4 text-gray-500 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        )}
      </div>

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 p-6 rounded-xl border border-gray-800">
              <h2 className="text-xl font-bold mb-6">Create Account</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Username</label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" placeholder="e.g. user1" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Password</label>
                  <input type="text" value={userPass} onChange={(e) => setUserPass(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" placeholder="Set password" required />
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
              <h2 className="text-xl font-bold mb-6">Upload Movie (MKV/MP4)</h2>
              
              <div className="flex gap-2 mb-6 p-1 bg-black rounded-lg">
                <button 
                  onClick={() => setUploadMethod('file')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition ${uploadMethod === 'file' ? 'bg-neutral-800 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  Laptop File
                </button>
                <button 
                  onClick={() => setUploadMethod('url')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition ${uploadMethod === 'url' ? 'bg-neutral-800 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  Cloud Link
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
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Select Video (MP4/MKV/AVI)</label>
                    <div className="relative border-2 border-dashed border-gray-800 hover:border-red-600 transition rounded-xl p-6 text-center group">
                      <input 
                        type="file" 
                        accept="video/*,.mkv,.mp4,.avi,.mov" 
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-2">
                        <svg className="w-8 h-8 mx-auto text-gray-600 group-hover:text-red-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="text-xs text-gray-400">{videoFile ? videoFile.name : 'Click to select MKV or MP4'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cloud Video URL</label>
                    <input 
                      type="url" 
                      value={externalUrl} 
                      onChange={(e) => setExternalUrl(e.target.value)} 
                      className="w-full bg-black border border-gray-700 p-3 rounded-lg text-white" 
                      placeholder="https://example.com/movie.mkv" 
                    />
                  </div>
                )}

                <button 
                  disabled={isUploading} 
                  className={`w-full py-4 rounded-lg font-bold transition ${isUploading ? 'bg-neutral-800 text-gray-500' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  {isUploading ? 'Uploading...' : 'Publish Movie'}
                </button>
                {isUploading && (
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredMovies.map(movie => (
              <div key={movie.id} className="bg-neutral-900 rounded-xl overflow-hidden border border-gray-800 group hover:border-red-600 transition">
                <div className="relative aspect-video">
                  <img src={movie.thumbnailUrl} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className="bg-black/80 text-[8px] px-2 py-0.5 rounded border border-white/10 uppercase font-bold text-white">
                      {movie.originalExtension || 'MP4'}
                    </span>
                    <span className={`text-[8px] px-2 py-0.5 rounded border uppercase font-bold ${movie.storageType === 'local' ? 'bg-blue-600 border-blue-400' : 'bg-green-600 border-green-400'}`}>
                      {movie.storageType === 'local' ? 'Laptop' : 'Cloud'}
                    </span>
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
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
          <div className="bg-neutral-900 p-8 rounded-2xl border border-gray-800 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              Cloud Sync
            </h2>
            <p className="text-sm text-gray-400 mb-8">Export your library links to other devices. Local laptop files are not synced.</p>
            <button onClick={copySyncCode} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold mb-8 transition">Copy Sync Code</button>
            
            <h3 className="text-lg font-bold mb-4">Import from Device</h3>
            <textarea 
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Paste sync code here..."
              className="w-full bg-black border border-gray-700 p-4 rounded-xl text-white text-xs h-32 mb-4"
            />
            <button onClick={() => onImportData(importCode)} className="w-full bg-neutral-800 hover:bg-neutral-700 py-4 rounded-xl font-bold transition">Load Sync Data</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
