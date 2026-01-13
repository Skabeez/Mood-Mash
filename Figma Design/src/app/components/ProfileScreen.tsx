import { Heart, Music, Clock, Settings, ChevronRight } from 'lucide-react';
import { Song } from '@/app/components/ChatScreen';

const mockFavoriteGenres = ['Ambient', 'Electronic', 'Indie', 'Alternative'];
const mockFavoriteMoods = ['Chill', 'Upbeat', 'Melancholic', 'Energetic'];

export function ProfileScreen({ 
  favorites, 
  onToggleFavorite 
}: { 
  favorites: Set<string>; 
  onToggleFavorite: (songId: string) => void;
}) {
  const mockFavoriteSongs: Song[] = [
    {
      id: 'h1',
      title: 'Weightless',
      artist: 'Marconi Union',
      albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop',
      youtubeId: 'UfcAVejslrU',
    },
    {
      id: 'd1',
      title: 'Arrival',
      artist: 'Helios',
      albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
      youtubeId: 'example1',
    },
    {
      id: 'm2',
      title: 'Holocene',
      artist: 'Bon Iver',
      albumArt: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop',
      youtubeId: 'example7',
    },
  ];

  const favoriteSongsFiltered = mockFavoriteSongs.filter((song) => favorites.has(song.id));

  return (
    <div className="h-full bg-gradient-to-b from-gray-950 to-gray-900 overflow-y-auto">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-purple-900/30 to-teal-900/30 px-5 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            MU
          </div>
          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">Music User</h1>
            <p className="text-sm text-gray-400">Your personal music companion</p>
          </div>
          <button
            className="p-2 hover:bg-gray-800/50 rounded-full transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Preferences Section */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Music className="w-5 h-5 text-teal-400" />
            Music Preferences
          </h2>
          
          {/* Favorite Genres */}
          <div className="bg-gray-800/50 rounded-2xl p-4 mb-3">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Favorite Genres</h3>
            <div className="flex flex-wrap gap-2">
              {mockFavoriteGenres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1.5 bg-purple-600/30 text-purple-300 rounded-full text-sm border border-purple-500/30"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Favorite Moods */}
          <div className="bg-gray-800/50 rounded-2xl p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Favorite Moods</h3>
            <div className="flex flex-wrap gap-2">
              {mockFavoriteMoods.map((mood) => (
                <span
                  key={mood}
                  className="px-3 py-1.5 bg-teal-600/30 text-teal-300 rounded-full text-sm border border-teal-500/30"
                >
                  {mood}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Favorites Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
              Saved Favorites
            </h2>
            <span className="text-sm text-gray-400">{favorites.size} songs</span>
          </div>

          {favoriteSongsFiltered.length > 0 ? (
            <div className="bg-gray-800/50 rounded-2xl overflow-hidden">
              {favoriteSongsFiltered.map((song, index) => (
                <div
                  key={song.id}
                  className={`flex items-center gap-3 p-4 hover:bg-gray-700/50 transition-colors ${
                    index !== favoriteSongsFiltered.length - 1 ? 'border-b border-gray-700/50' : ''
                  }`}
                >
                  <img
                    src={song.albumArt}
                    alt={`${song.title} album art`}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{song.title}</h4>
                    <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(song.id)}
                    className="p-2"
                    aria-label="Remove from favorites"
                  >
                    <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-2xl p-8 text-center">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No favorites yet</p>
              <p className="text-gray-500 text-xs mt-1">
                Save songs from recommendations to see them here
              </p>
            </div>
          )}
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-gray-300">Highlights</h3>
            </div>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-xs text-gray-400 mt-1">songs discovered</p>
          </div>

          <div className="bg-gradient-to-br from-teal-900/30 to-teal-800/30 rounded-2xl p-4 border border-teal-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <h3 className="text-sm font-medium text-gray-300">Listening</h3>
            </div>
            <p className="text-2xl font-bold text-white">8.5</p>
            <p className="text-xs text-gray-400 mt-1">hours this week</p>
          </div>
        </section>

        {/* Action Items */}
        <section className="space-y-2">
          <button className="w-full bg-gray-800/50 hover:bg-gray-800 rounded-2xl p-4 flex items-center justify-between transition-colors">
            <span className="text-sm font-medium text-white">Listening History</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full bg-gray-800/50 hover:bg-gray-800 rounded-2xl p-4 flex items-center justify-between transition-colors">
            <span className="text-sm font-medium text-white">Manage Preferences</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </section>
      </div>
    </div>
  );
}
