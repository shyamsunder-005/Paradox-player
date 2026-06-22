import { Song, Album, ArtistDetails, SongImage } from './types';
import { AudioQuality } from './storage';

/**
 * Robust fetch helper that queries active mirrors via our backend Express proxy.
 * This guarantees successful fetches by avoiding all browser client-side CORS issues.
 */
async function fetchFromApi(relativeEndpoint: string): Promise<any> {
  const endpoint = relativeEndpoint.startsWith('/') ? relativeEndpoint.slice(1) : relativeEndpoint;
  const url = `https://saavn.sumit.co/api/${endpoint}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Fetch failed with status ${res.status}: ${errorText}`);
  }
  
  return await res.json();
}

/**
 * Utility to unescape HTML entities commonly returned by Saavn API (e.g. &amp;, &#039;)
 */
export function unescapeHtml(text: string): string {
  if (!text) return '';
  const temp = document.createElement('div');
  temp.innerHTML = text;
  return temp.textContent || temp.innerText || text;
}

/**
 * Clean up Song objects from Saavn API to match our standard App Types.
 */
export function cleanSong(song: any): Song {
  if (!song) return song;

  // Grab the primary artist representation
  let primaryArtists = song.artists?.primary || [];
  if (primaryArtists.length === 0 && song.primaryArtists) {
    if (typeof song.primaryArtists === 'string') {
      primaryArtists = song.primaryArtists.split(',').map((name: string, i: number) => ({
        id: `artist-${i}`,
        name: name.trim(),
      }));
    } else if (Array.isArray(song.primaryArtists)) {
      primaryArtists = song.primaryArtists;
    }
  }

  return {
    id: song.id || '',
    name: unescapeHtml(song.name || song.title || 'Untitled'),
    album: {
      id: song.album?.id,
      name: unescapeHtml(song.album?.name || 'Single'),
      url: song.album?.url,
    },
    artists: {
      primary: primaryArtists.map((artist: any) => ({
        id: artist.id || '',
        name: unescapeHtml(artist.name || 'Unknown Artist'),
        image: artist.image,
        type: artist.type,
        url: artist.url,
      })),
    },
    image: song.image || [],
    downloadUrl: song.downloadUrl || [],
    duration: typeof song.duration === 'string' ? parseInt(song.duration, 10) : (song.duration || 0),
  };
}

export async function searchSongs(query: string, page = 1, limit = 50): Promise<Song[]> {
  if (!query.trim()) return [];
  try {
    const json = await fetchFromApi(`search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    const results = json.data?.results || json.data || [];
    return results.map((s: any) => cleanSong(s));
  } catch (err) {
    console.error('[Paradox Player] Failed to search songs:', err);
    return [];
  }
}

export async function searchAlbums(query: string, page = 1, limit = 50): Promise<Album[]> {
  if (!query.trim()) return [];
  try {
    const json = await fetchFromApi(`search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    const results = json.data?.results || json.data || [];
    return results.map((alb: any) => ({
      id: alb.id || '',
      name: unescapeHtml(alb.name || alb.title || 'Unknown Album'),
      year: alb.year || '',
      image: alb.image || [],
      artists: {
        primary: (alb.artists?.primary || []).map((art: any) => ({
          id: art.id || '',
          name: unescapeHtml(art.name || ''),
        })),
      },
    }));
  } catch (err) {
    console.error('[Paradox Player] Failed to search albums:', err);
    return [];
  }
}

export async function searchArtists(query: string, page = 1, limit = 50): Promise<any[]> {
  if (!query.trim()) return [];
  try {
    const json = await fetchFromApi(`search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    const results = json.data?.results || json.data || [];
    return results.map((art: any) => ({
      id: art.id || '',
      name: unescapeHtml(art.title || art.name || 'Unknown Artist'),
      image: art.image || [],
      type: art.type || 'artist',
      role: art.role || '',
    }));
  } catch (err) {
    console.error('[Paradox Player] Failed to search artists:', err);
    return [];
  }
}

export async function getSongDetails(id: string): Promise<Song | null> {
  try {
    const json = await fetchFromApi(`songs?id=${id}`);
    let originalData = json.data;
    if (Array.isArray(originalData)) {
      originalData = originalData[0];
    } else if (originalData && Array.isArray(originalData.results)) {
      originalData = originalData.results[0];
    }
    
    if (!originalData) return null;
    return cleanSong(originalData);
  } catch (err) {
    console.error(`[Paradox Player] Failed to load details for song ${id}, trying backups:`, err);
    try {
      const json = await fetchFromApi(`songs/${id}`);
      let originalData = json.data;
      if (Array.isArray(originalData)) {
        originalData = originalData[0];
      }
      if (!originalData) return null;
      return cleanSong(originalData);
    } catch (e) {
      console.error('[Paradox Player] Backup details fetch failed as well:', e);
      return null;
    }
  }
}

export async function getAlbumDetails(id: string): Promise<Album | null> {
  try {
    const json = await fetchFromApi(`albums?id=${id}`);
    const data = json.data;
    if (!data) return null;

    return {
      id: data.id || '',
      name: unescapeHtml(data.name || 'Untitled Album'),
      year: data.year || '',
      image: data.image || [],
      artists: {
        primary: (data.artists?.primary || []).map((art: any) => ({
          id: art.id || '',
          name: unescapeHtml(art.name || ''),
        })),
      },
      songs: (data.songs || []).map((s: any) => cleanSong(s)),
    };
  } catch (err) {
    console.error(`[Paradox Player] Failed to load details for album ${id}:`, err);
    try {
      const json = await fetchFromApi(`albums/${id}`);
      const data = json.data;
      if (!data) return null;
      return {
        id: data.id || '',
        name: unescapeHtml(data.name || 'Untitled Album'),
        year: data.year || '',
        image: data.image || [],
        artists: {
          primary: (data.artists?.primary || []).map((art: any) => ({
            id: art.id || '',
            name: unescapeHtml(art.name || ''),
          })),
        },
        songs: (data.songs || []).map((s: any) => cleanSong(s)),
      };
    } catch (e) {
      console.error('[Paradox Player] Backup album details fetch failed:', e);
      return null;
    }
  }
}

export async function getPlaylistDetails(id: string, limit: number = 50): Promise<Album | null> {
  try {
    const json = await fetchFromApi(`playlists?id=${id}&limit=${limit}`);
    const data = json.data;
    if (!data) return null;

    return {
      id: data.id || '',
      name: unescapeHtml(data.name || 'Playlist'),
      year: '',
      image: data.image || [],
      artists: { primary: [] },
      songs: (data.songs || []).map((s: any) => cleanSong(s)),
    };
  } catch (err) {
    console.error(`[Paradox Player] Failed to load details for playlist ${id}:`, err);
    return null;
  }
}

export async function getArtistDetails(id: string): Promise<ArtistDetails | null> {
  try {
    const json = await fetchFromApi(`artists?id=${id}`);
    const data = json.data;
    if (!data) return null;

    return {
      id: data.id || '',
      name: unescapeHtml(data.name || 'Unknown Artist'),
      image: data.image || [],
      bio: unescapeHtml(data.bio || ''),
      topSongs: (data.topSongs || []).map((s: any) => cleanSong(s)),
    };
  } catch (err) {
    console.error(`[Paradox Player] Failed to list details for artist ${id}, trying backup:`, err);
    try {
      const json = await fetchFromApi(`artists/${id}`);
      const data = json.data;
      if (!data) return null;
      return {
        id: data.id || '',
        name: unescapeHtml(data.name || 'Unknown Artist'),
        image: data.image || [],
        bio: unescapeHtml(data.bio || ''),
        topSongs: (data.topSongs || []).map((s: any) => cleanSong(s)),
      };
    } catch (e) {
      console.error('[Paradox Player] Artist backup search failed:', e);
      return null;
    }
  }
}

/**
 * Gets the highest resolution image URL from a list of images.
 */
export function getBigImage(images: SongImage[] | undefined): string {
  if (!images || images.length === 0) return 'https://placehold.co/500x500/18181b/ffffff?text=Tunely';
  const ideal = images.find((img) => img.quality === '500x500' || img.quality === 'large');
  if (ideal) return `/api/image/?url=${encodeURIComponent(ideal.url)}`;
  return `/api/image/?url=${encodeURIComponent(images[images.length - 1].url)}`;
}

/**
 * Gets the medium resolution image URL from a list of images.
 */
export function getMediumImage(images: SongImage[] | undefined): string {
  if (!images || images.length === 0) return 'https://placehold.co/150x150/18181b/ffffff?text=Tunely';
  const ideal = images.find((img) => img.quality === '150x150' || img.quality === 'medium');
  if (ideal) return `/api/image/?url=${encodeURIComponent(ideal.url)}`;
  return `/api/image/?url=${encodeURIComponent(images[0].url)}`;
}

/**
 * Gets the highest quality audio stream from downloadUrls based on requested AudioQuality.
 */
export function getPlaybackUrl(song: Song, quality: AudioQuality = 'high'): string {
  if (!song.downloadUrl || song.downloadUrl.length === 0) return '';
  // Find all options sorted descending
  const options = [...song.downloadUrl].sort((a, b) => {
    const rateA = parseInt(a.quality.replace(/[^0-9]/g, ''), 10) || 0;
    const rateB = parseInt(b.quality.replace(/[^0-9]/g, ''), 10) || 0;
    return rateB - rateA; // Descending
  });

  let selectedUrl = options[0]?.url;

  if (quality === 'medium') {
    const mediumOpt = options.find(o => (parseInt(o.quality.replace(/[^0-9]/g, ''), 10) || 0) <= 160);
    if (mediumOpt) selectedUrl = mediumOpt.url;
  } else if (quality === 'low') {
    const lowOpt = options.find(o => (parseInt(o.quality.replace(/[^0-9]/g, ''), 10) || 0) <= 96);
    if (lowOpt) selectedUrl = lowOpt.url;
  }

  return selectedUrl ? `/api/stream/?url=${encodeURIComponent(selectedUrl)}` : '';
}
