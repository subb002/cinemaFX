
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string, pass: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) return;
    onLogin(name, password);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <img 
          src="https://images.unsplash.com/photo-1574267432553-4b202f6201a5?auto=format&fit=crop&q=80&w=1920" 
          alt="background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black" />
      </div>

      <div className="relative w-full max-w-md p-12 bg-black/85 rounded-lg border border-gray-800 backdrop-blur-sm shadow-2xl">
        <h1 className="text-red-600 font-black text-4xl mb-8 tracking-tighter text-center">CINEMAX</h1>
        <h2 className="text-3xl font-bold text-white mb-8">Sign In</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-800 border border-transparent focus:border-red-600 p-4 rounded text-white focus:outline-none transition-all"
              autoComplete="username"
            />
          </div>
          <div>
            <input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800 border border-transparent focus:border-red-600 p-4 rounded text-white focus:outline-none transition-all"
              autoComplete="current-password"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-red-600 text-white font-bold py-4 rounded mt-4 hover:bg-red-700 transition active:scale-[0.98] shadow-lg shadow-red-900/20"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 p-4 bg-neutral-900/80 rounded border border-neutral-700">
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Access Information</p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Please use the credentials provided by your Administrator. 
            Default demo accounts (admin / subbu) are active.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between text-gray-400 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-red-600" />
            Remember me
          </label>
          <a href="#" className="hover:underline">Forgot password?</a>
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          <p>
            New to Cinemax? <span className="text-white hover:underline cursor-pointer">Contact your Admin.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
