import type { CreateServiceRequest } from "@contexts/business/application/DTOs/CreateServiceDTO";

export type CreateServiceViewModel = Omit<CreateServiceRequest, "resourceId" | "duration"> & {
  id: string;
  createdAt: string;
};
