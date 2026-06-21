import express from 'express';
import dns from 'dns';

// Fix for Node 18+ preferring IPv6 in container environments and failing to fetch
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.warn('Could not set DNS default result order to ipv4first:', e);
}

// Ignore self-signed or invalid SSL certificates often present on hobby API mirrors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const HOSTS_POOL = [
  'https://saavn.me',
  'https://jiosaavnapi.vercel.app',
  'https://jiosaavn-api-one.vercel.app',
  'https://jiosaavn-api-liard.vercel.app',
  'https://saavn.dev/api',
  'https://saavn.dev',
  'https://jiosaavn-api.vercel.app',
  'https://jiosaavn-api-beta-three.vercel.app',
  'https://jiosaavn-api-2.vercel.app',
  'https://jiosaavnapi-nine.vercel.app',
  'https://jiosaavn-api-v2.vercel.app'
];

async function fetchFromApi(relativeEndpoint: string): Promise<any> {
  const endpoint = relativeEndpoint.startsWith('/') ? relativeEndpoint.slice(1) : relativeEndpoint;
  const candidateUrls: string[] = [];

  for (const host of HOSTS_POOL) {
    if (host.endsWith('/api')) {
      candidateUrls.push(`${host}/${endpoint}`);
      const rawParent = host.replace(/\/api$/, '');
      candidateUrls.push(`${rawParent}/${endpoint}`);
    } else {
      candidateUrls.push(`${host}/api/${endpoint}`);
      candidateUrls.push(`${host}/${endpoint}`);
    }
  }

  // Deduplicate Candidate URLs
  const uniqueUrls = Array.from(new Set(candidateUrls));
  const errors: string[] = [];

  for (const url of uniqueUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const json = await res.json();
        // Check if response indicates success or standard saavn API payload
        const isValidPayload = json && (
          Array.isArray(json) ||
          json.success === true ||
          json.status === 'SUCCESS' ||
          json.data !== undefined ||
          (json.id !== undefined && json.name !== undefined)
        );
        if (isValidPayload) {
          console.log(`[Server Proxy] Loaded data successfully from mirror: ${url}`);
          return json;
        }
      } else {
        errors.push(`${url} (HTTP ${res.status})`);
      }
    } catch (err: any) {
      // Quietly log to avoid false positive error monitoring tags
      console.log(`[Server Proxy Check] Host not available: ${url}`);
      errors.push(`${url} (Reason: unavailable)`);
    }
  }

  throw new Error(`All ${uniqueUrls.length} JioSaavn API mirrors failed. Logged errors:\n` + errors.join('\n'));
}

const app = express();

// Parse JSON requests
app.use(express.json());

// Saavn API Proxy route FIRST to bypass browser CORS constraints completely
app.get('/api/saavn/*', async (req, res) => {
  try {
    const pathSuffix = req.params[0] || req.path.replace(/^\/api\/saavn\//, '');
    const queryParams = new URLSearchParams(req.query as any).toString();
    const relativeEndpoint = pathSuffix + (queryParams ? `?${queryParams}` : '');
    
    console.log(`[Server Proxy] Fetching mirror endpoint: ${relativeEndpoint}`);
    const data = await fetchFromApi(relativeEndpoint);
    res.json(data);
  } catch (err: any) {
    console.error(`[Server Proxy Error]:`, err.message || err);
    res.status(502).json({
      success: false,
      message: err.message || String(err)
    });
  }
});

// API health status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
