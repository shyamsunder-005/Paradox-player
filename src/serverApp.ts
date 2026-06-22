import express from 'express';
import dns from 'dns';
import { Readable } from 'stream';

// Fix for Node 18+ preferring IPv6 in container environments and failing to fetch
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.warn('Could not set DNS default result order to ipv4first:', e);
}

// Ignore self-signed or invalid SSL certificates often present on hobby API mirrors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

app.use(express.json());

// Set security headers to match Medplay
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Proxy handler helper for streams
async function proxyStream(req: express.Request, res: express.Response) {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).send('No URL provided');
  }

  try {
    const headers: Record<string, string> = {};
    if (req.headers.range) {
      headers['Range'] = req.headers.range as string;
    }

    const upstreamResponse = await fetch(url, { headers });

    res.status(upstreamResponse.status);
    
    // Pass along headers
    const contentType = upstreamResponse.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    
    const contentRange = upstreamResponse.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);
    
    res.setHeader('Accept-Ranges', 'bytes');
    
    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    if (upstreamResponse.body) {
      // Use Readable.fromWeb to pipe the web stream to the Node response
      const readable = Readable.fromWeb(upstreamResponse.body as any);
      readable.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  }
}

app.get(['/stream/', '/api/stream/'], (req, res) => proxyStream(req, res));
app.get(['/streamer/', '/api/streamer/'], (req, res) => proxyStream(req, res));

app.get(['/image/', '/api/image/'], async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.status(400).send('No URL provided');
  }

  try {
    const upstreamResponse = await fetch(url);
    if (!upstreamResponse.ok) {
      return res.redirect('https://placehold.co/150x150/18181b/ffffff?text=Paradox');
    }

    res.status(upstreamResponse.status);
    const contentType = upstreamResponse.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    
    const contentLength = upstreamResponse.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);

    if (upstreamResponse.body) {
      const readable = Readable.fromWeb(upstreamResponse.body as any);
      readable.pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    res.redirect('https://placehold.co/150x150/18181b/ffffff?text=Paradox');
  }
});

app.get(['/download/', '/api/download/'], async (req, res) => {
  const url = req.query.url as string;
  const filename = req.query.filename as string || 'downloaded_song.mp3';
  if (!url) {
    return res.status(400).send('No URL provided');
  }

  try {
    const upstreamResponse = await fetch(url);
    res.status(upstreamResponse.status);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.mp3"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    
    if (upstreamResponse.body) {
      const readable = Readable.fromWeb(upstreamResponse.body as any);
      readable.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error('Download Error:', err);
    res.status(500).send('Download Error');
  }
});

// API health status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
