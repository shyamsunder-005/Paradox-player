import { Song, Playlist } from '../types';
import { formatDuration } from '../utils/format';
import SongCard from './SongCard';
import { Heart, Play, Download, Trash2, FolderHeart } from 'lucide-react';

interface FavoritesViewProps {
  favourites: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onSetSongQueue: (songs: Song[], playIndex?: number) => void;
  onAddToQueue: (song: Song) => void;
  onFavoriteToggle: (song: Song) => void;
  onDownloadSong: (song: Song) => void;
  onDownloadSongs: (songs: Song[], batchName?: string) => void;
  playlists: Playlist[];
  onAddToPlaylist: (songId: string, playlistId: string) => void;
  onAddToPlaylist: (songId: string, playlistId: string) => void;
  onCreatePlaylistAndAdd: (songId: string, name: string) => void;
  onAddSongs: () => void;
}

export default function FavoritesView({
  favourites,
  currentSong,
  isPlaying,
  onPlaySong,
  onSetSongQueue,
  onAddToQueue,
  onFavoriteToggle,
  onDownloadSong,
  onDownloadSongs,
  playlists,
  playlists,
  onAddToPlaylist,
  onCreatePlaylistAndAdd,
  onAddSongs,
}: FavoritesViewProps) {
  
  // Calculate aggregate playtime
  const totalDuration = favourites.reduce((acc, current) => acc + (current.duration || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 font-sans select-none text-text-primary">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Liked Songs Summary Card */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-border-color shadow-sm">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
              <FolderHeart className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Your Saved Favorites</h2>
              <p className="text-xs text-text-muted mt-0.5 font-mono">
                {favourites.length} liked tracks • Total Duration: {formatDuration(totalDuration)}
              </p>
            </div>
          </div>

          {/* Favorites Actions */}
          <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
            <button
              onClick={() => onSetSongQueue(favourites, 0)}
              disabled={favourites.length === 0}
              className="flex-1 md:flex-initial px-4 py-2 bg-brand text-bg-primary text-xs font-semibold rounded-xl hover:scale-[1.03] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" /> Play Favorites
            </button>
            <button
              onClick={() => onDownloadSongs(favourites, 'Favorites Songs')}
              disabled={favourites.length === 0}
              className="flex-1 md:flex-initial px-4 py-2 bg-white/5 border border-border-color text-text-muted hover:text-text-primary text-xs font-semibold rounded-xl hover:scale-[1.03] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Folder
            </button>
            <button
              onClick={onAddSongs}
              className="flex-1 md:flex-initial px-4 py-2 bg-white/5 border border-border-color text-text-muted hover:text-text-primary text-xs font-semibold rounded-xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="text-lg leading-none mb-[2px]">+</span> Add Songs
            </button>
          </div>
        </div>

        {/* Favorite songs listing */}
        <div className="space-y-2">
          {favourites.length === 0 ? (
            <div className="text-center py-20 text-sm text-text-muted bg-white/5 rounded-2xl border border-dashed border-border-color space-y-1">
              <Heart className="w-10 h-10 stroke-1 text-text-muted/40 mx-auto animate-pulse" />
              <p className="max-w-xs mx-auto">You haven't favorited any songs yet. Press the heart icon on any track card to list details here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {favourites.map((song, i) => (
                <SongCard
                  key={song.id}
                  song={song}
                  layout="row"
                  isActive={currentSong?.id === song.id}
                  isPlaying={isPlaying}
                  isFavorite={true}
                  onFavoriteToggle={() => onFavoriteToggle(song)}
                  onPlayTrigger={() => onSetSongQueue(favourites, i)}
                  onAddToQueue={() => onAddToQueue(song)}
                  onDownload={() => onDownloadSong(song)}
                  playlists={playlists}
                  onAddToPlaylist={(plId) => onAddToPlaylist(song.id, plId)}
                  onCreatePlaylistAndAdd={(name) => onCreatePlaylistAndAdd(song.id, name)}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
