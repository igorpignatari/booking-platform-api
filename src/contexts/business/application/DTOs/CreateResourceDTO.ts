import z from "zod";

export const CreateResourceSchema = z.object({
  businessId: z.string(),
  name: z.string(),
});

export type CreateResourceRequest = z.infer<typeof CreateResourceSchema>;
