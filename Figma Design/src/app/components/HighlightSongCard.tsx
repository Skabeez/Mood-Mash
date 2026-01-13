import { Play, Heart } from 'lucide-react';
import { Song } from '@/app/components/ChatScreen';

interface HighlightSongCardProps {
  song: Song;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function HighlightSongCard({ song, isFavorite, onToggleFavorite }: HighlightSongCardProps) {
  const handlePlay = () => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${song.youtubeId}`;
    window.open(youtubeUrl, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-gray-700/60 to-gray-800/60 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
      <div className="flex gap-4 p-4">
        {/* Album Art */}
        <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden">
          <img
            src={song.albumArt}
            alt={`${song.title} album art`}
            className="w-full h-full object-cover"
          />
          {/* Play Button Overlay */}
          <button
            onClick={handlePlay}
            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group"
            aria-label={`Play ${song.title}`}
          >
            <div className="bg-white rounded-full p-3 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-gray-900 fill-gray-900" />
            </div>
          </button>
        </div>

        {/* Song Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1 truncate">{song.title}</h3>
            <p className="text-sm text-gray-300 truncate">{song.artist}</p>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handlePlay}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 transition-colors"
              aria-label={`Play ${song.title}`}
            >
              <Play className="w-4 h-4 text-white fill-white" />
              <span className="text-sm font-medium text-white">Play</span>
            </button>
            <button
              onClick={onToggleFavorite}
              className="px-3 py-2.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-300'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
