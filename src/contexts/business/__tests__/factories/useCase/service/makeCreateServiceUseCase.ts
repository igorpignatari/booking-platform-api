import { ResourceRepositoryInMemory } from "@contexts/business/__tests__/inMemory/ResourceRepositoryInMemory";
import { ServiceRepositoryInMemory } from "@contexts/business/__tests__/inMemory/ServiceRepositoryInMemory";
import type { ResourceRepository } from "@contexts/business/application/ports/output/ResourceRepository";
import type { ServiceRepository } from "@contexts/business/application/ports/output/ServiceRepository";
import { CreateServiceUseCase } from "@contexts/business/application/useCases/service/CreateServiceUseCase";

type Dependencies = {
  serviceRepository: ServiceRepository;
  resourceRepository: ResourceRepository;
};

export const makeCreateServiceUseCase = (deps?: Partial<Dependencies>) => {
  const resourceRepo = deps?.resourceRepository ?? new ResourceRepositoryInMemory();
  const serviceRepo = deps?.serviceRepository ?? new ServiceRepositoryInMemory();
  const useCase = new CreateServiceUseCase(serviceRepo, resourceRepo);
  return { useCase, resourceRepo, serviceRepo };
};
