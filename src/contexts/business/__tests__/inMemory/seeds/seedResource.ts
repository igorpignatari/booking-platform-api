import { CreateResourceUseCase } from "@contexts/business/application/useCases/resource/CreateResourceUseCase";
import type { BusinessRepositoryInMemory } from "../BusinessRepositoryInMemory";
import type { ResourceRepositoryInMemory } from "../ResourceRepositoryInMemory";

export const seedResource = async (
  businessId: string,
  businessRepo: BusinessRepositoryInMemory,
  resourceRepo: ResourceRepositoryInMemory,
) => {
  const useCase = new CreateResourceUseCase(resourceRepo, businessRepo);
  const result = await useCase.execute({ businessId, name: "chair 1" });
  return result.value;
};
