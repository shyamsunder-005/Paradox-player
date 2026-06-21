import { Song } from './types';
import { getBigImage, getPlaybackUrl } from './api';
import { getQueue, saveQueue, getHistory, saveHistory } from './storage';

export type RepeatMode = 'off' | 'one' | 'all';
export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  status: PlaybackStatus;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Song[];
  currentIndex: number;
  eqGains: number[]; // 9 values between -20 and +20
}

class PlayerEngine {
  private audio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  
  private state: PlayerState = {
    currentSong: null,
    isPlaying: false,
    status: 'idle',
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isShuffle: false,
    repeatMode: 'off',
    queue: [],
    currentIndex: -1,
    eqGains: Array(9).fill(0), // 62Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz
  };

  private listeners: (() => void)[] = [];
  private frequencies = [62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous'; // Enable CORS for equalizer/fetch
    
    // Setup audio element listeners
    this.audio.addEventListener('timeupdate', () => {
      this.state.currentTime = this.audio.currentTime;
      this.emit();
    });

    this.audio.addEventListener('durationchange', () => {
      this.state.duration = this.audio.duration || 0;
      this.emit();
    });

    this.audio.addEventListener('play', () => {
      this.state.isPlaying = true;
      this.state.status = 'playing';
      this.emit();
      this.updateMediaSessionState();
    });

    this.audio.addEventListener('pause', () => {
      this.state.isPlaying = false;
      this.state.status = 'paused';
      this.emit();
      this.updateMediaSessionState();
    });

    this.audio.addEventListener('loadstart', () => {
      this.state.status = 'loading';
      this.emit();
    });

    this.audio.addEventListener('canplay', () => {
      if (this.state.status === 'loading') {
        this.state.status = this.state.isPlaying ? 'playing' : 'paused';
      }
      this.emit();
    });

    this.audio.addEventListener('ended', () => {
      this.handleSongEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      this.state.status = 'error';
      this.state.isPlaying = false;
      this.emit();
    });

    // Load initial queue
    const savedQueue = getQueue();
    if (savedQueue && savedQueue.length > 0) {
      this.state.queue = savedQueue;
      this.state.currentIndex = 0;
      this.state.currentSong = savedQueue[0];
      // Preload current song but don't autoplay
      const streamUrl = getPlaybackUrl(savedQueue[0]);
      if (streamUrl) {
        this.audio.src = streamUrl;
        this.audio.load();
      }
    }

    // Set initial volume
    this.audio.volume = this.state.volume;
  }

  // Set up listeners for state changes
  public subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((x) => x !== fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  // Returns current immutable-ish state snapshot
  public getState(): PlayerState {
    return { ...this.state };
  }

  // Setup Web Audio API Context and Filters
  private initAudioPipeline() {
    if (this.audioCtx) return; // Already setup

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        console.warn('Web Audio API is not supported in this browser.');
        return;
      }

      this.audioCtx = new AudioCtxClass();
      this.mediaSource = this.audioCtx.createMediaElementSource(this.audio);

      // Create 9 filters peaking equalizer
      let lastNode: AudioNode = this.mediaSource;
      
      this.filters = this.frequencies.map((freq, i) => {
        const filter = this.audioCtx!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.0; // standard filter bandwidth selectivity Q
        filter.gain.value = this.state.eqGains[i]; // Apply whatever state says
        
        lastNode.connect(filter);
        lastNode = filter;
        return filter;
      });

      // Finally, connect chain to speaker output
      lastNode.connect(this.audioCtx.destination);
    } catch (err) {
      console.error('Failed to initialize Web Audio Equalizer chain:', err);
    }
  }

  // Play a specific song and optionally load an entourage queue
  public async playSong(song: Song, newQueue?: Song[]) {
    this.initAudioPipeline();

    // Ensure AudioContext is resumed if suspended (auto-play policy restriction)
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (newQueue) {
      this.state.queue = newQueue;
      this.state.currentIndex = newQueue.findIndex((s) => s.id === song.id);
      saveQueue(newQueue);
    } else {
      // If song is not in queue, add it after the current one or set as sole queue item
      const idx = this.state.queue.findIndex((s) => s.id === song.id);
      if (idx !== -1) {
        this.state.currentIndex = idx;
      } else {
        this.state.queue.splice(this.state.currentIndex + 1, 0, song);
        this.state.currentIndex = this.state.currentIndex + 1;
        saveQueue(this.state.queue);
      }
    }

    this.state.currentSong = song;
    const url = getPlaybackUrl(song);
    
    if (!url) {
      console.error('No playback URL found for this song:', song.name);
      this.state.status = 'error';
      this.emit();
      return;
    }

    try {
      this.audio.src = url;
      this.audio.load();
      await this.audio.play();

      this.addToHistory(song);
      this.updateMediaSession();
    } catch (err) {
      console.error('Playback failed:', err);
    }
    this.emit();
  }

  public async setSongQueue(songs: Song[], playIndex = 0) {
    if (songs.length === 0) return;
    this.state.queue = songs;
    saveQueue(songs);
    await this.playSong(songs[playIndex], songs);
  }

  // Toggle playback play/pause state
  public async togglePlay() {
    this.initAudioPipeline();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (!this.state.currentSong && this.state.queue.length > 0) {
      await this.playSong(this.state.queue[0]);
      return;
    }

    if (!this.state.currentSong) return;

    try {
      if (this.state.isPlaying) {
        this.audio.pause();
      } else {
        await this.audio.play();
      }
    } catch (err) {
      console.error('Toggle play failed:', err);
    }
    this.emit();
  }

  // Skip to next track
  public playNext() {
    if (this.state.queue.length === 0) return;

    let nextIndex = this.state.currentIndex + 1;

    if (this.state.isShuffle) {
      nextIndex = Math.floor(Math.random() * this.state.queue.length);
    } else if (nextIndex >= this.state.queue.length) {
      if (this.state.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // Stop playback at end of queue
        this.audio.pause();
        this.state.currentTime = 0;
        this.audio.currentTime = 0;
        this.emit();
        return;
      }
    }

    this.state.currentIndex = nextIndex;
    const nextSong = this.state.queue[nextIndex];
    if (nextSong) {
      this.playSong(nextSong);
    }
  }

  // Skip to previous track
  public playPrevious() {
    if (this.state.queue.length === 0) return;

    let prevIndex = this.state.currentIndex - 1;

    if (this.state.isShuffle) {
      prevIndex = Math.floor(Math.random() * this.state.queue.length);
    } else if (prevIndex < 0) {
      if (this.state.repeatMode === 'all') {
        prevIndex = this.state.queue.length - 1;
      } else {
        // Remain on first track, seek to start
        this.audio.currentTime = 0;
        return;
      }
    }

    this.state.currentIndex = prevIndex;
    const prevSong = this.state.queue[prevIndex];
    if (prevSong) {
      this.playSong(prevSong);
    }
  }

  // Seek time position
  public seek(time: number) {
    if (!this.state.currentSong) return;
    this.audio.currentTime = time;
    this.state.currentTime = time;
    this.emit();
  }

  // Change volume values (0 - 1)
  public setVolume(vol: number) {
    const safeVol = Math.max(0, Math.min(1, vol));
    this.state.volume = safeVol;
    this.audio.volume = safeVol;
    this.emit();
  }

  // Change shuffle behavior
  public setShuffle(shuffle: boolean) {
    this.state.isShuffle = shuffle;
    this.emit();
  }

  // Change Repeat states
  public setRepeatMode(mode: RepeatMode) {
    this.state.repeatMode = mode;
    this.emit();
  }

  // Remove song from active queue
  public removeFromQueue(songId: string) {
    const removeIdx = this.state.queue.findIndex((s) => s.id === songId);
    if (removeIdx === -1) return;

    const deletingCurrent = removeIdx === this.state.currentIndex;
    
    this.state.queue = this.state.queue.filter((s) => s.id !== songId);
    saveQueue(this.state.queue);

    if (this.state.queue.length === 0) {
      this.audio.src = '';
      this.state.currentSong = null;
      this.state.currentIndex = -1;
      this.state.isPlaying = false;
      this.state.status = 'idle';
    } else {
      if (deletingCurrent) {
        // Play the updated first item or next item
        const newIdx = Math.min(removeIdx, this.state.queue.length - 1);
        this.state.currentIndex = newIdx;
        this.playSong(this.state.queue[newIdx]);
      } else {
        // Adjust index pointer
        this.state.currentIndex = this.state.queue.findIndex(
          (s) => s.id === this.state.currentSong?.id
        );
      }
    }
    this.emit();
  }

  // Clears the entire queue
  public clearQueue() {
    this.audio.pause();
    this.audio.src = '';
    this.state.queue = [];
    this.state.currentSong = null;
    this.state.currentIndex = -1;
    this.state.isPlaying = false;
    this.state.status = 'idle';
    this.state.currentTime = 0;
    this.state.duration = 0;
    saveQueue([]);
    this.emit();
  }

  // Add a single song to queue (next in deck) without playing instantly
  public addToQueue(song: Song) {
    const alreadyIdx = this.state.queue.findIndex((s) => s.id === song.id);
    if (alreadyIdx !== -1) return; // Already queued up

    this.state.queue.push(song);
    saveQueue(this.state.queue);
    
    if (this.state.queue.length === 1) {
      this.state.currentIndex = 0;
      this.state.currentSong = song;
      const streamUrl = getPlaybackUrl(song);
      if (streamUrl) {
        this.audio.src = streamUrl;
        this.audio.load();
      }
    }
    this.emit();
  }

  // Reorder queue index items
  public setReorderQueue(reordered: Song[]) {
    this.state.queue = reordered;
    saveQueue(reordered);
    this.state.currentIndex = reordered.findIndex((s) => s.id === this.state.currentSong?.id);
    this.emit();
  }

  // Adjust peak equalizer filters gain (-20 to +20)
  public setEqGain(bandIdx: number, value: number) {
    const safeGain = Math.max(-20, Math.min(20, value));
    this.state.eqGains[bandIdx] = safeGain;
    
    this.initAudioPipeline();
    if (this.filters[bandIdx]) {
      // Use linearRampToValueAtTime for seamless pops/clicks-free sweeps
      const ctx = this.audioCtx;
      if (ctx) {
        this.filters[bandIdx].gain.setValueAtTime(safeGain, ctx.currentTime);
      } else {
        this.filters[bandIdx].gain.value = safeGain;
      }
    }
    this.emit();
  }

  // Resets the entire 9 bands back to flat 0dB settings
  public resetEq() {
    this.state.eqGains = Array(9).fill(0);
    this.initAudioPipeline();
    this.filters.forEach((filter) => {
      filter.gain.value = 0;
    });
    this.emit();
  }

  private handleSongEnded() {
    if (this.state.repeatMode === 'one') {
      this.audio.currentTime = 0;
      this.audio.play().catch(console.error);
    } else {
      this.playNext();
    }
  }

  private addToHistory(song: Song) {
    let history = getHistory();
    // Exclude duplicates and limit to 30 items
    history = [song, ...history.filter((s) => s.id !== song.id)].slice(0, 30);
    saveHistory(history);
  }

  // MediaSession API configurations integration
  private updateMediaSession() {
    if (!('mediaSession' in navigator) || !this.state.currentSong) return;

    try {
      const song = this.state.currentSong;
      const artists = song.artists.primary.map((a) => a.name).join(', ') || 'Unknown Artist';
      
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.name,
        artist: artists,
        album: song.album.name || 'Single',
        artwork: [
          { src: getBigImage(song.image), sizes: '500x500', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => this.togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => this.togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.playNext());
      
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
    } catch (err) {
      console.warn('Error setting up MediaSession API handlers:', err);
    }
  }

  private updateMediaSessionState() {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = this.state.isPlaying ? 'playing' : 'paused';
    } catch {}
  }
}

// Single singleton instance declared globally
export const playerEngine = new PlayerEngine();
