
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: 'home' | 'admin') => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-4 md:px-12 py-4 flex items-center justify-between ${scrolled ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center gap-8">
        <h1 
          className="text-red-600 font-black text-3xl cursor-pointer tracking-tighter"
          onClick={() => onNavigate('home')}
        >
          CINEMAX
        </h1>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
          <button onClick={() => onNavigate('home')} className="hover:text-white transition">Home</button>
          <button className="hover:text-white transition">TV Shows</button>
          <button className="hover:text-white transition">Movies</button>
          <button className="hover:text-white transition">New & Popular</button>
          {user?.role === UserRole.ADMIN && (
            <button 
              onClick={() => onNavigate('admin')} 
              className="text-red-500 hover:text-red-400 font-bold"
            >
              Admin Panel
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center text-sm font-medium">
          <span className="text-gray-400 mr-2">Hello,</span>
          <span className="text-white capitalize">{user?.name}</span>
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
