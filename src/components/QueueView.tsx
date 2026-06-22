import { Song, Playlist } from '../types';
import { formatDuration } from '../utils/format';
import { getMediumImage } from '../api';
import SongCard from './SongCard';
import { 
  ChevronUp, ChevronDown, Trash2, Download, Play, ListMusic, 
  Trash, ListCollapse 
} from 'lucide-react';

interface QueueViewProps {
  queue: Song[];
  currentIndex: number;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onRemoveFromQueue: (songId: string) => void;
  onClearQueue: () => void;
  onReorderQueue: (songs: Song[]) => void;
  onDownloadSongs: (songs: Song[], batchName?: string) => void;
  playlists: Playlist[];
  onAddToPlaylist: (songId: string, playlistId: string) => void;
  onCreatePlaylistAndAdd: (songId: string, name: string) => void;
  favourites: Song[];
  onFavoriteToggle: (song: Song) => void;
  onSetSongQueue: (songs: Song[], playIndex?: number) => void;
  onAddSongs: () => void;
}

export default function QueueView({
  queue,
  currentIndex,
  currentSong,
  isPlaying,
  onPlaySong,
  onRemoveFromQueue,
  onClearQueue,
  onReorderQueue,
  onDownloadSongs,
  playlists,
  onAddToPlaylist,
  onCreatePlaylistAndAdd,
  favourites,
  onFavoriteToggle,
  onSetSongQueue,
  onAddSongs,
}: QueueViewProps) {
  
  // Calculate total duration
  const totalDuration = queue.reduce((acc, current) => acc + (current.duration || 0), 0);

  // Click based reordering
  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...queue];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onReorderQueue(updated);
  };

  const moveDown = (index: number) => {
    if (index === queue.length - 1) return;
    const updated = [...queue];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onReorderQueue(updated);
  };

  const isSongFavorite = (songId: string) => {
    return favourites.some((s) => s.id === songId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 font-sans select-none text-text-primary">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Queue Header Information cards */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-border-color shadow-sm">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
              <ListMusic className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Active Play Queue</h2>
              <p className="text-xs text-text-muted mt-0.5 font-mono">
                {queue.length} Songs • Combined duration: {formatDuration(totalDuration)}
              </p>
            </div>
          </div>

          {/* Quick actions row */}
          <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
            <button
              onClick={() => onSetSongQueue(queue, 0)}
              disabled={queue.length === 0}
              className="flex-1 md:flex-initial px-4 py-2 bg-brand text-bg-primary text-xs font-semibold rounded-xl hover:scale-[1.03] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Play Queue
            </button>
            
            <button
              onClick={() => onDownloadSongs(queue, 'Queue Tracks')}
              disabled={queue.length === 0}
              className="flex-1 md:flex-initial px-4 py-2 bg-white/5 border border-border-color text-text-muted hover:text-text-primary text-xs font-semibold rounded-xl hover:scale-[1.03] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Queue
            </button>

            <button
              onClick={onClearQueue}
              disabled={queue.length === 0}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold rounded-xl active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1 select-none cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear
            </button>
            
            <button
              onClick={onAddSongs}
              className="flex-1 md:flex-initial px-4 py-2 bg-white/5 border border-border-color text-text-muted hover:text-text-primary text-xs font-semibold rounded-xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="text-lg leading-none mb-[2px]">+</span> Add Songs
            </button>
          </div>
        </div>

        {/* List of queue songs */}
        <div className="space-y-2">
          {queue.length === 0 ? (
            <div className="text-center py-20 text-sm text-text-muted bg-white/5 rounded-2xl border border-dashed border-border-color">
              Your Play Queue is currently empty. Explore the Home Feed and search for tracks to pile them up here.
            </div>
          ) : (
            <div className="space-y-1">
              {queue.map((song, i) => {
                const isActive = currentIndex === i;
                const imageUrl = getMediumImage(song.image);
                const artists = song.artists.primary.map(a => a.name).join(', ') || 'Unknown Artist';

                return (
                  <div 
                    key={`${song.id}-${i}`}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${
                      isActive 
                        ? 'bg-brand/10 border-brand/35' 
                        : 'bg-transparent border-transparent hover:bg-white/5'
                    }`}
                  >
                    {/* Index or active indicator */}
                    <span className="font-mono text-xs text-text-muted w-5 text-center shrink-0">
                      {isActive && isPlaying ? (
                        <div className="flex gap-0.5 justify-center h-2.5 items-end">
                          <div className="w-[2px] h-2 bg-brand animate-pulse-bar1"></div>
                          <div className="w-[2px] h-3 bg-brand animate-pulse-bar2"></div>
                          <div className="w-[2px] h-1 bg-brand animate-pulse-bar3"></div>
                        </div>
                      ) : (
                        i + 1
                      )}
                    </span>

                    {/* Thumbnail click play */}
                    <div 
                      onClick={() => onPlaySong(song, queue)}
                      className="relative w-10 h-10 rounded-lg overflow-hidden bg-bg-primary shrink-0 cursor-pointer"
                    >
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-white fill-current ml-[1px]" />
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onPlaySong(song, queue)}>
                      <h4 className={`font-medium text-sm truncate ${isActive ? 'text-brand font-semibold' : 'text-text-primary'}`}>
                        {song.name}
                      </h4>
                      <p className="text-xs text-text-muted truncate mt-0.5">{artists}</p>
                    </div>

                    {/* Reordering & custom actions */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      
                      {/* Chevron up/down buttons */}
                      <button
                        onClick={() => moveUp(i)}
                        disabled={i === 0}
                        className="p-1 text-text-muted hover:text-brand disabled:opacity-20 rounded-md transition-colors"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => moveDown(i)}
                        disabled={i === queue.length - 1}
                        className="p-1 text-text-muted hover:text-brand disabled:opacity-20 rounded-md transition-colors"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      <span className="font-mono text-xs text-text-muted mx-2 hidden sm:inline-block">
                        {formatDuration(song.duration)}
                      </span>

                      {/* Favorite Heart Toggler */}
                      <button
                        onClick={() => onFavoriteToggle(song)}
                        className={`p-2 rounded-lg transition-colors ${
                          isSongFavorite(song.id) ? 'text-brand' : 'text-text-muted hover:text-text-primary'
                        }`}
                      >
                        <Trash className={`w-3.5 h-3.5 ${isSongFavorite(song.id) ? 'fill-current' : ''}`} />
                      </button>

                      {/* Remove queue row */}
                      <button
                        onClick={() => onRemoveFromQueue(song.id)}
                        className="p-2 text-text-muted hover:text-red-400 rounded-lg transition-colors"
                        title="Remove from block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
