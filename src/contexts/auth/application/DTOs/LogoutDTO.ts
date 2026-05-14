import z from "zod";

const LogoutZodObject = z.object({
  jti: z.uuid().nonempty("Token is required!"),
});

export const LogoutSchema = z.object({
  body: LogoutZodObject,
});

export type LogoutRequest = z.infer<typeof LogoutZodObject>;
