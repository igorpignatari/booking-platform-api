import { BusinessRepositoryInMemory } from "@contexts/business/__tests__/inMemory/BusinessRepositoryInMemory";
import { ResourceRepositoryInMemory } from "@contexts/business/__tests__/inMemory/ResourceRepositoryInMemory";
import { ServiceRepositoryInMemory } from "@contexts/business/__tests__/inMemory/ServiceRepositoryInMemory";
import { CreateServiceUseCase } from "@contexts/business/application/useCases/service/CreateServiceUseCase";

export const makeCreateServiceUseCase = () => {
  const businessRepo = new BusinessRepositoryInMemory();
  const resourceRepo = new ResourceRepositoryInMemory();
  const serviceRepo = new ServiceRepositoryInMemory();
  const useCase = new CreateServiceUseCase(serviceRepo, resourceRepo);
  return { useCase, businessRepo, resourceRepo, serviceRepo };
};
