import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectSongGenre } from './src/server/genreService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API endpoint: Detect single song genre
  app.get('/api/detect', async (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      if (!q.trim()) {
        return res.status(400).json({ error: 'Parámetro de búsqueda "q" requerido.' });
      }
      const result = await detectSongGenre(q);
      return res.json(result);
    } catch (err: unknown) {
      console.error('Error in /api/detect:', err);
      return res.status(500).json({
        error: 'Error al consultar las bases de datos de géneros musicales.',
        message: err instanceof Error ? err.message : String(err)
      });
    }
  });

  app.post('/api/detect', async (req, res) => {
    try {
      const query = req.body?.query || req.body?.q || '';
      if (!query.trim()) {
        return res.status(400).json({ error: 'Campo "query" requerido en el cuerpo.' });
      }
      const result = await detectSongGenre(query);
      return res.json(result);
    } catch (err: unknown) {
      console.error('Error in POST /api/detect:', err);
      return res.status(500).json({
        error: 'Error procesando la solicitud.',
        message: err instanceof Error ? err.message : String(err)
      });
    }
  });

  // Batch detection endpoint
  app.post('/api/batch-detect', async (req, res) => {
    try {
      const songs: string[] = req.body?.songs || [];
      if (!Array.isArray(songs) || songs.length === 0) {
        return res.status(400).json({ error: 'Se requiere un arreglo "songs" de canciones.' });
      }

      const limitedSongs = songs.slice(0, 10); // Limit to 10 in batch
      const results = await Promise.all(
        limitedSongs.map(async (song) => {
          try {
            return await detectSongGenre(song);
          } catch (e) {
            return {
              query: { raw: song, cleaned: song },
              matchFound: false,
              primaryGenre: 'Desconocido',
              error: e instanceof Error ? e.message : 'Error al procesar',
            };
          }
        })
      );

      return res.json({ results });
    } catch (err: unknown) {
      console.error('Error in /api/batch-detect:', err);
      return res.status(500).json({ error: 'Error en procesamiento por lotes.' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'SonoraGenre API', timestamp: new Date().toISOString() });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🎵 SonoraGenre server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
