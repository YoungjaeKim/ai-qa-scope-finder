import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import projectsRouter from './routes/projects';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || '');

app.use('/projects', projectsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
