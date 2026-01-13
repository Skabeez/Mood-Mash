import { Play, Heart, Calendar } from 'lucide-react';
import { Song } from '@/app/components/ChatScreen';

export interface HistoryEntry {
  id: string;
  song: Song;
  date: Date;
}

const mockHistory: HistoryEntry[] = [
  {
    id: '1',
    song: {
      id: 'h1',
      title: 'Weightless',
      artist: 'Marconi Union',
      albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
      youtubeId: 'UfcAVejslrU',
    },
    date: new Date('2026-01-13T10:01:00'),
  },
  {
    id: '2',
    song: {
      id: 'h2',
      title: 'Midnight City',
      artist: 'M83',
      albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      youtubeId: 'dX3k_QDnzHE',
    },
    date: new Date('2026-01-12T15:30:00'),
  },
  {
    id: '3',
    song: {
      id: 'h3',
      title: 'Electric Feel',
      artist: 'MGMT',
      albumArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
      youtubeId: 'MmZexg8sxyk',
    },
    date: new Date('2026-01-11T20:15:00'),
  },
  {
    id: '4',
    song: {
      id: 'h4',
      title: 'Intro',
      artist: 'The xx',
      albumArt: 'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?w=400&h=400&fit=crop',
      youtubeId: 'example4',
    },
    date: new Date('2026-01-10T12:00:00'),
  },
  {
    id: '5',
    song: {
      id: 'h5',
      title: 'Holocene',
      artist: 'Bon Iver',
      albumArt: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop',
      youtubeId: 'TWcyIpul8OE',
    },
    date: new Date('2026-01-09T18:45:00'),
  },
];

export function HistoryScreen({ 
  favorites, 
  onToggleFavorite 
}: { 
  favorites: Set<string>; 
  onToggleFavorite: (songId: string) => void;
}) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePlay = (youtubeId: string) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    window.open(youtubeUrl, '_blank');
  };

  return (
    <div className="h-full bg-gradient-to-b from-gray-950 to-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-950 to-gray-950/95 backdrop-blur-sm px-5 pt-6 pb-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">Listening History</h1>
        <p className="text-sm text-gray-400 mt-1">Your highlighted recommendations</p>
      </div>

      {/* History List */}
      <div className="px-5 py-4 space-y-3">
        {mockHistory.map((entry) => (
          <div
            key={entry.id}
            className="bg-gray-800/50 rounded-2xl overflow-hidden hover:bg-gray-800/70 transition-all"
          >
            <div className="flex gap-4 p-4">
              {/* Album Art */}
              <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                <img
                  src={entry.song.albumArt}
                  alt={`${entry.song.title} album art`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Song Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-base font-semibold text-white truncate mb-1">
                    {entry.song.title}
                  </h3>
                  <p className="text-sm text-gray-400 truncate mb-2">{entry.song.artist}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(entry.date)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 justify-center">
                <button
                  onClick={() => handlePlay(entry.song.youtubeId)}
                  className="p-2.5 bg-teal-600 rounded-full hover:bg-teal-700 transition-colors"
                  aria-label={`Play ${entry.song.title}`}
                >
                  <Play className="w-4 h-4 text-white fill-white" />
                </button>
                <button
                  onClick={() => onToggleFavorite(entry.song.id)}
                  className="p-2.5 bg-gray-700/50 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label={favorites.has(entry.song.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      favorites.has(entry.song.id)
                        ? 'fill-pink-500 text-pink-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
