import { Router } from 'express';
import multer from 'multer';
import Project from '../models/Project';
import { parseCsv } from '../utils/csv';
import { analyzeRepo } from '../services/analyze';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.get('/', async (_req, res) => {
  console.log('[Projects] Received GET request for all projects');
  const projects = await Project.find();
  console.log(`[Projects] Found ${projects.length} projects`);
  projects.forEach(p => {
    console.log(`[Projects] Project: ${p.name} (ID: ${p._id}), Cases count: ${p.cases?.length || 0}`);
  });
  res.json(projects);
});

router.post('/', upload.single('file'), async (req, res) => {
  console.log('[Projects] Received POST request to create project');
  const { name, repoUrl } = req.body;
  console.log(`[Projects] Project name: ${name}, Repo URL: ${repoUrl}`);
  
  if (!req.file) {
    console.error('[Projects] No file uploaded in request');
    return res.status(400).send('CSV file required');
  }
  
  console.log(`[Projects] Uploaded file path: ${req.file.path}, original name: ${req.file.originalname}`);
  console.log(`[Projects] Starting CSV parsing...`);
  
  try {
    const cases = await parseCsv(req.file.path);
    console.log(`[Projects] CSV parsing completed. Parsed ${cases.length} cases`);
    console.log(`[Projects] Sample case data:`, cases.slice(0, 2));
    
    const project = await Project.create({ name, repoUrl, cases });
    console.log(`[Projects] Project created successfully with ID: ${project._id}, Cases count: ${project.cases.length}`);
    res.json(project);
  } catch (error) {
    console.error('[Projects] Error processing CSV file:', error);
    res.status(500).json({ error: 'Failed to process CSV file', details: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/:id/analyze', async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.sendStatus(404);
  const filtered = await analyzeRepo(project.repoUrl, project.cases);
  res.json(filtered);
});

export default router;
