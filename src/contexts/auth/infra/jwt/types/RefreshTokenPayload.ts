import z from "zod";

export const refreshTokenPayloadSchema = z.object({
  sub: z.uuid(),
  jti: z.uuid(),
});

export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;
