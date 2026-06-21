/**
 * Custom Client-Side ID3v2.3 Metatag Injector for MP3s
 * Allows writing Artist, Title, Album, and Cover Image directly inside the browser.
 */

function createTextFrame(id: string, text: string): Uint8Array {
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);
  
  // Frame format:
  // - 4 bytes Frame ID (e.g. "TIT2")
  // - 4 bytes Frame Size (excluding this 10-byte header)
  // - 2 bytes Flags (usually 0x00 00)
  // - 1 byte Text Encoding (0x03 for UTF-8)
  // - N bytes encoded Text content
  
  const frameLength = 10 + 1 + textBytes.length;
  const frame = new Uint8Array(frameLength);
  
  // Set Frame ID
  for (let i = 0; i < 4; i++) {
    frame[i] = id.charCodeAt(i);
  }
  
  // Set Frame Size (Big-Endian 32-bit int)
  const size = 1 + textBytes.length;
  frame[4] = (size >> 24) & 0xff;
  frame[5] = (size >> 16) & 0xff;
  frame[6] = (size >> 8) & 0xff;
  frame[7] = size & 0xff;
  
  // Set Flags (0)
  frame[8] = 0;
  frame[9] = 0;
  
  // Set Encoding (UTF-8)
  frame[10] = 0x03;
  
  // Set String data
  frame.set(textBytes, 11);
  
  return frame;
}

function createPictureFrame(imageBuffer: ArrayBuffer, mimeType: string): Uint8Array {
  const mimeBytes = new TextEncoder().encode(mimeType);
  const imgBytes = new Uint8Array(imageBuffer);
  
  // Frame format for APIC:
  // - 4 bytes Frame ID ("APIC")
  // - 4 bytes Frame Size (excluding this 10-byte header)
  // - 2 bytes Flags
  // - 1 byte Text Encoding (0x03 for UTF-8)
  // - N bytes mimeType + null terminator (0x00)
  // - 1 byte Picture Type (0x03 is Front Cover)
  // - 1 byte Description null terminator (0x00 is empty description)
  // - M bytes image data
  const contentSize = 1 + mimeBytes.length + 1 + 1 + 1 + imgBytes.length;
  const frameLength = 10 + contentSize;
  const frame = new Uint8Array(frameLength);
  
  // Frame ID: "APIC"
  for (let i = 0; i < 4; i++) {
    frame[i] = "APIC".charCodeAt(i);
  }
  
  // Frame Size
  frame[4] = (contentSize >> 24) & 0xff;
  frame[5] = (contentSize >> 16) & 0xff;
  frame[6] = (contentSize >> 8) & 0xff;
  frame[7] = contentSize & 0xff;
  
  // Flags
  frame[8] = 0;
  frame[9] = 0;
  
  let offset = 10;
  frame[offset++] = 0x03; // Encoding (UTF-8)
  
  frame.set(mimeBytes, offset);
  offset += mimeBytes.length;
  frame[offset++] = 0x00; // Null terminator for mimeType
  
  frame[offset++] = 0x03; // Picture Type: Cover (front)
  frame[offset++] = 0x00; // Null terminator for empty description
  
  frame.set(imgBytes, offset);
  
  return frame;
}

/**
 * Prepends an ID3v2.3 tag header and target frames to raw audio binary data
 */
export function injectID3v2Tags(
  audioBuffer: ArrayBuffer,
  title: string,
  artist: string,
  album: string,
  coverBuffer: ArrayBuffer | null,
  mimeType: string = 'image/jpeg'
): ArrayBuffer {
  try {
    const titleFrame = createTextFrame('TIT2', title);
    const artistFrame = createTextFrame('TPE1', artist);
    const albumFrame = createTextFrame('TALB', album);
    const pictureFrame = coverBuffer && coverBuffer.byteLength > 0 
      ? createPictureFrame(coverBuffer, mimeType) 
      : null;
      
    let totalTagsLength = titleFrame.length + artistFrame.length + albumFrame.length;
    if (pictureFrame) {
      totalTagsLength += pictureFrame.length;
    }
    
    // Create preconditioned ID3 header block (10 bytes)
    // Structure:
    // - 3 bytes "ID3"
    // - 2 bytes Version (03 00 -> ID3v2.3)
    // - 1 byte Flags
    // - 4 bytes Size (Syncsafe integer representation)
    const id3Header = new Uint8Array(10);
    id3Header[0] = 'I'.charCodeAt(0);
    id3Header[1] = 'D'.charCodeAt(0);
    id3Header[2] = '3'.charCodeAt(0);
    id3Header[3] = 3; // Version 3
    id3Header[4] = 0; // Revision 0
    id3Header[5] = 0; // Flags
    
    // Syncsafe integers use 7 bits of each byte, with MSB set to 0.
    id3Header[6] = (totalTagsLength >> 21) & 0x7f;
    id3Header[7] = (totalTagsLength >> 14) & 0x7f;
    id3Header[8] = (totalTagsLength >> 7) & 0x7f;
    id3Header[9] = totalTagsLength & 0x7f;
    
    const taggedFile = new Uint8Array(10 + totalTagsLength + audioBuffer.byteLength);
    let offset = 0;
    
    // Write ID3 header
    taggedFile.set(id3Header, offset);
    offset += 10;
    
    // Write ID3 frames
    taggedFile.set(titleFrame, offset);
    offset += titleFrame.length;
    
    taggedFile.set(artistFrame, offset);
    offset += artistFrame.length;
    
    taggedFile.set(albumFrame, offset);
    offset += albumFrame.length;
    
    if (pictureFrame) {
      taggedFile.set(pictureFrame, offset);
      offset += pictureFrame.length;
    }
    
    // Append the actual MP3 audio binary bytes after tags
    taggedFile.set(new Uint8Array(audioBuffer), offset);
    
    return taggedFile.buffer;
  } catch (error) {
    console.error('Failed to parse or write ID3 tags, returning raw buffer:', error);
    return audioBuffer;
  }
}
