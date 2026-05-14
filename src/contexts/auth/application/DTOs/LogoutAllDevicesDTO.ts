import z from "zod";

const LogoutAllDevicesZodObject = z.object({
  userId: z.string().nonempty("User ID is required!"),
});

export const LogoutAllDevicesSchema = z.object({
  body: LogoutAllDevicesZodObject,
});

export type LogoutAllDevicesRequest = z.infer<typeof LogoutAllDevicesZodObject>;
