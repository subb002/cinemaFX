
import React from 'react';
import { Movie } from '../types';

interface HeroProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
}

const Hero: React.FC<HeroProps> = ({ movie, onPlay }) => {
  return (
    <div className="relative h-[85vh] w-full">
      <div className="absolute inset-0">
        <img 
          src={movie.thumbnailUrl} 
          alt={movie.title} 
          className="w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>

      <div className="absolute bottom-1/4 left-4 md:left-12 max-w-2xl space-y-4">
        <span className="bg-red-600 text-[10px] px-2 py-1 rounded font-bold tracking-widest">
          TRENDING NOW
        </span>
        <h1 className="text-4xl md:text-7xl font-bold tracking-tight">{movie.title}</h1>
        <p className="text-lg text-gray-200 line-clamp-3 leading-relaxed drop-shadow-lg">
          {movie.description}
        </p>
        <div className="flex items-center gap-4 pt-4">
          <button 
            onClick={() => onPlay(movie)}
            className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-bold hover:bg-white/80 transition"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M7 6v12l10-6z"/></svg>
            Play
          </button>
          <button className="flex items-center gap-2 bg-gray-500/50 text-white px-8 py-3 rounded font-bold hover:bg-gray-500/30 transition backdrop-blur-md">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
