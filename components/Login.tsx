
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string, pass: string) => void;
  onReset: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onReset }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      alert("Please enter both username and password.");
      return;
    }
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

      <div className="relative w-full max-w-md p-10 md:p-12 bg-black/90 rounded-2xl border border-gray-800 backdrop-blur-md shadow-2xl mx-4">
        <h1 className="text-red-600 font-black text-4xl mb-8 tracking-tighter text-center">CINEMAX</h1>
        <h2 className="text-3xl font-bold text-white mb-8">Sign In</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Username</label>
            <input 
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-800/80 border border-neutral-700 focus:border-red-600 p-4 rounded-xl text-white focus:outline-none transition-all placeholder:text-gray-600"
              autoComplete="username"
            />
          </div>
          <div className="relative">
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
            <input 
              type={showPass ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800/80 border border-neutral-700 focus:border-red-600 p-4 rounded-xl text-white focus:outline-none transition-all placeholder:text-gray-600"
              autoComplete="current-password"
            />
            <button 
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 bottom-4 text-gray-500 hover:text-white transition text-xs font-bold"
            >
              {showPass ? "HIDE" : "SHOW"}
            </button>
          </div>
          <button 
            type="submit"
            className="w-full bg-red-600 text-white font-bold py-4 rounded-xl mt-4 hover:bg-red-700 transition active:scale-[0.98] shadow-lg shadow-red-900/40"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
          <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Help Desk</p>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Admin: <strong>admin</strong> / <strong>admin</strong><br/>
            Can't login? <button onClick={onReset} className="text-white hover:underline font-bold">Reset Credentials</button>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Need an account? <span className="text-white font-bold">Ask your Admin.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
