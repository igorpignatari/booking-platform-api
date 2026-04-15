import { BusinessRepositoryInMemory } from "@contexts/business/__tests__/inMemory/BusinessRepositoryInMemory";
import { ResourceRepositoryInMemory } from "@contexts/business/__tests__/inMemory/ResourceRepositoryInMemory";
import type { BusinessRepository } from "@contexts/business/application/ports/output/BusinessRepository";
import type { ResourceRepository } from "@contexts/business/application/ports/output/ResourceRepository";
import { CreateResourceUseCase } from "@contexts/business/application/useCases/resource/CreateResourceUseCase";

type Dependencies = {
  resourceRepository: ResourceRepository;
  businessRepository: BusinessRepository;
};

export const makeCreateResourceUseCase = (deps?: Partial<Dependencies>) => {
  const businessRepo = deps?.businessRepository ?? new BusinessRepositoryInMemory();
  const resourceRepo = deps?.resourceRepository ?? new ResourceRepositoryInMemory();
  const useCase = new CreateResourceUseCase(resourceRepo, businessRepo);
  return { useCase, businessRepo, resourceRepo };
};
