import type { Business } from "@contexts/business/domain/entities/Business";
import type { RegisterBusinessViewModel } from "./RegisterBusinessViewModel";

export const registerBusinessToHttp = (business: Business): RegisterBusinessViewModel => {
  return {
    id: business.id,
    name: business.name,
    createdAt: business.createdAt.toISOString(),
  };
};
