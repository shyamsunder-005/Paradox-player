import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './src/serverApp';

async function startServer() {
  const PORT = 3000;

  // Vite middleware setup for local development and live preview
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(expressStaticMiddleware(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function expressStaticMiddleware(p: string) {
  // We need to import express since we use static helper
  const express = require('express');
  return express.static(p);
}

startServer();
