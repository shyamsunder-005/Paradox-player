import { NavigationSection } from '../types';
import { Home, ListMusic, Heart, Palette, Disc } from 'lucide-react';

interface BottomNavProps {
  currentSection: NavigationSection;
  setSection: (section: NavigationSection) => void;
}

export default function BottomNav({ currentSection, setSection }: BottomNavProps) {
  const navItems = [
    { id: 'feed', name: 'Feed', icon: Home },
    { id: 'song-page', name: 'Playing', icon: Disc },
    { id: 'queue', name: 'Queue', icon: ListMusic },
    { id: 'favourites', name: 'Liked', icon: Heart },
    { id: 'themes', name: 'Themes', icon: Palette },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass border-t border-border-color flex justify-around items-center px-2 z-40 select-none pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 ${
              isActive ? 'text-brand' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-medium tracking-tight">{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
