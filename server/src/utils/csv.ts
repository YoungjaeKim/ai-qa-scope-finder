import fs from 'fs';
import { parse } from 'csv-parse';
import { StepCase } from '../models/Project';

export async function parseCsv(filePath: string): Promise<StepCase[]> {
  console.log(`[CSV] Starting to parse CSV file: ${filePath}`);
  const cases: StepCase[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ 
        delimiter: ',', 
        trim: true,
        skip_empty_lines: true,
        columns: false,
        relax_column_count: true
      }))
      .on('data', (row: string[]) => {
        console.log(`[CSV] Processing row:`, row);
        if (!row.length || row.length < 2) {
          console.log(`[CSV] Skipping invalid row (too short):`, row);
          return;
        }
        const [caseId, title, ...steps] = row;
        const filteredSteps = steps.filter(s => s && s.trim().length > 0);
        console.log(`[CSV] Parsed case - ID: ${caseId}, Title: ${title}, Steps: ${filteredSteps.length}`);
        cases.push({ caseId: caseId || '', title: title || '', steps: filteredSteps });
      })
      .on('end', () => {
        console.log(`[CSV] Finished parsing. Total cases parsed: ${cases.length}`);
        resolve(cases);
      })
      .on('error', (err) => {
        console.error(`[CSV] Error parsing CSV file:`, err);
        reject(err);
      });
  });
}
