export interface Artist {
  id: string;
  name: string;
  image?: { quality: string; url: string }[];
  type?: string;
  url?: string;
}

export interface SongAlbum {
  id?: string;
  name: string;
  url?: string;
}

export interface SongImage {
  quality: string;
  url: string;
}

export interface SongDownloadUrl {
  quality: string;
  url: string;
}

export interface Song {
  id: string;
  name: string;
  album: SongAlbum;
  artists: {
    primary: Artist[];
  };
  image: SongImage[];
  downloadUrl: SongDownloadUrl[];
  duration: number; // in seconds
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  year?: string;
  songCount?: number;
  image: SongImage[];
  artists: {
    primary: Artist[];
  };
  songs?: Song[];
}

export interface ArtistDetails {
  id: string;
  name: string;
  image: SongImage[];
  bio?: string;
  topSongs: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

export type NavigationSection = 'feed' | 'song-page' | 'queue' | 'favourites' | 'themes' | 'about' | 'settings';

export interface ThemeConfig {
  id: string;
  name: string;
  bgHex: string;
  brandHex: string;
}
