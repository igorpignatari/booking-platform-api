import type { ZodError } from "zod";

export const zodErrorMessageParser = (error: ZodError): string[] => {
  return error.issues.map((issue) => `[${issue.path.join(".")}]: ${issue.message}`);
};
