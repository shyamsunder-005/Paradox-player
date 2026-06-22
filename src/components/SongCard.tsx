import { Song, Playlist } from '../types';
import { getMediumImage } from '../api';
import { formatDuration } from '../utils/format';
import { Heart, Play, Pause, Plus, Download, MoreVertical, Trash2, ListMusic } from 'lucide-react';
import React, { useState } from 'react';

// Formatter helper
export { formatDuration };

interface SongCardProps {
  key?: any;
  song: Song;
  layout?: 'grid' | 'row';
  isActive: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onPlayTrigger: () => void;
  onAddToQueue: () => void;
  onRemoveFromQueue?: () => void;
  onDownload: () => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string) => void;
  onCreatePlaylistAndAdd: (name: string) => void;
}

export default function SongCard({
  song,
  layout = 'row',
  isActive,
  isPlaying,
  isFavorite,
  onFavoriteToggle,
  onPlayTrigger,
  onAddToQueue,
  onRemoveFromQueue,
  onDownload,
  playlists,
  onAddToPlaylist,
  onCreatePlaylistAndAdd,
}: SongCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const artistNames = song.artists.primary.map((a) => a.name).join(', ') || 'Unknown Artist';
  const imageUrl = getMediumImage(song.image);

  const handlePlaylistSelection = (playlistId: string) => {
    onAddToPlaylist(playlistId);
    setShowPlaylistMenu(false);
    setShowMenu(false);
  };

  const handleCreateAndAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylistAndAdd(newPlaylistName.trim());
      setNewPlaylistName('');
      setShowPlaylistMenu(false);
      setShowMenu(false);
    }
  };

  if (layout === 'grid') {
    return (
      <div 
        className="group relative flex flex-col bg-bg-secondary hover:bg-white/5 border border-border-color hover:border-brand/30 rounded-2xl p-4 transition-all duration-300 w-44 shrink-0 select-none cursor-pointer group shadow-md"
        onClick={onPlayTrigger}
      >
        {/* Cover Art Wrapper */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-bg-primary shadow-inner">
          <img
            src={imageUrl}
            alt={song.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {/* Cover Overlay Hover Panel */}
          <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayTrigger();
              }}
              className="w-12 h-12 rounded-full bg-brand hover:scale-110 active:scale-95 text-bg-primary flex items-center justify-center shadow-lg transition-transform"
            >
              {isActive && isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          {/* Playing Sound Bar Overlay */}
          {isActive && isPlaying && (
            <div className="absolute bottom-2 right-2 flex gap-0.5 py-1 px-1.5 rounded-md bg-bg-primary/80 backdrop-blur-sm">
              <div className="w-[3px] h-3 bg-brand rounded-full animate-pulse-bar1"></div>
              <div className="w-[3px] h-3 bg-brand rounded-full animate-pulse-bar2"></div>
              <div className="w-[3px] h-3 bg-brand rounded-full animate-pulse-bar3"></div>
            </div>
          )}
        </div>

        {/* Text Metadata */}
        <div className="flex-1 min-w-0 pr-1">
          <h3 className="font-sans font-semibold text-sm text-text-primary truncate" title={song.name}>
            {song.name}
          </h3>
          <p className="font-sans text-xs text-text-muted truncate mt-0.5" title={artistNames}>
            {artistNames}
          </p>
        </div>

        {/* Action Handles Floating Layer */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle();
            }}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
              isFavorite ? 'bg-brand text-bg-primary' : 'bg-bg-primary/80 text-text-muted hover:text-text-primary'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg bg-bg-primary/80 text-text-muted hover:text-text-primary backdrop-blur-md transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Context Menu Dropdown */}
        {showMenu && (
          <div 
            className="absolute top-11 right-2 w-48 bg-bg-primary/90 backdrop-blur-xl border border-border-color rounded-xl shadow-2xl py-1 z-30 font-sans text-xs text-text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onAddToQueue();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
            >
              <ListMusic className="w-4 h-4 text-brand" />
              Add to Queue
            </button>

            {/* Playlist Branch */}
            <div className="border-t border-border-color my-1"></div>
            <button
              onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand" />
                Add to Playlist
              </span>
              <span className="text-[10px] text-text-muted">➔</span>
            </button>

            {/* Expansive Playlist Dropdown */}
            {showPlaylistMenu && (
              <div className="bg-bg-primary/50 px-2 py-1 space-y-1">
                {playlists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => handlePlaylistSelection(pl.id)}
                    className="w-full text-left truncate py-1 px-2 hover:bg-white/5 rounded text-text-muted hover:text-text-primary"
                  >
                    {pl.name}
                  </button>
                ))}
                <form onSubmit={handleCreateAndAdd} className="flex gap-1 pt-1 border-t border-border-color/50">
                  <input
                    type="text"
                    placeholder="New playlist..."
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="flex-1 bg-bg-secondary border border-border-color rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-brand"
                  />
                  <button type="submit" className="px-1.5 py-0.5 bg-brand text-bg-primary text-[10px] rounded font-semibold">
                    +
                  </button>
                </form>
              </div>
            )}

            <button
              onClick={() => {
                onDownload();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 border-t border-border-color transition-colors"
            >
              <Download className="w-4 h-4 text-brand" />
              Download MP3
            </button>
          </div>
        )}
      </div>
    );
  }

  // Row Layout
  return (
    <div 
      className={`group flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all duration-200 select-none cursor-pointer ${
        isActive 
          ? 'bg-brand/10 border-brand/35 shadow-sm' 
          : 'bg-transparent border-transparent hover:bg-white/5'
      }`}
      onClick={onPlayTrigger}
    >
      {/* Thumbnail */}
      <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-bg-primary shrink-0">
        <img
          src={imageUrl}
          alt={song.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {/* Play Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {isActive && isPlaying ? (
            <Pause className="w-4 h-4 text-brand fill-current" />
          ) : (
            <Play className="w-4 h-4 text-white fill-current ml-[1px]" />
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-sans font-medium text-sm truncate ${isActive ? 'text-brand' : 'text-text-primary'}`}>
          {song.name}
        </h4>
        <p className="font-sans text-xs text-text-muted truncate mt-0.5">
          {artistNames}
        </p>
      </div>

      {/* Duration & Actions */}
      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="font-mono text-xs text-text-muted mr-1 hidden sm:inline-block">
          {formatDuration(song.duration)}
        </span>

        {/* Favorite Heart Trigger */}
        <button
          onClick={onFavoriteToggle}
          className={`p-2 rounded-lg transition-colors ${
            isFavorite ? 'text-brand' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Trash Delete (Optional for Playlists/Queue contexts) */}
        {onRemoveFromQueue ? (
          <button
            onClick={onRemoveFromQueue}
            className="p-2 text-text-muted hover:text-red-400 rounded-lg transition-colors"
            title="Remove from queue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onAddToQueue}
            className="p-2 text-text-muted hover:text-brand rounded-lg transition-colors hidden sm:block"
            title="Add to queue"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {/* Row More Actions trigger */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-text-muted hover:text-text-primary rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 bottom-8 sm:bottom-auto sm:top-8 w-48 bg-bg-primary/90 backdrop-blur-xl border border-border-color rounded-xl shadow-2xl py-1 z-30 font-sans text-xs text-text-primary select-none">
              <button
                onClick={() => {
                  onAddToQueue();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
              >
                <Plus className="w-4 h-4 text-brand" />
                Add to Queue
              </button>

              <div className="border-t border-border-color my-1"></div>
              <button
                onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ListMusic className="w-4 h-4 text-brand" />
                  Add to Playlist
                </span>
                <span className="text-[10px] text-text-muted">➔</span>
              </button>

              {/* Nested Playlist Dropdown */}
              {showPlaylistMenu && (
                <div className="bg-bg-primary/50 px-2 py-1 space-y-1 max-h-40 overflow-y-auto">
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => handlePlaylistSelection(pl.id)}
                      className="w-full text-left truncate py-1 px-2 hover:bg-white/5 rounded text-text-muted hover:text-text-primary text-[11px]"
                    >
                      {pl.name}
                    </button>
                  ))}
                  <form onSubmit={handleCreateAndAdd} className="flex gap-1 pt-1 border-t border-border-color/50">
                    <input
                      type="text"
                      placeholder="New playlist..."
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="flex-1 bg-bg-secondary border border-border-color rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-brand"
                    />
                    <button type="submit" className="px-1.5 py-0.5 bg-brand text-bg-primary text-[10px] rounded font-semibold font-sans">
                      +
                    </button>
                  </form>
                </div>
              )}

              <button
                onClick={() => {
                  onDownload();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 border-t border-border-color transition-colors"
              >
                <Download className="w-4 h-4 text-brand" />
                Download MP3
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
