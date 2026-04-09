import z from "zod";

export const CreateServiceSchema = z.object({
  resourceId: z.string(),
  name: z.string(),
  duration: z.number(),
});

export type CreateServiceRequest = z.infer<typeof CreateServiceSchema>;
