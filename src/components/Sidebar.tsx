import { NavigationSection } from '../types';
import { Home, ListMusic, Heart, Palette, Info, Disc, Settings } from 'lucide-react';

interface SidebarProps {
  currentSection: NavigationSection;
  setSection: (section: NavigationSection) => void;
}

export default function Sidebar({ currentSection, setSection }: SidebarProps) {
  const navItems = [
    { id: 'feed', name: 'Home Feed', icon: Home },
    { id: 'song-page', name: 'Now Playing', icon: Disc },
    { id: 'queue', name: 'Play Queue', icon: ListMusic },
    { id: 'favourites', name: 'Favorites', icon: Heart },
    { id: 'themes', name: 'App Themes', icon: Palette },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'about', name: 'About App', icon: Info },
  ] as const;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-bg-secondary border-r border-border-color h-screen p-6 select-none shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => setSection('feed')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-brand-hover flex items-center justify-center shadow-lg shadow-brand/20">
          <Disc className="w-6 h-6 text-bg-primary animate-spin-slow" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg tracking-tight text-text-primary">Paradox Player</h1>
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Premium Audio</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-sm group ${
                isActive
                  ? 'bg-brand text-bg-primary shadow-lg shadow-brand/10'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-bg-primary' : 'text-text-muted group-hover:text-brand'
              }`} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding Info */}
      <div className="border-t border-border-color pt-4 font-mono text-[11px] text-text-muted space-y-1">
        <div>Paradox Player</div>
        <div className="text-[10px] opacity-75">100% Ad-Free Audio</div>
      </div>
    </aside>
  );
}
