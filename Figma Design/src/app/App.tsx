import { useState } from 'react';
import { ChatScreen } from '@/app/components/ChatScreen';
import { HistoryScreen } from '@/app/components/HistoryScreen';
import { ProfileScreen } from '@/app/components/ProfileScreen';
import { BottomNav, TabType } from '@/app/components/BottomNav';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['h1', 'd1', 'm2']));

  const handleToggleFavorite = (songId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(songId)) {
        newFavorites.delete(songId);
      } else {
        newFavorites.add(songId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-950 text-white">
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <ChatScreen favorites={favorites} onToggleFavorite={handleToggleFavorite} />
        )}
        {activeTab === 'history' && (
          <HistoryScreen favorites={favorites} onToggleFavorite={handleToggleFavorite} />
        )}
        {activeTab === 'profile' && (
          <ProfileScreen favorites={favorites} onToggleFavorite={handleToggleFavorite} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
