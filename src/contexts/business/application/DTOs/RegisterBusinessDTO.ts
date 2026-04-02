import z from "zod";

export const RegisterBusinessSchema = z.object({
  userId: z.uuid(),
  name: z.string().min(3).max(100).trim(),
  phone: z
    .string()
    .trim()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/),
  timezone: z
    .string()
    .trim()
    .regex(/^[A-Za-z]+\/[A-Za-z]+$/),
  address: z.object({
    street: z.string().min(3).max(100).trim(),
    number: z.string().trim().regex(/^\d+$/),
    neighborhood: z.string().min(3).max(100).trim(),
    city: z.string().min(3).max(100).trim(),
    state: z.string().min(2).max(2).trim(),
    country: z.string().min(3).max(100).trim(),
    zipCode: z.string().trim(),
    complement: z.string().trim().optional(),
  }),
  category: z
    .string()
    .min(3)
    .max(100)
    .trim()
    .regex(/^[A-Za-z]+$/),
  taxId: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    .optional(),
  email: z.email().optional(),
});

export type RegisterBusinessRequest = z.infer<typeof RegisterBusinessSchema>;
