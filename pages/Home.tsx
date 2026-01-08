
import React from 'react';
import { Movie, User } from '../types';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';

interface HomeProps {
  user: User | null;
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
}

const Home: React.FC<HomeProps> = ({ user, movies, onPlayMovie }) => {
  const handleDownload = (movie: Movie) => {
    if (!user?.canDownload) {
      alert("You don't have download permission. Contact admin.");
      return;
    }
    
    // Simulate mobile-like direct download
    const link = document.createElement('a');
    link.href = movie.videoUrl;
    link.download = `${movie.title}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`Downloading ${movie.title}... Check your device storage.`);
  };

  const genres = [...new Set(movies.map(m => m.genre))];

  return (
    <div className="pb-20">
      {movies.length > 0 && (
        <Hero movie={movies[0]} onPlay={onPlayMovie} />
      )}

      <div className="-mt-32 relative z-20 space-y-2">
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
          title="Cinemax Originals" 
          movies={movies} 
          user={user}
          onSelect={onPlayMovie}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default Home;
