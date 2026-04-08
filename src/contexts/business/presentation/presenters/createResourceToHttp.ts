import type { Resource } from "@contexts/business/domain/entities/Resource";
import type { CreateResourceViewModel } from "./CreateResourceViewModel";

export const createResourceToHttp = (resource: Resource): CreateResourceViewModel => {
  return {
    id: resource.id,
    name: resource.name,
    createdAt: resource.createdAt.toISOString(),
  };
};
