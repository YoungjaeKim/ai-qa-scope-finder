import dotenv from 'dotenv';
dotenv.config();

import { OpenAI } from 'openai';
import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import { StepCase } from '../models/Project';

const openai = new OpenAI({ apiKey: process.env.AI_API_KEY });

function buildPrompt(diff: string, cases: StepCase[]): string {
  const caseText = cases
    .map(c => `${c.caseId}: ${c.steps.join(' -> ')}`)
    .join('\n');
  return `Given the following git diff:\n${diff}\n\nAnd test cases:\n${caseText}\n\nReturn a JSON array of test case IDs that are affected.`;
}

export async function analyzeRepo(repoUrl: string, cases: StepCase[]): Promise<StepCase[]> {
  const tmp = fs.mkdtempSync(path.join(process.cwd(), 'repo-'));
  const git = simpleGit();
  await git.clone(repoUrl, tmp);
  const diff = await simpleGit(tmp).diff();
  const prompt = buildPrompt(diff, cases);

  // send request to openai
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });

  const content = completion.choices[0].message?.content || '[]';
  const ids: string[] = JSON.parse(content);
  return cases.filter(c => ids.includes(c.caseId));
}
