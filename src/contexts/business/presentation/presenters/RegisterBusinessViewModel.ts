import type { RegisterBusinessRequest } from "@contexts/business/application/DTOs/RegisterBusinessDTO";

export type RegisterBusinessViewModel = Omit<
  RegisterBusinessRequest,
  "userId" | "category" | "address" | "email" | "taxId" | "timezone" | "phone"
> & {
  id: string;
  createdAt: string;
};
