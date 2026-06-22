import { Palette, Check } from 'lucide-react';

interface ThemeDescriptor {
  id: string;
  name: string;
  desc: string;
  accentClass: string;
  colors: string[]; // hex codes for display
}

interface ThemesViewProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export default function ThemesView({ currentTheme, onThemeChange }: ThemesViewProps) {
  const list: ThemeDescriptor[] = [
    {
      id: 'sunset',
      name: 'Immersive Orange',
      desc: 'Glowing sunset orange & amber accents over the core pure dark backdrop (Default)',
      accentClass: 'bg-orange-500',
      colors: ['#050507', 'rgba(255,255,255,0.03)', '#f97316', '#e0e0e6'],
    },
    {
      id: 'midnight',
      name: 'Midnight Purple',
      desc: 'Ambient dark purple glow over subsea deep charcoal finishes',
      accentClass: 'bg-purple-500',
      colors: ['#050507', 'rgba(255,255,255,0.03)', '#a855f7', '#e0e0e6'],
    },
    {
      id: 'forest',
      name: 'Forest Emerald',
      desc: 'Deep silent leaves and forest greens for relaxed, eye-strain relief focus',
      accentClass: 'bg-emerald-500',
      colors: ['#030805', 'rgba(255,255,255,0.02)', '#10b981', '#f0fdf4'],
    },
    {
      id: 'ocean',
      name: 'Deep Ocean Blue',
      desc: 'Deep marine sky accents evoking oceanic subsea tranquility',
      accentClass: 'bg-sky-500',
      colors: ['#020610', 'rgba(255,255,255,0.02)', '#0ea5e9', '#f0f9ff'],
    },
    {
      id: 'monochrome',
      name: 'Carbon Noir',
      desc: 'Sleek, minimalist pure black and white values for brutalist modern vibes',
      accentClass: 'bg-zinc-100',
      colors: ['#050507', 'rgba(255,255,255,0.03)', '#f4f4f5', '#ffffff'],
    },
    {
      id: 'daylight',
      name: 'Clean Daylight (Light)',
      desc: 'Bright and airy clean light theme with a sharp amber sunset pop',
      accentClass: 'bg-orange-500',
      colors: ['#f8fafc', 'rgba(0,0,0,0.03)', '#f97316', '#0f172a'],
    },
    {
      id: 'nordic',
      name: 'Nordic Sky (Light)',
      desc: 'Cool slate grays and crisp whites with a calming azure blue brand',
      accentClass: 'bg-sky-600',
      colors: ['#f1f5f9', 'rgba(0,0,0,0.04)', '#0284c7', '#1e293b'],
    },
    {
      id: 'cherry',
      name: 'Sakura Cherry (Light)',
      desc: 'Warm and inviting rose-tinted backdrop with vivid crimson accents',
      accentClass: 'bg-rose-600',
      colors: ['#fff1f2', 'rgba(225,29,72,0.04)', '#e11d48', '#4c0519'],
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Neon',
      desc: 'High contrast electric neon yellow accents with deep matrix greens',
      accentClass: 'bg-yellow-400',
      colors: ['#09090b', 'rgba(255,255,255,0.03)', '#facc15', '#a3e635'],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-40 md:pb-32 font-sans select-none text-text-primary">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Title Grid */}
        <div className="flex items-center gap-3 bg-white/5 p-6 rounded-3xl border border-border-color shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
            <Palette className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">App Interface Themes</h2>
          </div>
        </div>

        {/* Theme select option column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => onThemeChange(theme.id)}
                className={`group rounded-2xl border p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between relative shadow-sm hover:translate-y-[-1px] select-none ${
                  isSelected 
                    ? 'bg-brand/10 border-brand/35 shadow-brand/5 shadow-md' 
                    : 'bg-bg-secondary border-border-color hover:border-brand/20'
                }`}
              >
                
                {/* Title and radio */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
                      {theme.name}
                      {isSelected && (
                        <span className="text-[10px] bg-brand text-bg-primary font-mono tracking-wider px-1.5 py-0.5 rounded uppercase font-semibold">
                          Selected
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-[85%] pr-1">
                      {theme.desc}
                    </p>
                  </div>

                  {/* Radio Indicator */}
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                    isSelected ? 'border-brand bg-brand text-bg-primary' : 'border-border-color group-hover:border-brand'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Color swatches preview dots */}
                <div className="flex items-center gap-2.5 pt-6">
                  {theme.colors.map((color, idx) => (
                    <div 
                      key={idx}
                      className="w-5 h-5 rounded-full border border-white/10 shadow-sm relative group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <span className="text-[10px] text-text-muted font-mono ml-1.5">Colors outline preview</span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
