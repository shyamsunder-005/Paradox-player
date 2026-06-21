import { Info, Disc, Sliders, Keyboard, Heart, ListCollapse } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 font-sans select-none text-text-primary">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        
        {/* Title branding hero */}
        <div className="bg-gradient-to-tr from-brand/10 to-brand/5 border border-border-color p-8 rounded-3xl space-y-4 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand to-brand-hover flex items-center justify-center shadow-lg shadow-brand/15 mx-auto">
            <Disc className="w-10 h-10 text-bg-primary animate-spin-slow" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">About Paradox Player</h2>
            <p className="text-xs text-text-muted max-w-md mx-auto">
              A high-fidelity client-only single-page music ecosystem. Beautiful dark styling, advanced filters, and zero advertisement disruptions.
            </p>
          </div>
        </div>

        {/* Feature listings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-brand px-1">Application Features</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-bg-secondary border border-border-color p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2.5 text-text-primary">
                <Disc className="w-5 h-5 text-brand" />
                <h4 className="font-semibold text-sm">CORS-Unlocked JioSaavn Streams</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Fetches music data and stream paths dynamically from saavn.dev's API, supporting up to 320kbps highest bitrate playback.
              </p>
            </div>

            <div className="bg-bg-secondary border border-border-color p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2.5 text-text-primary">
                <Sliders className="w-5 h-5 text-brand" />
                <h4 className="font-semibold text-sm">9-Band Graphic Equalizer</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Synthesized live via a connected peak-gain BiquadFilterNode chain on the Web Audio API, adjusting gains from -20dB to +20dB in real time.
              </p>
            </div>

            <div className="bg-bg-secondary border border-border-color p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2.5 text-text-primary">
                <Keyboard className="w-5 h-5 text-brand" />
                <h4 className="font-semibold text-sm">Client-Side ID3v2 Tagging</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Appends title, artist name, album name, and embedded cover art directly into downloaded MP3 binaries on-the-fly inside the browser.
              </p>
            </div>

            <div className="bg-bg-secondary border border-border-color p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2.5 text-text-primary">
                <Heart className="w-5 h-5 text-brand" />
                <h4 className="font-semibold text-sm">100% Offline-First Cache</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Keeps your favorites, custom folder playlists, playing queue, and custom visual color themes persisted safely inside local storage.
              </p>
            </div>

          </div>
        </div>

        {/* Keyboard Shortcuts Visual Board */}
        <div className="glass border border-border-color p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-brand" />
            <span className="text-base font-semibold text-text-primary">Global Keyboard Shortcuts</span>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Quickly control the player regardless of which page view is open. These hotkeys cooperate smoothly with focus traps so you can type entries inside the search bar without misfiring actions.
          </p>

          <div className="grid grid-cols-2 gap-3.5 pt-2">
            
            <div className="flex items-center justify-between py-2.5 border-b border-border-color/50 text-xs">
              <span className="text-text-primary font-medium">Play / Pause</span>
              <kbd className="px-2.5 py-1 bg-white/5 border border-border-color rounded-lg font-mono text-[10px] text-brand shadow-sm font-bold uppercase">
                Spacebar
              </kbd>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-border-color/50 text-xs">
              <span className="text-text-primary font-medium">Seek Forward 5s</span>
              <kbd className="px-2.5 py-1 bg-white/5 border border-border-color rounded-lg font-mono text-[10px] text-brand shadow-sm font-bold">
                ➔ Arrow Right
              </kbd>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-border-color/50 text-xs">
              <span className="text-text-primary font-medium">Seek Backward 5s</span>
              <kbd className="px-2.5 py-1 bg-white/5 border border-border-color rounded-lg font-mono text-[10px] text-brand shadow-sm font-bold">
                Level Arrow Left
              </kbd>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-border-color/50 text-xs">
              <span className="text-text-primary font-medium">Increase Volume 5%</span>
              <kbd className="px-2.5 py-1 bg-white/5 border border-border-color rounded-lg font-mono text-[10px] text-brand shadow-sm font-bold">
                ▲ Arrow Up
              </kbd>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-border-color/50 text-xs">
              <span className="text-text-primary font-medium">Decrease Volume 5%</span>
              <kbd className="px-2.5 py-1 bg-white/5 border border-border-color rounded-lg font-mono text-[10px] text-brand shadow-sm font-bold">
                ▼ Arrow Down
              </kbd>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-border-color/50 text-xs">
              <span className="text-text-primary font-medium">Toggle Mute / Unmute</span>
              <kbd className="px-2.5 py-1 bg-white/5 border border-border-color rounded-lg font-mono text-[10px] text-brand shadow-sm font-bold uppercase">
                M
              </kbd>
            </div>

          </div>
        </div>

        {/* Closing Credits Note */}
        <div className="text-center font-mono text-[11px] text-text-muted py-2 space-y-1">
          <div>Built by Paradox Systems. Non-profit open-source project.</div>
          <div>No licensing, no analytics cookies, no user tracking.</div>
        </div>

      </div>
    </div>
  );
}
