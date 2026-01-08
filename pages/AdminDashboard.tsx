
import React, { useState } from 'react';
import { User, UserRole, Movie } from '../types';
import { generateMovieMetadata } from '../services/geminiService';

interface AdminDashboardProps {
  users: User[];
  movies: Movie[];
  onAddUser: (user: User) => void;
  onAddMovie: (movie: Movie) => void;
  onToggleDownload: (userId: string) => void;
  onToggleBlock: (userId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, 
  movies, 
  onAddUser, 
  onAddMovie, 
  onToggleDownload,
  onToggleBlock
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'movies'>('users');
  
  // User creation state
  const [userName, setUserName] = useState('');
  const [userPass, setUserPass] = useState('');

  // Movie upload state
  const [movieTitle, setMovieTitle] = useState('');
  const [movieGenre, setMovieGenre] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPass) return;
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
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
    alert(`User ${userName} created!`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    
    if (file) {
      // 4GB Limit check (4 * 1024 * 1024 * 1024 bytes)
      const maxSize = 4 * 1024 * 1024 * 1024;
      if (file.size > maxSize) {
        setUploadError("File exceeds 4GB limit. Please select a smaller video.");
        setVideoFile(null);
        return;
      }
      setVideoFile(file);
    }
  };

  const handleMovieUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieTitle || !movieGenre || !videoFile) {
      setUploadError("Please fill all fields and select a valid video file.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Create a blob URL for the local file
      const videoUrl = URL.createObjectURL(videoFile);
      
      // Use Gemini to get a description
      const metadata = await generateMovieMetadata(movieTitle, movieGenre);

      const newMovie: Movie = {
        id: Math.random().toString(36).substr(2, 9),
        title: movieTitle,
        genre: movieGenre,
        videoUrl: videoUrl,
        thumbnailUrl: `https://picsum.photos/seed/${encodeURIComponent(movieTitle)}/1280/720`,
        description: metadata.description,
        year: new Date().getFullYear().toString(),
        duration: 'Varies',
        rating: metadata.rating
      };

      onAddMovie(newMovie);
      setMovieTitle('');
      setMovieGenre('');
      setVideoFile(null);
      alert(`Movie "${movieTitle}" added successfully!`);
    } catch (err) {
      setUploadError("Failed to process movie. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pt-24 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold">Admin Central</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'users' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-gray-400 hover:text-white'}`}
          >
            User Analytics
          </button>
          <button 
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'movies' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-gray-400 hover:text-white'}`}
          >
            Library Management
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Create User Section */}
          <div className="lg:col-span-1 bg-neutral-900 p-6 rounded-xl border border-gray-800 h-fit">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              Quick Register
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">User Name</label>
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-red-600"
                  placeholder="Enter login name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pass-key</label>
                <input 
                  type="text" 
                  value={userPass}
                  onChange={(e) => setUserPass(e.target.value)}
                  className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-red-600"
                  placeholder="Set user password"
                />
              </div>
              <button className="w-full bg-red-600 hover:bg-red-700 py-3 rounded font-bold transition">
                Register User
              </button>
            </form>
          </div>

          {/* User Tracking Table */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
              <div className="p-4 bg-neutral-800 border-b border-gray-700">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">Active Users & Activity</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-neutral-900/50 text-gray-500 text-[10px] uppercase font-bold">
                  <tr>
                    <th className="p-4">Identity</th>
                    <th className="p-4">Last Activity</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">DL Access</th>
                    <th className="p-4 text-right">Operation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map(u => (
                    <tr key={u.id} className={`hover:bg-neutral-800/30 transition ${u.isBlocked ? 'bg-red-950/10' : ''}`}>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white capitalize">{u.name}</span>
                          <span className="text-[10px] text-gray-500 font-mono">ID: {u.id}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-gray-400">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${u.isBlocked ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                          {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => onToggleDownload(u.id)}
                          className={`w-10 h-5 rounded-full transition-all duration-300 relative mx-auto ${u.canDownload ? 'bg-red-600' : 'bg-neutral-700'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${u.canDownload ? 'left-5.5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== UserRole.ADMIN && (
                          <button 
                            onClick={() => onToggleBlock(u.id)}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded transition uppercase tracking-tighter ${u.isBlocked ? 'bg-white text-black' : 'bg-red-600/20 text-red-500 border border-red-500/20'}`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Restrict'}
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pb-20">
          {/* Upload Section */}
          <div className="lg:col-span-1 bg-neutral-900 p-6 rounded-xl border border-gray-800 h-fit">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Upload Manager
            </h2>
            <form onSubmit={handleMovieUpload} className="space-y-4">
              {uploadError && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-xs">
                  {uploadError}
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input 
                  type="text" 
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-red-600"
                  placeholder="Movie Name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Genre</label>
                <select 
                  value={movieGenre}
                  onChange={(e) => setMovieGenre(e.target.value)}
                  className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-red-600"
                >
                  <option value="">Select Genre</option>
                  <option value="Action">Action</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Drama">Drama</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Select Video (MP4/MKV up to 4GB)</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md hover:border-red-500 transition cursor-pointer relative bg-black/50">
                  <input 
                    type="file" 
                    accept="video/mp4,video/x-m4v,video/*,.mkv,.webm"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <p className="text-xs text-gray-300">
                      {videoFile ? videoFile.name : 'Choose file from Laptop/Mobile'}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-2">Maximum file size: 4GB</p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded border border-gray-700">
                <p className="text-[10px] text-gray-400 italic">
                  Note: For MKV files, playback compatibility depends on user browser. MP4 is recommended for universal support.
                </p>
              </div>
              <button 
                disabled={isUploading}
                className={`w-full ${isUploading ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} py-4 rounded font-bold transition flex items-center justify-center gap-2`}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing Upload...
                  </>
                ) : 'Confirm Upload'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {movies.map(movie => (
                <div key={movie.id} className="bg-neutral-900 rounded-lg overflow-hidden border border-gray-800 group hover:border-red-600 transition shadow-lg">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={movie.thumbnailUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute top-2 right-2 bg-black/70 text-[10px] px-2 py-1 rounded">
                      {movie.rating || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-white truncate">{movie.title}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">{movie.genre}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
