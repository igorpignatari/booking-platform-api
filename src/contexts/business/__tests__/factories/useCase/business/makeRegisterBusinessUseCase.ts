import { BusinessRepositoryInMemory } from "@contexts/business/__tests__/inMemory/BusinessRepositoryInMemory";
import type { BusinessRepository } from "@contexts/business/application/ports/output/BusinessRepository";
import { RegisterBusinessUseCase } from "@contexts/business/application/useCases/business/RegisterBusinessUseCase";

type BusinessRepositoryType = {
  businessRepository: BusinessRepository;
};

export const makeRegisterBusinessUseCase = (deps?: Partial<BusinessRepositoryType>) => {
  const businessRepository = deps?.businessRepository ?? new BusinessRepositoryInMemory();
  const useCase = new RegisterBusinessUseCase(businessRepository);
  return { useCase, businessRepository };
};
