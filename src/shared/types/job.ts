export type JobStatus = 'Active' | 'Paused' | 'Closed';

export interface HiringRound {
  roundName: string;
  totalScore: number;
  passingScore: number;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  type: string;
  locationType: string;
  location: string;
  description: string;
  status: JobStatus;
  candidatesCount: number;
  company: string;
  experience: string;
  salary: string;
  tags: string[];
  atsKeywords: string[];
  atsCriteriaScore: number;
  applicationCloseDays: number;
  hiringDeadlineDays: number;
  hiringPipeline: HiringRound[];
  createdAt: string;
  applicationCloseDate?: string;
  deadline?: string;
}

export interface CreateJobInput {
  title: string;
  department: string;
  type: string;
  locationType: string;
  location: string;
  experience: string;
  salary: string;
  description: string;
  atsKeywords: string[];
  atsCriteriaScore: number;
  applicationCloseDays: number;
  hiringDeadlineDays: number;
  hiringPipeline: HiringRound[];
}
