import { DownloadState } from '../downloadManager';
import { getMediumImage } from '../api';
import { X, Loader2 } from 'lucide-react';

interface DownloadModalProps {
  state: DownloadState;
  onCancel: () => void;
}

export default function DownloadModal({ state, onCancel }: DownloadModalProps) {
  if (!state.isDownloading && !state.statusMessage) {
    return null;
  }

  const currentSong = state.currentSong;
  const imageUrl = currentSong ? getMediumImage(currentSong.image) : '';
  const progressPercent = state.songProgress;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
      <div className="glass w-full max-w-sm rounded-2xl p-6 border border-border-color shadow-2xl relative select-none text-text-primary">
        {/* Cancel Trigger Top Right */}
        {state.isDownloading && (
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-center text-center mt-2">
          {/* Cover Art Preview */}
          {currentSong ? (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-lg bg-bg-secondary mb-4 border border-border-color">
              <img
                src={imageUrl}
                alt={currentSong.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
          )}

          {/* Titles */}
          <h3 className="font-semibold text-base truncate max-w-full px-2">
            {state.isDownloading ? 'Downloading Track' : 'Process Status'}
          </h3>
          {currentSong && state.isDownloading && (
            <p className="text-xs text-text-muted mt-1 truncate max-w-full px-4">
              {currentSong.name} • {currentSong.artists.primary.map(a => a.name).join(', ')}
            </p>
          )}

          {/* Progress Slider Bar */}
          {state.isDownloading && (
            <div className="w-full mt-6 space-y-2">
              <div className="flex justify-between text-xs font-mono text-text-muted">
                <span>
                  Track {state.currentIndex + 1} of {state.totalSongs}
                </span>
                <span>{progressPercent}%</span>
              </div>
              
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-brand transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Live Status Message Label */}
          <p className="text-xs font-mono text-text-muted mt-5 bg-white/5 rounded-lg py-2 px-3 w-full border border-white/5 truncate">
            {state.statusMessage}
          </p>

          {/* Cancel button below */}
          {state.isDownloading && (
            <button
              onClick={onCancel}
              className="mt-6 w-full py-2.5 bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-border-color hover:border-text-muted/30 text-text-muted hover:text-text-primary rounded-xl text-xs font-semibold tracking-wide transition-all"
            >
              Cancel Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
