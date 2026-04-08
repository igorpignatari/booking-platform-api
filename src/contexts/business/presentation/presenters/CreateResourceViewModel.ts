import type { CreateResourceRequest } from "@contexts/business/application/DTOs/CreateResourceDTO";

export type CreateResourceViewModel = Omit<CreateResourceRequest, "businessId"> & {
  id: string;
  createdAt: string;
};
