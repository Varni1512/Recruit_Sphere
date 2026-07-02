import { z } from "zod";

export const hiringRoundSchema = z.object({
  roundName: z.string().min(1, "Round name is required"),
  totalScore: z.number().min(0),
  passingScore: z.number().min(0),
  selected: z.boolean().optional(),
});

export const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  company: z.string().min(1, "Company name is required"),
  department: z.string().min(1, "Department is required"),
  type: z.string().min(1, "Employment type is required"),
  locationType: z.string().min(1, "Location type is required"),
  location: z.string().min(1, "Location is required"),
  experience: z.string().min(1, "Experience level is required"),
  salary: z.string().min(1, "Salary is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  atsKeywords: z.array(z.string()),
  atsCriteriaScore: z.number().min(0).max(100),
  applicationCloseDays: z.number().min(1),
  hiringDeadlineDays: z.number().min(1),
  aptitudeQuestions: z.array(z.object({
    question: z.string().min(1, "Question is required"),
    questionType: z.enum(["mcq", "msq", "text"]),
    options: z.array(z.string()),
    answer: z.any(),
    marks: z.number().min(1)
  })).optional(),
  examDuration: z.number().min(1).optional(),
  hiringPipeline: z.array(hiringRoundSchema),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
