import { z } from "zod";

export const hiringRoundSchema = z.object({
  roundName: z.string().min(1, "Round name is required"),
  totalScore: z.number().min(0),
  passingScore: z.number().min(0),
});

export const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  department: z.string().min(1, "Department is required"),
  type: z.string().min(1, "Employment type is required"),
  locationType: z.string().min(1, "Location type is required"),
  location: z.string().min(1, "Location is required"),
  experience: z.string().min(1, "Experience level is required"),
  salary: z.string().min(1, "Salary is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  atsKeywords: z.array(z.string()).default([]),
  atsCriteriaScore: z.number().min(0).max(100).default(75),
  applicationCloseDays: z.number().min(1).default(7),
  hiringDeadlineDays: z.number().min(1).default(30),
  hiringPipeline: z.array(hiringRoundSchema).default([]),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
