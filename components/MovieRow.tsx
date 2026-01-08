
import React, { useRef } from 'react';
import { Movie, User } from '../types';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  user: User | null;
  onSelect: (movie: Movie) => void;
  onDownload: (movie: Movie) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, user, onSelect, onDownload }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 py-8 group">
      <h2 className="px-4 md:px-12 text-2xl font-semibold text-gray-200">{title}</h2>
      
      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-40 bg-black/40 px-2 opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div 
          ref={rowRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 px-4 md:px-12 pb-4 snap-x"
        >
          {movies.map(movie => (
            <div 
              key={movie.id}
              className="relative min-w-[200px] md:min-w-[280px] h-[150px] md:h-[180px] bg-neutral-900 rounded-lg overflow-hidden group/item cursor-pointer snap-start transition-transform duration-300 hover:scale-110 z-0 hover:z-50"
            >
              <img 
                src={movie.thumbnailUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover"
                onClick={() => onSelect(movie)}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold truncate">{movie.title}</h3>
                  <p className="text-[10px] text-gray-400 mt-1">{movie.genre}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onSelect(movie)}
                    className="p-1.5 bg-white rounded-full text-black hover:bg-gray-200"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                  {user?.canDownload && (
                    <button 
                      onClick={() => onDownload(movie)}
                      className="p-1.5 bg-neutral-800 border border-gray-600 rounded-full text-white hover:border-white transition"
                      title="Download to device"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-40 bg-black/40 px-2 opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
};

export default MovieRow;
