import z from "zod";

export const CreateUserSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters!")
    .max(50, "Name must be at most 50 characters!")
    .nonempty("Name is required!")
    .trim()
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces!"),
  email: z.email("Invalid email!").nonempty("Email is required!"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters!")
    .nonempty("Password is required!")
    .trim()
    .regex(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number!",
    ),
  phone: z
    .string()
    .min(11, "Phone number must be at least 11 characters!")
    .max(11, "Phone number must be at most 11 characters!")
    .nonempty("Phone number is required!")
    .trim()
    .regex(/^[0-9]+$/, "Phone number must contain only numbers!"),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;
