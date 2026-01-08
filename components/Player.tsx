
import React from 'react';
import { Movie } from '../types';

interface PlayerProps {
  movie: Movie;
  onClose: () => void;
}

const Player: React.FC<PlayerProps> = ({ movie, onClose }) => {
  const handleError = (e: any) => {
    console.error("Video Error:", e);
    // Common error with MKV in Chrome/Safari
    alert("Playback Error: Your browser may not support this video format (MKV). Try using Firefox or uploading in MP4 format.");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent absolute top-0 w-full z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition text-white"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">{movie.title}</h2>
            <p className="text-sm text-gray-400">{movie.genre} • {movie.year || '2024'}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full bg-black relative flex items-center justify-center">
        <video 
          src={movie.videoUrl} 
          controls 
          autoPlay 
          className="w-full max-h-full"
          poster={movie.thumbnailUrl}
          onError={handleError}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default Player;
