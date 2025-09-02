import axios from 'axios';
import { Project, StepCase } from './types';

const api = axios.create({ baseURL: '/projects' });

export async function getProjects(): Promise<Project[]> {
  const res = await api.get<Project[]>('/');
  return res.data;
}

export async function createProject(name: string, repoUrl: string, file: File): Promise<Project> {
  const form = new FormData();
  form.append('name', name);
  form.append('repoUrl', repoUrl);
  form.append('file', file);
  const res = await api.post<Project>('/', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function analyze(id: string): Promise<StepCase[]> {
  const res = await api.post<StepCase[]>(`/${id}/analyze`);
  return res.data;
}
