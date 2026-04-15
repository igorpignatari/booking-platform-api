import { BusinessRepositoryInMemory } from "@contexts/business/__tests__/inMemory/BusinessRepositoryInMemory";
import { ResourceRepositoryInMemory } from "@contexts/business/__tests__/inMemory/ResourceRepositoryInMemory";
import { CreateResourceUseCase } from "@contexts/business/application/useCases/resource/CreateResourceUseCase";

export const makeCreateResourceUseCase = () => {
  const businessRepo = new BusinessRepositoryInMemory();
  const resourceRepo = new ResourceRepositoryInMemory();
  const useCase = new CreateResourceUseCase(resourceRepo, businessRepo);
  return { useCase, businessRepo, resourceRepo };
};
