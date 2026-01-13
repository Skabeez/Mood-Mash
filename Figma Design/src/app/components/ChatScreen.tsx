import { useState, useRef, useEffect } from 'react';
import { Mic, Send } from 'lucide-react';
import { RecommendationCard } from '@/app/components/RecommendationCard';
import { HighlightSongCard } from '@/app/components/HighlightSongCard';

export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  youtubeId: string;
  isFavorite?: boolean;
}

export interface Recommendation {
  id: string;
  type: 'ai' | 'user';
  message?: string;
  highlight?: Song;
  deepCuts?: Song[];
  mainstreampicks?: Song[];
  timestamp: Date;
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    type: 'user',
    message: 'Hey! I\'m in the mood for something chill and ambient. Any suggestions?',
    timestamp: new Date('2026-01-13T10:00:00'),
  },
  {
    id: '2',
    type: 'ai',
    message: 'Great choice! Here are some ambient gems I think you\'ll love. Starting with a highlight pick, plus some deep cuts and mainstream favorites.',
    highlight: {
      id: 'h1',
      title: 'Weightless',
      artist: 'Marconi Union',
      albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
      youtubeId: 'UfcAVejslrU',
    },
    deepCuts: [
      {
        id: 'd1',
        title: 'Arrival',
        artist: 'Helios',
        albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        youtubeId: 'example1',
      },
      {
        id: 'd2',
        title: 'The Four Seasons',
        artist: 'Ólafur Arnalds',
        albumArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
        youtubeId: 'example2',
      },
      {
        id: 'd3',
        title: 'First Light',
        artist: 'Harold Budd',
        albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        youtubeId: 'example3',
      },
      {
        id: 'd4',
        title: 'Reflection',
        artist: 'Brian Eno',
        albumArt: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&h=300&fit=crop',
        youtubeId: 'example4',
      },
      {
        id: 'd5',
        title: 'Golden Hour',
        artist: 'Loscil',
        albumArt: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300&h=300&fit=crop',
        youtubeId: 'example5',
      },
    ],
    mainstreampicks: [
      {
        id: 'm1',
        title: 'Awake',
        artist: 'Tycho',
        albumArt: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
        youtubeId: 'example6',
      },
      {
        id: 'm2',
        title: 'Holocene',
        artist: 'Bon Iver',
        albumArt: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop',
        youtubeId: 'example7',
      },
      {
        id: 'm3',
        title: 'Re: Stacks',
        artist: 'Bon Iver',
        albumArt: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=300&h=300&fit=crop',
        youtubeId: 'example8',
      },
      {
        id: 'm4',
        title: 'A Walk',
        artist: 'Tycho',
        albumArt: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
        youtubeId: 'example9',
      },
      {
        id: 'm5',
        title: 'Intro',
        artist: 'The xx',
        albumArt: 'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?w=300&h=300&fit=crop',
        youtubeId: 'example10',
      },
    ],
    timestamp: new Date('2026-01-13T10:01:00'),
  },
];

export function ChatScreen({ 
  favorites, 
  onToggleFavorite 
}: { 
  favorites: Set<string>; 
  onToggleFavorite: (songId: string) => void;
}) {
  const [messages, setMessages] = useState<Recommendation[]>(mockRecommendations);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Recommendation = {
      id: Date.now().toString(),
      type: 'user',
      message: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-950 to-gray-900">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] ${
                msg.type === 'user'
                  ? 'bg-purple-600 text-white rounded-[20px] rounded-tr-[4px]'
                  : 'bg-gray-800 text-gray-100 rounded-[20px] rounded-tl-[4px]'
              } px-5 py-3`}
            >
              {msg.message && <p className="text-[15px] leading-relaxed">{msg.message}</p>}
              
              {/* AI Response with Recommendations */}
              {msg.type === 'ai' && (msg.highlight || msg.deepCuts || msg.mainstreampicks) && (
                <div className="mt-4 space-y-6">
                  {/* Highlight Song */}
                  {msg.highlight && (
                    <div>
                      <h3 className="text-sm font-semibold text-teal-400 mb-3 uppercase tracking-wide">
                        ✨ Highlight Pick
                      </h3>
                      <HighlightSongCard
                        song={msg.highlight}
                        isFavorite={favorites.has(msg.highlight.id)}
                        onToggleFavorite={() => onToggleFavorite(msg.highlight.id)}
                      />
                    </div>
                  )}

                  {/* Deep Cuts */}
                  {msg.deepCuts && msg.deepCuts.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wide">
                        🎵 Deep Cuts
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                        {msg.deepCuts.map((song) => (
                          <RecommendationCard
                            key={song.id}
                            song={song}
                            isFavorite={favorites.has(song.id)}
                            onToggleFavorite={() => onToggleFavorite(song.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mainstream Picks */}
                  {msg.mainstreampicks && msg.mainstreampicks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-pink-400 mb-3 uppercase tracking-wide">
                        🔥 Mainstream Picks
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                        {msg.mainstreampicks.map((song) => (
                          <RecommendationCard
                            key={song.id}
                            song={song}
                            isFavorite={favorites.has(song.id)}
                            onToggleFavorite={() => onToggleFavorite(song.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="px-4 pb-6 pt-3 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800">
        <div className="flex items-center gap-3 bg-gray-800 rounded-full px-4 py-3 shadow-lg">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for music recommendations..."
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-400 outline-none text-[15px]"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
          <button
            className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
            aria-label="Voice input"
          >
            <Mic className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
