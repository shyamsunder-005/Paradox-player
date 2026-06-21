import { Song } from './types';
import { getBigImage, getPlaybackUrl } from './api';
import { injectID3v2Tags } from './utils/id3';

export interface DownloadState {
  isDownloading: boolean;
  currentSong: Song | null;
  currentIndex: number;
  totalSongs: number;
  songProgress: number; // 0 to 100
  downloadQueue: Song[];
  statusMessage: string;
}

type DownloadListener = (state: DownloadState) => void;

class DownloadManager {
  private state: DownloadState = {
    isDownloading: false,
    currentSong: null,
    currentIndex: 0,
    totalSongs: 0,
    songProgress: 0,
    downloadQueue: [],
    statusMessage: '',
  };

  private listeners: DownloadListener[] = [];
  private abortController: AbortController | null = null;

  public subscribe(fn: DownloadListener) {
    this.listeners.push(fn);
    fn({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter((x) => x !== fn);
    };
  }

  private emit() {
    this.listeners.forEach((fn) => fn({ ...this.state }));
  }

  public getState(): DownloadState {
    return { ...this.state };
  }

  /**
   * Triggers sequential downloading of the given song list with progress
   */
  public async downloadSongs(songs: Song[], batchName = 'Songs') {
    if (this.state.isDownloading) {
      this.state.statusMessage = 'Please wait for the current download to complete';
      this.emit();
      // Clear status message warning after 3 seconds
      setTimeout(() => {
        if (this.state.statusMessage === 'Please wait for the current download to complete') {
          this.state.statusMessage = '';
          this.emit();
        }
      }, 3000);
      return;
    }

    if (songs.length === 0) return;

    this.state = {
      isDownloading: true,
      currentSong: songs[0],
      currentIndex: 0,
      totalSongs: songs.length,
      songProgress: 0,
      downloadQueue: songs,
      statusMessage: `Initializing download of ${songs.length} ${batchName}...`,
    };
    this.emit();

    this.abortController = new AbortController();

    try {
      for (let i = 0; i < songs.length; i++) {
        if (this.abortController.signal.aborted) break;

        const song = songs[i];
        this.state.currentSong = song;
        this.state.currentIndex = i;
        this.state.songProgress = 0;
        this.state.statusMessage = `Downloading "${song.name}" (${i + 1}/${songs.length})`;
        this.emit();

        await this.downloadSingleSong(song, this.abortController.signal);
      }

      this.state.statusMessage = 'All downloads completed successfully!';
    } catch (err: any) {
      if (err.name === 'AbortError') {
        this.state.statusMessage = 'Downloads cancelled by user.';
      } else {
        console.error('Error in download queue:', err);
        this.state.statusMessage = `Download failed: ${err.message || 'Unknown error'}`;
      }
    } finally {
      this.state.isDownloading = false;
      this.state.currentSong = null;
      this.state.songProgress = 0;
      this.abortController = null;
      this.emit();

      // Clear terminal completions message after 4s
      setTimeout(() => {
        if (!this.state.isDownloading) {
          this.state.statusMessage = '';
          this.emit();
        }
      }, 4000);
    }
  }

  /**
   * Cancels any active downloads
   */
  public cancelDownloads() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private async downloadSingleSong(song: Song, signal: AbortSignal): Promise<void> {
    const audioUrl = getPlaybackUrl(song);
    if (!audioUrl) {
      throw new Error(`No stream source URL found for ${song.name}`);
    }

    // 1. Fetch raw audio binary with chunk-wise progress updating
    const response = await fetch(audioUrl, { signal });
    if (!response.ok) throw new Error(`Server returned HTTP ${response.status} for search`);
    
    const contentLength = response.headers.get('content-length');
    let audioBuffer: ArrayBuffer;

    if (contentLength) {
      const totalBytes = parseInt(contentLength, 10);
      let loadedBytes = 0;
      
      const reader = response.body?.getReader();
      if (!reader) {
        audioBuffer = await response.arrayBuffer();
      } else {
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loadedBytes += value.length;
          
          this.state.songProgress = Math.round((loadedBytes / totalBytes) * 100);
          this.emit();
        }

        const stitched = new Uint8Array(loadedBytes);
        let pointer = 0;
        for (const chunk of chunks) {
          stitched.set(chunk, pointer);
          pointer += chunk.length;
        }
        audioBuffer = stitched.buffer;
      }
    } else {
      audioBuffer = await response.arrayBuffer();
      this.state.songProgress = 100;
      this.emit();
    }

    // 2. Safely load the highest available cover art image as ArrayBuffer (CORS allowed CDN)
    let coverBuffer: ArrayBuffer | null = null;
    const coverUrl = getBigImage(song.image);
    if (coverUrl) {
      try {
        const coverRes = await fetch(coverUrl, { signal });
        if (coverRes.ok) {
          coverBuffer = await coverRes.arrayBuffer();
        }
      } catch (err) {
        console.warn(`Failed to retrieve cover image for ID3 tagging:`, err);
      }
    }

    // 3. Inject ID3 tags (embedded title, artist names, album, cover image)
    const artistsLabel = song.artists.primary.map((a) => a.name).join(', ') || 'Unknown Artist';
    const albumName = song.album.name || 'Single';
    
    const taggedBuffer = injectID3v2Tags(
      audioBuffer,
      song.name,
      artistsLabel,
      albumName,
      coverBuffer,
      'image/jpeg'
    );

    // 4. Trigger browser native file download save dialog
    const blob = new Blob([taggedBuffer], { type: 'audio/mpeg' });
    const localUrl = URL.createObjectURL(blob);
    
    const element = document.createElement('a');
    element.href = localUrl;
    element.download = `${artistsLabel} - ${song.name}.mp3`;
    document.body.appendChild(element);
    element.click();
    
    // Revoke object url to free space
    document.body.removeChild(element);
    URL.revokeObjectURL(localUrl);
  }
}

export const downloadManager = new DownloadManager();
