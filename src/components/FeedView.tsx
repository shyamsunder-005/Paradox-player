import { Song, Playlist, Album, ArtistDetails, Artist } from '../types';
import { 
  searchSongs, searchAlbums, searchArtists, 
  getAlbumDetails, getArtistDetails, getPlaylistDetails, getBigImage, getMediumImage 
} from '../api';
import SongCard from './SongCard';
import { 
  Search, ListMusic, ChevronLeft, Disc, Play, Download, 
  FolderHeart, Calendar, Library, Info, User 
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface FeedViewProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue?: Song[]) => void;
  onSetSongQueue: (songs: Song[], playIndex?: number) => void;
  onAddToQueue: (song: Song) => void;
  onDownloadSong: (song: Song) => void;
  onDownloadSongs: (songs: Song[], batchName?: string) => void;
  playlists: Playlist[];
  onAddToPlaylist: (songId: string, playlistId: string) => void;
  onCreatePlaylistAndAdd: (songId: string, name: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onRemoveSongFromPlaylist: (songId: string, playlistId: string) => void;
  favourites: Song[];
  onFavoriteToggle: (song: Song) => void;
}

type FeedSubActive = 'main' | 'playlist' | 'album' | 'artist';

export default function FeedView({
  currentSong,
  isPlaying,
  onPlaySong,
  onSetSongQueue,
  onAddToQueue,
  onDownloadSong,
  onDownloadSongs,
  playlists,
  onAddToPlaylist,
  onCreatePlaylistAndAdd,
  onDeletePlaylist,
  onRemoveSongFromPlaylist,
  favourites,
  onFavoriteToggle,
}: FeedViewProps) {
  // Query States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'songs' | 'albums' | 'artists'>('songs');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreResults, setHasMoreResults] = useState(true);

  // Results
  const [songResults, setSongResults] = useState<Song[]>([]);
  const [albumResults, setAlbumResults] = useState<Album[]>([]);
  const [artistResults, setArtistResults] = useState<any[]>([]);

  // Navigation Overlay States
  const [subView, setSubView] = useState<FeedSubActive>('main');
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [activeArtist, setActiveArtist] = useState<ArtistDetails | null>(null);
  const [isOverlayLoading, setIsOverlayLoading] = useState(false);

  // Top Data Feeds
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [topAlbums, setTopAlbums] = useState<Album[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [isLoadingTop, setIsLoadingTop] = useState(false);

  // Top Data Display Limits
  const [topSongsLimit, setTopSongsLimit] = useState(10);
  const [topAlbumsLimit, setTopAlbumsLimit] = useState(10);
  const [topArtistsLimit, setTopArtistsLimit] = useState(10);

  useEffect(() => {
    async function loadTopData() {
      setIsLoadingTop(true);
      try {
        const [pl, albumsRes, artistsRes] = await Promise.all([
          getPlaylistDetails('1134548194'), // India Superhits Top 50
          searchAlbums('Top Bollywood', 1, 50),
          searchArtists('Hits', 1, 50)
        ]);
        
        if (pl && pl.songs) {
          setTopSongs(pl.songs);
        }
        if (albumsRes) {
          setTopAlbums(albumsRes);
        }
        if (artistsRes) {
          setTopArtists(artistsRes);
        }
      } catch (err) {
        console.error('Failed to load top data', err);
      } finally {
        setIsLoadingTop(false);
      }
    }
    loadTopData();
  }, []);

  // Debounce effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSongResults([]);
      setAlbumResults([]);
      setArtistResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setCurrentPage(1);
    setHasMoreResults(true);

    const timer = setTimeout(async () => {
      try {
        if (activeTab === 'songs') {
          const res = await searchSongs(searchQuery, 1);
          setSongResults(res);
          setHasMoreResults(res.length > 0);
        } else if (activeTab === 'albums') {
          const res = await searchAlbums(searchQuery, 1);
          setAlbumResults(res);
          setHasMoreResults(res.length > 0);
        } else if (activeTab === 'artists') {
          const res = await searchArtists(searchQuery, 1);
          setArtistResults(res);
          setHasMoreResults(res.length > 0);
        }
      } catch (err) {
        console.error('Search query fetch failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const handleLoadMore = async () => {
    if (!hasMoreResults || isLoadingMore || !searchQuery.trim()) return;
    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      if (activeTab === 'songs') {
        const res = await searchSongs(searchQuery, nextPage);
        if (res.length > 0) {
          setSongResults(prev => [...prev, ...res]);
          setCurrentPage(nextPage);
        } else {
          setHasMoreResults(false);
        }
      } else if (activeTab === 'albums') {
        const res = await searchAlbums(searchQuery, nextPage);
        if (res.length > 0) {
          setAlbumResults(prev => [...prev, ...res]);
          setCurrentPage(nextPage);
        } else {
          setHasMoreResults(false);
        }
      } else if (activeTab === 'artists') {
        const res = await searchArtists(searchQuery, nextPage);
        if (res.length > 0) {
          setArtistResults(prev => [...prev, ...res]);
          setCurrentPage(nextPage);
        } else {
          setHasMoreResults(false);
        }
      }
    } catch (err) {
      console.error('Failed to load more results:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      if (!isLoadingMore && hasMoreResults && searchQuery.trim() !== '') {
        handleLoadMore();
      }
    }
  };

  // Sync activePlaylist when playlists prop changes
  useEffect(() => {
    if (activePlaylist && subView === 'playlist') {
      const updated = playlists.find(p => p.id === activePlaylist.id);
      if (updated) {
        setActivePlaylist(updated);
      } else {
        setActivePlaylist(null);
        setSubView('main');
      }
    }
  }, [playlists]);

  // Click Handlers
  const handlePlaylistClick = (playlist: Playlist) => {
    setActivePlaylist(playlist);
    setSubView('playlist');
  };

  const handleAlbumClick = async (albumId: string) => {
    setIsOverlayLoading(true);
    setSubView('album');
    try {
      const details = await getAlbumDetails(albumId);
      if (details) {
        setActiveAlbum(details);
      }
    } catch (err) {
      console.error('Failed to load deep album details:', err);
    } finally {
      setIsOverlayLoading(false);
    }
  };

  const handleArtistClick = async (artistId: string) => {
    setIsOverlayLoading(true);
    setSubView('artist');
    try {
      const details = await getArtistDetails(artistId);
      if (details) {
        setActiveArtist(details);
      }
    } catch (err) {
      console.error('Failed to load deep artist details:', err);
    } finally {
      setIsOverlayLoading(false);
    }
  };

  // Close helper
  const navigateBackToMain = () => {
    setSubView('main');
    setActivePlaylist(null);
    setActiveAlbum(null);
    setActiveArtist(null);
  };

  // Check favourites
  const isSongFavorite = (songId: string) => {
    return favourites.some((s) => s.id === songId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-40 md:pb-32 font-sans select-none text-text-primary" onScroll={handleScroll}>
      
      {/* 1. PLAYLIST OVERLAY */}
      {subView === 'playlist' && activePlaylist && (
        <div className="space-y-6">
          <button 
            onClick={navigateBackToMain}
            className="flex items-center gap-2 hover:text-brand font-medium text-sm text-text-muted transition-colors border border-border-color bg-white/5 py-1 px-3 rounded-lg w-fit"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Feed
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 p-6 rounded-3xl border border-border-color">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-brand/20 to-brand/80 flex items-center justify-center shadow-lg text-bg-primary">
              <ListMusic className="w-16 h-16" />
            </div>
            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{activePlaylist.name}</h2>
              <p className="text-sm text-text-muted font-mono">
                {activePlaylist.songs.length} Tracks • Created {new Date(activePlaylist.createdAt).toLocaleDateString()}
              </p>
              
              <div className="flex flex-wrap gap-2.5 pt-2 justify-center sm:justify-start">
                <button
                  onClick={() => onSetSongQueue(activePlaylist.songs, 0)}
                  disabled={activePlaylist.songs.length === 0}
                  className="px-5 py-2 rounded-xl bg-brand font-semibold text-xs text-bg-primary hover:scale-[1.03] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-current" /> Play Album
                </button>
                <button
                  onClick={() => onDownloadSongs(activePlaylist!.songs, activePlaylist!.name)}
                  disabled={activePlaylist.songs.length === 0}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-border-color text-xs text-text-muted hover:text-text-primary active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Download Folder
                </button>
                <button
                  onClick={() => {
                    onDeletePlaylist(activePlaylist!.id);
                    navigateBackToMain();
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
                >
                  Delete Playlist
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base px-2">Playlist Songs ({activePlaylist.songs.length})</h3>
            {activePlaylist.songs.length === 0 ? (
              <div className="text-center py-12 text-sm text-text-muted bg-white/5 rounded-2xl border border-dashed border-border-color">
                No songs inside this playlist yet. Browse and add them!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {activePlaylist.songs.map((song, i) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    layout="row"
                    isActive={currentSong?.id === song.id}
                    isPlaying={isPlaying}
                    isFavorite={isSongFavorite(song.id)}
                    onFavoriteToggle={() => onFavoriteToggle(song)}
                    onPlayTrigger={() => onSetSongQueue(activePlaylist!.songs, i)}
                    onAddToQueue={() => onAddToQueue(song)}
                    onRemoveFromQueue={() => onRemoveSongFromPlaylist(song.id, activePlaylist!.id)}
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
      )}

      {/* 2. ALBUM DEEP LINK OVERLAY */}
      {subView === 'album' && (
        <div className="space-y-6">
          <button 
            onClick={navigateBackToMain}
            className="flex items-center gap-2 hover:text-brand font-medium text-sm text-text-muted transition-colors border border-border-color bg-white/5 py-1 px-3 rounded-lg w-fit"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Feed
          </button>

          {isOverlayLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Disc className="w-10 h-10 text-brand animate-spin" />
              <p className="text-sm font-mono text-text-muted">Fetching album details...</p>
            </div>
          ) : activeAlbum ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 p-6 rounded-3xl border border-border-color">
                <img
                  src={getBigImage(activeAlbum.image)}
                  alt={activeAlbum.name}
                  className="w-32 h-32 rounded-2xl object-cover shadow-lg border border-border-color"
                  referrerPolicy="no-referrer"
                />
                <div className="text-center sm:text-left space-y-1.5">
                  <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-brand">Album tracklist details</div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{activeAlbum.name}</h2>
                  <p className="text-xs text-text-muted">
                    {activeAlbum.artists.primary.map((a) => a.name).join(', ') || 'Unknown Artist'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-text-muted font-mono justify-center sm:justify-start">
                    <Calendar className="w-3.5 h-3.5 text-brand" /> {activeAlbum.year || 'Unknown Year'}
                    <span>•</span>
                    <Disc className="w-3.5 h-3.5 text-brand" /> {(activeAlbum.songs || []).length} Tracks
                  </div>

                  <div className="flex gap-2.5 pt-3 justify-center sm:justify-start">
                    <button
                      onClick={() => onSetSongQueue(activeAlbum.songs || [], 0)}
                      disabled={!(activeAlbum.songs && activeAlbum.songs.length > 0)}
                      className="px-5 py-2 rounded-xl bg-brand font-semibold text-xs text-bg-primary hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-current" /> Play All
                    </button>
                    <button
                      onClick={() => onDownloadSongs(activeAlbum.songs || [], activeAlbum.name)}
                      disabled={!(activeAlbum.songs && activeAlbum.songs.length > 0)}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-border-color text-xs text-text-muted hover:text-text-primary active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Download Album
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-base px-2">Songs inside Album</h3>
                <div className="grid grid-cols-1 gap-1.5">
                  {(activeAlbum.songs || []).map((song, i) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      layout="row"
                      isActive={currentSong?.id === song.id}
                      isPlaying={isPlaying}
                      isFavorite={isSongFavorite(song.id)}
                      onFavoriteToggle={() => onFavoriteToggle(song)}
                      onPlayTrigger={() => onSetSongQueue(activeAlbum.songs || [], i)}
                      onAddToQueue={() => onAddToQueue(song)}
                      onDownload={() => onDownloadSong(song)}
                      playlists={playlists}
                      onAddToPlaylist={(plId) => onAddToPlaylist(song.id, plId)}
                      onCreatePlaylistAndAdd={(name) => onCreatePlaylistAndAdd(song.id, name)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-text-muted font-sans border border-border-color bg-white/5 rounded-2xl">
              Unable to parse or fetch album specifics. Please try again later.
            </div>
          )}
        </div>
      )}

      {/* 3. ARTIST PROFILE OVERLAY */}
      {subView === 'artist' && (
        <div className="space-y-6">
          <button 
            onClick={navigateBackToMain}
            className="flex items-center gap-2 hover:text-brand font-medium text-sm text-text-muted transition-colors border border-border-color bg-white/5 py-1 px-3 rounded-lg w-fit"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Feed
          </button>

          {isOverlayLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <User className="w-10 h-10 text-brand animate-spin" />
              <p className="text-sm font-mono text-text-muted">Fetching artist profile...</p>
            </div>
          ) : activeArtist ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/5 p-6 rounded-3xl border border-border-color">
                <img
                  src={getBigImage(activeArtist.image)}
                  alt={activeArtist.name}
                  className="w-32 h-32 rounded-full object-cover shadow-lg border-2 border-brand/50"
                  referrerPolicy="no-referrer"
                />
                <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
                  <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-brand">Artist Bio details</div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{activeArtist.name}</h2>
                  {activeArtist.bio && (
                    <p className="text-xs text-text-muted line-clamp-3 leading-relaxed max-w-xl text-justify" dangerouslySetInnerHTML={{ __html: activeArtist.bio }}></p>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => onSetSongQueue(activeArtist.topSongs, 0)}
                      disabled={activeArtist.topSongs.length === 0}
                      className="px-5 py-2 rounded-xl bg-brand font-semibold text-xs text-bg-primary hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-current" /> Play Best Hits
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-base px-2">All Songs ({activeArtist.topSongs.length})</h3>
                {activeArtist.topSongs.length === 0 ? (
                  <div className="text-center py-12 text-sm text-text-muted bg-white/5 rounded-2xl border border-dashed border-border-color">
                    No songs listed for this artist.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5">
                    {activeArtist.topSongs.map((song, i) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        layout="row"
                        isActive={currentSong?.id === song.id}
                        isPlaying={isPlaying}
                        isFavorite={isSongFavorite(song.id)}
                        onFavoriteToggle={() => onFavoriteToggle(song)}
                        onPlayTrigger={() => onSetSongQueue(activeArtist.topSongs, i)}
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
          ) : (
            <div className="text-center py-20 text-text-muted font-sans border border-border-color bg-white/5 rounded-2xl">
              Unable to locate artist details right now.
            </div>
          )}
        </div>
      )}

      {/* 4. MAIN CENTRAL FEED COPT */}
      {subView === 'main' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Main heading branding */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">Find your soundtrack</h2>
          </div>

          {/* PLAYLISTS LINEUP */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <Library className="w-5 h-5 text-brand" />
              <h3 className="text-base font-semibold text-text-primary">Your Playlists ({playlists.length})</h3>
            </div>
            
            {playlists.length === 0 ? (
              <div className="glass rounded-2xl p-6 border border-border-color flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="font-semibold text-sm text-text-primary">Create Your First Playlist</h4>
                </div>
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const name = fd.get('plname') as string;
                    if (name && name.trim()) {
                      onCreatePlaylistAndAdd('', name.trim());
                      e.currentTarget.reset();
                    }
                  }}
                  className="flex gap-2 w-full md:w-auto"
                >
                  <input
                    type="text"
                    name="plname"
                    required
                    placeholder="E.g. Study Beats"
                    className="flex-1 md:w-48 bg-bg-primary text-xs border border-border-color rounded-xl px-3 py-2 outline-none focus:border-brand"
                  />
                  <button type="submit" className="px-4 py-2 bg-brand text-bg-primary rounded-xl text-xs font-semibold hover:scale-105 active:scale-95 transition-all">
                    Create Folder
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x scrollbar-none scroll-smooth">
                {playlists.map((pl, idx) => {
                  // Generate stable unique background gradient based on index 
                  const gradients = [
                    'from-purple-500/15 via-purple-500/5 to-transparent border-purple-500/25',
                    'from-orange-500/15 via-orange-500/5 to-transparent border-orange-500/25',
                    'from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/25',
                    'from-sky-500/15 via-sky-500/5 to-transparent border-sky-500/25',
                    'from-pink-500/15 via-pink-500/5 to-transparent border-pink-500/25',
                  ];
                  const gradClass = gradients[idx % gradients.length];
                  const bgArt = pl.songs.length > 0 ? getMediumImage(pl.songs[0].image) : '';
                  
                  return (
                    <div
                      key={pl.id}
                      onClick={() => handlePlaylistClick(pl)}
                      className={`group flex flex-col justify-between w-40 h-40 rounded-2xl bg-gradient-to-b ${gradClass} border p-4 snap-start shrink-0 cursor-pointer overflow-hidden relative shadow-md hover:border-brand/40 transition-all duration-300 select-none`}
                    >
                      {/* Embear cover art faintly in bottom right */}
                      {bgArt && (
                        <img 
                          src={bgArt} 
                          alt="" 
                          className="absolute right-[-10px] bottom-[-10px] w-20 h-20 rounded-xl rotate-12 opacity-15 group-hover:scale-110 transition-transform duration-500 pointer-events-none"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <ListMusic className="w-4.5 h-4.5 text-brand" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-sans font-semibold text-sm text-text-primary leading-tight truncate">
                          {pl.name}
                        </h4>
                        <p className="font-mono text-[9px] text-text-muted">
                          {pl.songs.length} audio tracks
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SEARCH COMPONENT BOARD */}
          <div className="space-y-4">
            
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks, albums, artists, bios..."
                className="w-full bg-bg-secondary text-sm border border-border-color rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-brand/50 placeholder:text-text-muted/65 transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted hover:text-brand"
                >
                  Clear
                </button>
              )}
            </div>

            {/* TAB SELECTOR BAR CONTAINER */}
            <div className="flex border-b border-border-color overflow-x-auto scrollbar-none">
              {(['songs', 'albums', 'artists'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 min-w-[100px] py-3 text-xs md:text-sm font-semibold capitalize relative transition-colors ${
                    activeTab === tab ? 'text-brand' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand"></div>
                  )}
                </button>
              ))}
            </div>

            {/* DYNAMIC SEARCH RESULTS SCROLLER */}
            <div className="min-h-[220px]">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Disc className="w-8 h-8 text-brand animate-spin" />
                  <span className="text-xs font-mono text-text-muted">Scanning JioSaavn database...</span>
                </div>
              ) : activeTab === 'songs' ? (
                searchQuery.trim() === '' ? (
                  // Landing state (Top Songs Feed)
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 px-2">
                      <Disc className="w-5 h-5 text-brand" />
                      <h3 className="text-base font-semibold text-text-primary">Top 50 Trending Songs in India</h3>
                    </div>
                    {isLoadingTop ? (
                      <div className="flex flex-col items-center justify-center py-10 text-text-muted font-sans space-y-2">
                        <Disc className="w-8 h-8 stroke-1 text-text-muted/40 animate-spin-slow" />
                        <p className="text-xs">Loading trending songs...</p>
                      </div>
                    ) : topSongs.length === 0 ? (
                      <div className="flex flex-col items-center text-center justify-center py-10 text-text-muted font-sans space-y-2">
                        <Disc className="w-12 h-12 stroke-1 text-text-muted/40 animate-spin-slow" />
                        <p className="text-xs">Type a keyword to discover high-fidelity MP3 downloads & streams</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-2.5">
                          {topSongs.slice(0, topSongsLimit).map((song) => (
                            <SongCard
                              key={song.id}
                              song={song}
                              layout="row"
                              isActive={currentSong?.id === song.id}
                              isPlaying={isPlaying}
                              isFavorite={isSongFavorite(song.id)}
                              onFavoriteToggle={() => onFavoriteToggle(song)}
                              onPlayTrigger={() => onSetSongQueue(topSongs, topSongs.indexOf(song))}
                              onAddToQueue={() => onAddToQueue(song)}
                              onDownload={() => onDownloadSong(song)}
                              playlists={playlists}
                              onAddToPlaylist={(plId) => onAddToPlaylist(song.id, plId)}
                              onCreatePlaylistAndAdd={(name) => onCreatePlaylistAndAdd(song.id, name)}
                            />
                          ))}
                        </div>
                        {topSongsLimit < topSongs.length && (
                          <button
                            onClick={() => setTopSongsLimit((prev) => prev + 10)}
                            className="w-full py-3 rounded-xl border border-border-color text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors text-sm font-semibold"
                          >
                            Load More
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : songResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                    No songs found matching "{searchQuery}".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {songResults.map((song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        layout="row"
                        isActive={currentSong?.id === song.id}
                        isPlaying={isPlaying}
                        isFavorite={isSongFavorite(song.id)}
                        onFavoriteToggle={() => onFavoriteToggle(song)}
                        onPlayTrigger={() => onPlaySong(song, songResults)}
                        onAddToQueue={() => onAddToQueue(song)}
                        onDownload={() => onDownloadSong(song)}
                        playlists={playlists}
                        onAddToPlaylist={(plId) => onAddToPlaylist(song.id, plId)}
                        onCreatePlaylistAndAdd={(name) => onCreatePlaylistAndAdd(song.id, name)}
                      />
                    ))}
                  </div>
                )
              ) : activeTab === 'albums' ? (
                searchQuery.trim() === '' ? (
                  // Landing state (Top Albums Feed)
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 px-2">
                      <Disc className="w-5 h-5 text-brand" />
                      <h3 className="text-base font-semibold text-text-primary">Top Albums in India</h3>
                    </div>
                    {isLoadingTop ? (
                      <div className="flex flex-col items-center justify-center py-10 text-text-muted font-sans space-y-2">
                        <Disc className="w-8 h-8 stroke-1 text-text-muted/40 animate-spin-slow" />
                        <p className="text-xs">Loading top albums...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {topAlbums.slice(0, topAlbumsLimit).map((alb) => (
                            <div
                              key={alb.id}
                              onClick={() => handleAlbumClick(alb.id)}
                              className="group flex flex-col bg-bg-secondary hover:bg-white/5 border border-border-color rounded-2xl p-4 transition-all duration-300 cursor-pointer shadow-md select-none"
                            >
                              <div className="aspect-square w-full rounded-xl overflow-hidden mb-3 bg-bg-primary">
                                <img
                                  src={getBigImage(alb.image)}
                                  alt={alb.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <h4 className="font-semibold text-sm truncate text-text-primary" title={alb.name}>
                                {alb.name}
                              </h4>
                              <p className="text-xs text-text-muted truncate mt-0.5">
                                {alb.year || 'Album'}
                              </p>
                            </div>
                          ))}
                        </div>
                        {topAlbumsLimit < topAlbums.length && (
                          <button
                            onClick={() => setTopAlbumsLimit((prev) => prev + 10)}
                            className="w-full py-3 rounded-xl border border-border-color text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors text-sm font-semibold"
                          >
                            Load More
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : albumResults.length === 0 ? (
                  <div className="text-center py-16 text-sm text-text-muted border border-dashed border-border-color rounded-2xl">
                    No albums found matching "{searchQuery}".
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {albumResults.map((alb) => (
                      <div
                        key={alb.id}
                        onClick={() => handleAlbumClick(alb.id)}
                        className="group flex flex-col bg-bg-secondary hover:bg-white/5 border border-border-color rounded-2xl p-4 transition-all duration-300 cursor-pointer shadow-md select-none"
                      >
                        <div className="aspect-square w-full rounded-xl overflow-hidden mb-3 bg-bg-primary">
                          <img
                            src={getBigImage(alb.image)}
                            alt={alb.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <h4 className="font-semibold text-sm truncate text-text-primary" title={alb.name}>
                          {alb.name}
                        </h4>
                        <p className="text-xs text-text-muted truncate mt-0.5">
                          {alb.year || 'Album'}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // Artists
                searchQuery.trim() === '' ? (
                  // Landing state (Top Artists Feed)
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 px-2">
                      <Disc className="w-5 h-5 text-brand" />
                      <h3 className="text-base font-semibold text-text-primary">Top Artists in India</h3>
                    </div>
                    {isLoadingTop ? (
                      <div className="flex flex-col items-center justify-center py-10 text-text-muted font-sans space-y-2">
                        <Disc className="w-8 h-8 stroke-1 text-text-muted/40 animate-spin-slow" />
                        <p className="text-xs">Loading top artists...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                          {topArtists.slice(0, topArtistsLimit).map((art) => (
                            <div
                              key={art.id}
                              onClick={() => handleArtistClick(art.id)}
                              className="group flex flex-col items-center bg-bg-secondary hover:bg-white/5 border border-border-color hover:border-brand/35 rounded-2xl p-4 text-center transition-all duration-300 cursor-pointer shadow-md select-none"
                            >
                              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 bg-bg-primary shadow-inner">
                                <img
                                  src={getMediumImage(art.image)}
                                  alt={art.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <h4 className="font-semibold text-xs text-text-primary truncate w-full" title={art.name}>
                                {art.name}
                              </h4>
                              <span className="text-[10px] text-brand font-mono font-medium block mt-1 uppercase tracking-wider">
                                {art.role || 'Artist'}
                              </span>
                            </div>
                          ))}
                        </div>
                        {topArtistsLimit < topArtists.length && (
                          <button
                            onClick={() => setTopArtistsLimit((prev) => prev + 10)}
                            className="w-full py-3 rounded-xl border border-border-color text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors text-sm font-semibold"
                          >
                            Load More
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : artistResults.length === 0 ? (
                  <div className="text-center py-16 text-sm text-text-muted border border-dashed border-border-color rounded-2xl">
                    No artists found matching "{searchQuery}".
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {artistResults.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => handleArtistClick(art.id)}
                        className="group flex flex-col items-center bg-bg-secondary hover:bg-white/5 border border-border-color hover:border-brand/35 rounded-2xl p-4 text-center transition-all duration-300 cursor-pointer shadow-md select-none"
                      >
                        <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 bg-bg-primary shadow-inner">
                          <img
                            src={getMediumImage(art.image)}
                            alt={art.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <h4 className="font-semibold text-xs text-text-primary truncate w-full" title={art.name}>
                          {art.name}
                        </h4>
                        <span className="text-[10px] text-brand font-mono font-medium block mt-1 uppercase tracking-wider">
                          {art.role || 'Artist'}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {searchQuery.trim() !== '' && !isSearching && hasMoreResults && (
                <div className="flex justify-center pt-8 pb-4">
                  {isLoadingMore && (
                    <div className="px-6 py-2.5 rounded-xl bg-white/5 border border-border-color text-sm font-semibold text-text-primary flex items-center gap-2">
                      <Disc className="w-4 h-4 animate-spin text-brand" /> Loading more...
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
