import React from 'react';
import { PlayerState } from '../playerEngine';
import { getMediumImage } from '../api';
import { formatDuration } from '../utils/format';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, 
  Volume2, VolumeX, Heart, Maximize2 
} from 'lucide-react';

interface PlayerBarProps {
  playerState: PlayerState;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onOpenSongPage: () => void;
}

export default function PlayerBar({
  playerState,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onShuffleToggle,
  onRepeatToggle,
  isFavorite,
  onFavoriteToggle,
  onOpenSongPage,
}: PlayerBarProps) {
  const { currentSong, isPlaying, currentTime, duration, volume, isShuffle, repeatMode } = playerState;

  if (!currentSong) return null;

  const imageUrl = getMediumImage(currentSong.image);
  const artistNames = currentSong.artists.primary.map((a) => a.name).join(', ') || 'Unknown Artist';

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek((val / 100) * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onVolumeChange(val);
  };

  const toggleMute = () => {
    if (volume > 0) {
      onVolumeChange(0);
    } else {
      onVolumeChange(0.8);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 md:h-24 glass border-t border-border-color z-40 flex flex-col justify-between select-none pb-safe">
      {/* Absolute Progress Scrubber for Mobile + Desktop */}
      <div className="w-full h-1 relative group cursor-pointer" title="Seek (Arrow Left/Right)">
        <input
          type="range"
          min="0"
          max="100"
          step="0.01"
          value={progressPercent}
          onChange={handleSeekChange}
          className="absolute top-0 left-0 w-full h-1 h-hover:h-2 opacity-0 group-hover:opacity-100 cursor-pointer z-20 outline-none accent-brand"
          style={{ appearance: 'none', background: 'transparent' }}
        />
        {/* Track Visual */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 group-hover:h-1.5 transition-all">
          <div 
            className="h-full bg-brand relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>

      {/* Main Bar Contents */}
      <div className="flex-1 flex items-center justify-between px-4 md:px-8 gap-4">
        
        {/* Thumbnail & Track Metadata Info */}
        <div 
          className="flex items-center gap-3 min-w-0 max-w-[40%] cursor-pointer group"
          onClick={onOpenSongPage}
        >
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-bg-secondary shrink-0 border border-border-color shadow-md">
            <img
              src={imageUrl}
              alt={currentSong.name}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="min-w-0">
            <h4 className="font-sans font-semibold text-sm text-text-primary truncate group-hover:text-brand transition-colors">
              {currentSong.name}
            </h4>
            <p className="font-sans text-xs text-text-muted truncate mt-0.5 group-hover:text-text-primary transition-colors">
              {artistNames}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            className={`p-2 rounded-xl transition-colors hidden sm:block ${
              isFavorite ? 'text-brand' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Heart className={`w-4 items-center h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Playback Controls & Timers */}
        <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl">
          <div className="flex items-center gap-2 md:gap-5">
            {/* Shuffle Toggle */}
            <button
              onClick={onShuffleToggle}
              className={`p-2 rounded-xl transition-colors ${
                isShuffle ? 'text-brand' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            </button>

            {/* Back Arrow */}
            <button
              onClick={onPrevious}
              className="p-2 text-text-muted hover:text-text-primary active:scale-95 transition-transform"
              title="Previous song"
            >
              <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Play/Pause Blob */}
            <button
              onClick={onTogglePlay}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand text-bg-primary hover:scale-105 active:scale-95 transition-transform flex items-center justify-center shadow-lg shadow-brand/10 cursor-pointer"
              title={isPlaying ? 'Pause (Spacebar)' : 'Play (Spacebar)'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-[3px]" />
              )}
            </button>

            {/* Skip Arrow */}
            <button
              onClick={onNext}
              className="p-2 text-text-muted hover:text-text-primary active:scale-95 transition-transform"
              title="Next song"
            >
              <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Repeat Toggle */}
            <button
              onClick={onRepeatToggle}
              className={`p-2 rounded-xl transition-colors relative ${
                repeatMode !== 'off' ? 'text-brand' : 'text-text-muted hover:text-text-primary'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              ) : (
                <Repeat className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              )}
              {repeatMode === 'all' && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand"></span>
              )}
            </button>
          </div>

          {/* Time text timers (hidden on small list row) */}
          <div className="hidden md:flex items-center gap-3 w-full justify-center">
            <span className="font-mono text-[11px] text-text-muted">{formatDuration(currentTime)}</span>
            <span className="text-text-muted/30">/</span>
            <span className="font-mono text-[11px] text-text-muted">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Volume slider & maximize */}
        <div className="flex items-center gap-4 text-text-muted max-w-[25%] shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <button onClick={toggleMute} className="p-1 hover:text-text-primary transition-colors" title={volume === 0 ? 'Unmute (M)' : 'Mute (M)'}>
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-white/10 rounded-full cursor-pointer outline-none accent-brand"
              title="Volume (Arrow Up/Down)"
            />
          </div>

          <button 
            onClick={onOpenSongPage}
            className="p-2 hover:text-text-primary active:scale-95 transition-all text-text-muted" 
            title="Open Full Player Page"
          >
            <Maximize2 className="w-4 h-4 md:w-5 md:h-5 text-brand" />
          </button>
        </div>
      </div>
    </div>
  );
}
