
import React from 'react';
import { Movie, User } from '../types';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import { getVideoBlob } from '../services/storageService';

interface HomeProps {
  user: User | null;
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
}

const Home: React.FC<HomeProps> = ({ user, movies, onPlayMovie }) => {
  const handleDownload = async (movie: Movie) => {
    if (!user?.canDownload) {
      alert("Permission Denied: You don't have download access. Contact Admin.");
      return;
    }
    
    try {
      let downloadUrl = movie.videoUrl;
      let cleanup = false;

      if (movie.storageType === 'local') {
        const blob = await getVideoBlob(movie.id);
        if (blob) {
          downloadUrl = URL.createObjectURL(blob);
          cleanup = true;
        } else {
          alert("File not found on this device.");
          return;
        }
      }

      const ext = movie.originalExtension || 'mp4';
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${movie.title.replace(/\s+/g, '_')}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (cleanup) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
      }
      
      alert(`Saving "${movie.title}" to your laptop downloads folder...`);
    } catch (error) {
      alert("Download failed. Check your laptop storage.");
    }
  };

  const genres = [...new Set(movies.map(m => m.genre))];

  return (
    <div className="pb-20">
      {movies.length > 0 ? (
        <Hero movie={movies[0]} onPlay={onPlayMovie} />
      ) : (
        <div className="h-[80vh] flex items-center justify-center bg-neutral-950">
           <div className="text-center">
              <h1 className="text-red-600 font-black text-6xl mb-4">CINEMAX</h1>
              <p className="text-gray-500">Your library is empty. Add movies in the Admin Panel.</p>
           </div>
        </div>
      )}

      <div className="-mt-32 relative z-20 space-y-2">
        {movies.length > 0 && (
          <>
            <MovieRow 
              title="Recently Added" 
              movies={movies.slice(0, 10)} 
              user={user}
              onSelect={onPlayMovie}
              onDownload={handleDownload}
            />

            {genres.map(genre => (
              <MovieRow 
                key={genre}
                title={`${genre} Hits`} 
                movies={movies.filter(m => m.genre === genre)} 
                user={user}
                onSelect={onPlayMovie}
                onDownload={handleDownload}
              />
            ))}

            <MovieRow 
              title="All Movies" 
              movies={movies} 
              user={user}
              onSelect={onPlayMovie}
              onDownload={handleDownload}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
