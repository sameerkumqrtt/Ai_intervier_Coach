import serverless from 'serverless-http';
import express from 'express';
import apiRouter from '../../apiRouter.js'; // The .js extension works with esbuild/Netlify in TS

const app = express();
app.use(express.json({ limit: '10mb' }));

// Handle standard local format if hitting the function directly
app.use('/api', apiRouter);

// Handle the Netlify proxy format
app.use('/.netlify/functions/api', apiRouter);

export const handler = serverless(app);
