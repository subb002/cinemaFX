
import React, { useEffect, useState } from 'react';
import { Movie } from '../types';
import { getVideoBlob } from '../services/storageService';

interface PlayerProps {
  movie: Movie;
  onClose: () => void;
}

const Player: React.FC<PlayerProps> = ({ movie, onClose }) => {
  const [videoSrc, setVideoSrc] = useState<string>(movie.videoUrl);
  const [isLoading, setIsLoading] = useState(movie.storageType === 'local');

  useEffect(() => {
    let objectUrl = '';
    
    const loadLocalVideo = async () => {
      if (movie.storageType === 'local') {
        try {
          const blob = await getVideoBlob(movie.id);
          if (blob) {
            objectUrl = URL.createObjectURL(blob);
            setVideoSrc(objectUrl);
          } else {
            alert("File not found in laptop storage. Please re-upload.");
          }
        } catch (error) {
          console.error("Error loading local video:", error);
          alert("Could not access laptop storage.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadLocalVideo();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [movie]);

  const handleError = (e: any) => {
    console.error("Video Error:", e);
    alert(`Playback Error: The ${movie.originalExtension || 'video'} format might not be supported by your browser. Chrome/Firefox usually support MKV/MP4 best.`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/95 to-transparent absolute top-0 w-full z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition text-white"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">{movie.title}</h2>
            <p className="text-sm text-gray-400">{movie.genre} • {movie.originalExtension?.toUpperCase() || 'HD'}</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full bg-black relative flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-red-900 border-t-red-600 rounded-full animate-spin" />
             <p className="text-gray-400 text-sm font-bold">Accessing laptop storage...</p>
          </div>
        ) : (
          <video 
            src={videoSrc} 
            controls 
            autoPlay 
            className="w-full max-h-full"
            poster={movie.thumbnailUrl}
            onError={handleError}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
};

export default Player;
