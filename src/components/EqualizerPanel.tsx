import { Sparkles, RotateCcw } from 'lucide-react';

interface EqualizerPanelProps {
  eqGains: number[];
  onSetEqGain: (bandIdx: number, value: number) => void;
  onReset: () => void;
}

export default function EqualizerPanel({ eqGains, onSetEqGain, onReset }: EqualizerPanelProps) {
  const bands = [
    { label: '62 Hz', sub: 'Bass' },
    { label: '125 Hz', sub: 'Bass' },
    { label: '250 Hz', sub: 'Low Mid' },
    { label: '500 Hz', sub: 'Mid' },
    { label: '1 kHz', sub: 'Vocal Mid' },
    { label: '2 kHz', sub: 'High Mid' },
    { label: '4 kHz', sub: 'Treble' },
    { label: '8 kHz', sub: 'Presence' },
    { label: '16 kHz', sub: 'Brilliance' },
  ];

  const handleSliderChange = (bandIdx: number, val: string) => {
    onSetEqGain(bandIdx, parseFloat(val));
  };

  return (
    <div className="glass rounded-3xl p-6 border border-border-color shadow-2xl relative select-none font-sans max-w-4xl mx-auto w-full">
      {/* Header Accent Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-brand" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-text-primary">9-Band Pro Equalizer</h3>
            <p className="text-[10px] text-text-muted">Interactive Live Web Audio peaking filter board</p>
          </div>
        </div>

        {/* Reset Panel */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-border-color hover:border-brand/30 hover:text-brand text-text-muted active:scale-95 transition-all text-xs font-medium cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Flat
        </button>
      </div>

      {/* Mixing Desk Grid sliders */}
      <div className="grid grid-cols-5 md:grid-cols-9 gap-4 md:gap-2.5 pt-2 items-stretch h-[240px]">
        {bands.map((band, i) => {
          const currentGain = eqGains[i] !== undefined ? eqGains[i] : 0;
          return (
            <div key={band.label} className="flex flex-col items-center justify-between text-center select-none">
              
              {/* dB Label Indicator */}
              <span className="font-mono text-[9px] text-brand bg-brand/5 border border-brand/10 rounded px-1 min-w-[28px] py-0.5">
                {currentGain > 0 ? `+${currentGain.toFixed(0)}` : currentGain.toFixed(0)}
              </span>

              {/* Slider Track container */}
              <div className="relative w-7 my-4 flex justify-center flex-1">
                {/* Visual vertical track background guide lines */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] bg-white/5 rounded-full border border-white/5">
                  {/* Glowing dynamic active channel level indicator bar */}
                  <div 
                    className="absolute bottom-1/2 w-full bg-brand/35 rounded-full transition-all duration-100"
                    style={{
                      height: `${(Math.abs(currentGain) / 20) * 50}%`,
                      bottom: currentGain >= 0 ? '50%' : 'auto',
                      top: currentGain < 0 ? '50%' : 'auto',
                      transformOrigin: currentGain >= 0 ? 'bottom' : 'top',
                    }}
                  ></div>
                </div>

                {/* DB Slider Input */}
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="0.5"
                  value={currentGain}
                  onChange={(e) => handleSliderChange(i, e.target.value)}
                  className="absolute inset-0 h-full w-full opacity-0 cursor-col-resize md:cursor-row-resize"
                  style={{
                    writingMode: 'vertical-lr', 
                    direction: 'rtl',
                    transform: 'rotate(180deg)' // Fix slider drag direction (up=plus, down=minus)
                  }}
                />
                
                {/* Floating physical level knob tracker (emulated) */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 w-5 h-2.5 rounded bg-brand flex items-center justify-center border border-white/40 shadow-md shadow-brand/15 group pointer-events-none transition-all duration-100"
                  style={{
                    // Maps -20dB to 20dB to bottom 0% to top 100% boundary
                    bottom: `${((currentGain + 20) / 40) * 100}%`,
                    transform: 'translate(-50%, 50%)'
                  }}
                >
                  <div className="w-[1px] h-1.5 bg-bg-primary"></div>
                </div>
              </div>

              {/* Band Hertz Scale Label */}
              <div className="space-y-0.5">
                <div className="font-mono text-[10px] font-semibold text-text-primary truncate max-w-[55px]">
                  {band.label}
                </div>
                <div className="text-[8px] text-text-muted lowercase tracking-tight scale-90 truncate max-w-[55px]">
                  {band.sub}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
