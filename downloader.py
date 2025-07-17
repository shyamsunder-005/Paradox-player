import os
import io
import zipfile
import yt_dlp

QUALITY_OPTIONS = {
    'Best': 'best',
    'Worst': 'worst',
    '480p': 'bestvideo[height<=480]+bestaudio/best',
    '720p': 'bestvideo[height<=720]+bestaudio/best',
    '1080p': 'bestvideo[height<=1080]+bestaudio/best'
}

def download_video_or_playlist(url, download_path='downloads', download_type='video', quality='Best', content_type='Playlist', zip_output=False):
    if not os.path.exists(download_path):
        os.makedirs(download_path)

    is_playlist = (content_type == 'Playlist')

    # Common YDL options
    outtmpl = os.path.join(download_path, '%(title)s.%(ext)s')

    ydl_opts = {
        'format': 'bestaudio/best' if download_type == 'audio' else QUALITY_OPTIONS.get(quality, 'best'),
        'outtmpl': outtmpl,
        'noplaylist': not is_playlist,
        'ignoreerrors': True,
        'quiet': False,
    }

    if download_type == 'audio':
        ydl_opts['postprocessors'] = [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]

    downloaded_filepaths = []

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info_dict = ydl.extract_info(url, download=False)
            if not info_dict:
                raise ValueError("Could not retrieve info. Please check the URL.")
        except Exception as e:
            raise ValueError(f"Failed to extract info: {e}")

        entries = info_dict.get('entries', [info_dict]) if is_playlist else [info_dict]

        for entry in entries:
            if not entry:
                continue
            try:
                title = entry.get('title', 'video')
                ext = 'mp3' if download_type == 'audio' else entry.get('ext', 'mp4')
                filename = f"{title}.{ext}"
                filepath = os.path.join(download_path, filename)

                print(f'Downloading: {title}')
                ydl.download([entry.get('webpage_url')])
                downloaded_filepaths.append(filepath)
            except Exception as e:
                print(f'Error downloading {entry.get("title", "Unknown")}: {str(e)}')

    # Optionally zip the files
    if zip_output and downloaded_filepaths:
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
            for file_path in downloaded_filepaths:
                arcname = os.path.basename(file_path)
                if os.path.exists(file_path):
                    zipf.write(file_path, arcname=arcname)
        zip_buffer.seek(0)
        return zip_buffer  # For Streamlit: pass this to `st.download_button`

    return downloaded_filepaths
