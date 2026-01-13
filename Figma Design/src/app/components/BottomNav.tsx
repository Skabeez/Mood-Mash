import { MessageCircle, Clock, User } from 'lucide-react';

export type TabType = 'chat' | 'history' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'chat' as TabType, icon: MessageCircle, label: 'Chat' },
    { id: 'history' as TabType, icon: Clock, label: 'History' },
    { id: 'profile' as TabType, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 px-4 py-2 safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              activeTab === id
                ? 'bg-purple-600/20 text-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            aria-label={label}
          >
            <Icon
              className={`w-6 h-6 transition-transform ${
                activeTab === id ? 'scale-110' : ''
              }`}
            />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
