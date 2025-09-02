import fs from 'fs';
import { parse } from 'csv-parse';
import { StepCase } from '../models/Project';

export async function parseCsv(filePath: string): Promise<StepCase[]> {
  const cases: StepCase[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ',', trim: true }))
      .on('data', (row: string[]) => {
        if (!row.length) return;
        const [caseId, ...steps] = row;
        cases.push({ caseId, steps });
      })
      .on('end', () => resolve(cases))
      .on('error', reject);
  });
}
