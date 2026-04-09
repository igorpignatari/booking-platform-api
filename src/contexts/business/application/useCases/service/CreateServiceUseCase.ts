import { Service } from "@contexts/business/domain/entities/Service";
import { Result } from "@core/result/Result";
import type { CreateServiceRequest } from "../../DTOs/CreateServiceDTO";
import type { ICreateService } from "../../ports/input/ICreateService";
import type { ServiceRepository } from "../../ports/output/ServiceRepository";

export class CreateServiceUseCase implements ICreateService {
  constructor(private readonly repository: ServiceRepository) {}

  async execute(request: CreateServiceRequest): Promise<Result<Service>> {
    const service = Service.create(request);
    if (service.isErr) {
      return Result.err(service.error);
    }
    const isSaved = await this.repository.save(service.value);
    if (isSaved.isErr) {
      return Result.err(isSaved.error);
    }
    return Result.ok(service.value);
  }
}
