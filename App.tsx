
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Movie, AuthState } from './types';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Player from './components/Player';
import { initDB } from './services/storageService';

const DEFAULT_ADMIN: User = {
  id: 'admin-id',
  name: 'admin',
  password: 'admin',
  role: UserRole.ADMIN,
  canDownload: true,
  isBlocked: false,
  lastLogin: new Date().toISOString()
};

const INITIAL_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Interstellar',
    genre: 'Sci-Fi',
    videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnailUrl: 'https://picsum.photos/id/1/1280/720',
    description: 'When Earth becomes uninhabitable, a team of ex-pilots and scientists travel through a wormhole in search of a new home for mankind.',
    year: '2014'
  },
  {
    id: '2',
    title: 'The Dark Knight',
    genre: 'Action',
    videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    thumbnailUrl: 'https://picsum.photos/id/10/1280/720',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    year: '2008'
  }
];

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem('cinemax_auth');
      return saved ? JSON.parse(saved) : { user: null, isAuthenticated: false };
    } catch (e) {
      return { user: null, isAuthenticated: false };
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('cinemax_users');
      let userList: User[] = saved ? JSON.parse(saved) : [DEFAULT_ADMIN];
      
      const hasAdmin = userList.some(u => u.role === UserRole.ADMIN);
      if (!hasAdmin) {
        userList.push(DEFAULT_ADMIN);
      }
      return userList;
    } catch (e) {
      return [DEFAULT_ADMIN];
    }
  });

  const [movies, setMovies] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('cinemax_movies');
      return saved ? JSON.parse(saved) : INITIAL_MOVIES;
    } catch (e) {
      return INITIAL_MOVIES;
    }
  });

  const [currentPage, setCurrentPage] = useState<'home' | 'admin'>('home');
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);

  useEffect(() => {
    initDB().catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem('cinemax_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cinemax_movies', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('cinemax_auth', JSON.stringify(auth));
  }, [auth]);

  const handleLogin = (name: string, pass: string) => {
    const cleanName = name.trim().toLowerCase();
    const cleanPass = pass.trim();
    const user = users.find(u => u.name.toLowerCase() === cleanName && u.password === cleanPass);
    
    if (user) {
      if (user.isBlocked) {
        alert('Access Denied: Your account has been blocked by the Administrator.');
        return;
      }
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      setAuth({ user: updatedUser, isAuthenticated: true });
    } else {
      alert('Login Failed: Check your credentials.');
    }
  };

  const resetAllData = useCallback(() => {
    if (window.confirm("This will clear all movies and users. Proceed?")) {
      localStorage.clear();
      window.location.reload();
    }
  }, []);

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    setCurrentPage('home');
    setPlayingMovie(null);
  };

  const addUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const addMovie = (newMovie: Movie) => {
    setMovies(prev => [newMovie, ...prev]);
  };

  const toggleDownloadAccess = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, canDownload: !u.canDownload } : u));
  };

  const toggleBlockUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
    if (auth.user?.id === userId) {
      handleLogout();
    }
  };

  const handleImportData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.users && data.movies) {
        setUsers(data.users);
        setMovies(data.movies);
        alert("Sync Complete!");
      } else {
        alert("Invalid Sync Format.");
      }
    } catch (e) {
      alert("Import Error.");
    }
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} onReset={resetAllData} />;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
      <Navbar 
        user={auth.user} 
        onLogout={handleLogout} 
        onNavigate={setCurrentPage} 
      />

      <main className="pt-0">
        {currentPage === 'home' ? (
          <Home 
            user={auth.user} 
            movies={movies} 
            onPlayMovie={setPlayingMovie} 
          />
        ) : (
          <AdminDashboard 
            users={users} 
            movies={movies}
            onAddUser={addUser} 
            onAddMovie={addMovie}
            onToggleDownload={toggleDownloadAccess}
            onToggleBlock={toggleBlockUser}
            onImportData={handleImportData}
          />
        )}
      </main>

      {playingMovie && (
        <Player 
          movie={playingMovie} 
          onClose={() => setPlayingMovie(null)} 
        />
      )}
    </div>
  );
};

export default App;
