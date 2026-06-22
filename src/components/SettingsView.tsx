import { Settings, Check, ListMusic } from 'lucide-react';

interface SettingsViewProps {
  autoFillQueue: boolean;
  onAutoFillQueueToggle: (val: boolean) => void;
}

export default function SettingsView({ autoFillQueue, onAutoFillQueueToggle }: SettingsViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 font-sans select-none text-text-primary">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Title Grid */}
        <div className="flex items-center gap-3 bg-white/5 p-6 rounded-3xl border border-border-color shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Player Settings</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Customize the behavior of Paradox Player.
            </p>
          </div>
        </div>

        {/* Settings column */}
        <div className="grid grid-cols-1 gap-4">
          
          <div
            onClick={() => onAutoFillQueueToggle(!autoFillQueue)}
            className={`group rounded-2xl border p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between relative shadow-sm hover:translate-y-[-1px] select-none ${
              autoFillQueue 
                ? 'bg-brand/10 border-brand/35 shadow-brand/5 shadow-md' 
                : 'bg-bg-secondary border-border-color hover:border-brand/20'
            }`}
          >
            {/* Title and radio */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <ListMusic className="w-5 h-5 text-text-muted" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
                    Auto-Fill Queue Context
                  </h3>
                  <p className="text-xs text-text-muted mt-1 flex-1">
                    When playing a song from search results, an album, or a playlist, automatically load the surrounding tracks into the Play Queue to provide uninterrupted playback. Turn this off if you strictly want only the clicked song to be played.
                  </p>
                </div>
              </div>

              {/* Radio Indicator */}
              <div className={`w-10 h-6 rounded-full border flex items-center transition-colors shrink-0 px-0.5 ${
                autoFillQueue ? 'border-brand bg-brand' : 'border-border-color group-hover:border-brand/50'
              }`}>
                <div className={`w-4 h-4 rounded-full bg-bg-primary transition-transform duration-300 ${
                  autoFillQueue ? 'translate-x-4 shadow-sm' : 'translate-x-0 bg-text-muted'
                }`}></div>
              </div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
