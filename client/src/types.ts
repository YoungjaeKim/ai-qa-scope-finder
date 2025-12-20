export interface StepCase {
  caseId: string;
  title: string;
  steps: string[];
}

export interface Project {
  _id: string;
  name: string;
  repoUrl: string;
  cases: StepCase[];
}
