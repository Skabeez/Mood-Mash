import { Play, Heart } from 'lucide-react';
import { Song } from '@/app/components/ChatScreen';

interface RecommendationCardProps {
  song: Song;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function RecommendationCard({ song, isFavorite, onToggleFavorite }: RecommendationCardProps) {
  const handlePlay = () => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${song.youtubeId}`;
    window.open(youtubeUrl, '_blank');
  };

  return (
    <div className="flex-shrink-0 w-[140px] bg-gray-700/50 rounded-xl overflow-hidden hover:bg-gray-700/70 transition-all">
      {/* Album Art */}
      <div className="relative aspect-square">
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
            <Play className="w-5 h-5 text-gray-900 fill-gray-900" />
          </div>
        </button>
      </div>

      {/* Song Info */}
      <div className="p-3">
        <h4 className="text-sm font-medium text-white truncate mb-1">{song.title}</h4>
        <p className="text-xs text-gray-400 truncate mb-3">{song.artist}</p>

        {/* Favorite Button */}
        <button
          onClick={onToggleFavorite}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-pink-500 text-pink-500' : 'text-gray-400'
            }`}
          />
          <span className="text-xs text-gray-300">
            {isFavorite ? 'Saved' : 'Save'}
          </span>
        </button>
      </div>
    </div>
  );
}
