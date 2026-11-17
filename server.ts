import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  ApiHttpError,
  generatePracticalTasks,
  generateProjectPlan,
  generateStudyNotes,
  getAiStatus,
  getHealthStatus,
  transcribeAudio,
} from './server/aiService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

function sendHandlerError(res: express.Response, err: unknown, fallbackMessage: string) {
  if (err instanceof ApiHttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  const msg = err instanceof Error ? err.message : fallbackMessage;
  return res.status(502).json({ error: msg });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req, res) => {
    res.json(getHealthStatus());
  });

  app.get('/api/ai/status', (_req, res) => {
    res.json(getAiStatus('express'));
  });

  app.post('/api/ai/transcribe', async (req, res) => {
    try {
      const result = await transcribeAudio(req.body ?? {});
      return res.json(result);
    } catch (err: unknown) {
      return sendHandlerError(res, err, 'Audio transcription failed.');
    }
  });

  app.post('/api/ai/notes', async (req, res) => {
    try {
      const result = await generateStudyNotes(req.body ?? {});
      return res.json(result);
    } catch (err: unknown) {
      return sendHandlerError(res, err, 'Failed to generate AI notes.');
    }
  });

  app.post('/api/ai/tasks', async (req, res) => {
    try {
      const result = await generatePracticalTasks(req.body ?? {});
      return res.json(result);
    } catch (err: unknown) {
      return sendHandlerError(res, err, 'Failed to generate practical tasks.');
    }
  });

  app.post('/api/ai/project-plan', async (req, res) => {
    try {
      const result = await generateProjectPlan(req.body ?? {});
      return res.json(result);
    } catch (err: unknown) {
      return sendHandlerError(res, err, 'Failed to generate project plan.');
    }
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SynapseStudy AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
