import { Song, Playlist } from './types';

const KEYS = {
  FAVOURITES: 'tunely_favourites_info',
  PLAYLISTS: 'tunely_playlists_info',
  QUEUE: 'tunely_play_queue_info',
  CURRENT_THEME: 'tunely_active_theme_id',
  HISTORY: 'tunely_play_history_info',
};

function safeGet(key: string, defaultValue: any): any {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Failed to parse localStorage key [${key}]:`, err);
    return defaultValue;
  }
}

function safeSet(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save localStorage key [${key}]:`, err);
  }
}

export function getFavourites(): Song[] {
  return safeGet(KEYS.FAVOURITES, []);
}

export function saveFavourites(songs: Song[]): void {
  safeSet(KEYS.FAVOURITES, songs);
}

export function getPlaylists(): Playlist[] {
  return safeGet(KEYS.PLAYLISTS, []);
}

export function savePlaylists(playlists: Playlist[]): void {
  safeSet(KEYS.PLAYLISTS, playlists);
}

export function getQueue(): Song[] {
  return safeGet(KEYS.QUEUE, []);
}

export function saveQueue(songs: Song[]): void {
  safeSet(KEYS.QUEUE, songs);
}

export function getTheme(): string {
  try {
    return localStorage.getItem(KEYS.CURRENT_THEME) || 'sunset';
  } catch {
    return 'sunset';
  }
}

export function saveTheme(theme: string): void {
  try {
    localStorage.setItem(KEYS.CURRENT_THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  } catch (err) {
    console.error('Failed to save selected theme:', err);
  }
}

export function getHistory(): Song[] {
  return safeGet(KEYS.HISTORY, []);
}

export function saveHistory(songs: Song[]): void {
  safeSet(KEYS.HISTORY, songs);
}
