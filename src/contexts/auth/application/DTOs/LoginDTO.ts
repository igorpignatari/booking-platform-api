import z from "zod";

const LoginZodObject = z.object({
  email: z.email("Invalid email!").nonempty("Email is required!"),
  password: z.string().nonempty("Password is required!").trim(),
});

export const LoginSchema = z.object({
  body: LoginZodObject,
});

export type LoginRequest = z.infer<typeof LoginZodObject>;
