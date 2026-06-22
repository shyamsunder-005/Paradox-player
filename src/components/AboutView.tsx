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
                <Sliders className="w-5 h-5 text-brand" />
                <h4 className="font-semibold text-sm">9-Band Graphic Equalizer</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Synthesized live via a connected peak-gain BiquadFilterNode chain on the Web Audio API, adjusting gains from -20dB to +20dB in real time.
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



        {/* Closing Credits Note */}
        <div className="text-center font-mono text-[11px] text-text-muted py-2 space-y-1">
          <div>Built by Sree. Non-profit open-source project.</div>
        </div>

      </div>
    </div>
  );
}
