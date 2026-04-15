import { Service } from "@contexts/business/domain/entities/Service";
import { BusinessErrors } from "@contexts/business/domain/errors/BusinessErrors";
import { Result } from "@core/result/Result";
import type { CreateServiceRequest } from "../../DTOs/CreateServiceDTO";
import type { ICreateService } from "../../ports/input/ICreateService";
import type { ResourceRepository } from "../../ports/output/ResourceRepository";
import type { ServiceRepository } from "../../ports/output/ServiceRepository";

export class CreateServiceUseCase implements ICreateService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly resourceRepository: ResourceRepository,
  ) {}

  async execute(request: CreateServiceRequest): Promise<Result<Service>> {
    console.log(request.resourceId);
    const isResourceExist = await this.resourceRepository.findById(request.resourceId);
    if (isResourceExist.isErr) {
      return Result.err(isResourceExist.error);
    }

    if (isResourceExist.value === null) {
      return Result.err(BusinessErrors.RESOURCE_NOT_FOUND.create("Resource not found"));
    }

    const service = Service.create(request);
    if (service.isErr) {
      return Result.err(service.error);
    }

    const isSaved = await this.serviceRepository.save(service.value);
    if (isSaved.isErr) {
      return Result.err(isSaved.error);
    }

    return Result.ok(service.value);
  }
}
