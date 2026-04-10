import type { Service } from "@contexts/business/domain/entities/Service";
import type { CreateServiceViewModel } from "./CreateServiceViewModel";

export const createServiceToHttp = (service: Service): CreateServiceViewModel => {
  return {
    id: service.id,
    name: service.name,
    createdAt: service.createdAt.toISOString(),
  };
};
