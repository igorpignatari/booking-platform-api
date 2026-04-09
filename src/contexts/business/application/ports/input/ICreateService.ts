import type { Service } from "@contexts/business/domain/entities/Service";
import type { Result } from "@core/result/Result";
import type { CreateServiceRequest } from "../../DTOs/CreateServiceDTO";

export interface ICreateService {
  execute(request: CreateServiceRequest): Promise<Result<Service>>;
}
