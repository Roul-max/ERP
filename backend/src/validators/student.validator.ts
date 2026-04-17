import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rollNumber: z.string().min(1),
  department: z.string().min(2),
  batch: z.string().min(4),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
});

export const updateStudentSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  department: z.string().min(2).optional(),
  batch: z.string().min(4).optional(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
});