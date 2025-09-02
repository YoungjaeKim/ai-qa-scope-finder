import { Schema, model, Document } from 'mongoose';

export interface StepCase {
  caseId: string;
  steps: string[];
}

export interface ProjectDoc extends Document {
  name: string;
  repoUrl: string;
  cases: StepCase[];
}

const StepSchema = new Schema<StepCase>({
  caseId: { type: String, required: true },
  steps: { type: [String], required: true }
});

const ProjectSchema = new Schema<ProjectDoc>({
  name: { type: String, required: true },
  repoUrl: { type: String, required: true },
  cases: { type: [StepSchema], default: [] }
});

export default model<ProjectDoc>('Project', ProjectSchema);
