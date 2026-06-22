import React, { useState, useEffect } from 'react';
import { Song, Playlist } from '../types';
import { getBigImage, searchSongs, cleanSong } from '../api';
import { PlayerState } from '../playerEngine';
import { formatDuration } from '../utils/format';
import EqualizerPanel from './EqualizerPanel';
import SongCard from './SongCard';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1,
  Sparkles, Heart, Volume2, Sliders, ListMusic, ListCollapse 
} from 'lucide-react';

interface SongPageProps {
  playerState: PlayerState;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  isFavorite: boolean;
  onFavoriteToggle: (song: Song) => void;
  onSetEqGain: (band: number, gain: number) => void;
  onResetEq: () => void;
  playlists: Playlist[];
  onAddToPlaylist: (songId: string, playlistId: string) => void;
  onCreatePlaylistAndAdd: (songId: string, name: string) => void;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onAddToQueue: (song: Song) => void;
  onDownloadSong: (song: Song) => void;
  favourites: Song[];
}

export default function SongPage({
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
  onSetEqGain,
  onResetEq,
  playlists,
  onAddToPlaylist,
  onCreatePlaylistAndAdd,
  onPlaySong,
  onAddToQueue,
  onDownloadSong,
  favourites,
}: SongPageProps) {
  const { currentSong, isPlaying, currentTime, duration, volume, isShuffle, repeatMode, eqGains } = playerState;
  const [showEq, setShowEq] = useState(false);
  const [suggestedSongs, setSuggestedSongs] = useState<Song[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const imageUrl = currentSong ? getBigImage(currentSong.image) : '';
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const artistNames = currentSong ? currentSong.artists.primary.map((a) => a.name).join(', ') : 'Unknown Artist';

  // Smart suggestions loader based on playing song 
  useEffect(() => {
    if (!currentSong) return;
    
    let active = true;
    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const firstArtist = currentSong.artists.primary[0]?.name || '';
        if (firstArtist) {
          const songs = await searchSongs(firstArtist);
          // Filter out current song to avoid redundancy
          const suggestions = songs.filter((s) => s.id !== currentSong.id).slice(0, 5);
          if (active) {
            setSuggestedSongs(suggestions);
          }
        }
      } catch (err) {
        console.error('Failed to preload suggested songs list:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
    return () => {
      active = false;
    };
  }, [currentSong?.id]);

  if (!currentSong) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 select-none text-center font-sans space-y-4">
        <Sliders className="w-16 h-16 stroke-1 text-text-muted animate-pulse" />
        <div>
          <h3 className="font-bold text-lg text-text-primary">No Song Playing</h3>
          <p className="text-xs text-text-muted mt-1 max-w-xs">
            Start playing custom streams from the Home Feed, or explore your local playlist imports.
          </p>
        </div>
      </div>
    );
  }

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek((val / 100) * duration);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onVolumeChange(val);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 font-sans select-none text-text-primary">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Core Layout: Grid splits Artwork and Player controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
          
          {/* Section A: Large CD Art Disk */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              {/* Immersive UI Art Background Glow */}
              <div className="absolute -inset-4 bg-brand/30 blur-2xl rounded-full opacity-60 group-hover:scale-105 transition-all duration-500 pointer-events-none"></div>
              
              <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-border-color overflow-hidden bg-bg-secondary shadow-2xl skew-x-1 hover:rotate-1 transition-transform duration-500 flex items-center justify-center ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}>
                {/* CD Ring Texture */}
                <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none z-10"></div>
                <div className="absolute inset-10 rounded-full border border-white/5 pointer-events-none z-10"></div>
                <div className="absolute inset-20 rounded-full border border-white/5 pointer-events-none z-10"></div>
                
                <img
                  src={imageUrl}
                  alt={currentSong.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Center Vinyl Spindle Hole */}
                <div className="absolute w-12 h-12 rounded-full bg-bg-primary border-4 border-border-color shadow-inner flex items-center justify-center z-20">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Detail Cards & Scrubbers */}
          <div className="space-y-6">
            
            {/* Title & Favorites toggle row */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary" title={currentSong.name}>
                  {currentSong.name}
                </h2>
                <h3 className="text-sm font-medium text-brand mt-1 uppercase tracking-wider" title={artistNames}>
                  {artistNames}
                </h3>
                <p className="text-xs text-text-muted font-mono mt-0.5 mt-1.5 bg-white/5 border border-border-color/50 rounded-md py-1 px-2.5 w-fit">
                  {currentSong.album?.name || 'Single'}
                </p>
              </div>

              <button
                onClick={() => onFavoriteToggle(currentSong)}
                className={`p-3 rounded-xl bg-white/5 border border-border-color hover:border-brand/40 hover:text-brand transition-colors cursor-pointer ${
                  isFavorite ? 'text-brand border-brand/35 bg-brand/5' : 'text-text-muted'
                }`}
                title="Save into favourites"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Custom Range Seeker */}
            <div className="space-y-2">
              <div className="relative group w-full h-2 bg-white/5 rounded-full cursor-pointer overflow-hidden border border-white/5" title="Seek (Arrow Left/Right)">
                <div 
                  className="h-full bg-brand rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.05"
                  value={progressPercent}
                  onChange={handleSeekChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer outline-none"
                />
              </div>
              
              <div className="flex justify-between items-center font-mono text-[11px] text-text-muted px-0.5">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Deck control playback buttons */}
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-border-color">
              <button
                onClick={onShuffleToggle}
                className={`p-2.5 rounded-xl transition-all ${
                  isShuffle ? 'text-brand bg-brand/5' : 'text-text-muted hover:text-text-primary'
                }`}
                title="Shuffle queue list"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={onPrevious}
                className="p-2.5 text-text-muted hover:text-text-primary active:scale-95 transition-transform"
                title="Play previous"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={onTogglePlay}
                className="w-14 h-14 rounded-full bg-brand text-bg-primary hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg shadow-brand/15 transition-transform"
                title={isPlaying ? 'Pause (Spacebar)' : 'Play (Spacebar)'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-[3px]" />
                )}
              </button>

              <button
                onClick={onNext}
                className="p-2.5 text-text-muted hover:text-text-primary active:scale-95 transition-transform"
                title="Play next"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              <button
                onClick={onRepeatToggle}
                className={`p-2.5 rounded-xl transition-all relative ${
                  repeatMode !== 'off' ? 'text-brand bg-brand/5' : 'text-text-muted hover:text-text-primary'
                }`}
                title={`Repeat queue: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                {repeatMode === 'all' && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand rounded-full"></div>
                )}
              </button>
            </div>

            {/* Volume Seeker bar & EQ Drawer Drawer togglers */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2.5 flex-1 max-w-xs text-text-muted">
                <Volume2 className="w-4.5 h-4.5 text-brand shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1 bg-white/10 rounded-full cursor-pointer outline-none accent-brand"
                  title="Volume (Arrow Up/Down)"
                />
                <span className="font-mono text-[10px] w-6 text-right">{(volume * 100).toFixed(0)}%</span>
              </div>

              {/* Slider panel trigger */}
              <button
                onClick={() => setShowEq(!showEq)}
                className={`flex items-center gap-1.5 px-4 py-2 bg-white/5 border rounded-xl font-semibold text-xs tracking-wide transition-all duration-200 cursor-pointer ${
                  showEq 
                    ? 'text-brand border-brand/40 bg-brand/5 shadow-inner' 
                    : 'text-text-muted border-border-color hover:border-brand/35 hover:text-brand'
                }`}
              >
                {showEq ? <ListCollapse className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
                {showEq ? 'Hide EQ Board' : 'Pro Equalizer'}
              </button>
            </div>

          </div>
        </div>

        {/* EQUALIZER BOARD SLIDING DRAWER LAYER */}
        {showEq && (
          <div className="animate-fade-in pt-4">
            <EqualizerPanel
              eqGains={eqGains}
              onSetEqGain={onSetEqGain}
              onReset={onResetEq}
            />
          </div>
        )}

        {/* SUGGESTED MUSIC LIST SECTION */}
        <div className="space-y-4 pt-4 border-t border-border-color/55">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-brand animate-pulse" />
            <span className="text-base font-semibold text-text-primary">Suggested & Related Tracks</span>
          </div>

          {isLoadingSuggestions ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Sliders className="w-6 h-6 text-brand animate-spin" />
              <span className="text-xs text-text-muted font-mono">Analyzing genre overlaps...</span>
            </div>
          ) : suggestedSongs.length === 0 ? (
            <p className="text-xs text-text-muted font-mono font-normal">
              No related matches index found for artist "{artistNames.split(',')[0]}".
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {suggestedSongs.map((sg) => {
                const isFavorited = favourites.some((item) => item.id === sg.id);
                return (
                  <SongCard
                    key={sg.id}
                    song={sg}
                    layout="row"
                    isActive={false} // don't highlight until played
                    isPlaying={false}
                    isFavorite={isFavorited}
                    onFavoriteToggle={() => onFavoriteToggle(sg)}
                    onPlayTrigger={() => onPlaySong(sg, suggestedSongs)}
                    onAddToQueue={() => onAddToQueue(sg)}
                    onDownload={() => onDownloadSong(sg)}
                    playlists={playlists}
                    onAddToPlaylist={(plId) => onAddToPlaylist(sg.id, plId)}
                    onCreatePlaylistAndAdd={(name) => onCreatePlaylistAndAdd(sg.id, name)}
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
