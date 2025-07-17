import os
import yt_dlp

QUALITY_OPTIONS = {
    'Best': 'best',
    'Worst': 'worst',
    '480p': 'bestvideo[height<=480]+bestaudio/best',
    '720p': 'bestvideo[height<=720]+bestaudio/best',
    '1080p': 'bestvideo[height<=1080]+bestaudio/best'
}

def download_video_or_playlist(url, download_path='downloads', download_type='video', quality='Best', content_type='Playlist'):
    if not os.path.exists(download_path):
        os.makedirs(download_path)

    is_playlist = (content_type == 'Playlist')

    if download_type == 'audio':
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(download_path, '%(title)s.%(ext)s'),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'noplaylist': not is_playlist,
            'ignoreerrors': True,
            'quiet': False,
        }
    else:
        ydl_opts = {
            'format': QUALITY_OPTIONS.get(quality, 'best'),
            'outtmpl': os.path.join(download_path, '%(title)s.%(ext)s'),
            'noplaylist': not is_playlist,
            'ignoreerrors': True,
            'quiet': False,
        }

    downloaded_files = []

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info_dict = ydl.extract_info(url, download=False)
            if not info_dict:
                raise ValueError("Could not retrieve info. Please check the URL.")
        except Exception as e:
            raise ValueError(f"Failed to extract info: {e}")

        # Handle single video or multiple entries
        entries = info_dict.get('entries', [info_dict]) if is_playlist else [info_dict]

        for entry in entries:
            if entry:
                video_url = entry.get('webpage_url') or url
                if not video_url:
                    continue
                try:
                    print(f'Downloading: {entry["title"]}')
                    ydl.download([video_url])
                    downloaded_files.append(entry["title"])
                except Exception as e:
                    print(f'Error downloading {entry.get("title", "Unknown")}: {str(e)}')

    return downloaded_files
