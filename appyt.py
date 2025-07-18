import streamlit as st
from downloader import download_video_or_playlist

st.title("📥 YouTube Downloader with ZIP Export")

url = st.text_input("Enter YouTube Video or Playlist URL")
content_type = st.radio("Select content type", ["Single Video", "Playlist"])
download_type = st.selectbox("Download type", ["video", "audio"])
quality = st.selectbox("Select Quality", ["Best", "Worst", "480p", "720p", "1080p"])
zip_filename = st.text_input("Enter ZIP file name", value="my_download.zip")

if st.button("Download"):
    if not url.strip():
        st.warning("Please enter a valid URL.")
    else:
        with st.spinner("Downloading and preparing your ZIP file..."):
            try:
                zip_buffer = download_video_or_playlist(
                    url=url,
                    download_type=download_type,
                    quality=quality,
                    content_type=content_type,
                    zip_output=True
                )

                if not zip_filename.endswith(".zip"):
                    zip_filename += ".zip"

                st.success("Download ready!")
                st.download_button(
                    label="📦 Download ZIP",
                    data=zip_buffer,
                    file_name=zip_filename,
                    mime="application/zip"
                )

            except Exception as e:
                st.error(f"Download failed: {e}")
