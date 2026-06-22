/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavigationSection, Song, Playlist } from './types';
import { Disc } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import FeedView from './components/FeedView';
import SongPage from './components/SongPage';
import QueueView from './components/QueueView';
import FavoritesView from './components/FavoritesView';
import ThemesView from './components/ThemesView';
import SettingsView from './components/SettingsView';
import AboutView from './components/AboutView';
import DownloadModal from './components/DownloadModal';
import PlayerBar from './components/PlayerBar';

import { playerEngine, PlayerState, RepeatMode } from './playerEngine';
import { downloadManager, DownloadState } from './downloadManager';
import { 
  getFavourites, saveFavourites,
  getPlaylists, savePlaylists, 
  getTheme, saveTheme,
  getAutoFillQueue, saveAutoFillQueue,
  getAudioQuality, saveAudioQuality,
  getAutoPlayEndless, saveAutoPlayEndless
} from './storage';
import type { AudioQuality } from './storage';
import { getSongDetails } from './api';

import { useState, useEffect } from 'react';

export default function App() {
  const [activeSection, setSection] = useState<NavigationSection>('feed');
  const [playerState, setPlayerState] = useState<PlayerState>(playerEngine.getState());
  const [downloadState, setDownloadState] = useState<DownloadState>(downloadManager.getState());
  const [favourites, setFavourites] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeTheme, setActiveTheme] = useState<string>('midnight');
  const [autoFillQueue, setAutoFillQueue] = useState<boolean>(true);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('high');
  const [autoPlayEndless, setAutoPlayEndless] = useState<boolean>(true);

  // 1. Subscribe to Player Engine & Background Download State listeners on mount
  useEffect(() => {
    const unsubPlayer = playerEngine.subscribe(() => {
      setPlayerState(playerEngine.getState());
    });
    
    const unsubDownload = downloadManager.subscribe((st) => {
      setDownloadState(st);
    });

    // Load initial user persistent records
    setFavourites(getFavourites());
    setPlaylists(getPlaylists());
    
    const savedTheme = getTheme();
    setActiveTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    setAutoFillQueue(getAutoFillQueue());
    setAudioQuality(getAudioQuality());
    setAutoPlayEndless(getAutoPlayEndless());

    return () => {
      unsubPlayer();
      unsubDownload();
    };
  }, []);

  // 2. Global Hotkey Listeners setup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus Trap check: prevent hijacking input bar typing
      const activeEl = document.activeElement;
      const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;
      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        playerEngine.togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const state = playerEngine.getState();
        playerEngine.seek(Math.max(0, state.currentTime - 5));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const state = playerEngine.getState();
        playerEngine.seek(Math.min(state.duration, state.currentTime + 5));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        const state = playerEngine.getState();
        playerEngine.setVolume(Math.min(1, state.volume + 0.05));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        const state = playerEngine.getState();
        playerEngine.setVolume(Math.max(0, state.volume - 0.05));
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const state = playerEngine.getState();
        playerEngine.setVolume(state.volume > 0 ? 0 : 0.8);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 3. Core Handler Routines
  const handlePlaySong = (song: Song, queue?: Song[]) => {
    playerEngine.playSong(song, autoFillQueue ? queue : undefined);
  };

  const handleSetSongQueue = (songs: Song[], playIndex = 0) => {
    playerEngine.setSongQueue(songs, playIndex);
  };

  const handleTogglePlay = () => {
    playerEngine.togglePlay();
  };

  const handleNext = () => {
    playerEngine.playNext();
  };

  const handlePrevious = () => {
    playerEngine.playPrevious();
  };

  const handleSeek = (time: number) => {
    playerEngine.seek(time);
  };

  const handleVolume = (vol: number) => {
    playerEngine.setVolume(vol);
  };

  const handleShuffleToggle = () => {
    playerEngine.setShuffle(!playerState.isShuffle);
  };

  const handleRepeatToggle = () => {
    const modes: RepeatMode[] = ['off', 'one', 'all'];
    const nextIdx = (modes.indexOf(playerState.repeatMode) + 1) % modes.length;
    playerEngine.setRepeatMode(modes[nextIdx]);
  };

  const handleFavoriteToggle = (song: Song) => {
    const exists = favourites.some((s) => s.id === song.id);
    let updated;
    if (exists) {
      updated = favourites.filter((s) => s.id !== song.id);
    } else {
      updated = [...favourites, song];
    }
    setFavourites(updated);
    saveFavourites(updated);
  };

  const handleAddToQueue = (song: Song) => {
    playerEngine.addToQueue(song);
  };

  const handleRemoveFromQueue = (songId: string) => {
    playerEngine.removeFromQueue(songId);
  };

  const handleClearQueue = () => {
    playerEngine.clearQueue();
  };

  const handleReorderQueue = (songs: Song[]) => {
    playerEngine.setReorderQueue(songs);
  };

  const handleSetEqGain = (band: number, value: number) => {
    playerEngine.setEqGain(band, value);
  };

  const handleResetEq = () => {
    playerEngine.resetEq();
  };

  const handleThemeChange = (themeId: string) => {
    setActiveTheme(themeId);
    saveTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const handleAutoFillQueueToggle = (val: boolean) => {
    setAutoFillQueue(val);
    saveAutoFillQueue(val);
  };

  const handleAudioQualityChange = (val: AudioQuality) => {
    setAudioQuality(val);
    saveAudioQuality(val);
  };

  const handleAutoPlayEndlessToggle = (val: boolean) => {
    setAutoPlayEndless(val);
    saveAutoPlayEndless(val);
  };

  // 4. Background Track metadata resolvers for custom Playlists adds
  const resolveSong = async (songId: string): Promise<Song | null> => {
    // Search local favourites or play queue representation
    let found = favourites.find((s) => s.id === songId);
    if (found) return found;

    if (playerState.currentSong?.id === songId) {
      return playerState.currentSong;
    }

    found = playerState.queue.find((s) => s.id === songId);
    if (found) return found;

    // Direct fallback: Fetch details from JioSaavn API
    try {
      const details = await getSongDetails(songId);
      if (details) return details;
    } catch (e) {
      console.warn('Failed to resolve song details object fully:', e);
    }
    return null;
  };

  const handleAddToPlaylist = async (songId: string, playlistId: string) => {
    const song = await resolveSong(songId);
    if (!song) return;

    const updated = playlists.map((pl) => {
      if (pl.id === playlistId) {
        const alreadyIn = pl.songs.some((s) => s.id === songId);
        if (alreadyIn) return pl; // Avoid duplication
        return { ...pl, songs: [...pl.songs, song] };
      }
      return pl;
    });

    setPlaylists(updated);
    savePlaylists(updated);
  };

  const handleCreatePlaylistAndAdd = async (songId: string, name: string) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name: name.trim(),
      songs: [],
      createdAt: Date.now(),
    };

    if (songId) {
      const song = await resolveSong(songId);
      if (song) {
        newPlaylist.songs.push(song);
      }
    }

    const updated = [...playlists, newPlaylist];
    setPlaylists(updated);
    savePlaylists(updated);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    const updated = playlists.filter((pl) => pl.id !== playlistId);
    setPlaylists(updated);
    savePlaylists(updated);
  };

  const handleRemoveSongFromPlaylist = (songId: string, playlistId: string) => {
    const updated = playlists.map((pl) => {
      if (pl.id === playlistId) {
        return { ...pl, songs: pl.songs.filter((s) => s.id !== songId) };
      }
      return pl;
    });
    setPlaylists(updated);
    savePlaylists(updated);
  };

  // 5. Download Operations triggers
  const handleDownloadSong = (song: Song) => {
    downloadManager.downloadSongs([song], song.name);
  };

  const handleDownloadSongs = (songs: Song[], batchName = 'Tracks') => {
    downloadManager.downloadSongs(songs, batchName);
  };

  const handleCancelDownload = () => {
    downloadManager.cancelDownloads();
  };

  // 6. Section Content router switcher
  const renderContent = () => {
    switch (activeSection) {
      case 'feed':
        return (
          <FeedView
            currentSong={playerState.currentSong}
            isPlaying={playerState.isPlaying}
            onPlaySong={handlePlaySong}
            onSetSongQueue={handleSetSongQueue}
            onAddToQueue={handleAddToQueue}
            onDownloadSong={handleDownloadSong}
            onDownloadSongs={handleDownloadSongs}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
            onCreatePlaylistAndAdd={handleCreatePlaylistAndAdd}
            onDeletePlaylist={handleDeletePlaylist}
            onRemoveSongFromPlaylist={handleRemoveSongFromPlaylist}
            favourites={favourites}
            onFavoriteToggle={handleFavoriteToggle}
          />
        );
      case 'song-page':
        return (
          <SongPage
            playerState={playerState}
            onTogglePlay={handleTogglePlay}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            onVolumeChange={handleVolume}
            onShuffleToggle={handleShuffleToggle}
            onRepeatToggle={handleRepeatToggle}
            isFavorite={playerState.currentSong ? favourites.some((s) => s.id === playerState.currentSong!.id) : false}
            onFavoriteToggle={() => playerState.currentSong && handleFavoriteToggle(playerState.currentSong)}
            onSetEqGain={handleSetEqGain}
            onResetEq={handleResetEq}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
            onCreatePlaylistAndAdd={handleCreatePlaylistAndAdd}
            onPlaySong={handlePlaySong}
            onAddToQueue={handleAddToQueue}
            onDownloadSong={handleDownloadSong}
            favourites={favourites}
          />
        );
      case 'queue':
        return (
          <QueueView
            queue={playerState.queue}
            currentIndex={playerState.currentIndex}
            currentSong={playerState.currentSong}
            isPlaying={playerState.isPlaying}
            onPlaySong={handlePlaySong}
            onRemoveFromQueue={handleRemoveFromQueue}
            onClearQueue={handleClearQueue}
            onReorderQueue={handleReorderQueue}
            onDownloadSongs={handleDownloadSongs}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
            onCreatePlaylistAndAdd={handleCreatePlaylistAndAdd}
            favourites={favourites}
            onFavoriteToggle={handleFavoriteToggle}
            onSetSongQueue={handleSetSongQueue}
            onAddSongs={() => setSection('feed')}
          />
        );
      case 'favourites':
        return (
          <FavoritesView
            favourites={favourites}
            currentSong={playerState.currentSong}
            isPlaying={playerState.isPlaying}
            onPlaySong={handlePlaySong}
            onSetSongQueue={handleSetSongQueue}
            onAddToQueue={handleAddToQueue}
            onFavoriteToggle={handleFavoriteToggle}
            onDownloadSong={handleDownloadSong}
            onDownloadSongs={handleDownloadSongs}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
            onCreatePlaylistAndAdd={handleCreatePlaylistAndAdd}
            onAddSongs={() => setSection('feed')}
          />
        );
      case 'themes':
        return (
          <ThemesView
            currentTheme={activeTheme}
            onThemeChange={handleThemeChange}
          />
        );
      case 'settings':
        return (
          <SettingsView
            autoFillQueue={autoFillQueue}
            onAutoFillQueueToggle={handleAutoFillQueueToggle}
            audioQuality={audioQuality}
            onAudioQualityChange={handleAudioQualityChange}
            autoPlayEndless={autoPlayEndless}
            onAutoPlayEndlessToggle={handleAutoPlayEndlessToggle}
          />
        );
      case 'about':
        return <AboutView />;
      default:
        return null;
    }
  };

  const activeIsFavoriteStatus = playerState.currentSong 
    ? favourites.some((s) => s.id === playerState.currentSong!.id) 
    : false;

  return (
    <div className="flex bg-bg-primary text-text-primary h-screen w-screen overflow-hidden text-sm relative selection:bg-brand/35 selection:text-text-primary">
      {/* 1. Sidebar desktop navigation */}
      <Sidebar currentSection={activeSection} setSection={setSection} />

      {/* 2. Main content viewport section */}
      <main className="flex-1 flex flex-col h-full bg-linear-to-b from-bg-primary to-bg-secondary relative overflow-hidden">
        {/* Immersive UI Background Atmosphere Glow */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-brand/10 blur-[130px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-brand/5 blur-[110px] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none z-0"></div>
        
        {/* Mobile Header Branding */}
        <div className="md:hidden flex items-center justify-between p-4 z-20 shrink-0 border-b border-border-color bg-bg-primary/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-brand animate-spin-slow" />
            <h1 className="font-sans font-bold text-base text-text-primary">Paradox Player</h1>
          </div>
          <div className="font-mono text-[11px] font-bold bg-gradient-to-r from-brand to-brand-hover bg-clip-text text-transparent">
            Built by Sree
          </div>
        </div>
        
        {/* Dynamic Section Contents Scroll view container */}
        <div className="flex-1 w-full overflow-hidden flex flex-col relative z-10">
          {renderContent()}
        </div>

        {/* Persistent bottom PlayerBar panel */}
        {playerState.currentSong && (
          <PlayerBar
            playerState={playerState}
            onTogglePlay={handleTogglePlay}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            onVolumeChange={handleVolume}
            onShuffleToggle={handleShuffleToggle}
            onRepeatToggle={handleRepeatToggle}
            isFavorite={activeIsFavoriteStatus}
            onFavoriteToggle={() => playerState.currentSong && handleFavoriteToggle(playerState.currentSong)}
            onOpenSongPage={() => setSection('song-page')}
          />
        )}
      </main>

      {/* 3. Mobile Navigation Bottom bar panel */}
      <BottomNav currentSection={activeSection} setSection={setSection} />

      {/* 4. Overlay Background file downloader progress popup */}
      <DownloadModal
        state={downloadState}
        onCancel={handleCancelDownload}
      />
    </div>
  );
}
