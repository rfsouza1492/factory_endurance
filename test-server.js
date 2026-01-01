#!/usr/bin/env node
/**
 * Teste simples do servidor
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Servidor funcionando!' });
});

app.get('/api/projects', async (req, res) => {
  try {
    const projectsManager = await import('./src/config/projects-manager.js');
    const projects = projectsManager.getAllProjects();
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor de teste rodando em http://localhost:${PORT}`);
  console.log(`📊 Teste: http://localhost:${PORT}/test`);
  console.log(`📋 Projetos: http://localhost:${PORT}/api/projects`);
});

