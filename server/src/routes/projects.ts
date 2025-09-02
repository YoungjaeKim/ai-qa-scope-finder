import { Router } from 'express';
import multer from 'multer';
import Project from '../models/Project';
import { parseCsv } from '../utils/csv';
import { analyzeRepo } from '../services/analyze';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.get('/', async (_req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

router.post('/', upload.single('file'), async (req, res) => {
  const { name, repoUrl } = req.body;
  if (!req.file) {
    return res.status(400).send('CSV file required');
  }
  const cases = await parseCsv(req.file.path);
  const project = await Project.create({ name, repoUrl, cases });
  res.json(project);
});

router.post('/:id/analyze', async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.sendStatus(404);
  const filtered = await analyzeRepo(project.repoUrl, project.cases);
  res.json(filtered);
});

export default router;
