import { BusinessRepositoryInMemory } from "@contexts/business/__tests__/inMemory/BusinessRepositoryInMemory";
import { RegisterBusinessUseCase } from "@contexts/business/application/useCases/business/RegisterBusinessUseCase";

export const makeRegisterBusinessUseCase = () => {
  const businessRepository = new BusinessRepositoryInMemory();
  const useCase = new RegisterBusinessUseCase(businessRepository);
  return { useCase, businessRepository };
};
