import streamlit as st
import yt_dlp
import zipfile
import os
import shutil
import io
import glob

st.set_page_config(page_title="YouTube Playlist Downloader", page_icon="📥")

# --- Helper: Download Playlist ---
def download_playlist(playlist_url, download_path, download_type='video'):
    if os.path.exists(download_path):
        shutil.rmtree(download_path)
    os.makedirs(download_path, exist_ok=True)

    ydl_opts = {
        'format': 'bestaudio/best' if download_type == 'audio' else 'best',
        'outtmpl': os.path.join(download_path, '%(title)s.%(ext)s'),
        'noplaylist': False,
        'quiet': True,
        'ignoreerrors': True,
    }

    if download_type == 'audio':
        ydl_opts.pop('postprocessors', None)  # Skip ffmpeg for Streamlit Cloud

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([playlist_url])

# --- Helper: Create ZIP ---
def zip_directory(directory, zip_filename):
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(directory):
            for file in files:
                full_path = os.path.join(root, file)
                arcname = os.path.relpath(full_path, start=directory)
                zipf.write(full_path, arcname=arcname)
    zip_buffer.seek(0)
    return zip_buffer

# --- UI ---
st.title("📥 YouTube Playlist Downloader")

url = st.text_input("Enter YouTube Playlist URL")
download_type = st.selectbox("Download Type", ["video", "audio"])
zip_filename = st.text_input("ZIP File Name", value="playlist_download.zip")

if st.button("Download Playlist"):
    if not url:
        st.warning("Please enter a playlist URL.")
    else:
        with st.spinner("Downloading playlist..."):
            try:
                download_path = "downloads"
                download_playlist(url, download_path, download_type)
                zip_file = zip_directory(download_path, zip_filename)

                if not zip_filename.endswith(".zip"):
                    zip_filename += ".zip"

                st.success("Download ready!")
                st.download_button(
                    label="📦 Download ZIP",
                    data=zip_file,
                    file_name=zip_filename,
                    mime="application/zip"
                )

                shutil.rmtree(download_path)

            except Exception as e:
                st.error(f"❌ Error: {e}")
