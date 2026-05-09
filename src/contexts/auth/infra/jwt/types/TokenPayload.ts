import { z } from "zod";

export const tokenPayloadSchema = z.object({
  sub: z.uuid(),
  role: z.enum(["user", "admin"]),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
