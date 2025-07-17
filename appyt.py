import streamlit as st
from downloader import download_video_or_playlist, QUALITY_OPTIONS
import os

st.title("📥 YouTube Downloader")
st.markdown("Download **YouTube Playlists** or **Single Videos** as **video** or **audio**")

# UI Inputs
url = st.text_input("Enter YouTube Video or Playlist URL")
content_type = st.radio("Select content type", ["Single Video", "Playlist"])
download_type = st.selectbox("Download type", ["video", "audio"])
quality = st.selectbox("Video Quality (only for video)", list(QUALITY_OPTIONS.keys()))
download_path = st.text_input("Download folder", "downloads")

# Run button
if st.button("Download"):
    if not url:
        st.error("Please enter a valid URL.")
    else:
        with st.spinner("Downloading..."):
            try:
                downloaded = download_video_or_playlist(
                    url=url,
                    download_path=download_path,
                    download_type=download_type,
                    quality=quality,
                    content_type=content_type
                )
                if downloaded:
                    st.success(f"Downloaded {len(downloaded)} item(s) successfully!")
                    st.markdown("### 📄 Files:")
                    for f in os.listdir(download_path):
                        file_path = os.path.join(download_path, f)
                        st.markdown(f"[📁 {f}](./{file_path})")
                else:
                    st.warning("No files were downloaded.")
            except Exception as e:
                st.error(f"❌ Error: {e}")
