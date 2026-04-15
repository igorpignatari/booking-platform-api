import { RegisterBusinessUseCase } from "@contexts/business/application/useCases/business/RegisterBusinessUseCase";
import { makeBusiness } from "../../factories/entities/makeBusiness";
import type { BusinessRepositoryInMemory } from "../BusinessRepositoryInMemory";

export const seedBusiness = async (businessRepo: BusinessRepositoryInMemory) => {
  const registerUseCase = new RegisterBusinessUseCase(businessRepo);
  const result = await registerUseCase.execute(makeBusiness({ userId: crypto.randomUUID() }));
  return result.value;
};
